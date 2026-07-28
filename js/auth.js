import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

// Keep the session alive across page reloads within the same tab, but
// never carry it over to a new tab/window and drop it the moment the
// tab is closed. (browserLocalPersistence would survive closing the
// tab entirely; inMemoryPersistence would log out on every reload —
// this sits in between, which is what we want here.) All auth calls
// below wait on this before running so it's guaranteed to be in effect
// first.
const authReady = setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Persistence error:", error.code, error.message);
});

// Sign up a new user
export function signUp(email, password) {
  return authReady
    .then(() => createUserWithEmailAndPassword(auth, email, password))
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
  return authReady
    .then(() => signInWithEmailAndPassword(auth, email, password))
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

// ---------------------------------------------------------------------
// Idle timeout — logs the user out after a stretch of no interaction,
// separate from the reload/tab-close behavior above. The "last active"
// timestamp lives in sessionStorage (not a plain JS variable) so it
// survives a reload instead of resetting the clock every time you hit
// refresh — only real inactivity counts.
// ---------------------------------------------------------------------
const IDLE_TIMEOUT_MS = 4 * 60 * 1000; // tune between 3–4 min as needed
const IDLE_CHECK_INTERVAL_MS = 15 * 1000;
const LAST_ACTIVITY_KEY = "kanban:lastActivity";
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

let idleIntervalId = null;

function markActivity() {
  sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

function checkIdle() {
  const last = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();
  if (Date.now() - last >= IDLE_TIMEOUT_MS) {
    stopIdleWatch();
    logOut();
  }
}

function startIdleWatch() {
  if (idleIntervalId) return; // already watching

  // Don't reset an in-progress countdown just because the page reloaded
  if (!sessionStorage.getItem(LAST_ACTIVITY_KEY)) {
    markActivity();
  }

  ACTIVITY_EVENTS.forEach((evt) =>
    window.addEventListener(evt, markActivity, { passive: true })
  );

  idleIntervalId = window.setInterval(checkIdle, IDLE_CHECK_INTERVAL_MS);
  checkIdle(); // catches a tab that was already idle before this ran (e.g. laptop woke from sleep)
}

function stopIdleWatch() {
  if (idleIntervalId) {
    clearInterval(idleIntervalId);
    idleIntervalId = null;
  }
  ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActivity));
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
}

// Drive the idle watcher directly off real auth state, independent of
// whatever the UI does with watchAuthState() below.
authReady.finally(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      startIdleWatch();
    } else {
      stopIdleWatch();
    }
  });
});

// Listen for auth state changes
export function watchAuthState(callback) {
  authReady.finally(() => {
    onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  });
}

// Google sign-in
const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return authReady
    .then(() => signInWithPopup(auth, provider))
    .then((result) => {
      console.log("Signed in:", result.user.email);
      return result.user;
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
      throw error;
    });
}