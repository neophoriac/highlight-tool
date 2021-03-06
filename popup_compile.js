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

if (!localStorage.getItem('isRegex')) {
    localStorage.setItem('isRegex', 'false');
}

if (!localStorage.getItem('wholeWords')) {
    localStorage.setItem('wholeWords', 'true');
}

let queriesArr = {};
let domain;

function store(e) {

    let indication = document.getElementById('saving')
    indication.style.visibility = "visible";
    let lists = document.querySelectorAll('[name^="list"]');
    lists.forEach(list => {

        queriesArr[list.className] = {};
        let queries = {};

        let items = list.querySelectorAll('.item');
        let patternArr = [];
        let flagArr = [];
        let bkrColorArr = [];
        let colorArr = [];
        let idArr = [];

        items.forEach(item => {
            let pattern
            if (document.getElementById('regex').checked === false) {
                pattern = item.querySelector('.textarea').value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');  // -bobince & fregante : https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
            } else {
                pattern = item.querySelector('.textarea').value
            }
            let flag = item.querySelector('[class^="flag"]');
            let bkrColor = item.querySelector('[name="bkgrColor"]').value;
            let color = item.querySelector('[name="color"]').value;
            let id = item.querySelector('.textarea').id;
            if (flag.className === 'flag-on') { flag = 'gi' } else { flag = 'g' };
            queries[pattern] = new QueryLine(pattern, bkrColor, color, flag, document.getElementById('completeWords').checked, document.body, id);

            patternArr.push(pattern);
            flagArr.push(flag);
            bkrColorArr.push(bkrColor);
            colorArr.push(color);
            idArr.push(id);
        });

        queriesArr[list.className]['queryInfo'] = [patternArr, flagArr, bkrColorArr, colorArr, idArr];
        queriesArr[list.className]['queries'] = queries;

    });
    chrome.storage.local.set(queriesArr, function () {
        indication.style.visibility = "hidden";
    });
};

function saveSettings(){
    let isRegex = document.getElementById('regex').checked;
    let isWholeWords = document.getElementById('completeWords').checked;
    let blacklist = document.getElementById('blacklist')
    let blacklistItems = document.getElementById('blacklist').innerText.split('\n');

    let settings = {regex: isRegex, wholeWords: isWholeWords, blacklist: blacklist.innerText, blacklistItems: blacklistItems}
    chrome.storage.local.set({settings: settings});
}

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