// board.js
// Owned by: Person A (UI & Board Experience)
//
// Wires up SortableJS so cards can be dragged between columns.
// Requires the SortableJS <script> tag (loaded in index.html) to
// run BEFORE this file, since it uses the global `Sortable` object.

document.addEventListener("DOMContentLoaded", () => {
  // Grab every column's card list and turn each one into a
  // drag-and-drop zone. Cards can be dragged from any one of
  // these lists into any other, because they all share the same
  // `group` name below.
  const cardLists = document.querySelectorAll(".column__cards");

  cardLists.forEach((list) => {
    Sortable.create(list, {
      group: "kanban-board", // same group name on every list = cards can move between all of them
      animation: 150,        // ms — smooth slide as cards make room
      ghostClass: "card--ghost",   // class applied to the empty placeholder while dragging
      chosenClass: "card--chosen", // class applied to the card actually being picked up
      dragClass: "card--dragging", // class applied to the dragged clone that follows the cursor

      // Fires once, when a drag ends (whether the card moved
      // columns or was just reordered within the same one).
      onEnd: handleCardMoved,
    });
  });
});

/**
 * Runs after a card is dropped anywhere on the board.
 * Figures out the task's new status from the column it landed in,
 * and hands off to onCardMoved() below.
 */
function handleCardMoved(evt) {
  const card = evt.item;                     // the <article class="card"> that was dragged
  const fromColumn = evt.from.closest(".column");
  const toColumn = evt.to.closest(".column");

  // Ignore reorders within the same column for now — status hasn't
  // actually changed, so there's nothing to persist.
  if (fromColumn === toColumn) return;

  const newStatus = toColumn.dataset.status;             // e.g. "in-progress"
  const taskTitleEl = card.querySelector(".card__title");
  const taskTitle = taskTitleEl ? taskTitleEl.textContent.trim() : "(untitled card)";

  onCardMoved(card, taskTitle, newStatus);
}

/**
 * TEMPORARY placeholder — dummy data has no real task ids yet, so
 * this just logs what happened. Once teammate's firestore.js
 * exposes updateTask(id, changes), replace the body of this
 * function with something like:
 *
 *   const taskId = card.dataset.taskId;
 *   updateTask(taskId, { status: newStatus });
 *
 * (Cards will need a data-task-id attribute added once real task
 * data is being rendered — see the rendering TODO below.)
 */
function onCardMoved(card, taskTitle, newStatus) {
  console.log(`"${taskTitle}" moved to status: ${newStatus}`);
}

// TODO (later in Week 2): once teammate's getTasks() is ready,
// this file will also be responsible for rendering cards into
// their columns from real task data, instead of the static dummy
// cards currently written directly in index.html.