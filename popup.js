let isChecked = false;

let textarea = document.getElementsByClassName('textarea');
let save = document.getElementById('save');
let list = document.getElementById('list');

for (i = 0; i < textarea.length; i++) {
    textarea[i].onkeydown = newLine;
    textarea[i].onkeyup = startHighlight;
}

function newLine(e) {

    textarea = document.getElementsByClassName('textarea');
    if (e.keyCode === 13) {
        e.preventDefault();

        startHighlight(e);
        store(e);

        if (e.path[0].value !== '') {
            let caretPos = e.path[0].selectionStart;
            let transferText = e.path[0].value.substr(caretPos)
            e.path[0].value = e.path[0].value.substr(0, caretPos);

            let colorsArr = getColor();

            let els = createElements(['div', { class: 'item', id: `div_item_${textarea.length + 1}` }],
                ['input', { type: 'checkbox', id: `chkbx${textarea.length + 1}` }],
                ['textarea', { name: 'textarea', id: `item_${e.target.parentElement.parentElement.className + (textarea.length + 1)}`, class: 'textarea', maxlength: 30, cols: 30, rows: 1 }],
                ['button', { class: 'flag-on', name: 'button' }],
                ['input', { type: 'color', name: 'bkgrColor', class: 'color', value: colorsArr[0] }],
                ['input', { type: 'color', name: 'color', class: 'color', value: colorsArr[1] }],
            );

            appendChilds(els.div1, [els.input1, els.textarea1, els.button1, els.input2, els.input3]);

            e.path[1].parentNode.insertBefore(els.div1, e.path[1].nextSibling);


            els.textarea1.value = transferText;
            els.button1.textContent = "Cs";

            els.textarea1.onkeydown = newLine;
            els.input1.onclick = enableOptions;
            // els.textarea1.onkeyup = startHighlight;
            els.button1.onclick = toggleFlag;
            els.input2.onchange = colorPicked;
            els.input3.onchange = colorPicked;
            els.textarea1.focus();
        }
    }

    if (e.keyCode === 8 && e.path[0].selectionStart === 0 && e.path[1].previousElementSibling && window.getSelection().toString() === "") {
        e.preventDefault();
        let previousEl = e.path[1].previousElementSibling.children[1];
        let pos = previousEl.value.length
        previousEl.value += e.path[0].value;
        e.path[1].remove();
        previousEl.focus();
        previousEl.setSelectionRange(pos, pos);

        // let query = previousEl.value;
        // let bkrColor = previousEl.parentElement.querySelector('[name="bkgrColor"]').value;
        // let color = previousEl.parentElement.querySelector('[name="color"]').value;
        // let flags =previousEl.parentElement.querySelector('[class^="flag"]').className;
        // let id = previousEl.id;
        // chrome.runtime.sendMessage({ command: { query: [query, bkrColor, color, flags, id] } });

        store(e);
    }

    if (e.keyCode === 8) {
        chrome.runtime.sendMessage({ command: { message: 'delete', id: [`[id="${e.target.id}"]`, e.target.id] } })
    }

    if (e.keyCode === 38 && e.path[1].previousElementSibling) {
        e.preventDefault();
        let caretPos = e.path[0].selectionStart;
        let previousEl = e.path[1].previousElementSibling.children[1];
        previousEl.focus();
        previousEl.setSelectionRange(caretPos, caretPos);
    }

    if (e.keyCode === 40 && e.path[1].nextElementSibling) {
        e.preventDefault();
        let caretPos = e.path[0].selectionStart;
        let nextEl = e.path[1].nextElementSibling.children[1];
        nextEl.focus();
        nextEl.setSelectionRange(caretPos, caretPos);
    }
}

function startHighlight(e) {
    let query;
    if (document.getElementById('regex').checked === false) {
        query = e.path[0].value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // -bobince & fregante : https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    } else {
        query = e.path[0].value;
    }
    let bkrColor = e.path[1].querySelector('[name="bkgrColor"]').value;
    let color = e.path[1].querySelector('[name="color"]').value;
    let flags = e.path[1].querySelector('[class^="flag"]').className;
    let isWholeWords = document.getElementById('completeWords').checked;
    let id = e.path[0].id;
    chrome.runtime.sendMessage({ command: { query: [query, bkrColor, color, flags, isWholeWords, id] } })
};

function toggleFlag(e) {
    let elClass = e.path[0].className;
    if (elClass === 'flag-off') {
        e.path[0].className = 'flag-on';
    } else {
        e.path[0].className = 'flag-off';
    }
    store(e);
}

function setAttributes(el, attributes) {
    for (const key in attributes) {
        el.setAttribute(key, attributes[key])
    }
}

function getColor() {
    let rgb = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]; // get random RGB colors
    let hexColor = []; // will hold complete conversions of RGB to hex
    for (j = 0; j < rgb.length; j++) { // for each of rgb values
        let arr = [];// will hold converted a single rgb color each iteration
        let num = rgb[j] / 16 // divide rgb color by 16 
        while (num !== 0) { //while num variable is not 0
            arr.push((num - Math.floor(num)) * 16); // get float and multiply by 16 and push it in the array, this number is the hex color before replacing number over 10 with letters
            num = Math.floor(num) / 16; // remove float and devide by 16
        };
        arr.reverse(); // reverse array values

        for (i = 0; i < arr.length; i++) { // for each array value replace number with corresponding hexadecimal symbol
            if (arr[i] === 10) { arr[i] = "a" };
            if (arr[i] === 11) { arr[i] = "b" };
            if (arr[i] === 12) { arr[i] = "c" };
            if (arr[i] === 13) { arr[i] = "d" };
            if (arr[i] === 14) { arr[i] = "e" };
            if (arr[i] === 15) { arr[i] = "f" };
        };
        if (arr.length === 1) { arr[0] = '0' + arr[0] } // if result is a single character or digit add 0 in front
        if (rgb[j] === 0) { arr.push('00') }; // if random rgb color was 0 then array will be empty, so push 00 to array as it is appropriate
        hexColor.push(arr.join('')); // join array values to get hex color
    };

    hexColor = '#' + hexColor.join(''); // complete hex color code

    let Y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722; // calculate relative luminance with formula provided by ITU-R BT.709 color space standards src: https://en.wikipedia.org/wiki/Relative_luminance
    let color;
    Y >= 145 ? color = '#000000' : color = '#ffffff'; // if rgb is dark, color is white, else color is black

    return [hexColor, color, rgb, Y]; // return all info in an array
};

let flagButtons = document.getElementsByName('button');

flagButtons.forEach(button => {
    button.onclick = toggleFlag;
})

let colors = document.getElementsByClassName('color');

for (i = 0; i < colors.length; i++) {
    colors[i].onchange = colorPicked
}

let checkboxes = document.querySelectorAll('[id^="chkbx"]')

checkboxes.forEach(checkbox => {
    checkbox.onclick = enableOptions

})

function colorPicked(e) {
    store(e);
    let color = e.target.value;
    let colorType = e.target.name;
    let queryId = e.target.parentElement.querySelector('textarea').id;
    chrome.runtime.sendMessage({ command: { changeColor: { colorType: colorType, queryId: queryId, color: color } } });
};

document.getElementById('clear').onclick = (e) => {
    let items = document.querySelectorAll('.item');
    if (isChecked === false) {
        let lists = document.getElementsByName('list')
        lists.forEach(list => {
            items = list.querySelectorAll('.item');
            for (i = 1; i < items.length; i++) {
                items[i].remove();
            }
            items[0].children[1].value = '';
            chrome.runtime.sendMessage({ command: { message: 'delete', id: ['.hltd_text', 'all'] } });
            chrome.storage.local.clear()
        })
    } else {
        let checkboxes = document.querySelectorAll('[id^="chkbx"]');
        let arr = [];
        let ids = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked === true) {
                arr.push(checkbox);
                ids.push(checkbox.nextElementSibling.id)
            }
            for (i = 0; i < arr.length; i++) {
                arr[i].parentElement.remove();
                chrome.runtime.sendMessage({ command: { message: 'delete', id: [`[id="${ids[i]}"]`, ids[i]] } });
            }
            document.querySelector('.trash').src = "images/trash-alt-solid.svg";
            document.querySelector('.groupColors').style.display = "none";
        })
    }
    store(e);
}

document.getElementById('this-domain').onclick = (e) => {
    let globalList = document.getElementById('list');
    let domainList = document.getElementById('domain');

    if (globalList.style.display === "none") {
        domainList.style.display = "none";
        globalList.style.display = ""
        e.target.textContent = "This Site's List"
    } else {
        globalList.style.display = "none"
        domainList.style.display = "";
        e.target.textContent = "Global List"
    }
}

let domainList = document.getElementById('domain')
chrome.runtime.sendMessage({ command: "getLocation" }, function (response) {
    domainList.className = response.host;
    // domainList.firstElementChild.querySelector('textarea').className = 
});

function enableOptions(e) {

    checkboxes = document.querySelectorAll('[id^="chkbx"]')
    for (i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked === true) {
            document.querySelector('.trash').src = "images/eraser-solid.svg"
            document.querySelector('.groupColors').style.display = "inline-flex";
            isChecked = true;
            break;
        } else {
            document.querySelector('.trash').src = "images/trash-alt-solid.svg";
            document.querySelector('.groupColors').style.display = "none";
            isChecked = false;
        }
    }
}

document.getElementsByName('groupBkgrColor')[0].onchange = e => {
    changeGroupColor(e.target.value, "bkgrColor")
};

document.getElementsByName('groupColor')[0].onchange = e => {
    changeGroupColor(e.target.value, "color")
}

function changeGroupColor(value, name) {
    checkboxes = document.querySelectorAll('[id^="chkbx"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked === true) {
            checkbox.parentElement.querySelector(`[name=${name}]`).value = value;

            let color = value;
            let colorType = name;
            let queryId = checkbox.parentElement.querySelector('textarea').id;
            chrome.runtime.sendMessage({ command: { changeColor: { colorType: colorType, queryId: queryId, color: color } } });
        };
    });
    store();
};

document.getElementById('settings').onclick = e => {
    document.getElementById('settings-page').style.display = "inline";
    document.querySelector('.container').style.display = "none";
    document.querySelector('.footer').style.display = "none";
}

document.getElementById('regex').onclick = e => {
    saveSettings();
};

// if(localStorage.getItem('isRegex')==="true"){
//     document.getElementById('regex').checked = true;
// };


document.getElementById('completeWords').onclick = e => {
    saveSettings();
};

// if(localStorage.getItem('wholeWords')==="false"){
//     document.getElementById('completeWords').checked = false;
// };
// console.log(localStorage.getItem('wholeWords'))