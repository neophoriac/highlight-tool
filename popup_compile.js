
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
save.onclick = e => {
    let items = document.querySelectorAll('.item');

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

    queriesArr['queryInfo'] = [patternArr, flagArr, bkrColorArr, colorArr, idArr];
    queriesArr['queries'] = queries;
    chrome.storage.local.set({ queryItems: queriesArr }, function () {
        chrome.runtime.sendMessage({ command: 'initialize' })
    });

    chrome.storage.local.get(['queryItems'], function (result) {
        console.log(result.queryItems);
    });

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