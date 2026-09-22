import Constants from "expo-constants";
import { getApp } from "@react-native-firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  writeBatch,
  waitForPendingWrites,
} from "@react-native-firebase/firestore";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import type { Driver } from "./port";
import { settleBeforeSignOut } from "./settle";

export function createDriver(): Driver {
  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
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
      const webClientId = Constants.expoConfig?.extra?.googleWebClientId;
      if (!webClientId)
        throw new Error("Google sign-in needs a Packbee OAuth client.");
      GoogleSignin.configure({ webClientId });
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const result = await GoogleSignin.signIn();
      if (isSuccessResponse(result)) {
        if (!result.data.idToken)
          throw new Error("Google did not return a sign-in token.");
        await signInWithCredential(
          auth,
          GoogleAuthProvider.credential(result.data.idToken),
        );
      }
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
              ? [{ id: snapshot.id, data: snapshot.data()! }]
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
