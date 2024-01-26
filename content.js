let isWholeWords = true;
let listCache = [];
let acceptedLists = {}; // holds lists not blacklisted or are whitelisted
let toggle = true;

let settings = {
    blacklist: "",
    blacklistItems: [''],
    regex: false,
    wholeWords: true,
};

function highlight({ lists = [], root = document.body }) {
    let count = 0;
    //console.time('highlight')
    observer.disconnect();

    if (typeof lists === "string") { lists = [lists] };

    let range = document.createRange(); // create a new range
    let regex
    let patttern

    let treeWalker = document.createTreeWalker(
        root, // the root element of the subelements we will is through
        NodeFilter.SHOW_TEXT, // grab all the text nodes
        {
            acceptNode: function (node) { // additional filtering
                if (node.parentNode.nodeName !== "STYLE"
                    && node.parentNode.nodeName !== "SCRIPT"
                    && node.parentNode.nodeName !== "OPTION"
                    && node.parentNode.nodeName !== "TEXTAREA"
                    && node.parentNode.className !== "hltd_text"
                    && (node.textContent.search(/[^ ]/) > -1)
                    && node.parentNode.isContentEditable !== true) {
                    return NodeFilter.FILTER_ACCEPT // return FILTER_ACCEPT value which means select particular node
                }
            }
        }
        // this method allows to filter out unwanted elements and sift through the ones of your choosing
    );
    let currentNode = treeWalker.nextNode(); // currentNode hold not the treeWalker.currentNode but the next one effectively skipping document.body



    while (currentNode) { // while currentNode exists


        for (i = 0; i < lists.length; i++) {

            let list = lists[i];
            let regexEnable = !list.e ? settings.regex : list.regex;
            let WholeEnable = !list.e ? settings.wholeWords : list.wholeWords;

            let italic = list?.is ? 'font-style: italic;' : "";
            let bold = list?.bs ? 'font-weight: 800;' : "";
            let underline = list?.us ? "text-decoration: underline;" : "";

            if (list.p !== '') {

                let bgColor = list.cm === false ? list.cb : list.bc
                let color = list.cm === false ? list.ct : list.c

                if (!regexEnable) {
                    patttern = list.p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') //-bobince & fregante : https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
                } else {
                    patttern = list.p
                }

                if (WholeEnable) {
                    regex = new RegExp(`\\b${patttern}\\b`, list.f); // create a regular expression from the string provided by user
                } else {
                    regex = new RegExp(patttern, list.f); // create a regular expression from the string provided by user
                }

                let array; // will hold information about each occurrence

                while ((array = regex.exec(currentNode.textContent)) !== null) { // while an occurence is found

                    let span = document.createElement('hlmagic'); // create span element
                    range.setStart(currentNode, array.index); // set the start-position of range on the current textnode on the position the occurrence is found
                    range.setEnd(currentNode, (array.index + array[0].length)); // set the end-position of range, on the current textnode, on the position where occurance is found plus the length of the string
                    span.style.cssText = `background-color: ${bgColor}; color: ${color}; border-radius: 3px; box-shadow: #20202059 1px 1px 3px; pointer-events: inherit; ${italic} ${bold} ${underline}`; // use background color
                    span.className = 'hltd_text';
                    span.id = list.i;
                    range.surroundContents(span);
                    count++
                }
            }
        }

        currentNode = treeWalker.nextNode(); // currentNode value is now the next text node of the DOM

    };

    setBadge(count)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    //console.timeEnd('highlight');

}

const observer = new MutationObserver(function (mutations) {
    let queue = []

    mutations.forEach(mutation => {

        mutation.addedNodes.forEach(addedNode => {
            if (addedNode.nodeName == "#comment") { return }

            if (addedNode.nodeName == "#text") {
                if (addedNode.parentNode === mutation.target) { return };
                addedNode = addedNode.parentNode
            }

            if (!addedNode) { return };
            if (queue.indexOf(addedNode) == -1) {
                queue.push(addedNode)
                if (queue.indexOf(addedNode.parentNode) > 0) {
                    queue.splice(addedNode.parentNode, 1);
                }
            }
        })

        if (mutation.type == "characterData") {
            if (queue.indexOf(mutation.target.parentNode) == -1) {
                queue.push(mutation.target.parentNode)
                if (queue.indexOf(mutation.target.parentNode.parentNode) > 0) {
                    queue.splice(queue.indexOf(mutation.target.parentNode.parentNode), 1);
                }
            }
        }
    })

    if (!queue.length) {
        return;
    }

    queue = queue.filter(el =>
        el.nodeName !== 'OPTION'
        && el.nodeName !== "STYLE"
        && el.nodeName !== "SCRIPT"
        && el.nodeName !== "OPTION"
        && el.nodeName !== "TEXTAREA")

    if (!queue.length) {
        return;
    }

    queue = queue.filter(n => !queue.find(m => m !== n && m.contains(n)));

    setTimeout(() => {
        for (let i = 0; i < queue.length; i++) {
            const element = queue[i];
            highlight({ lists: listCache, root: element })
        }
    }, 0)
})

window.onload = initialize;

function removeHighlight(highlighted) {
    //console.log('remove from doc: ', highlighted.length)
    observer.disconnect();
    highlighted.forEach(function (hlt) {
        hlt.before(hlt.textContent)
        hlt.remove();
    })
    document.normalize();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // console.clear()
        if (request.command === "initialize") {
            initialize();
        };
        if (request.command.id) {
            removeHighlight(document.querySelectorAll(`${request.command.id[0]}`));
            updateListCache()
        };
        if (request.command.query) {
            initializeSingle(request.command.query);
            updateListCache();
        };
        if (request.command.changeColor) {
            changeColor(request.command.changeColor);
            updateListCache();
        };
        if (request.command.toggle) {
            turnOnOff(request.command.toggle)
        }
        if (request.command.newSettings) {
            settings = request.command.newSettings
        }
        if (request.command.addToAccepted) {
            acceptedLists[request.command.addToAccepted] = true;
        }
        if (request.command.toggleList) {
            toggleLine(request.command.toggleList);
        }
        if (request.command.changeStyle) {
            changeStyle(request.command.changeStyle);
        }
    });

function initialize() {
    chrome.runtime.sendMessage({ command: { retrieveLists: { url: location.href } } }, function (response) {
        if (!response.toggle) {
            toggle = response.toggle;
            return
        };

        if (response.lists) {
            listCache = response.lists;
        }

        if (response.settings) {
            settings = response.settings
        }

        if (response.acceptedLists) {
            acceptedLists = response.acceptedLists;
        }

        highlight({ root: document.body, lists: listCache })
    })
}

function updateListCache() {
    chrome.runtime.sendMessage({ command: { retrieveLists: { url: location.href } } }, function (response) {
        listCache = response.lists;
        //console.log(listCache.map(list => list.p.patterns).join('\n'))
    })
}

function initializeSingle(query) {
    if (!toggle) { return };
    let appended = appendItem(query);
    if (!appended) { return };
    if (!acceptedLists[query.l]) { return };

    removeHighlight(document.querySelectorAll(`[id="${query.i}"]`));
    highlight({ root: document.body, lists: [query] })
}

function appendItem(item) {
    let index = listCache.findIndex(list => list.i == item.i);

    if (index == -1) {
        return true;
    }

    let samePattern = listCache[index].p === item.p
    //console.log('same pattern: ', samePattern)
    if (!samePattern) {
        return true;
    }
    return false;
}

function changeColor(info) {
    let color = info.color;
    let colorType = info.colorType;
    let queryId = info.queryId;
    let instances = document.querySelectorAll(`[id="${queryId}"]`);
    if (colorType === 'bkgrColor') {
        instances.forEach(instance => { instance.style.backgroundColor = color });
    } else {
        instances.forEach(instance => { instance.style.color = color });
    };
};

function turnOnOff(value) {
    value = value[0];

    if (value) {
        toggle = true;
        initialize();
    } else {
        toggle = false;
        removeHighlight(document.querySelectorAll('.hltd_text'));
        observer.disconnect();
    };

}

function toggleLine(group) {

    if (!toggle) { return };
    if (!group.toggle) {
        // if toggled off
        let toRemove = []; // will hold words of the same group
        let newListCache = [];

        listCache.forEach(list => {
            if (list.groupId !== group.id) {
                newListCache.push(list)
                return;
            }
            toRemove.push(`[id="${list.i}"]`);
        })

        if (!toRemove.length) { return }

        selector = toRemove.join(', '); // compose selector with the word Ids
        let query = document.querySelectorAll(selector);

        if (!query) { return }

        removeHighlight(query);
        acceptedLists[group.id] = false;
        listCache = newListCache;
    } else {
        // if toggled on
        chrome.runtime.sendMessage({ command: { retrieveLists: { url: location.href, key: [group.id, "settings"] } } }, function (response) {
            highlight({ root: document.body, lists: response.lists });
            acceptedLists[group.id] = response.acceptedLists?.[group.id] ? true : false;
            listCache = listCache.concat(response.lists);
        })

    }

}

function changeStyle(data) {

    if (!toggle) { return };

    for (id in data.assignedColors) {
        let matches = Array.from(document.querySelectorAll(`[id="${id}"]`));
        matches.forEach(match => {
            match.style.cssText += data.style;
            match.style.backgroundColor = data.assignedColors[id].bgColor;
            match.style.color = data.assignedColors[id].color;
        })

    }

    chrome.runtime.sendMessage({ command: { retrieveLists: { url: location.href } } }, function (response) {
        listCache = response.lists;
    })

}

function setBadge(n) {
    chrome.runtime.sendMessage({ command: { setBadge: n } }, function (response) {
        console.log('ok')
    })
}