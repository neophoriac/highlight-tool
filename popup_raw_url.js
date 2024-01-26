async function getPublicList(url) {
    const controller = new AbortController()
    const signal = controller.signal;

    let timeout = setTimeout(e => {
        controller.abort()
        return { error: 'Request timed out!' };
    }, 5 * 1000)

    let list = await fetch(url, { signal }).then(res => {
        clearTimeout(timeout);
        return res.text()
    }).catch(error => {
        clearTimeout(timeout);
        return null
    });

    if (!list) {
        return { error: "Failed to fetch list!" };
    }

    let words = list.split('\n');

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