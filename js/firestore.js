// js/firestore.js
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";

const tasksRef = collection(db, "tasks");

// Add a new task
export function addTask(taskData) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("No user logged in"));

  return addDoc(tasksRef, {
    title: taskData.title,
    description: taskData.description || "",
    dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
    priority: taskData.priority || "medium",
    label: taskData.label || "",
    status: taskData.status || "todo",
    isOverdue: false,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }).then((docRef) => {
    console.log("Task added:", docRef.id);
    return docRef.id;
  }).catch((error) => {
    console.error("Error adding task:", error);
    throw error;
  });
}

// Real-time listener for the logged-in user's tasks
export function getTasks(callback) {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in — cannot fetch tasks");
    return () => {}; // return a no-op unsubscribe
  }

  const q = query(tasksRef, where("userId", "==", user.uid));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(tasks);
  }, (error) => {
    console.error("Error listening to tasks:", error);
  });

  return unsubscribe; // teammate calls this to stop listening (e.g. on logout)
}