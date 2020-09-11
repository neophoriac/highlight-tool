
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


let queriesArr = {};
let queries = {};
let queryInfo = queriesArr['queryInfo'] = {};
chrome.storage.local.get(['queryItems'], function (result) {
    haw(result)
});

function haw(result) {
    if (result.queryItems) {
        queries = result.queryItems.queries;
        queryInfo = queriesArr['queryInfo'] = result.queryItems.queryInfo;
        console.log(queriesArr, queries)
    }
}

function store(e) {

    let indication = document.getElementById('saving')
    indication.style.visibility = "visible";
    let lists = document.getElementsByName('list');
    lists.forEach(list => {
        queries[list.className] = {};
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
            queries[list.className][pattern] = new QueryLine(pattern, bkrColor, color, flag, true, document.body, id);

            patternArr.push(pattern);
            flagArr.push(flag);
            bkrColorArr.push(bkrColor);
            colorArr.push(color);
            idArr.push(id);
        });

        queryInfo[list.className] = [patternArr, flagArr, bkrColorArr, colorArr, idArr];
        queriesArr['queries'] = queries;
        chrome.storage.local.set({ queryItems: queriesArr }, function () {
            indication.style.visibility = "hidden";
            // chrome.runtime.sendMessage({ command: 'initialize' })
        });

        chrome.storage.local.get(['queryItems'], function (result) {
            console.log(result.queryItems);
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