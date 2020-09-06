let queries = [];

let pattern = '';
let bkrColor = '';
let color = '';
let flags = '';
let onlyWords = '';
let id = '';

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

        currentNode = treeWalker.nextNode(); // correntNode value is now the next text node of the DOM

    };

    console.timeEnd(`query_${stringArr}`);
    observer.observe(document.body, { childList: true, subtree: true })
}

const observer = new MutationObserver(function (mutations) {

    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
            highlightText_2(pattern, bkrColor, color, flags, onlyWords, addedNode, id)

            //             addedNode.childNodes.forEach(childNode=>{
            //                 if(childNode.nodeName === '#text'){
            // //                     observer.disconnect();
            //                 }
            //             })
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

// textarea.onkeydown = function (e) {

//     if (e.keyCode === 13) {
//         e.preventDefault();
//         textarea.value = textarea.value.trim();
//         if (textarea.value === '') {
//             removeHighlight()
//             return
//         }

//         queries = textarea.value.split(' ');
//         queries.sort(function (a, b) {
//             if (a.length > b.length) {
//                 return -1
//             } else if (a.length < b.length) {
//                 return 1
//             }
//             return 0
//         });
//         queries = [...new Set(queries)];

//         let queriesArr = {};

//         queries.forEach(function (query) {
//             let h = Math.floor(Math.random() * 360)
//             let color;
//             if (h < 272 && h > 233) { color = '#fff' } else { color = '#000' }
//             queriesArr[query] = new Query(query, `hsl(${h},100%,75%)`, color, 'gi', true, document.body);
//         })
//         console.log(queriesArr)
//     }
//     textarea.focus();
// }


window.onload = function () {
    initialize();
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



// if (!document.getElementById(`\\b${query}\\b`) && !document.getElementById(query)) {
//     setTimeout(() => {

//         highlightText_2(query, `hsl(${h},100%,75%)`, `${color}`);

// storage object-> lists object-> queries object -> query objects


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.command === "initialize") {
            initialize();
        };
        if (request.command.id) {
            removeHighlight(document.querySelectorAll(`#${request.command.id}`))
        }
        if (request.command.query) {
            initializeSingle(request.command.query);
        }
    });

function initialize() {
    chrome.storage.local.get(['queryItems'], function (result) {
        let queryItems = result.queryItems.queries;

        console.log(queryItems)
        let list = {
            queryItems,
            getProperty: function (property) {
                let arr = [];
                Object.keys(this.queryItems).forEach(key => {
                    arr.push(this.queryItems[key][property]);
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

        console.log(id)
        highlightText_2(pattern, bkrColor, color, flags, onlyWords, document.body, id)
    })
}

function initializeSingle(query) {
    if (query[3] === 'flag-on') { query[3] = 'gi' } else { query[3] = 'g' };

    highlightText_2([query[0]], [query[1]], [query[2]], [query[3]], [true], document.body, [query[4]])
}