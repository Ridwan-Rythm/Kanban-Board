import { addTask, updateTask, deleteTask } from "./firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("task-modal-overlay");
  const form = document.getElementById("task-form");
  const modalTitle = document.getElementById("task-modal-title");

  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const dueInput = document.getElementById("task-due");
  const priorityInput = document.getElementById("task-priority");
  const labelInput = document.getElementById("task-label");

  const deleteBtn = document.getElementById("task-delete-btn");
  const cancelBtn = document.getElementById("task-cancel-btn");
  const closeBtn = document.getElementById("task-modal-close");

  let mode = "add";           // "add" or "edit"
  let targetStatus = null;    // status to assign a new task, e.g. "todo"
  let editingTaskID = null;     // the <article class="card"> being edited, if mode === "edit"

  // ---- Open in ADD mode: any column's "+ Add a card" button ----
  document.querySelectorAll(".column__add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const column = btn.closest(".column");
      openModal("add", { status: column.dataset.status });
    });
  });

  // ---- Open in EDIT mode: clicking any existing card ----
  document.querySelectorAll(".column__cards").forEach((list) => {
    list.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      openModal("edit", { card });
    });
  });

  function openModal(newMode, { status, card } = {}) {
    mode = newMode;
    form.reset();
    priorityInput.value = "medium"; // form.reset() doesn't reliably restore the `selected` default in every browser

    if (mode === "add") {
      targetStatus = status;
      editingTaskID = null;
      modalTitle.textContent = "Add Task";
      deleteBtn.hidden = true;
    } else {
      editingTaskID = card.dataset.taskId;
      modalTitle.textContent = "Edit Task";
      deleteBtn.hidden = false;

      // Pre-fill from the card's rendered content (board.js put these
      // there from the real task data).
      const task = JSON.parse(card.dataset.task || "{}");

      titleInput.value = task.title || "";
      descInput.value = task.description || "";
      dueInput.value = task.dueDate || "";
      priorityInput.value = task.priority || "medium";
      labelInput.value = task.label || "";
    }

    overlay.classList.remove("is-hidden");
    titleInput.focus();
  }

  function closeModal() {
    overlay.classList.add("is-hidden");
    editingTaskID = null;
    targetStatus = null;
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.classList.contains("is-hidden")) {
      closeModal();
    }
  });

  // ---- Save (handles both Add and Edit) ----
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    if (!title) return; // the `required` attribute already guards this in-browser

    const taskData = {
      title,
      description: descInput.value.trim(),
      dueDate: dueInput.value,
      priority: priorityInput.value,
      label: labelInput.value.trim(),
    };

    try {
      if (mode === "add") {
        if (!targetStatus) {
          alert("Something went wrong: missing column status");
          return;
        }
        taskData.status = targetStatus;
        await addTask(taskData);
      } else if (mode === "edit" && editingTaskID) {
        await updateTask(editingTaskID, taskData);
      }
      closeModal();
    } catch (err) {
      alert("Couldn't save this task: " + err.message);
    }
  });

  // ---- Delete ----
  deleteBtn.addEventListener("click", async () => {
    if (!editingTaskID) {
      closeModal();
      return;
    }
    try {
      await deleteTask(editingTaskID);
      closeModal();
    } catch (err) {
      alert("Couldn't delete this task: " + err.message);
    }
  });
});