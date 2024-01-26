async function getPublicList(url) {
    let paste = await fetch(url).then(res => { return res.text() });

    let words = paste.split('\n');

    return words
}

function storePrimeList(words, name = "Untitled") {
    if (name == "") { name = "Untitled" }
    const items = createPrimeList(words);
    const id = crypto.randomUUID();

    const row = createRow({ title: name, parentElement: groupList, id: id });
    groupList.appendChild(row);
    const _list = initListInStorage(id, name, items);
    lists[id] = _list;
}