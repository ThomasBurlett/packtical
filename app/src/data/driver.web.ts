import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  onSnapshot,
  writeBatch,
  waitForPendingWrites,
} from "firebase/firestore";
import type { Driver } from "./port";
import { createPreviewDriver } from "./preview";
import { settleBeforeSignOut } from "./settle";

export function createDriver(): Driver {
  if (process.env.EXPO_PUBLIC_PREVIEW === "true") return createPreviewDriver();
  const config = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
    ? {
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      }
    : Constants.expoConfig?.extra?.firebase;
  if (!config?.projectId || !config.apiKey)
    throw new Error(
      "Packbee needs its Firebase configuration before Google sign-in is available.",
    );
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
  return {
    preview: false,
    auth: (next) =>
      onAuthStateChanged(auth, (user) =>
        next(
          user
            ? {
                uid: user.uid,
                name: user.displayName || "Packer",
                email: user.email || "",
              }
            : null,
        ),
      ),
    async signIn() {
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    signOut: () =>
      settleBeforeSignOut(waitForPendingWrites(db), () => signOut(auth)),
    watch(path, list, next, fail) {
      if (list)
        return onSnapshot(
          collection(db, path),
          { includeMetadataChanges: true },
          (snapshot) =>
            next(
              snapshot.docs.map((d) => ({ id: d.id, data: d.data() })),
              {
                pending: snapshot.metadata.hasPendingWrites,
                cached: snapshot.metadata.fromCache,
              },
            ),
          fail,
        );
      return onSnapshot(
        doc(db, path),
        { includeMetadataChanges: true },
        (snapshot) =>
          next(
            snapshot.exists()
              ? [{ id: snapshot.id, data: snapshot.data() }]
              : [],
            {
              pending: snapshot.metadata.hasPendingWrites,
              cached: snapshot.metadata.fromCache,
            },
          ),
        fail,
      );
    },
    async write(writes) {
      if (writes.length > 450)
        throw new Error("Too many changes in one operation.");
      const batch = writeBatch(db);
      for (const write of writes) {
        if (write.remove) batch.delete(doc(db, write.path));
        else batch.set(doc(db, write.path), write.data!, { merge: true });
      }
      await batch.commit();
    },
  };
}
