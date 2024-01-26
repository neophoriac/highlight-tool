function syncLists() {
    sync.children[1].className.baseVal = "sync-symbol";
    let rows = document.querySelectorAll('.row[data-sync="true"]');
    rows = Array.from(rows);
    rows = rows.map(row => row.dataset.parent);
    let items = rows.concat(["settings", "listOrder", "dm"]);

    chrome.storage.local.get(items, async (items) => {

        if (chrome.runtime.lastError) {
            alertMessage.innerText = chrome.runtime.lastError.message;
            alertMessage.parentElement.hidden = false;
            return
        }

        for (let key in items) {
            const item = items[key]
            item?.lists?.forEach(entry => delete entry.i)
        }

        await chrome.storage.sync.clear()
        chrome.storage.sync.set(items, (result) => {

            if (chrome.runtime.lastError) {
                alertMessage.innerText = chrome.runtime.lastError.message;
                alertMessage.parentElement.hidden = false;
                return
            }

            chrome.storage.sync.getBytesInUse(null, (number) => {
                // console.log(number);
                sync.className += " sync-open";
                syncDone.className += " done-reveal";
                sync.children[1].className.baseVal += " symbol-hide";

                setTimeout(() => {
                    sync.className = "sync";
                    syncDone.className = "sync-done";
                    sync.children[1].className.baseVal = "sync-symbol symbol-end";
                }, 1000)

            })
        })
    });
}
