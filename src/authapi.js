// src/lib/auth-api.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  getIdToken,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./firebase";

export async function loginEmailPassword(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signupEmailPassword(email, password, displayName) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(user, { displayName });
  sendEmailVerification(user);

  return user;
}

export async function requestPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function getAppToken() {
  const u = auth.currentUser;
  return u ? getIdToken(u, false) : null;
}
