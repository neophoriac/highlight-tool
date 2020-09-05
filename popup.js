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

        if (e.path[0].value !== '') {
            let caretPos = e.path[0].selectionStart;
            let transferText = e.path[0].value.substr(caretPos)
            e.path[0].value = e.path[0].value.substr(0, caretPos);

            let div = document.createElement('div');
            let input = document.createElement('input');
            let text = document.createElement('textarea');
            let button = document.createElement('button');
            let span = document.createElement('span')
            let clr = document.createElement('input')
            let bkgrClr = document.createElement('input')

            div.appendChild(input);
            div.appendChild(text);
            div.appendChild(button);
            div.appendChild(span);
            div.appendChild(bkgrClr);
            div.appendChild(clr);

            e.path[1].parentNode.insertBefore(div, e.path[1].nextSibling);

            let colorsArr = getColor();

            setAttributes(div, { class: 'item', id: `div_item_${textarea.length + 1}` });
            setAttributes(input, { type: 'checkbox', id: `chkbx${textarea.length + 1}` });
            setAttributes(text, { name: 'textarea', id: `item_${textarea.length + 1}`, class: 'textarea', cols: 30, rows: 1 });
            setAttributes(button, { class: 'flag-on', name: 'button' });
            setAttributes(bkgrClr, { type: 'color', name: 'bkgrColor', class: 'color', value: colorsArr[0] });
            setAttributes(clr, { type: 'color', name: 'color', class: 'color', value: colorsArr[1] });


            text.value = transferText;
            button.textContent = "Cs";
            span.textContent = "|";

            text.onkeydown = newLine;
            text.onkeyup = startHighlight;
            button.onclick = toggleFlag;
            text.focus();
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
    }

    if (e.keyCode === 8) {
        chrome.runtime.sendMessage({ command: { message: 'delete', id: e.path[0].value } })
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
    if (e.keyCode !== 40 && e.keyCode !== 38 && e.keyCode !== 8 && e.keyCode !== 13) {
        let query = e.path[0].value;
        let bkrColor = e.path[1].querySelector('[name="bkgrColor"]').value;
        let color = e.path[1].querySelector('[name="color"]').value;
        let flags = e.path[1].querySelector('[class^="flag"]').className;
        console.log(query, bkrColor, color, flags)
        chrome.runtime.sendMessage({ command: { query: [query, bkrColor, color, flags] } })

    }
}

let flagButtons = document.getElementsByName('button');

flagButtons.forEach(button => {
    button.onclick = toggleFlag
})

function toggleFlag(e) {
    let elClass = e.path[0].className
    if (elClass === 'flag-off') {
        e.path[0].className = 'flag-on'
    } else {
        e.path[0].className = 'flag-off';
    }
}

function setAttributes(el, attributes) {
    for (const key in attributes) {
        el.setAttribute(key, attributes[key])
    }
}

function getColor() {
    let rgb = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]; // get random RGB colors
    let hexColor = []; // will hold complete conversion of RGB to hex
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

        hexColor.push(arr.join('')); // join array values to get hex color
    };

    let Y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722; // calculate relative luminance with formula provided by ITU-R BT.709 color space standards
    let color;
    Y >= 145 ? color = '#000000' : color = '#ffffff'; // if rgb is dark, color is white, else color is black

    return ['#' + hexColor.join(''), color, rgb, Y]; // return all info in an array
};