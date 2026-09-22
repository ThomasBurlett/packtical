import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  getDocs,
  collection,
  disableNetwork,
  enableNetwork,
  getDocFromCache,
} from "firebase/firestore";
let env: RulesTestEnvironment;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-packbee",
    firestore: {
      host: "127.0.0.1",
      port: 8188,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});
after(async () => env?.cleanup());
test("private accounts reject unauthenticated and cross-account reads/writes", async () => {
  const owner = env.authenticatedContext("owner").firestore();
  const stranger = env.authenticatedContext("stranger").firestore();
  const guest = env.unauthenticatedContext().firestore();
  const path = "users/owner/checklists/camping/items/custom-test";
  await assertSucceeds(
    setDoc(doc(owner, path), {
      label: "Test item",
      custom: true,
      sectionId: "campsite",
    }),
  );
  await assertFails(getDoc(doc(stranger, path)));
  await assertFails(getDoc(doc(guest, path)));
  await assertFails(
    setDoc(doc(stranger, path), { hidden: true }, { merge: true }),
  );
  await assertFails(setDoc(doc(owner, path), { label: "" }, { merge: true }));
});
test("late writes to an older cycle cannot change the new cycle; undo copies into another fresh cycle", async () => {
  const db = env.authenticatedContext("packer").firestore();
  const root = "users/packer/checklists/camping";
  await setDoc(doc(db, `${root}/cycles/initial/states/tent`), {
    status: "packed",
  });
  await setDoc(doc(db, root), { cycle: "reset1" });
  await setDoc(doc(db, `${root}/cycles/initial/states/tent`), {
    status: "skipped",
  });
  assert.equal((await getDoc(doc(db, root))).data()?.cycle, "reset1");
  assert.equal(
    (await getDocs(collection(db, `${root}/cycles/reset1/states`))).size,
    0,
  );
  const undo = writeBatch(db);
  undo.set(doc(db, root), { cycle: "undo1" });
  undo.set(doc(db, `${root}/cycles/undo1/states/tent`), { status: "packed" });
  await assertSucceeds(undo.commit());
  await setDoc(doc(db, `${root}/cycles/initial/states/tent`), {
    status: "unpacked",
  });
  assert.equal(
    (await getDoc(doc(db, `${root}/cycles/undo1/states/tent`))).data()?.status,
    "packed",
  );
});
test("an offline device queues item changes; reconnection does not resurrect checks after another device resets", async () => {
  const phone = env.authenticatedContext("offline-packer").firestore();
  const laptop = env.authenticatedContext("offline-packer").firestore();
  const root = "users/offline-packer/checklists/camping";
  await setDoc(doc(phone, root), { cycle: "initial" });
  await disableNetwork(phone);
  const pending = setDoc(doc(phone, `${root}/cycles/initial/states/tent`), {
    status: "packed",
  });
  assert.equal(
    (
      await getDocFromCache(doc(phone, `${root}/cycles/initial/states/tent`))
    ).data()?.status,
    "packed",
  );
  await setDoc(doc(laptop, root), { cycle: "fresh" });
  await setDoc(doc(laptop, `${root}/cycles/fresh/states/stove`), {
    status: "packed",
  });
  await enableNetwork(phone);
  await pending;
  assert.equal((await getDoc(doc(phone, root))).data()?.cycle, "fresh");
  assert.equal(
    (await getDocs(collection(phone, `${root}/cycles/fresh/states`))).size,
    1,
  );
  assert.equal(
    (await getDoc(doc(phone, `${root}/cycles/fresh/states/stove`))).data()
      ?.status,
    "packed",
  );
});
