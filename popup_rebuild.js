let host;

chrome.runtime.sendMessage({ command: "getLocation" }, function (response) {

    chrome.storage.local.get(['globalList', response.host, 'settings'], function (result) {
        if (result.globalList) {
            build(result.globalList.queryInfo, 'globalList', result.settings);
        }
        if (result[response.host]) {
            build(result[response.host].queryInfo, response.host);
        }
    });

});

function build(list, className, settings) {
    let queryLine = []; // will be filled with the appended query lines

    let queryItems = list;

    let textarea = queryItems[0].reverse();
    let flags = queryItems[1].reverse();
    let bkrColor = queryItems[2].reverse();
    let color = queryItems[3].reverse();
    let id = queryItems[4].reverse();

    for (i = 0; i < textarea.length; i++) {
        let foundExisting = queryLine.find(item => item.children[1].value === textarea[i]); // find a query with the same textarea value as the one we're trying to append; if it exists
        if (!foundExisting) { // if it's not found

            flags[i] === 'g' ? flags[i] = 'flag-off' : flags[i] = 'flag-on';

            let createdEls = createElements(['div', { class: 'item', id: `div_${id[i]}` }],
                ['input', { type: 'checkbox', id: `chkbx${i}` }],
                ['textarea', { name: 'textarea', id: `${id[i]}`, class: 'textarea', maxlength: 30, cols: 30, rows: 1 }],
                ['button', { class: flags[i], name: 'button' }],
                ['input', { type: 'color', name: 'bkgrColor', class: 'color', value: bkrColor[i] }],
                ['input', { type: 'color', name: 'color', class: 'color', value: color[i] }],
                )

            appendChilds(createdEls.div1, [createdEls.input1, createdEls.textarea1, createdEls.button1, createdEls.input2, createdEls.input3])

            document.querySelector(`[class="${className}"]`).querySelector('.item').parentNode.insertBefore(createdEls.div1, document.querySelector(`[class="${className}"]`).querySelector('.item').nextSibling);

            createdEls.textarea1.value = textarea[i].replace(/\\/gi, "");
            createdEls.button1.textContent = "Cs";

            createdEls.textarea1.onkeydown = newLine;
            createdEls.input1.onclick = enableOptions;
            // createdEls.textarea1.onkeyup = startHighlight;
            createdEls.button1.onclick = toggleFlag;
            createdEls.input2.onchange = colorPicked;
            createdEls.input3.onchange = colorPicked;

            queryLine.push(createdEls.div1)
        }
    }
    document.querySelector(`[class="${className}"]`).querySelector('.item').remove();
    if(settings){
        document.getElementById('regex').checked = settings.regex;
        document.getElementById('completeWords').checked = settings.wholeWords;
        document.getElementById('blacklist').innerText = settings.blacklist;
    }
}

function createElements(...arrays) {
    let createdElements = {};
    arrays.forEach(item => {
        if (typeof item === "string") { item = [item] };
        let el = document.createElement(item[0]);
        if (item[1]) {
            for (const prop in item[1]) {
                el.setAttribute(prop, item[1][prop]);
            };
        };
        let i = 1;
        while (createdElements[item[0] + i]) { i++ };
        createdElements[item[0] + i] = el;
    });
    return createdElements;
}


function appendChilds(el, childs) {
    childs.forEach(child => {
        el.appendChild(child)
    })
}