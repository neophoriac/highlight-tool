let queries = [];

let pattern = [];
let bkrColor = [];
let color = [];
let flags = [];
let onlyWords = [];
let id = [];

let isWholeWords = true;

function highlightText_2(stringArr, bkrColor = 'yellow', color = '#000', flags = 'ig', onlyWords = true, root = document.body, id) {
    console.time(`query_${stringArr}`);
    observer.disconnect();

    if (typeof stringArr === "string") { stringArr = [stringArr] };

    let range = document.createRange(); // create a new range
    let regex

    let treeWalker = document.createTreeWalker(
        root, // the root element of the subelements we will is through
        NodeFilter.SHOW_TEXT, // grab all the text nodes
        {
            acceptNode: function (node) { // additional filtering
                if (node.parentNode.nodeName !== "STYLE" && node.parentNode.nodeName !== "SCRIPT" && node.parentNode.nodeName !== "OPTION" && node.parentNode.className !== "hltd_text" && (node.textContent.search(/[^ ]/) > -1)) { // if the parent node of the childnode isn't <style> or <body> we want to use it
                    return NodeFilter.FILTER_ACCEPT // return FILTER_ACCEPT value which means select particular node
                }
            }
        }
        // this method allows to filter out unwanted elements and sift through the ones of your choosing
    );
    let currentNode = treeWalker.nextNode(); // currentNode hold not the treeWalker.currentNode but the next one effectively skipping document.body

    while (currentNode) { // while cirrentNode exists

        for (i = 0; i < stringArr.length; i++) {
            if (stringArr[i] !== '') {
                if (stringArr[i].match(/\//g) && stringArr[i].match(/\//g).length === 2) {
                    let arr = stringArr[i].split('/');
                    stringArr[i] = arr[1];
                    if (arr[2]) {
                        flags[i] = arr[2];
                    }
                }

                if (onlyWords[i]) {
                    regex = new RegExp(`\\b${stringArr[i]}\\b`, flags[i]); // create a regular expression from the string provided by user
                } else {
                    regex = new RegExp(stringArr[i], flags[i]); // create a regular expression from the string provided by user
                }

                let array; // will hold information about each occurrence

                while ((array = regex.exec(currentNode.textContent)) !== null) { // while an occurence is found

                    range.setStart(currentNode, array.index); // set the start-position of range on the current textnode on the position the occurrence is found
                    range.setEnd(currentNode, (array.index + array[0].length)) // set the end-position of range, on the current textnode, on the position where occurance is found plus the length of the string
                    range.deleteContents();
                    let span = document.createElement('font'); // create span element
                    span.textContent = array[0]; // fill the span with the matched word
                    span.style.cssText = `background-color: ${bkrColor[i]}; color: ${color[i]};border-radius: 3px; box-shadow: #c4c4c4 1px 1px 3px;`; // use background color
                    span.className = 'hltd_text';
                    span.id = id[i];
                    range.insertNode(span); // insert node where our current range is

                }
            }
        }

        currentNode = treeWalker.nextNode(); // correntNode value is now the next text node of the DOM

    };

    console.timeEnd(`query_${stringArr}`);
    observer.observe(document.body, { childList: true, subtree: true })
}

const observer = new MutationObserver(function (mutations) {

    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
            highlightText_2(pattern, bkrColor, color, flags, onlyWords, addedNode, id)
        })
    })
})


function removeHighlight(selector) {
    observer.disconnect();
    console.time('remove')
    let hlts = selector
    hlts.forEach(function (hlt) {
        hlt.before(hlt.textContent)
        hlt.remove();
    })
    document.normalize();
    observer.observe(document.body, { childList: true, subtree: true });
    queries = [];
    console.timeEnd('remove');
}

window.onload = function () {
    chrome.storage.local.get(['settings'], function (result) { // get stored settings
        if (result.settings) { //if setings exists
            let items = result.settings.blacklistItems; // array with blacklisted pages
            function checkBlacklist() {
                for (i = 0; i < items.length; i++) { // for each value in array
                    if (location.href.search(items[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')) >= 0 && items[i] !== '') { // check if current page is blacklisted
                        return true; // return true if it is
                    };
                }
                return false; // return false if it's not
            };

            if (!checkBlacklist()) { // if page is not blacklisted
                initialize(); // highlight
            }
        } else { // if settings are not found
            initialize(); // highlight
        }
    })
}

class Query {
    constructor(pattern, bkrColor, color, flags, onlyWords, root) {
        this.pattern = pattern;
        this.bkrColor = bkrColor;
        this.color = color;
        this.flags = flags;
        this.onlyWords = onlyWords;
        this.root = root;

    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.command === "initialize") {
            initialize();
        };
        if (request.command.id) {
            removeHighlight(document.querySelectorAll(request.command.id[0]));
            spliceArrs(request.command.id[1])
        };
        if (request.command.query) {
            initializeSingle(request.command.query);
        };
        if (request.command.changeColor) {
            changeColor(request.command.changeColor);
        };
    });

function initialize() {
    chrome.storage.local.get(['globalList', location.host, 'settings'], function (result) {
        if (!result.globalList) { return }
        let Completedlist = result.globalList.queries;
        let domainList
        if (result[location.host]) {
            domainList = result[location.host].queries;
            Object.assign(Completedlist, domainList);
        };

        // let target = {};
        // Object.keys(queryItems).forEach(key => {
        //     Object.assign(target, queryItems[key]);
        // })

        let list = {
            Completedlist,
            getProperty: function (property) {
                let arr = [];
                Object.keys(this.Completedlist).forEach(key => {
                    arr.push(this.Completedlist[key][property]);
                })
                return arr;
            }
        }
        pattern = list.getProperty('pattern');
        bkrColor = list.getProperty('bkrColor');
        color = list.getProperty('color');
        flags = list.getProperty('flags');
        onlyWords = list.getProperty('onlyWords');
        let root = list.getProperty('root');
        id = list.getProperty('id');

        highlightText_2(pattern, bkrColor, color, flags, onlyWords, document.body, id)
    })
}

function initializeSingle(query) {
    chrome.storage.local.get(['settings'], function (result) { // get stored settings

        if (result.settings) { //if setings exists

            let items = result.settings.blacklistItems; // array with blacklisted pages
            function checkBlacklist() {
                for (i = 0; i < items.length; i++) { // for each value in array
                    if (location.href.search(items[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')) >= 0 && items[i] !== '') { // check if current page is blacklisted
                        return true; // return true if it is
                    };
                }
                return false; // return false if it's not
            };

            if (!checkBlacklist()) { // if page is not blacklisted
                send(); //highlight
            }

        } else { // if settings are not found
            send(); // highlight
        }
    })

    function send() {
        if (query[3] === 'flag-on') { query[3] = 'gi' } else { query[3] = 'g' };
        pattern.push(query[0]);
        bkrColor.push(query[1]);
        color.push(query[2]);
        flags.push(query[3]);
        onlyWords.push(query[4]);
        id.push(query[5]);

        highlightText_2(pattern, bkrColor, color, flags, onlyWords, document.body, id);
    }

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

function spliceArrs(result) {
    if (result !== "all") {
        let index = id.indexOf(result)
        if (index !== -1) {
            pattern.splice(index, 1);
            bkrColor.splice(index, 1);
            color.splice(index, 1);
            flags.splice(index, 1);
            onlyWords.splice(index, 1);
            id.splice(index, 1);
        }
    } else {
        pattern = [];
        bkrColor = [];
        color = [];
        flags = [];
        onlyWords = [];
        id = [];
    }
}