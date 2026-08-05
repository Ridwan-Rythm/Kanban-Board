import { getTasks, updateTask } from "./firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const cardLists = document.querySelectorAll(".column__cards");

  // Set up drag-and-drop once. These containers themselves are never
  // replaced on re-render (only the individual cards inside them are),
  // so these Sortable instances stay valid every time the board re-renders.
  cardLists.forEach((list) => {
    Sortable.create(list, {
      group: "kanban-board",
      animation: 150,
      ghostClass: "card--ghost",
      chosenClass: "card--chosen",
      dragClass: "card--dragging",
      onEnd: handleCardMoved,
    });
  });

  // Subscribe to real-time task data. Fires immediately with the
  // current tasks, then again every time anything changes.
  getTasks((tasks) => {
    renderBoard(tasks);
  });
});

/**
 * Rebuilds every column's card list from the given task array.
 * Called every time Firestore's real-time listener fires.
 */
function renderBoard(tasks) {
  const byStatus = { todo: [], "in-progress": [], "in-review": [], done: [] };

  tasks.forEach((task) => {
    const status = byStatus[task.status] ? task.status : "todo"; // fallback for any unexpected value
    byStatus[status].push(task);
  });

  document.querySelectorAll(".column").forEach((column) => {
    const status = column.dataset.status;
    const list = column.querySelector(".column__cards");

    const demoCard = list.querySelector(".demo-card");

    // clear list
    list.innerHTML = "";

    if (byStatus[status].length === 0) {
      if (demoCard) {
        list.appendChild(demoCard);
      }
      return;
    }

    byStatus[status].forEach((task) => {
      list.appendChild(buildCardElement(task));
    });
  });
}

/**
 * Builds a <article class="card"> DOM node for one task, matching the
 * same markup structure the static dummy cards used to have.
 * Sets data-task-id so board.js/ui.js can identify which real
 * Firestore document a card corresponds to.
 */
function buildCardElement(task) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.taskId = task.id;
  article.dataset.task = JSON.stringify(task);

  article.innerHTML = `
    <div class="card__priority" aria-hidden="true"></div>
    <div class="card__tags">
      ${task.label ? `<span class="tag">${escapeHTML(task.label)}</span>` : ""}
      <span class="tag">${escapeHTML(capitalize(task.priority || "medium"))}</span>
    </div>
    <div class="card__title-row">
      <h3 class="card__title">${escapeHTML(task.title || "Untitled")}</h3>
      <span class="card__chevron" aria-hidden="true">⌄</span>
    </div>
    <p class="card__desc">${escapeHTML(task.description || "No description")}</p>
    <div class="card__notes">
      <span class="card__notes-label">Notes:</span>
      <p class="card__notes-placeholder">Type here...</p>
    </div>
    <div class="card__meta">
      <span class="card__assignee">
        <span class="card__avatar" aria-hidden="true"></span>
        <span class="card__assignee-name">To be assigned</span>
      </span>
      <span class="card__due">📅 ${escapeHTML(formatDueDateDisplay(task.dueDate))}</span>
    </div>
  `;
  return article;
}

/**
 * Runs after a card is dropped anywhere on the board. Figures out the
 * task's new status from the column it landed in, and persists it.
 */
function handleCardMoved(evt) {
  const card = evt.item;
  const fromColumn = evt.from?.closest(".column");
  const toColumn = evt.to?.closest(".column");

  if(!fromColumn || !toColumn) return; // safety net — shouldn't happen once real data is rendering
  
  if (fromColumn === toColumn) return; // just a reorder, status unchanged

  const newStatus = toColumn.dataset.status;
  const taskId = card.dataset.taskId;
  if (!taskId || !newStatus) return; // safety net — shouldn't happen once real data is rendering

  updateTask(taskId, { status: newStatus }).catch((err) => {
    console.error("Failed to update task status:", err);
    // The next getTasks() snapshot will re-render from the real
    // (unchanged) data anyway, so the card will snap back on its own.
  });
}

// getTasks() now always gives dueDate as a plain "YYYY-MM-DD" string.
function formatDueDateDisplay(value) {
  if (!value) return "DD MM";
  const [, month, day] = value.split("-");
  return `${day} ${month}`;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

// Prevents any task text from being interpreted as HTML.
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}