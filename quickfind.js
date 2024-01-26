function quickFind(highlightFunc, removeFunc) {
    window.removeEventListener("keydown", startQuickFind);
    let lists = [];
    let container = document.createElement('div');
    let title = document.createElement('span');
    let words = document.createElement('textarea');
    let exitBtn = document.createElement("span");

    let buttonsContainer = document.createElement('div');
    let wholeBtn = document.createElement('span');
    let regexBtn = document.createElement('span');
    let saveBtn = document.createElement('span');
    let resetBtn = document.createElement('span');

    let delimiter = ",";

    let styles = getQuickfindStyle();

    container.id = "quickfind_highlight_magic";
    title.id = "title_highlight_magic";
    words.id = "words_highlight_magic";
    exitBtn.id = "exit_highlight_magic";

    buttonsContainer.className = "buttons_highlight_magic";
    wholeBtn.className = "button_highlight_magic button_highlight_magic_clicked";
    regexBtn.className = "button_highlight_magic";
    saveBtn.className = "button_highlight_magic";
    resetBtn.className = "button_highlight_magic";

    wholeBtn.dataset.active = true;
    regexBtn.dataset.active = false;

    title.innerText = "Quickfind:";
    words.placeholder = "Press enter or add seperator manually.";
    wholeBtn.innerText = "Whole";
    regexBtn.innerText = "Regex";
    resetBtn.innerText = "Reset";
    saveBtn.innerText = "Save";
    exitBtn.innerText = "\u2716";

    buttonsContainer.appendChild(resetBtn);
    buttonsContainer.appendChild(wholeBtn);
    buttonsContainer.appendChild(regexBtn);
    buttonsContainer.appendChild(saveBtn);
    container.appendChild(title);
    container.appendChild(exitBtn);
    container.appendChild(words);
    container.appendChild(buttonsContainer);

    resetBtn.addEventListener("click", resetHandler);
    wholeBtn.addEventListener("click", buttonClickAction);
    regexBtn.addEventListener("click", buttonClickAction);
    exitBtn.addEventListener("click", exitQuickfind);
    saveBtn.addEventListener("click", (e) => {
        saveGroup(
            e,
            words.value.split(delimiter).map(val => val.trim()),
            regexBtn.dataset.active === "true",
            wholeBtn.dataset.active === "true"
        ).then(response => {
            let text = e.target.innerText
            e.target.innerText = response;
            setTimeout(() => {
                e.target.innerText = text
            }, 1000)
        })
    })

    document.head.appendChild(styles);
    document.body.appendChild(container);

    words.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            exitQuickfind(e);
            return;
        }

        if (e.key === delimiter || e.key == "Enter") {

            if (e.key == "Enter") {
                e.target.value += delimiter + " ";
                e.preventDefault()
            };
            let words = e.target.value.split(delimiter);
            let group = [];

            for (let i = 0; i < words.length; i++) {
                let word = words[i].trim();
                let colors = getColor();
                let data = { e: true, p: word, f: "gi", bc: colors[0], c: colors[1], wholeWords: wholeBtn.dataset.active === "true", regex: regexBtn.dataset.active === "true" };
                group.push(data)
            }
            highlight({ root: document.body, lists: group });
        }
    })

    function exitQuickfind(e) {
        e.preventDefault();
        container.remove();
        resetHandler(e);
        window.addEventListener("keydown", startQuickFind);
    }

    function resetHandler(e) {
        e.preventDefault();
        words.value = "";
        removeFunc(document.querySelectorAll('.hltd_text'));
    }

    words.focus();
}

async function saveGroup(e, words, regex, wholeWords) {
    e.preventDefault();
    if (words.length === 1 && words[0] === "") { return "Empty" }

    let listOrder = await retrieveListOrder();
    let packet = { dm: new Date().toJSON(), listOrder: listOrder }
    let lists = [];
    let groupId = crypto.randomUUID();
    let name = "Quickfind List";
    let enable = true;

    if (regex === false && wholeWords === true) {
        enable = false
    }

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word == "") { continue };
        const colors = getColor();
        lists.push({ bc: colors[0], c: colors[1], f: "gi", p: word, i: crypto.randomUUID() });
    }
    let settings = { t: true, e: enable, s: true, regex: regex, wholeWords: wholeWords, b: [], w: [] };
    packet[groupId] = { name: name, lists: lists, settings: settings };
    packet.listOrder.push({ id: groupId, name: name });
    let store = await saveList(packet);
    return store;
}

function buttonClickAction(e) {
    e.preventDefault();

    if (e.target.dataset.active == "true") {
        e.target.dataset.active = false;
        e.target.className = "button_highlight_magic";
    } else {
        e.target.dataset.active = true;
        e.target.className += " button_highlight_magic_clicked";
    }
}

function getQuickfindStyle() {
    let style = document.createElement('style');
    let css = `
#quickfind_highlight_magic {
    position: fixed !important;
    width: 300px !important;
    z-index: 999999 !important;
    top: 50px !important;
    right: 50px !important;
    padding: 0px 10px !important;
    background-color: #5a5a5a6e !important;
    backdrop-filter: blur(4px) !important;
    border-radius: 4px !important;
    border: none !important;
    color: black !important;
    box-shadow: none !important;
    transition: none !important;
    margin: 0px !important;
}

#title_highlight_magic {
    display: flex !important;
    align-items: center !important;
    font-family: system-ui !important;
    color: #fc036b !important;
    font-weight: 900 !important;
    font-size: 12px !important;
    height: 16px !important;
    box-shadow: none !important;
    transition: none !important;
    margin: 0px !important;
}

#exit_highlight_magic {
	display: inline-flex !important;
	position: absolute !important;
	right: 4px !important;
	top: 8px !important;
	height: 0px !important;
    align-items: center !important;
    justify-content: center !important;
    border: none !important;
    font-family: system-ui !important;
    box-shadow: none !important;
    transition: none !important;
    outline: none !important;
    padding: unset !important;
    font-size: 11px !important;
    font-weight: 400 !important;
    color: white !important;
    background-color: transparent !important;
    cursor: pointer !important;
    margin: 0px !important;
    user-select: none !important;
}

#words_highlight_magic {
    display: block !important;
    font-family: arial !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    height: 100px !important;
    resize: vertical !important;
    overflow: hidden !important;
    width: 100%; !important;
    width: -moz-available; !important;      
    width: -webkit-fill-available; !important;
    width: fill-available; !important;
    border-radius: 4px !important;
    outline: none !important;
    background-color: inherit !important;
    color: white !important;
    border: 1px solid #858585 !important;
    box-shadow: none !important;
    transition: none !important;
    padding: unset !important;
    padding-left: 5px !important;
    margin: 0px !important;
}

#words_highlight_magic::placeholder {
    color: #dedede !important;
    font-style: italic !important;
}

.buttons_highlight_magic {
    display: flex !important;
    flex-direction: row !important;
    height: 25px !important;
    margin: 4px 0px !important;
    gap: 4px; !important;
}

.button_highlight_magic {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 4px !important;
    border: 1px solid #5a5a5a6e !important;
    font-family: system-ui !important;
    box-shadow: none !important;
    transition: none !important;
    outline: none !important;
    padding: 5px !important;
    font-size: 13px !important;
    font-family: arial !important;
    font-weight: 400 !important;
    color: white !important;
    background-color: #5a5a5a6e !important;
    cursor: pointer !important;
    margin: 0px !important;
    user-select: none !important;
    flex: 1 !important;
}

.button_highlight_magic:hover {
    background-color: #a7a4a46e !important;
}

.button_highlight_magic_clicked {
    border: 1px solid #ffff00 !important;
}
`

    style.innerHTML = css;

    return style;
}

function getColor() {
    let rgb = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]; // get random RGB colors
    let hexColor = rgb.map(x => x.toString(16))
    hexColor = hexColor.map((val) => {
        if (val.length == 1) {
            return 0 + val
        } else {
            return val
        }
    })
    hexColor = '#' + hexColor.join(''); // complete hex color code
    let Y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722; // calculate relative luminance with formula provided by ITU-R BT.709 color space standards src: https://en.wikipedia.org/wiki/Relative_luminance
    let color;
    Y >= 145 ? color = '#000000' : color = '#ffffff'; // if rgb is dark, color is white, else color is black
    return [hexColor, color, rgb, Y]; // return all info in an array
};


window.addEventListener("keydown", startQuickFind)

function startQuickFind(e) {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyF") {
        quickFind(highlight, removeHighlight)
    }
}

function retrieveListOrder() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["listOrder"], function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message)
            }
            resolve(result.listOrder)
        })
    })
}

function saveList(list) {
    return new Promise((resolve, reject) => {
        list.dm = new Date().toJSON();
        chrome.storage.local.set(list, function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve("OK")
        })
    })
}