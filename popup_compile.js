
class QueryLine {
    constructor(pattern, bkrColor, color, flags, onlyWords, root, id) {
        this.pattern = pattern;
        this.bkrColor = bkrColor;
        this.color = color;
        this.flags = flags;
        this.onlyWords = onlyWords;
        this.root = root;
        this.id = id;
    };
};



// chrome.storage.local.get(['queryItems'], function (result) {
//     haw(result)
// });

// function haw(result) {
//     if (result.queryItems) {
//         queries = result.queryItems.queries;
//         queryInfo = queriesArr['queryInfo'] = result.queryItems.queryInfo;
//         console.log(queriesArr, queries)
//     }
// }
let queriesArr = {};
let domain;

function store(e) {

    let indication = document.getElementById('saving')
    indication.style.visibility = "visible";
    let lists = document.getElementsByName('list');
    lists.forEach(list => {
        let domain = list.className

        queriesArr[list.className] = {};
        let queries = {};

        let items = list.querySelectorAll('.item');
        let patternArr = [];
        let flagArr = [];
        let bkrColorArr = [];
        let colorArr = [];
        let idArr = [];

        items.forEach(item => {
            let pattern = item.querySelector('.textarea').value;
            let flag = item.querySelector('[class^="flag"]');
            let bkrColor = item.querySelector('[name="bkgrColor"]').value;
            let color = item.querySelector('[name="color"]').value;
            let id = item.querySelector('.textarea').id;
            if (flag.className === 'flag-on') { flag = 'gi' } else { flag = 'g' };
            queries[pattern] = new QueryLine(pattern, bkrColor, color, flag, true, document.body, id);

            patternArr.push(pattern);
            flagArr.push(flag);
            bkrColorArr.push(bkrColor);
            colorArr.push(color);
            idArr.push(id);
        });

        queriesArr[list.className]['queryInfo'] = [patternArr, flagArr, bkrColorArr, colorArr, idArr];
        queriesArr[list.className]['queries'] = queries;
        chrome.storage.local.set(queriesArr, function () {
            indication.style.visibility = "hidden";
            // chrome.runtime.sendMessage({ command: 'initialize' })
            console.log(queriesArr)
        });

        chrome.storage.local.get(['globalList', domain], function (result) {
            console.log("sfg", result);
        });
    })
};

let lists = {
    queriesArr,
    getPattern: function () {
        let arr = [];
        Object.keys(this.queriesArr).forEach(key => {
            arr.push(this.queriesArr[key].pattern);
        });
        return arr;
    }
};