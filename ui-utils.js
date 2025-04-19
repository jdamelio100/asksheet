// ui-utils.js

function setupPaneToggle({ paneId, toggleButtonId }) {
    const toggleButton = document.querySelector(toggleButtonId);
    const pane = document.querySelector(paneId);
  
    if (!toggleButton || !pane) return;
  
    toggleButton.addEventListener("click", () => {
      pane.style.display = pane.style.display === "none" ? "" : "none";
    });
  }
  
  function createModal({ id, title, content, actions = [] }) {
    const modal = document.createElement("div");
    modal.id = id;
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${title}</h2>
        <div class="modal-body">${content}</div>
        <div class="modal-actions">
          ${actions.map(action => `<button class="modal-btn" data-action="${action.id}">${action.label}</button>`).join("")}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  
    actions.forEach(action => {
      modal.querySelector(`[data-action="${action.id}"]`).addEventListener("click", action.handler);
    });
  
    return modal;
  }
  
  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
  }
  
  function showToast(message, duration = 3000) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }
  