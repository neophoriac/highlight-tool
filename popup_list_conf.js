let eraserSVG = `<svg style = "color: #a3a1b3" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eraser" class="svg-inline--fa fa-eraser fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M497.941 273.941c18.745-18.745 18.745-49.137 0-67.882l-160-160c-18.745-18.745-49.136-18.746-67.883 0l-256 256c-18.745 18.745-18.745 49.137 0 67.882l96 96A48.004 48.004 0 0 0 144 480h356c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12H355.883l142.058-142.059zm-302.627-62.627l137.373 137.373L265.373 416H150.628l-80-80 124.686-124.686z"></path></svg>`;

function listConfigurator(e, groups, id, name, curFooter) {
    let ExistingList = document.getElementById(id);
    let returnBtn = document.getElementById("conf_to_group_btn");
    let thisSettings = lists[id]?.settings;

    if (ExistingList) {
        thisSettings = lists[id]?.settings;
        ExistingList.hidden = false;
        ExistingList.className = "active";
        confIntoView();
        loadCustomSettings(thisSettings, id);
        return;
    }

    let container = document.createElement("div");
    let configurator = document.createElement("div");
    let settings = document.createElement("div");
    let noResults = document.createElement('span')

    container.setAttribute("name", name);
    container.id = id;
    configurator.id = "conf_" + id;
    container.className = "active";
    configurator.className = "wrap configurator";
    settings.className = "custom_settings";
    noResults.id = "no_results"

    noResults.innerText = 'No Results'

    configurator.style.cssText = "padding: 5px";

    createHeader(container, name, e.target);
    container.appendChild(noResults)
    container.appendChild(configurator);
    container.appendChild(settings);

    groups.after(container);
    confIntoView();

    returnBtn.addEventListener("click", returnToGroup);

    function confIntoView() {
        groups.hidden = true;
        curFooter.hidden = true;
        footer.hidden = false;
    }

    function returnToGroup(e) {
        container.remove();
        let globalCheck = container.querySelector('#global_checkbox');
        container.className = "wrap";
        groups.hidden = false;
        curFooter.hidden = false;
        footer.hidden = true;
        container.hidden = true;
        globalCheck.checked = false;
        globalCheck.dispatchEvent(new Event('change'));
    }

    loadCustomSettings(thisSettings, id);

    if (!lists || !lists[id] || !lists[id]?.lists.length) {
        newLine({
             referenceElement: configurator,
             bkgrColor: document.querySelector('[name="bg-option"]:checked').dataset.color,
             color:  document.querySelector('[name="color-option"]:checked').dataset.color,
         });
        return;
    }
    let list = lists[id]?.lists;

    // code below will run only if list exists
    for (let i = 0; i < list.length; i++) {
        setTimeout(() => {

            const line = list[i];
            let flag = line.f == "gi" ? "flag-on" : "flag-off";

            let bkgrColor = thisSettings.cm ? line.bc : thisSettings.cb
            let color = thisSettings.cm ? line.c : thisSettings.ct

            newLine({
                referenceElement: configurator,
                transferText: line.p,
                lineId: line.i,
                flag: flag,
                bkgrColor: bkgrColor,
                color: color
            })
        }, 0)
    }

}

function createHeader(refElement, name, target) {
    let header = document.createElement("div");

    let container = document.createElement("div");
    let checkboxCont = document.createElement("div");
    let checkBox = document.createElement("input");

    let optContainer = document.createElement("div");

    let groupCols = document.createElement("div");
    let color = document.createElement("input");
    let bkgrColor = document.createElement("input");

    let clearCont = document.createElement("div");

    let nameCont = document.createElement("div");
    let nameChange = document.createElement("input");
    let label = document.createElement("span");
    let saveBtn = document.createElement("button");
    let saveIcon = document.createElement("img");

    checkBox.type = "checkbox";
    color.type = "color";
    bkgrColor.type = "color";
    groupCols.id = "groupColors";
    color.id = "groupColor";
    bkgrColor.id = "groupBkgrColor"
    checkBox.id = "global_checkbox";
    nameChange.id = "edit_name";
    saveBtn.id = "save_name_change";
    label.setAttribute("for", "edit_name");
    clearCont.id = "clear";
    optContainer.id = "options_container";

    checkboxCont.className = "checkbox_container"
    clearCont.className = "button-secondary";
    container.className = "conf_global_check";
    header.className = "list_conf_header";
    label.className = "input_label";
    nameChange.className = "input_text";
    nameCont.className = "input_container";
    color.className = "color";
    bkgrColor.className = "color";

    label.innerText = "Name:";
    nameChange.value = name;
    nameChange.placeholder = "List Name"
    nameChange.spellcheck = false;
    color.value = "#000";
    bkgrColor.value = "#FFFF00";
    eraserIcon = createSvgIcon(eraserSVG, "eraser-icon")
    saveIcon.src = "images/floppy-disk_1f4be.png";
    saveIcon.setAttribute("alt", "&#128190;")
    saveBtn.appendChild(saveIcon)

    checkboxCont.appendChild(checkBox);

    clearCont.appendChild(eraserIcon)

    groupCols.appendChild(bkgrColor);
    groupCols.appendChild(color);

    optContainer.appendChild(groupCols);
    optContainer.appendChild(clearCont);

    container.appendChild(checkboxCont);
    container.appendChild(optContainer);

    header.appendChild(container);
    header.appendChild(nameCont);

    nameCont.appendChild(label);
    nameCont.appendChild(nameChange);
    nameCont.appendChild(saveBtn);

    refElement.appendChild(header);

    tooltip(saveBtn, "Save", "bottom-start", "mouseover");
    tooltip(clearCont, "Erase Selected", 'bottom-end', "mouseover");

    nameChange.addEventListener("input", (e) => {
        saveBtn.style.marginRight = "0px"
    })

    nameChange.addEventListener('keydown', (e) => {
        if (e.code !== "Enter") { return };
        saveBtn.click();
    })

    saveBtn.addEventListener("click", (e) => {
        target.innerText = nameChange.value;
        store([refElement]);
        storeOrder();
        saveBtn.style.marginRight = "-40px"
    })

    bkgrColor.addEventListener('change', (e) => {
        changeGroupColor(e, e.target.value, "bkgrColor");
    })

    color.addEventListener('change', (e) => {
        changeGroupColor(e, e.target.value, "color");
    })

    customToggle.addEventListener("change", enableCustSettings);
    checkBox.addEventListener("change", e => groupColorChange(e, refElement, optContainer));
    clearCont.addEventListener('click', eraseCheckedHandler);

}