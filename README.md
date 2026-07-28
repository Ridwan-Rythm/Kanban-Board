# Kanban Board — Desktop & Web Programming Course Project

A 2-person Kanban board web app with real-time sync across devices, built with HTML, CSS, JavaScript, and Firebase.

## Tech Stack
- HTML / CSS / JavaScript (vanilla, no framework)
- Firebase Firestore (data storage + real-time sync)
- Firebase Authentication (email/password + Google sign-in)
- SortableJS (drag-and-drop)

## Team & Ownership

**Nazifa Rahman (teammate 1):** Board UI, drag-and-drop, responsive CSS, PWA setup
- `board.js`, `ui.js`, `style.css`

**Abu Ridwan Siddique (teammate 2):** Firebase, Auth, CRUD logic, real-time sync, notifications
- `js/firebase-config.js`, `js/firestore.js`, `js/auth.js`, `js/notifications.js`

## Task Data Structure

Each task in the `tasks` Firestore collection:

```js
{
  title: "Design homepage",
  description: "Create wireframes for the landing page",
  dueDate: Timestamp,          // stored as Firestore Timestamp
  priority: "high",             // "low" | "medium" | "high"
  label: "design",
  status: "todo",                // "todo" | "in-progress" | "in-review" | "done"
  isOverdue: false,
  userId: "uid_of_owner",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

Tasks are scoped **per-user** — each user only sees their own tasks, enforced via Firestore security rules (see `firestore.rules`).

## CRUD Functions (`js/firestore.js`)

```js
addTask(taskData)              // → Promise<docId>
updateTask(taskId, updates)    // → Promise<void>
deleteTask(taskId)             // → Promise<void>
getTasks(callback)             // → real-time listener, returns unsubscribe function
                                //   callback receives array of tasks with dueDate as "YYYY-MM-DD" string
```

## Auth Functions (`js/auth.js`)

```js
signUp(email, password)
logIn(email, password)
logOut()
watchAuthState(callback)       // callback(user) — user is null if logged out
signInWithGoogle()
```

## Setup

1. Clone the repo
2. Copy `js/firebase-config.example.js` to `js/firebase-config.js` and fill in your Firebase project values
3. Serve with a local server (e.g. VS Code Live Server) — do not open `index.html` directly via `file://`

## Status

- [x] Firebase project set up, Firestore + Auth working
- [x] CRUD functions implemented and integrated with UI
- [x] Real-time sync confirmed
- [x] Login/signup (email/password + Google) working
- [ ] Notification/reminder system (Week 3)
- [ ] Deployment (Week 5)
