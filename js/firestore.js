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
    callback([]); // return empty array instead of leaving teammate's UI hanging
    return () => {};
  }
  const q = query(tasksRef, where("userId", "==", user.uid));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(tasks); // will just be [] if no tasks exist — teammate's UI should handle showing an empty state
  });
  return unsubscribe;
}

import { doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Update an existing task
export function updateTask(taskId, updates) {
  const taskDoc = doc(db, "tasks", taskId);

  const updatesWithTimestamp = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  // If dueDate is being updated, convert it to a Timestamp
  if (updates.dueDate) {
    updatesWithTimestamp.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
  }

  return updateDoc(taskDoc, updatesWithTimestamp)
    .then(() => console.log("Task updated:", taskId))
    .catch((error) => {
      console.error("Error updating task:", error);
      throw error;
    });
}

// Delete a task
export function deleteTask(taskId) {
  const taskDoc = doc(db, "tasks", taskId);

  return deleteDoc(taskDoc)
    .then(() => console.log("Task deleted:", taskId))
    .catch((error) => {
      console.error("Error deleting task:", error);
      throw error;
    });
}