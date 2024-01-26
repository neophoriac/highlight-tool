function newLine({
    referenceElement = globalList,
    method = "appendChild",
    transferText = "",
    lineId = crypto.randomUUID(),
    flag = "flag-on",
    bkgrColor = undefined,
    color = undefined
}) {

    if (!bkgrColor) {
        const currentColor = document.getElementById('current-color'); // false or undefined = single mode, true = random mode

        if (currentColor.checked) {
            const colorsArr = getColor();
            bkgrColor = colorsArr[0];
            color = colorsArr[1];
        } else {
            bkgrColor = document.querySelector('[name="bg-option"]:checked').dataset.color;
            color = document.querySelector('[name="color-option"]:checked').dataset.color;
        }

    }

    const els = createElements(['div', { class: 'item visible', id: `div_item_${lineId}` }],
        ['input', { type: 'checkbox', id: `chkbx_${lineId}`, class: 'chkbx' }],
        ['textarea', { name: 'textarea', id: lineId, class: 'textarea', spellcheck: false, maxlength: 100, cols: 100, rows: 1 }],
        ['button', { name: 'button' }],
        ['input', { type: 'color', name: 'bkgrColor', class: 'color', value: bkgrColor }],
        ['input', { type: 'color', name: 'color', class: 'color', value: color }],
    );

    appendChilds(els.div1, [els.input1, els.textarea1, els.button1, els.input2, els.input3]);

    els.textarea1.value = transferText;
    els.button1.textContent = "Aa";
    els.button1.dataset.toggle = flag;

    els.input1.addEventListener("click", e => enableOptions(e.composedPath()[3]));
    els.button1.addEventListener("click", toggleFlag);
    els.input2.addEventListener("change", colorPicked);
    els.input3.addEventListener("change", colorPicked);

    els.textarea1.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
            changeLine(e, newLine);
            // create a new line when pressing enter
        }
        if (e.code === "Backspace" || e.key === "Delete") {
            document.getElementById('clear').click();
            // when pressing backspace remove results from screen
        };
        if (e.code === "Backspace" && e.target.selectionStart === 0 && window.getSelection().toString() === "") {
            transferToPrev(e);
            // when backspacing, if we're in the start of the line, trasnfer all to previous line
        };
        if ((e.code === "ArrowUp" || e.code === "ArrowDown")) {
            verticalMovement(e);
            //retain cursor position when moving cursor up and down
        }
        if (e.ctrlKey && e.code === "KeyA") {
            selectAll(e)
        }

    })
    els.textarea1.addEventListener('paste', e => {
        e.preventDefault();
        let paste = (e.clipboardData || window.clipboardData).getData("text");
        let words = paste.split('\r\n');
        let firstWord = words.shift();
        let fragment = document.createDocumentFragment();
        let lastLine;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            let line = newLine({ transferText: word, method: null });
            fragment.append(line);
            if (i === words.length - 1) {
                lastLine = line;
            }
        }

        let parentNode = e.target.parentNode;
        e.target.value += firstWord;
        parentNode.after(fragment);
        lastLine?.querySelector('textarea')?.focus();
        store([parentNode.parentNode.parentNode]);
    })

    els.textarea1.addEventListener('mouseenter', selectHandler);
    els.textarea1.addEventListener('mouseleave', selectHandler);

    if (method) { referenceElement[method](els.div1) };
    // els.textarea1.focus();

    return els.div1;

};

addEventListener('copy', e => {
    let selectedCheckboxes = document.querySelector('.active')?.querySelectorAll('.chkbx:checked');

    if (!selectedCheckboxes || !selectedCheckboxes.length) {
        return
    }
    e.preventDefault();
    let selectedWords = [];
    for (let i = 0; i < selectedCheckboxes.length; i++) {
        const checkbox = selectedCheckboxes[i];
        selectedWords.push(checkbox.nextElementSibling.value)
    }
    selectedWords = selectedWords.join('\r\n');
    e.clipboardData.setData('text/plain', selectedWords)
    console.log(selectedCheckboxes)
})

function selectHandler(e) {
    if (e.buttons === 1 && !e.target.previousElementSibling.checked) {
        e.target.previousElementSibling.checked = true;
        e.target.previousElementSibling.dispatchEvent(new Event('click'));
        e.target.blur();
    }
}

function newRestrictionLine({
    referenceElement = blacklist,
    method = "appendChild",
    transferText = "",
}) {

    const els = createElements(['div', { class: 'restrict' }],
        ['div', { class: 'number' }],
        ['textarea', { name: 'textarea', class: 'textarea restrict-text', maxlength: 50, cols: 50, rows: 1, placeholder: "Allows * wildcard e.g. *.dhl.com/*" }],
    );

    appendChilds(els.div1, [els.div2, els.textarea1]);
    referenceElement[method](els.div1);

    els.textarea1.value = transferText;

    els.textarea1.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
            changeLine(e, newRestrictionLine, isStore = false);
            // create a new line when pressing enter
        }
        if (e.code === "Backspace") {
            // when pressing backspace remove results from screen
        };
        if (e.code === "Backspace" && e.target.selectionStart === 0 && window.getSelection().toString() === "") {
            transferToPrev(e, isStore = false);
            // when backspacing, if we're in the start of the line, trasnfer all to previous line
        };
        if ((e.code === "ArrowUp" || e.code === "ArrowDown")) {
            verticalMovement(e);
            //retain cursor position when moving cursor up and down
        }

    })
    els.textarea1.focus();

    return els.div1;

};

async function changeLine(e, func, isStore = true, transferText = null) {
    e.preventDefault();
    let newLine
    let path = e.composedPath()

    let curColorMode = document.getElementById('current-color').checked // false or undefined = single mode, true = random mode

    const bgColor = !curColorMode ? document.querySelector('[name="bg-option"]:checked').dataset.color : null;
    const textColor = !curColorMode ? document.querySelector('[name="color-option"]:checked').dataset.color : null;

    if (e.target.value !== "") {
        let caretPos = e.target.selectionStart;
        transferText = !transferText ? e.target.value.substr(caretPos) : transferText;
        e.target.value = e.target.value.substr(0, caretPos);
        newLine = func({ referenceElement: path[1], method: "after", transferText: transferText, bkgrColor: bgColor, color: textColor });
        if (!isStore) return;
        startHighlight(extractData(path[1]))
        if (transferText !== "") {
            startHighlight(extractData(newLine))
        }
        store([path[3]])
    } else {
        newLine = func({ referenceElement: path[1], method: "after", bkgrColor: bgColor, color: textColor });
    }
    newLine.querySelector('textarea').focus()
}

function transferToPrev(e, isStore = true) {
    e.preventDefault();
    let item = e.composedPath()[1]
    if (!item.previousElementSibling || item.previousElementSibling.id === "no_results") {
        return;
    }

    let previousEl = item.previousElementSibling;

        while (previousEl && !previousEl?.classList?.contains('visible')) {
            previousEl = previousEl.previousElementSibling
        }
    

    previousEl = previousEl.children[1];

    let pos = previousEl.value.length;
    previousEl.value += e.target.value;
    item.remove();
    previousEl.focus();
    previousEl.setSelectionRange(pos, pos);
    if (!isStore) return;
    store([e.composedPath()[3]]);
    chrome.runtime.sendMessage({ command: { message: 'delete', id: [`[id="${e.target.id}"]`, e.target.id] } });
}

function verticalMovement(e) {
    e.preventDefault();
    let element = e.key == "ArrowUp" ? item.previousElementSibling : item.nextElementSibling;
    if (!element) {
        return;
    }
    element = element.children[1];
    let caretPos = e.target.selectionStart;
    element.focus();
    element.setSelectionRange(caretPos, caretPos);
}

function extractData(element) {
    const textArea = element.querySelector('[name="textarea"]')
    const bkrColor = element.querySelector('[name="bkgrColor"]').value;
    const pattern = textArea.value;
    const color = element.querySelector('[name="color"]').value;
    const flag = element.querySelector('[data-toggle^="flag"]').dataset.toggle;
    const id = textArea.id;
    const curList = element.parentNode.parentNode.id;

    const thisEnable = document.getElementById("toggle_custom").checked;
    const thisRegex = document.getElementById("regexCust").checked;
    const thisWhole = document.getElementById("completeWordsCust").checked;
    const thisItalic = document.getElementById('italic_style').checked;
    const thisBold = document.getElementById('bold_style').checked;
    const thisUnderline = document.getElementById('underline_style').checked;

    return { bc: bkrColor, c: color, f: flag, i: id, p: pattern, l: curList, e: thisEnable, regex: thisRegex, wholeWords: thisWhole, is: thisItalic, bs: thisBold, us: thisUnderline };
}

function selectAll(e) {
    e.preventDefault();
    let checkboxes = e.composedPath()[2].querySelectorAll('.item.visible .chkbx');

    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        checkbox.checked = true;
    }

    document.getElementById('global_checkbox').checked = true;
    document.getElementById('options_container').style.marginLeft = '0px';

}