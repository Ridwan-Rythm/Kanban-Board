// ui.js
// Owned by: Person A (UI & Board Experience)
//
// Handles the Add/Edit/Delete task modal. UI-only for now: saving
// or deleting a card just updates the DOM directly, since
// teammate's firestore.js isn't wired up yet. Every spot that will
// eventually need a real Firestore call is marked with a TODO.
//
// Theme toggle logic will also live in this file — coming Week 4.

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

  let mode = "add";              // "add" or "edit"
  let targetColumnCards = null;  // the .column__cards list a new card gets added to
  let editingCard = null;        // the <article class="card"> being edited, if mode === "edit"

  // ---- Open in ADD mode: any column's "+ Add a card" button ----
  document.querySelectorAll(".column__add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const column = btn.closest(".column");
      openModal("add", { columnCards: column.querySelector(".column__cards") });
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

  function openModal(newMode, { columnCards, card } = {}) {
    mode = newMode;
    form.reset();
    priorityInput.value = "medium"; // form.reset() alone won't restore the `selected` default reliably in every browser

    if (mode === "add") {
      targetColumnCards = columnCards;
      editingCard = null;
      modalTitle.textContent = "Add Task";
      deleteBtn.hidden = true;
    } else {
      editingCard = card;
      targetColumnCards = card.closest(".column__cards");
      modalTitle.textContent = "Edit Task";
      deleteBtn.hidden = false;

      // Pre-fill from the card's current content. Dummy cards don't
      // carry real due-date/priority/label data yet, so those stay
      // at their defaults until real task objects exist.
      titleInput.value = card.querySelector(".card__title")?.textContent.trim() || "";
      descInput.value = card.querySelector(".card__desc")?.textContent.trim() || "";
    }

    overlay.classList.remove("is-hidden");
    titleInput.focus();
  }

  function closeModal() {
    overlay.classList.add("is-hidden");
    editingCard = null;
    targetColumnCards = null;
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Clicking the dimmed backdrop (not the modal box itself) closes it
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape key closes it
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.classList.contains("is-hidden")) {
      closeModal();
    }
  });

  // ---- Save (handles both Add and Edit) ----
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    if (!title) return; // the `required` attribute already guards this in-browser

    if (mode === "add") {
      const card = buildCardElement({
        title,
        description: descInput.value.trim(),
        dueDate: dueInput.value,
        priority: priorityInput.value,
        label: labelInput.value.trim(),
      });
      targetColumnCards.appendChild(card);

      // TODO: once firestore.js exposes addTask(), call it here with
      // the same fields, then let getTasks() re-render the board
      // instead of building this DOM node directly.
    } else if (mode === "edit" && editingCard) {
      editingCard.querySelector(".card__title").textContent = title;
      const descEl = editingCard.querySelector(".card__desc");
      if (descEl) descEl.textContent = descInput.value.trim();

      // TODO: once firestore.js exposes updateTask(id, changes), call
      // it here instead of editing the DOM directly.
    }

    closeModal();
  });

  // ---- Delete ----
  deleteBtn.addEventListener("click", () => {
    if (editingCard) {
      editingCard.remove();
      // TODO: once firestore.js exposes deleteTask(id), call it here.
    }
    closeModal();
  });

  /**
   * Builds a new <article class="card"> DOM node matching the same
   * markup structure as the dummy cards already in index.html, so
   * new cards look identical to existing ones.
   */
  function buildCardElement({ title, description, dueDate, priority, label }) {
    const article = document.createElement("article");
    article.className = "card";

    article.innerHTML = `
      <div class="card__priority" aria-hidden="true"></div>
      <div class="card__tags">
        ${label ? `<span class="tag">${escapeHTML(label)}</span>` : ""}
        <span class="tag">${escapeHTML(capitalize(priority))}</span>
      </div>
      <div class="card__title-row">
        <h3 class="card__title">${escapeHTML(title)}</h3>
        <span class="card__chevron" aria-hidden="true">⌄</span>
      </div>
      <p class="card__desc">${escapeHTML(description || "No description")}</p>
      <div class="card__notes">
        <span class="card__notes-label">Notes:</span>
        <p class="card__notes-placeholder">Type here...</p>
      </div>
      <div class="card__meta">
        <span class="card__assignee">
          <span class="card__avatar" aria-hidden="true"></span>
          <span class="card__assignee-name">To be assigned</span>
        </span>
        <span class="card__due">📅 ${escapeHTML(formatDueDate(dueDate))}</span>
      </div>
    `;
    return article;
  }

  function formatDueDate(value) {
    if (!value) return "DD MM";
    const [, month, day] = value.split("-");
    return `${day} ${month}`;
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  // Prevents any typed text from being interpreted as HTML — keeps
  // this safe even though nothing here touches a real database yet.
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});