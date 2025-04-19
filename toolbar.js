// toolbar.js

function initToolbar(table) {
    const toolbar = document.getElementById("toolbar");
    if (!toolbar) return;
  
    const viewDropdown = document.createElement("select");
    viewDropdown.id = "view-selector";
    viewDropdown.className = "toolbar-select";
    viewDropdown.style.marginRight = "10px";
    viewDropdown.style.fontSize = "1.2em";
    viewDropdown.style.padding = "6px 10px";
    toolbar.appendChild(viewDropdown);
  
    const menuWrapper = document.createElement("div");
    menuWrapper.style.position = "relative";
    toolbar.appendChild(menuWrapper);
  
    const moreBtn = document.createElement("button");
    moreBtn.id = "view-options-button";
    moreBtn.className = "toolbar-button";
    moreBtn.innerHTML = '<i data-lucide="more-vertical"></i>';
    menuWrapper.appendChild(moreBtn);
  
    const dropdownMenu = document.createElement("div");
    dropdownMenu.id = "view-options-menu";
    dropdownMenu.style.position = "absolute";
    dropdownMenu.style.top = "36px";
    dropdownMenu.style.right = "0";
    dropdownMenu.style.background = "#fff";
    dropdownMenu.style.border = "1px solid #ccc";
    dropdownMenu.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
    dropdownMenu.style.display = "none";
    dropdownMenu.style.zIndex = "1000";
    dropdownMenu.style.width = "180px";
  
    dropdownMenu.innerHTML = `
      <div id="edit-view-option" class="dropdown-item" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i data-lucide="pencil"></i> <span>Edit View</span>
      </div>
      <div id="add-view-option" class="dropdown-item" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i data-lucide="plus"></i> <span>Add View</span>
      </div>
    `;
    menuWrapper.appendChild(dropdownMenu);
  
    moreBtn.onclick = () => {
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
      if (window.lucide) lucide.createIcons();
    };
  
    document.addEventListener("click", (e) => {
      if (!menuWrapper.contains(e.target)) {
        dropdownMenu.style.display = "none";
      }
    });
  
    function updateViewDropdownOptions() {
      const savedViews = JSON.parse(localStorage.getItem("savedViews")) || {};
      viewDropdown.innerHTML = `<option value="Default View">Default View</option>`;
      for (const name in savedViews) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        viewDropdown.appendChild(opt);
      }
    }
  
    viewDropdown.addEventListener("change", (e) => {
      const viewName = e.target.value;
      const savedViews = JSON.parse(localStorage.getItem("savedViews")) || {};
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
  
    dropdownMenu.querySelector("#edit-view-option").onclick = () => {
      const selected = viewDropdown.value;
      if (selected && selected !== "Default View") {
        window.openViewManagerMode = "edit";
        openViewManager(selected, "edit");
      } else {
        alert("Please select a view to edit.");
      }
      dropdownMenu.style.display = "none";
    };
  
    dropdownMenu.querySelector("#add-view-option").onclick = () => {
      window.openViewManagerMode = "add";
      openViewManager("", "add");
      dropdownMenu.style.display = "none";
    };
  
    updateViewDropdownOptions();
  
    if (window.lucide) lucide.createIcons();
  
    window.getCurrentViewName = () => viewDropdown.value;
    window.refreshViewDropdown = updateViewDropdownOptions;
  }
  
  window.openViewManagerMode = "add"; // default fallback  