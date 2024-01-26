let dragSVG = `<svg height="20" viewBox="0 0 1792 1792" width="20" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;"><path d="M1664 1344v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45z"/></svg>`
let trashSVG = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash-alt" class="svg-inline--fa fa-trash-alt fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg>`
let menuSVG = `<svg height="100" width="100" viewBox="9.149 9.731 11.449 40.604" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com"><defs><bx:grid x="-33.864" y="-20.614" width="100" height="100"/></defs><circle cx="15" cy="15" r="4"/><circle cx="15" cy="30" r="4" bx:origin="0.574 1.616"/><circle cx="15" cy="45" r="4" bx:origin="0.574 1.616"/></svg>`
let addToListSVG = `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="addToListIconTitle" stroke="#000000" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter" color="#000000"> <title id="addToListIconTitle">Add To List</title> <path d="M6 10H18"/> <path d="M6 6H18"/> <path d="M6 14H10"/> <path d="M14 16H18"/> <path d="M16 14L16 18"/> <path d="M6 18H10"/> </svg>`
let syncSVG = `<svg width="24px" height="24px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="rotateIconTitle" stroke="#000000" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter" fill="none" color="#000000"> <title id="rotateIconTitle">Rotate</title> <path d="M22 12l-3 3-3-3"/> <path d="M2 12l3-3 3 3"/> <path d="M19.016 14v-1.95A7.05 7.05 0 0 0 8 6.22"/> <path d="M16.016 17.845A7.05 7.05 0 0 1 5 12.015V10"/> <path stroke-linecap="round" d="M5 10V9"/> <path stroke-linecap="round" d="M19 15v-1"/> </svg>`;
let lockSVG = `<svg width="24px" height="24px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="lockAltIconTitle" stroke="#000000" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter" fill="none" color="#000000"> <title id="lockAltIconTitle">Lock</title> <rect width="14" height="10" x="5" y="11"/> <path d="M12,3 L12,3 C14.7614237,3 17,5.23857625 17,8 L17,11 L7,11 L7,8 C7,5.23857625 9.23857625,3 12,3 Z"/> <circle cx="12" cy="16" r="1"/> </svg>`;

function createRow({
    title = "Untitled",
    id = crypto.randomUUID(),
    parentElement = undefined,
    sendAccepted = false //  add to lists not blacklisted or are whitelisted
}) {
    let container = document.createElement('div');
    let row = document.createElement('div');
    let button = document.createElement('button');
    let buttonText = document.createElement('div');
    let menu = document.createElement('button');
    let dragIcon = createSvgIcon(dragSVG, 'drag-icon');
    let menuIcon = createSvgIcon(menuSVG, 'trash-icon');
    let footer = document.getElementById('group_footer');
    let toggle = createToggle(id);

    buttonText.innerText = title;

    let elements = [row, button, menu, dragIcon];

    row.id = `row_${id}`;
    row.className = "row";
    row.dataset.title = title;
    row.dataset.sync = lists[id]?.settings?.s !== undefined ? lists[id]?.settings?.s : true;
    container.className = "row_container";
    button.className = "row_conf_btn button-secondary";
    buttonText.className = "row-button-text";
    menu.className = "menu-button button-secondary";

    if (lists[id]?.settings?.t == undefined) { // if toggle setting exists
        toggle.checkbox.checked = true; // set to toggle on
    } else {
        toggle.checkbox.checked = lists[id]?.settings?.t ? true : false; // if list is toggled on or off
    }

    elements.forEach(element => { // to announce they are droppable
        element['dataset']["droppable"] = "true";
        element['dataset']["parent"] = id; // will tell which is the parent
    })

    createMenu(menu, row, id); // menu for various actions on the group

    button.appendChild(buttonText);
    row.appendChild(dragIcon);
    row.appendChild(button);
    row.appendChild(menu);
    menu.appendChild(menuIcon);
    row.appendChild(toggle.element);
    container.appendChild(row);

    buttonText.dataset.scrollWidth = buttonText.scrollWidth; // comment

    //button.addEventListener('click', setupRow); // add new item

    button.addEventListener('click', (e) => {
        listConfigurator(e, parentElement, id, title, footer); // to the list 
    })

    toggle.checkbox.addEventListener("change", e => {
        changeSettingHandler(id, "t").then(result => {
            chrome.runtime.sendMessage({ command: { toggleList: {id: id, toggle: result} } })
            e.target.checked = result
        }) // toggle list on or off
    });

    draggable(dragIcon, row, parentElement);  // make the list groups draggable 
    tooltip(toggle.element.lastElementChild, "Toggle List on/off", "top-start", "mouseover", "text"); // set tooltip for toggle option

    if (sendAccepted) {
        chrome.runtime.sendMessage({ command: { addToAccepted: id } })
    }

    return container;
}

function createMenu(button, row, id) {
    let menu = document.createElement("div");
    let delOpt = document.createElement("div");
    let syncOpt = document.createElement("div");
    let sep = document.createElement("div");
    let denySiteOpt = document.createElement("div");
    let denyPageOpt = document.createElement("div");
    let allowSiteOpt = document.createElement("div");

    let delText = document.createElement("span");
    let syncText = document.createElement("span");
    let denySiteText = document.createElement("span");
    let denyPageText = document.createElement("span");
    let allowSiteText = document.createElement("span");

    let denySiteIcon = createSvgIcon(addToListSVG, "add-icon");
    let denyPageIcon = createSvgIcon(addToListSVG, "add-icon");
    let syncIcon = createSvgIcon(syncSVG, 'add-icon');
    let lockIcon = createSvgIcon(lockSVG, 'add-icon');
    let trashIcon = createSvgIcon(trashSVG, 'add-icon trash-icon')

    syncOpt.id = `menu_${id}`;
    delOpt.id = "delete_option";
    syncOpt.id = `menu_sync_${id}`;
    denySiteOpt.id = "deny_site_option";
    denyPageOpt.id = "deny_page_option";
    allowSiteOpt.id = "allow_site_option";

    menu.className = "menu";
    delOpt.className = "menu-option";
    syncOpt.className = "menu-option";
    denySiteOpt.className = "menu-option";
    denyPageOpt.className = "menu-option";
    allowSiteOpt.className = "menu-option";
    sep.className = "menu-option seperator";

    delText.innerText = "Delete";
    denySiteText.innerText = "Denylist Site";
    denyPageText.innerText = "Denylist Page";
    allowSiteText.innerText = "Lock to This Site";
    syncText.innerText = lists[id]?.settings?.s ? "Turn off Sync" : "Turn on Sync";

    delOpt.appendChild(trashIcon);
    delOpt.appendChild(delText);

    denySiteOpt.appendChild(denySiteIcon);
    denySiteOpt.appendChild(denySiteText);

    denyPageOpt.appendChild(denyPageIcon);
    denyPageOpt.appendChild(denyPageText);

    allowSiteOpt.appendChild(lockIcon);
    allowSiteOpt.appendChild(allowSiteText);

    syncOpt.appendChild(syncIcon);
    syncOpt.appendChild(syncText);

    menu.appendChild(delOpt);
    menu.appendChild(syncOpt);
    menu.appendChild(sep);
    menu.appendChild(denySiteOpt);
    menu.appendChild(denyPageOpt);
    menu.appendChild(allowSiteOpt);

    tooltip(button, menu, "bottom-start", "click", "menu");

    delOpt.addEventListener("click", (e) => {
        button.click();
        row.parentElement.remove();
        removeList(id); // remove the list from the creator
    })

    syncOpt.addEventListener("click", e => {
        changeSettingHandler(id, "s").then(result => { changeSync(id, result) }) // toggle sync option on or off
    });

    denySiteOpt.addEventListener("click", e => restrictOptPush(button, id, "b", "origin", "*")); // use wildcard to match all the pages of the site
    denyPageOpt.addEventListener("click", e => restrictOptPush(button, id, "b", "href", "")); // href: the location property
    allowSiteOpt.addEventListener("click", e => restrictOptPush(button, id, "w", "origin", "*")); // use wildcard to match all the pages of the site

}

function restrictOptPush(button, id, where, prop, wildcard) {
    // will add to the custom options of the list
    chrome.runtime.sendMessage({ command: "getLocation" }, (response) => {

        if (response.url) {
            let domain = new URL(response.url)[prop];
            restrictOptHandler(id, where, domain + wildcard);
        }
        button.click() // click the menu button to close menu
    })
}

function restrictOptHandler(id, type, url) {
    // id: the list id
    // type: whitelist or blacklist
    // the url to add
    chrome.storage.local.get(id, (data) => {

        data[id].settings[type].push(url); // set url to the list data
        data[id].settings.e = true; // set custom settings to enabled


        chrome.storage.local.set(data, (result) => { // store altered data
            if (chrome.runtime.lastError) {
                alertMessage.innerText = chrome.runtime.lastError.message;
                alertMessage.parentElement.hidden = false;
            }
            // make the same changes to our list var
            lists[id].settings[type].push(url);
            lists[id].settings.e = true;

        })

    })
}

function changeSettingHandler(id, prop) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(id, (data) => { //get stored list
            let boolSetting = data[id].settings[prop]; // get a setting with boolean value

            data[id].settings[prop] = !boolSetting; // reverse value

            chrome.storage.local.set(data, (result) => { // store value
                if (chrome.runtime.lastError) {
                    alertMessage.innerText = chrome.runtime.lastError.message;
                    alertMessage.parentElement.hidden = false;
                }
                // make the same changed to our list var
                lists[id].settings[prop] = !boolSetting;
                resolve(!boolSetting);
            })

        })

    })
}

function createToggle(id) {
    // our toggle element set
    let label = document.createElement('label');
    let input = document.createElement('input');
    let span = document.createElement('span');

    input.type = "checkbox";
    input.setAttribute("checked", "checked");
    input.id = `toggle_${id}`;
    label.className = "toggle-control-row";
    span.className = "control-row";

    label.appendChild(input);
    label.appendChild(span);

    return { element: label, checkbox: input };
}

function draggable(dragElement, element, container) {
    // the draggable functionality
    let mustScroll = true, // will toggle according to the position of dragged element
        elementClientRect,
        containerHeight,
        elementHeight,
        containerBottomBound,
        maxScrollTop,
        containerClientRect


    if (!dragElement) {
        return;
    }
    if (!element) {
        return;
    }

    let pos_1 = 0, pos_2 = 0, pos_3 = 0, pos_4 = 0, dragged, emptySlot; // to be used to store mouse position and drag element

    dragElement.addEventListener('mousedown', mousedown);

    function mousedown(e) { // when agent presses mouse on drag element
        if (e.button !== 0) {
            return;
        }

        e.preventDefault(); // prevent default action

        emptySlot = element.parentElement; // empty slot is the container of the grabbed elemented
        element.style.zIndex = 1;

        containerClientRect = container.getBoundingClientRect();
        elementClientRect = element.getBoundingClientRect(); // get pos info of grabbed element
        containerHeight = containerClientRect.bottom - containerClientRect.top;
        elementHeight = elementClientRect.bottom - elementClientRect.top;
        containerBottomBound = containerHeight - elementHeight; // bottom boundaries of container
        maxScrollTop = container.scrollHeight - container.clientHeight; // max scrolling value from top to bottom or vice versa

        element.style.position = "absolute"; // enable element to be dragged
        window.addEventListener("mousemove", drag); //to listen to the mouse moving
        window.addEventListener("mouseup", stopDrag); // to listen to when the agent releases mouse button

        pos_3 = e.clientX; // store initial X position of mouse
        pos_4 = e.clientY; // store initial Y position of mouse
    }


    function drag(e) { // when the mouse moves

        pos_1 = pos_3 - e.clientX; // initial X position minus current X position (values -1 or 1)
        pos_2 = pos_4 - e.clientY; // initial Y position minus current Y position (values -1 or 1)
        pos_3 = e.clientX; // replace previous X position with current
        pos_4 = e.clientY; // replace previous Y position with current
        element.style.top = (element.offsetTop - pos_2) + 'px'; // update element Y position (current position - Y position)
        element.style.left = (element.offsetLeft - pos_1) + 'px'; // update element X position (current position - X position)

        elementClientRect = element.getBoundingClientRect();
        let elementYPos = elementClientRect.y - containerClientRect.y; // top position of dragged elemenet within it's container and not the window

        if (elementYPos < 0) { // if it exceeds container top boundaries
            mustScroll = true;
            startScroll(element, -1, maxScrollTop); // start scrolling upwards on the container
        } else if (elementYPos > containerBottomBound) { // if it exceeds container bottom boundaries
            mustScroll = true;
            startScroll(element, +1, maxScrollTop) // start scrolling downwards on the container
        } else { // if it's within boundaries
            mustScroll = false; // stop scrolling
        }

        element.style.display = "none"; // hide element 
        let elementPointed = document.elementFromPoint(pos_3, pos_4); // get pointed element beneath now hidden element
        element.style.display = "flex"; // unhide element

        if (elementPointed?.dataset?.droppable) { // if pointed element can be dropped onto
            elementPointed = document.getElementById(`row_${elementPointed.dataset.parent}`); // get it's parent element since event could be dispatched from one of the child elements
            let elementPointedParent = elementPointed.parentElement; // the parent 
            emptySlot.appendChild(elementPointed); // append pointed element to the empty slot
            emptySlot = elementPointedParent; // empty slot is now the container of the pointed element
        }

    }

    function startScroll(elementDragged, value, max) {
        let interval = setInterval(scroll, 30); // interval to scroll continuously

        function scroll() {
            if (!mustScroll) { // stops scrolling action
                clearInterval(interval);
                return;
            }

            if ((container.scrollTop <= 0 && value < 0) || (container.scrollTop >= max && value > 0)) { // stops scrolling action if we are already to the top or bottom of the element
                clearInterval(interval);
                return;
            }

            container.scrollTop = Math.ceil(container.scrollTop) + value; // scroll action; ceil scrollTop as non-integer values are returned when pixel ratio is not 1
            elementDragged.style.top = (parseInt(elementDragged.style.top) + value) + 'px'; // move up the dragged element as much as we scrolled up since it'll stay stationary otherwise
        }

    }

    function stopDrag(e) { // when mouse button releases
        window.removeEventListener("mousemove", drag); // stop tracking mouse movement, effectively stopping element from moving
        window.removeEventListener("mouseup", stopDrag); // stop tracking mouse movement, effectively stopping element from moving

        cssStyle(element, "position: initial; top: initial; left: initial; z-index: initial");
        emptySlot.appendChild(element);
        storeOrder();
    }

}