
chrome.storage.local.get('settings', res => {
    let popup = res.settings.dm ? 'popup_dark.html' : 'popup.html'
    chrome.action.setPopup(
        { popup: popup }
    )
})

chrome.storage.onChanged.addListener((changes, areaName)=>{

    if(areaName === "local" && changes.settings){
        let popup = changes.settings.newValue.dm ? 'popup_dark.html' : 'popup.html'
        console.log(changes.settings.newValue.dm)
        chrome.action.setPopup(
            { popup: popup }
        ) 
    }
})

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.command.retrieveLists) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message)
            }
            retrieveAccepted(request.command.retrieveLists).then(lists => sendResponse(lists))
            return true;
        }

        if (request.command === "donate") {
            chrome.tabs.create({ url: 'https://paypal.me/neophoriac' });
            return true;
        }
        if (request.command === "getLocation") {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0]) {
                    sendResponse({ url: (new URL(tabs[0].url)) });
                } else {
                    sendResponse({ url: undefined })
                }
            });
            return true;
        }
        if (request.command === "updateMenu") {
            updateContextMenu();
            return true;
        }
        if (request.command.setBadge) {
            setBadge(request.command.setBadge, sender.tab.id)
            return true;
        }
        sendToContent(request.command);
        return true;
    })

async function setBadge(n, tabId) {

    let tabs = await storageGet('tabs');
    let count = !tabs ? 0 : tabs[tabId.toString()]

    if (!tabs) { count = 0 }

    console.log(count)

    count += n;

    tabs[tabId.toString()] = count

    await storageSet('tabs', tabs)

    chrome.action.setBadgeText(
        {
            text: count.toString(),
            tabId: tabId
        }
    )
}


chrome.tabs.onUpdated.addListener(async (number, changeInfo, tab) => {
    console.log(number, changeInfo, tab)
    if (changeInfo.status == "loading") {

        let tabs = await storageGet('tabs');

        if (!tabs) {
            tabs = { number: "fg" }
        } else {
            tabs[number.toString()] = 0
        }

        await storageSet('tabs', tabs);
    }
})

function sendToContent(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { command: message }, function (response) {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                }
            })
        }
    });
}

function getRegex(pattern) {
    pattern = pattern.replace(/\*/gi, '.*')
    pattern = new RegExp(pattern, "gi");
    return pattern;
}

function retrieveAccepted({ url, key = null }) {
    console.log(url)
    return new Promise((resolve, reject) => {

        chrome.storage.local.get(key, function (result) {
            if (result.toggle && !result.toggle[0]) {
                resolve({ toggle: false })
            };
            let lists = getAcceptedLists(result, url)
            let acceptedLists = {}
            lists.forEach(list => acceptedLists[list.id] = true);
            lists = lists.filter(list => list.lists !== undefined)
            for (let i = 0; i < lists.length; i++) {
                let obj = lists[i];
                obj.lists.map(list => Object.assign(list, obj.settings))
            }
            lists = lists.map(list => list.lists)

            lists = lists.flat()
            if (result.settings) {
                settings = result.settings
            }
            resolve({ lists: lists, settings: result.settings, toggle: true, acceptedLists: acceptedLists })
        })
    })
}


function getAcceptedLists(lists, url) {
    let acceptArr = [];

    let blist = !lists.settings?.blacklistItems?.length ? undefined : isMatch(lists.settings.blacklistItems, url);
    let wlist = !lists.settings?.whitelistItems?.length ? undefined : isMatch(lists.settings.whitelistItems, url);
    let gAccept = acceptLogic(blist, wlist);


    for (let key in lists) {
        const item = lists[key];
        if (!item?.lists) { continue };
        item.id = key;
        item.lists.forEach(list => list.groupId = key)
    }

    lists = Object.values(lists);

    for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (!list?.lists) { continue };
        if (!list?.settings?.t) { continue };

        if (list.settings.e) {
            let cblist = !list.settings.b.length ? undefined : isMatch(list.settings.b, url);
            let cwlist = !list.settings.w.length ? undefined : isMatch(list.settings.w, url);

            if (acceptLogic(cblist, cwlist)) {
                acceptArr.push(list)
            }
        } else {
            if (gAccept) {
                acceptArr.push(list)
            }
        }
    }
    return acceptArr
}

function acceptLogic(blist, wlist) {
    if (blist == true && wlist == true) { return true };
    if (blist == false && wlist == false) { return false };
    if (blist == false && wlist == true) { return true };
    if (blist == true && wlist == false) { return false };
    if (blist == undefined && wlist == undefined) { return true };
    if (blist == true && wlist == undefined) { return false };
    if (blist == false && wlist == undefined) { return true };
    if (blist == undefined && wlist == true) { return true };
    if (blist == undefined && wlist == false) { return false };
}

function isMatch(patterns, url) {
    for (let i = 0; i < patterns.length; i++) {
        let regex = getRegex(patterns[i].replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&'));
        let match = url.match(regex);
        if (!match) { continue };
        if (url == match[0]) { return true };
    }
    return false;
}

chrome.runtime.onInstalled.addListener(oneTimeActions);
chrome.runtime.onStartup.addListener(syncToLocal);

function oneTimeActions(e) {
    if (e.reason === "install") {
        syncToLocal();
        createContextmenu();
    }
    if (e.reason === "update") {
        convertOldStorageAFormat();
        createContextmenu();
    }
}

function syncToLocal() {
    chrome.storage.local.get("dm", (localDate) => {
        chrome.storage.sync.get(null, (data) => {
            // console.log("local:", new Date(localDate.dm)?.valueOf(), "sync: ", new Date(data.dm).valueOf(), new Date(localDate.dm)?.valueOf() >= new Date(data.dm).valueOf())
            if (new Date(localDate.dm)?.valueOf() >= new Date(data.dm).valueOf()) return;
            if (!Object.values(data).length) return;

            for (let key in data) {
                const item = data[key];
                item?.lists?.forEach(entry => entry.i = crypto.randomUUID());
            }

            chrome.storage.local.set(data, (result) => {
                console.log("sync data set to local");
            })
        })
    })
}

function convertOldStorageAFormat() {
    chrome.storage.local.get(null, (data) => {

        let obj = data;
        let packet = { dm: new Date().toJSON(), listOrder: [] };

        if (obj.dm) { return };
        try {
            let globalSettings = { blacklistItems: obj.settings?.blacklist.split("\n").map(val => `${val}*`), whitelistItems: [], regex: obj.settings?.regex, wholeWords: obj.settings?.wholeWords };
            packet.settings = globalSettings;
        } catch (error) {
            console.log(error);
        }

        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {

                const id = crypto.randomUUID();

                if (key == "settings") { continue };
                const item = obj[key];
                let lists = [];

                for (const prop in item.queries) {
                    if (Object.hasOwnProperty.call(item.queries, prop)) {
                        const element = item.queries[prop];
                        lists.push({ bc: element.bkrColor, c: element.color, f: element.flags, p: element.pattern, i: crypto.randomUUID() });
                    }
                }

                let white = [];
                let isEnable = false;
                if (key !== "globalList") {
                    white.push(`*${key}*`);
                    isEnable = true;
                }

                let settings = { t: true, e: isEnable, s: true, regex: false, wholeWords: true, b: [], w: white };
                packet[id] = { name: key, lists: lists, settings: settings };
                packet.listOrder.push({ id: id, name: key });

            }
        }

        chrome.storage.local.clear();
        chrome.storage.local.set(packet, (result) => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            }
        });
    })
}

function createContextmenu() {
    try {
        retrieveListOrder().then((lists) => {
            if (!lists) { return };
            for (let i = 0; i < lists.length; i++) {
                const list = lists[i];
                createContextMenu(list.id, `Add to ${list.name}`);
            }
        });
    } catch (e) {
        console.log(e);
    }
}

function updateContextMenu() {
    chrome.contextMenus.removeAll();
    createContextmenu();
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    createEntry(info.menuItemId, info.selectionText.trim());
})

async function createEntry(id, pattern) {
    let list = await retrieveList(id);
    let listSett = list[id].settings
    let colors = getColor();

    const bkColor = !listSett.cm ? listSett.cb : colors[0];
    const color = !listSett.cm ? listSett.ct : colors[1];

    let entry = { bc: bkColor, c: color, f: "gi", p: pattern, i: crypto.randomUUID() };
    list[id].lists.push(entry);
    let result = await saveList(list);
    entry.l = id;
    entry.is = listSett.is;
    entry.bs = listSett.bs;
    entry.us = listSett.us;
    contentHighlight({ query: entry });
}

function retrieveListOrder() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["listOrder"], function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve(result.listOrder);
        })
    })
}

function retrieveList(id = null) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([id], function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve(result);
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
            resolve("done");
        })
    })
}

function createContextMenu(id, name) {
    chrome.contextMenus.create(
        {
            contexts: ["selection"],
            id: id,
            title: name
        },
    )

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

function contentHighlight(item) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { command: item }, function (response) {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                }
            })
        }
    });
}

async function storageSet(key, value) {
    let data = {}
    data[key] = value
    let set = await chrome.storage.local.set(data).then(() => {
        console.log(`${key} is set!`);
        return chrome.runtime.lastError ? chrome.runtime.lastError : true;
    });
    return set;
}

async function storageGet(key) {
    let get = await chrome.storage.local.get([key]).then((result) => {
        return chrome.runtime.lastError ? chrome.runtime.lastError : result[key];
    })
    return get
}