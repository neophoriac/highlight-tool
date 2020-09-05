chrome.storage.local.get(['queryItems'], function (result) {
    let queryLine = []; // will be filled with the appended query lines

    let queryItems = result.queryItems.queryInfo;

    let textarea = queryItems[0].reverse();
    let flags = queryItems[1].reverse();
    let bkrColor = queryItems[2].reverse();
    let color = queryItems[3].reverse();
    for (i = 0; i < textarea.length; i++) {
        let foundExisting = queryLine.find(item => item.children[1].value === textarea[i]); // find a query with the same textarea value as the one we're trying to append; if it exists
        if (!foundExisting) { // if it's not found
            let div = document.createElement('div');
            let input = document.createElement('input');
            let text = document.createElement('textarea');
            let button = document.createElement('button');
            let span = document.createElement('span')
            let clr = document.createElement('input')
            let bkgrClr = document.createElement('input')

            flags[i] === 'g' ? flags[i] = 'flag-off' : flags[i] = 'flag-on';

            div.appendChild(input);
            div.appendChild(text);
            div.appendChild(button);
            div.appendChild(span);
            div.appendChild(bkgrClr);
            div.appendChild(clr);

            document.querySelector('.item').parentNode.insertBefore(div, document.querySelector('.item').nextSibling);

            setAttributes(div, { class: 'item', id: `div_item_${i}` });
            setAttributes(input, { type: 'checkbox', id: `chkbx${i}` });
            setAttributes(text, { name: 'textarea', id: `item_${i}`, class: 'textarea', cols: 30, rows: 1 });
            setAttributes(button, { class: flags[i], name: 'button' })
            setAttributes(bkgrClr, { type: 'color', name: 'bkgrColor', class: 'color', value: bkrColor[i] });
            setAttributes(clr, { type: 'color', name: 'color', class: 'color', value: color[i] });

            text.value = textarea[i];
            button.textContent = "Cs";
            span.textContent = "|";

            text.onkeydown = newLine;
            text.onkeyup = startHighlight;
            button.onclick = toggleFlag;
            queryLine.push(div)
        }
    }
    document.querySelector('.item').remove();
});


function setAttributes(el, attributes) {
    for (const key in attributes) {
        el.setAttribute(key, attributes[key])
    }
}