import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

// Sign up a new user
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Signed up:", userCredential.user.email);
      return userCredential.user;
    })
    .catch((error) => {
      console.error("Sign-up error:", error.code, error.message);
      throw error;
    });
}

// Sign in an existing user
export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Logged in:", userCredential.user.email);
      return userCredential.user;
    })
    .catch((error) => {
      console.error("Login error:", error.code, error.message);
      throw error;
    });
}

// Sign out the current user
export function logOut() {
  return signOut(auth);
}

// Listen for auth state changes
export function watchAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// Google sign-in
const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Signed in:", result.user.email);
      return result.user;
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
      throw error;
    });
}
