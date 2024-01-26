let indication = document.getElementById('saving');

function store(lists) {
    let storedLists = [];
    lists.forEach(list => {

        let configurator = list.querySelector('.configurator');

        indication.style.visibility = "visible";

        let key = list.id;
        let items = configurator.querySelectorAll('.item');
        let name = list.getAttribute('name');

        let storedArr = storeList(key, items, name);
        storedLists.push(storedArr);
    })
    return storedLists;
}

function storeList(key, items, name) {
    let itemArr = [];
    let customSettings = getCustSettings(key)

    items.forEach(item => {
        let pattern = item.querySelector('.textarea').value;

        if (pattern === "") {
            return
        };

        let flag = item.querySelector('[data-toggle^="flag"]');
        let bkrColor = item.querySelector('[name="bkgrColor"]').value;
        let color = item.querySelector('[name="color"]').value;
        let id = item.querySelector('.textarea').id;
        flag = flag.dataset.toggle === 'flag-on' ? 'gi' : 'g';


        let obj = {
            p: pattern,
            f: flag,
            i: id
        };

        // random color mode is enabled
        if (customSettings.cm) {
            obj.c = color;
            obj.bc = bkrColor
        }

        itemArr.push(obj);
    });

    let storagePacket = {};
    let obj = { name: name, lists: itemArr, settings: customSettings };
    storagePacket[key] = obj;
    storagePacket["dm"] = new Date().toJSON();

    chrome.storage.local.set(storagePacket, function (result) {
        if (chrome.runtime.lastError) {
            alertMessage.innerText = chrome.runtime.lastError.message;
            alertMessage.parentElement.hidden = false;
        }
        indication.style.visibility = "hidden";
    });

    Object.assign(lists, storagePacket);
    return itemArr;
}

function storeSettings() {
    indication.style.visibility = "visible";
    let isRegex = document.getElementById('regex').checked;
    let isWholeWords = document.getElementById('completeWords').checked;

    let blacklistItems = Array.from(document.getElementById('blacklist').children);
    blacklistItems = blacklistItems.map(el => el.children[1].value);
    blacklistItems = blacklistItems.filter(val => val !== "");

    let whitelistItems = Array.from(document.getElementById('whitelist').children);
    whitelistItems = whitelistItems.map(el => el.children[1].value);
    whitelistItems = whitelistItems.filter(val => val !== "");

    let settings = { regex: isRegex, wholeWords: isWholeWords, blacklistItems: blacklistItems, whitelistItems: whitelistItems };
    chrome.storage.local.set({ settings: settings, dm: new Date().toJSON() }, function (result) {
        if (chrome.runtime.lastError) {
            alertMessage.innerText = chrome.runtime.lastError.message;
            alertMessage.parentElement.hidden = false;
        }
        indication.style.visibility = "hidden";
        chrome.runtime.sendMessage({ command: { newSettings: settings } });
    });

}

function getCustSettings(id) {

    const isEnabled = document.getElementById('toggle_custom').checked;
    const isPaused = document.getElementById(`toggle_${id}`).checked;
    const isSync = document.getElementById('sync_storage').checked;
    const isRegex = document.getElementById('regexCust').checked;
    const isWholeWords = document.getElementById('completeWordsCust').checked;
    const isRandomMode = document.getElementById('settings_random_color').checked;
    const isItalic = document.getElementById('italic_style').checked;
    const isBold = document.getElementById('bold_style').checked;
    const isIUnderline = document.getElementById('underline_style').checked;

    let blacklistItems = Array.from(document.getElementById('blacklistCust').children);
    blacklistItems = blacklistItems.map(el => el.children[1].value);
    blacklistItems = blacklistItems.filter(val => val !== "");

    let whitelistItems = Array.from(document.getElementById('whitelistCust').children);
    whitelistItems = whitelistItems.map(el => el.children[1].value);
    whitelistItems = whitelistItems.filter(val => val !== "");

    let settings = {
        t: isPaused,
        e: isEnabled,
        s: isSync,
        regex: isRegex,
        wholeWords: isWholeWords,
        b: blacklistItems,
        w: whitelistItems,
        cm: isRandomMode,
        is: isItalic,
        bs: isBold,
        us: isIUnderline
    };

    if (!isRandomMode) {
        let bgColor = document.querySelector('[name="bg-option"]:checked').dataset.color;
        let textColor = document.querySelector('[name="color-option"]:checked').dataset.color

        settings.cb = bgColor
        settings.ct = textColor
    }
    changeSync(id, isSync)

    return settings;

}

function removeList(key) {
    chrome.storage.local.remove(key, function (response) {
        if (chrome.runtime.lastError) {
            alertMessage.innerText = chrome.runtime.lastError.message;
            alertMessage.parentElement.hidden = false;
        }
        storeOrder();
        delete lists[key];
    });

}

function storeOrder() {
    indication.style.visibility = "visible";

    let rows = Array.from(document.getElementsByClassName('row'));
    listOrder = [];

    for (i = 0; i < rows.length; i++) {
        let row = rows[i];
        let id = row.dataset.parent;
        let name = row.querySelector('.row_conf_btn').innerText;

        let obj = {
            id: id,
            name: name
        }
        listOrder.push(obj);
    }

    chrome.storage.local.set({ listOrder: listOrder, dm: new Date().toJSON() }, function (result) {
        indication.style.visibility = "hidden";
        chrome.runtime.sendMessage({ command: "updateMenu" })
    });
}

function initListInStorage(id, name, lists = []) {
    const randColor = getColor();
    const packet = { dm: new Date().toJSON() }
    const settings = { t: true, e: false, s: true, regex: false, wholeWords: true, b: [], w: [], cm: false, cb: randColor[0], ct: randColor[1], is: false, bs: false, us: false };
    packet[id] = { name: name, lists: lists, settings: settings };
    chrome.storage.local.set(packet, (result) => {
        if (chrome.runtime.lastError) {
            alertMessage.innerText = chrome.runtime.lastError.message;
            alertMessage.parentElement.hidden = false;
        }
        lists = packet;
        changeSync(id, true);
        storeOrder();
    });
    return packet[id];
}

function createPrimeList(wordArray) {
    let list = [];
    wordArray.forEach(word => {
        let item = {f: "gi", i: crypto.randomUUID(), p: word.trim() };
        list.push(item);
    });
    return list;
}