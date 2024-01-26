async function exportFile() {

    try {
        const data = await retrieveData();

        let options = {
            suggestedName: `hmagic ${new Date().toJSON().split('T')[0]}`,
            types: [
                {
                    description: "Text file",
                    accept: { 'text/plain': ['.txt'] }
                }
            ]
        }

        // create a new handle
        const newHandle = await window.showSaveFilePicker(options);

        // create a FileSystemWritableFileStream to write to
        const writableStream = await newHandle.createWritable();

        // write our file
        await writableStream.write(data);

        // close the file and write the contents to disk.
        await writableStream.close();
    } catch (error) {
        console.log(error)
    }

}

let importOptions = {
    types: [
        {
            description: "Text file",
            accept: { 'text/plain': ['.txt'] }
        }
    ],
    multiple: false
}

async function importRawFile() {
    try {
        // create a new handle
        let [newHandle] = await window.showOpenFilePicker(importOptions);

        // create a FileSystemWritableFileStream to write to
        const fileData = await newHandle.getFile();

        const data = await fileData.text().then(data =>{ return {name: fileData.name, data: data}})

        return data;
    } catch (error) {
        console.log(error)
    }
}

async function importFile() {
    try {
        // create a new handle
        let [newHandle] = await window.showOpenFilePicker(importOptions);

        // create a FileSystemWritableFileStream to write to
        const fileData = await newHandle.getFile();

        fileData.text().then(data => storeData(data))
    } catch (error) {
        console.log(error)
    }
}

function retrieveData() {
    return new Promise((resolve, reject) => {

        chrome.storage.local.get(null, function (data) {
            data.dm = new Date().toJSON();
            data.name = "Highlight Magic";
            resolve(JSON.stringify(data));
        })
    })
}

let imported;

function storeData(data) {
    try {
        data = JSON.parse(data)
        if (!data?.dm) return;
        if (data?.name !== "Highlight Magic") return;

        imported = data;
        formatImported();

    } catch (error) {
        console.log(error)
    }

}

function formatImported() {
    for (let i = 0; i < imported.listOrder.length; i++) {
        const entry = imported.listOrder[i];

        chooseImportTitle.innerHTML = `<b>Export Date:</b> ${new Date(imported.dm).toLocaleDateString()}`;
        listImported(entry.name, entry.id);
    }
    importCheck.click();
    importContainer.style.display = "flex";
}

function listImported(name, id) {
    let line = document.createElement('div');
    let checkboxContainer = document.createElement('div');
    let checkbox = document.createElement('input');
    let listName = document.createElement('span');

    checkbox.type = "checkbox";
    line.id = id;
    line.className = "import-line";
    listName.innerText = name;
    listName.className = "import-list-name";

    checkboxContainer.appendChild(checkbox);
    line.appendChild(checkboxContainer);
    line.appendChild(listName);
    chooseImport.appendChild(line);

}

importCancel.addEventListener('click', importClose);
importProceed.addEventListener('click', appendImported);

function importClose(e) {
    importCheck.click();
    chooseImport.innerHTML = "";
    importContainer.style.display = "none";
}

function appendImported() {
    let storeObj = {};
    let listOrder = [];
    let checked = chooseImport.querySelectorAll('input[type="checkbox"]:checked');

    for (let i = 0; i < checked.length; i++) {
        const line = checked[i].parentElement.parentElement;
        storeObj[line.id] = imported[line.id];
        listOrder.push({ id: line.id, name: line.lastElementChild.innerText })
    }
    chrome.storage.local.get(['listOrder'], function (storedOrder) {
        // get stored listOrder

        storedOrder = storedOrder.listOrder;

        if (storedOrder) {
            for (let i = 0; i < listOrder.length; i++) {
                const item = listOrder[i];
                let isExists = storedOrder.findIndex(value => value.id === item.id);

                if (isExists > -1) continue;
                // if list already exists in local storage, exclude imported one
                storedOrder.push(item)
            }
        }

        storeObj.listOrder = storedOrder;
        storeObj.dm = new Date().toJSON();

        if (importSettings.checked) {
            if (imported.settings) {
                storeObj.settings = imported.settings
            }
        }

        chrome.storage.local.set(storeObj, function (result) {
            if (chrome.runtime.lastError) {
                alertMessage.innerText = chrome.runtime.lastError.message;
                alertMessage.parentElement.hidden = false;
            }

            groupList.innerHTML = "";
            blacklist.innerHTML = "";
            whitelist.innerHTML = "";

            rebuild();
            importClose();
        })

    })

}