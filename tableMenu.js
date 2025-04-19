// Ensure toolbar buttons and view selector are initialized
function initToolbar(table) {
    const toolbar = document.getElementById("toolbar");
    if (!toolbar) return;
  
    const viewDropdown = document.createElement("select");
    viewDropdown.id = "view-selector";
    viewDropdown.style.marginRight = "10px";
    viewDropdown.style.fontSize = "1.2em";
    viewDropdown.style.padding = "6px 12px";
    viewDropdown.style.minWidth = "180px";
    toolbar.appendChild(viewDropdown);
  
    const editButton = document.createElement("button");
    editButton.id = "edit-view-button";
    editButton.className = "toolbar-button";
    editButton.textContent = "Edit View";
    toolbar.appendChild(editButton);
  
    const addButton = document.createElement("button");
    addButton.id = "add-view-button";
    addButton.className = "toolbar-button";
    addButton.textContent = "Add View";
    toolbar.appendChild(addButton);
  
    const buttons = [
      { id: "search-button", icon: "search", label: "Search", action: null },
      { id: "filter-button", icon: "filter", label: "Filter", action: null },
      { id: "sort-button", icon: "arrow-down-up", label: "Sort", action: null },
      { id: "group-button", icon: "layers", label: "Group", action: null },
      { id: "csv-button", icon: "download", label: "CSV", action: () => table.download("csv", "contracts.csv") },
      { id: "excel-button", icon: "file-spreadsheet", label: "Excel", action: () => table.download("xlsx", "contracts.xlsx") },
      { id: "print-button", icon: "printer", label: "Print", action: () => table.print(false, true) }
    ];
  
    buttons.forEach(({ id, label, action }) => {
      const btn = document.createElement("button");
      btn.id = id;
      btn.className = "toolbar-button";
      btn.textContent = label;
      btn.style.marginLeft = "6px";
  
      if (id === "filter-button") {
        let filtersShown = false;
        btn.onclick = () => {
          filtersShown = !filtersShown;
          table.getColumns().forEach(col => {
            col.updateDefinition({ headerFilter: filtersShown ? "input" : false });
          });
          table.redraw(true);
        };
      } else if (action) {
        btn.onclick = action;
      }
  
      toolbar.appendChild(btn);
    });
  
    updateViewDropdownOptions(viewDropdown);
  
    viewDropdown.addEventListener("change", (e) => {
      const viewName = e.target.value;
      const viewData = savedViews[viewName];
      if (!viewData) {
        table.getColumns().forEach(col => col.show());
        return;
      }
      table.getColumns().forEach(col => {
        const field = col.getField();
        if (!field) return;
        if (viewData.visibleColumns.includes(field)) col.show();
        else col.hide();
      });
      if (viewData.columnLayout) table.setColumnLayout(viewData.columnLayout);
      table.redraw(true);
    });
  
    editButton.onclick = () => {
      const selected = viewDropdown.value;
      if (!selected || selected === "Default View") {
        alert("Please select a view to edit.");
        return;
      }
      openViewManager(selected, "edit");
    };
  
    addButton.onclick = () => {
      openViewManager("", "add");
    };
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    if (window.table) initToolbar(window.table);
    else {
      const checkTable = setInterval(() => {
        if (window.table) {
          initToolbar(window.table);
          clearInterval(checkTable);
        }
      }, 100);
    }
  });
  
  let savedViews = JSON.parse(localStorage.getItem("savedViews")) || {};
  
  function updateViewDropdownOptions(selector = document.getElementById("view-selector")) {
    if (!selector) return;
    selector.innerHTML = `<option value="Default View">Default View</option>`;
    for (const name in savedViews) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      selector.appendChild(opt);
    }
  }
  
  window.openViewManager = function(viewName, mode) {
    console.log("Opening View Manager for:", viewName, "mode:", mode);
    let modal = document.getElementById("view-manager-modal");
    let viewNameInput;
  
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "view-manager-modal";
      modal.style.display = "none";
      modal.style.position = "fixed";
      modal.style.top = "100px";
      modal.style.right = "20px";
      modal.style.width = "360px";
      modal.style.padding = "20px";
      modal.style.background = "#fff";
      modal.style.border = "1px solid #ccc";
      modal.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.1)";
      modal.style.zIndex = 10000;
      modal.innerHTML = `
        <div style="margin-bottom: 10px">
          <input id="view-name" placeholder="View Name" style="width: 100%; padding: 8px;" />
        </div>
        <div style="margin-bottom: 10px">
          <h4>Select columns to include:</h4>
          <div id="checkbox-container"></div>
        </div>
        <div>
          <button id="save-close-view" class="toolbar-button">Save & Close</button>
          <button id="close-view" class="toolbar-button" style="margin-left: 10px">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
  
    viewNameInput = document.getElementById("view-name");
    const checkboxContainer = document.getElementById("checkbox-container");
    const closeBtn = modal.querySelector("#close-view");
    const saveCloseBtn = modal.querySelector("#save-close-view");
  
    if (!modal || !viewNameInput || !checkboxContainer) {
      console.error("View Manager modal or input field not found");
      return;
    }
  
    modal.style.display = "block";
  
    if (mode === "add") {
      viewNameInput.value = "";
      viewNameInput.placeholder = "View Name";
      viewNameInput.dataset.viewOriginal = "";
    } else {
      viewNameInput.value = viewName;
      viewNameInput.dataset.viewOriginal = viewName;
    }
  
    if (closeBtn) {
      closeBtn.onclick = () => (modal.style.display = "none");
    }
  
    checkboxContainer.innerHTML = "";
    const fields = window.table.getColumns().map(c => c.getField()).filter(f => f);
    const currentVisible = fields.filter(field => {
      const col = window.table.getColumn(field);
      return col && col.isVisible();
    });
  
    fields.forEach(field => {
      const label = document.createElement("label");
      label.style.display = "block";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = currentVisible.includes(field);
      cb.dataset.field = field;
      cb.onchange = () => {
        const col = window.table.getColumn(field);
        if (cb.checked) col.show();
        else col.hide();
      };
      label.appendChild(cb);
      label.append(` ${field}`);
      checkboxContainer.appendChild(label);
    });
  
    if (saveCloseBtn) {
      saveCloseBtn.onclick = () => {
        const newName = viewNameInput.value.trim();
        if (!newName) return alert("Please enter a name for the view.");
  
        const originalName = viewNameInput.dataset.viewOriginal;
        const selectedFields = Array.from(checkboxContainer.querySelectorAll("input[type=checkbox]"))
          .filter(cb => cb.checked)
          .map(cb => cb.dataset.field);
  
        const viewKey = mode === "edit" ? originalName : newName;
        savedViews[viewKey] = { visibleColumns: selectedFields };
  
        if (mode === "edit" && originalName !== newName) {
          delete savedViews[originalName];
        }
  
        localStorage.setItem("savedViews", JSON.stringify(savedViews));
        modal.style.display = "none";
  
        const selector = document.getElementById("view-selector");
        if (selector) {
          updateViewDropdownOptions(selector);
          selector.value = newName;
          selector.dispatchEvent(new Event("change"));
        }
      };
    }
  };  