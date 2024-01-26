function toggleFlag(e) {
    let elClass = e.target.dataset.toggle;
    if (elClass === 'flag-off') {
        e.target.dataset.toggle = 'flag-on';
    } else {
        e.target.dataset.toggle = 'flag-off';
    };
    store([e.composedPath()[3]]);
};

function colorPicked(e) {
    let color = e.target.value;
    let colorType = e.target.name;
    let queryId = e.target.parentElement.querySelector('textarea').id;
    chrome.runtime.sendMessage({ command: { changeColor: { colorType: colorType, queryId: queryId, color: color } } });
    store([e.composedPath()[3]]);
};

function enableOptions(container) {

    let checkboxes = container.querySelectorAll('[class="chkbx"]:checked');
    let options = container.querySelector('#options_container');
    let globalCheck = container.querySelector('#global_checkbox');

    if (checkboxes.length > 0) {
        options.style.marginLeft = "0px";
        globalCheck.checked = true;
    } else {
        options.style.marginLeft = "-53px";
        globalCheck.checked = false;
    }

}

function groupColorChange(e, container, options) {

    if (e.target.checked) {
        let checkboxes = container.querySelectorAll('.item.visible > input[type="checkbox"]')
        checkboxes.forEach(box => box.checked = true);
        options.style.marginLeft = "0px";
    } else {
        let checkboxes = container.querySelectorAll('.item > input[type="checkbox"]')
        checkboxes.forEach(box => box.checked = false);
        options.style.marginLeft = "-53px";
    }
    enableOptions(container);
}

function changeGroupColor(e, value, name) {
    let activeList = document.querySelector('.active');
    checkboxes = activeList.querySelectorAll('[class="chkbx"]:checked')
    checkboxes.forEach(checkbox => {
        checkbox.parentElement.querySelector(`[name=${name}]`).value = value;
        let color = value;
        let colorType = name;
        let queryId = checkbox.parentElement.querySelector('textarea').id;
        chrome.runtime.sendMessage({ command: { changeColor: { colorType: colorType, queryId: queryId, color: color } } });
    });
    store([activeList]);
};

function toggleOnOff(e) {
    chrome.storage.local.set({ toggle: [toggle.checked] }, function () {
        chrome.runtime.sendMessage({ command: { toggle: [toggle.checked] } });
    })
}

function donateHandler(e) {
    chrome.runtime.sendMessage({ command: "donate" });
}

function nameEntryHandler(element) {

    //nameValue.focus()

    cancel.addEventListener('click', closeNameEntry);
    nameValue.addEventListener('keydown', accessibilityKeys);
    ok.addEventListener('click', rowProceed);

    function accessibilityKeys(e) {

        if (e.code === "Enter") {
            e.preventDefault();
            rowProceed(e)
        }
        if (e.code === "Escape") {
            e.preventDefault();
            closeNameEntry(e)
        }

    }

    function closeNameEntry(e) {
        element.click()
        // cancel.removeEventListener('click', closeNameEntry);
        // ok.removeEventListener('click', rowProceed);
        // nameValue.removeEventListener('keydown', accessibilityKeys);
        nameValue.value = "";
        //insertRow.addEventListener('click', nameEntryHandler);

    }


    async function rowProceed(e) {

        let name = nameEntry.querySelector('#name').value;
        name = name === "" ? "Untitled" : name;
        const filePayload = await storageGet('filePayload');

        if (rawURL.value == "" && !filePayload) {

            let row = createRow({ title: name, parentElement: groupList, sendAccepted: true });
            groupList.appendChild(row);
            resetCustSettings();
            let button = row.querySelector('.row_conf_btn');
            button.click();
            let newList = document.querySelector('.active');
            store([newList]);
            storeOrder();
        } else if (rawURL.value !== "" && !filePayload) {

            document.querySelector('.load-icon').style.display = "block";
            document.getElementById('name_entry_ok_text').style.display = "none";

            let rawWords = await getPublicList(rawURL.value).catch(e => console.log(e));

            document.querySelector('.load-icon').style.display = "none";
            document.getElementById('name_entry_ok_text').style.display = "block";

            if (rawWords.error) {
                alertMessage.innerText = rawWords.error;
                alertMessage.parentElement.hidden = false;
                return
            }

            storePrimeList(rawWords, name);

        } else if (rawURL.value == "" && filePayload) {
            storePrimeList(filePayload, name);
            await storageSet('filePayload', null);
            document.getElementById('import_button_text').style.display = "block";
            document.getElementById('show_loaded_file').classList.replace('visible', 'hidden');
            document.getElementById('file_name').innerText = '';
        }

        document.getElementById('raw_url').disabled = false;
        importBtn.disabled = false;
        importBtn.classList.remove('disabled');
        rawURL.disabled = false;
        rawURL.classList.remove('disabled');

        closeNameEntry();
    }

}

rawURL.addEventListener('input', e => {
    if (e.target.value !== "") {
        importBtn.disabled = true;
        importBtn.classList.add('disabled');
    } else {
        importBtn.disabled = false;
        importBtn.classList.remove('disabled');
    }
})

importBtn.addEventListener('click', async e => {

    if (e.target === document.getElementById('file_remove')) { return }

    let data = await importRawFile();

    if (!data) { return }

    document.getElementById('import_button_text').style.display = "none";
    document.getElementById('show_loaded_file').classList.replace('hidden', 'visible');
    document.getElementById('file_name').innerText = data.name;
    rawURL.disabled = true;
    rawURL.classList.add('disabled');

    await storageSet('filePayload', data.data.split('\n'));
});

document.getElementById('file_remove').addEventListener('click', async e => {
    await storageSet('filePayload', null);
    document.getElementById('import_button_text').style.display = "block";
    document.getElementById('show_loaded_file').classList.replace('visible', 'hidden');
    document.getElementById('file_name').innerText = '';
    document.getElementById('raw_url').disabled = false;
    rawURL.disabled = false;
    rawURL.classList.remove('disabled');
})

document.getElementById('import_btn').addEventListener('click', e => {

    const importOpts = document.getElementById('import_opts');
    const tooltip = e.composedPath()[4];
    const optsHeight = importOpts.scrollHeight;

    if (importOpts.classList.contains('hidden')) {
        importOpts.style.height = `${optsHeight}px`;
        importOpts.classList.replace('hidden', 'visible');
        tooltip.style.top = `${tooltip.getBoundingClientRect().top - optsHeight}px`;
    } else {
        importOpts.style.height = '0px';
        importOpts.classList.replace('visible', 'hidden');
        tooltip.style.top = `${tooltip.getBoundingClientRect().top + optsHeight - 10}px`;
    }
});

function showGlobalSettings(e) {
    e.preventDefault();
    groupList.hidden = true;
    settingsPage.hidden = false;
    groupFooter.hidden = true;
    settFooter.hidden = false;
}

function settToGroup(e) {
    e.preventDefault();
    groupList.hidden = false;
    settingsPage.hidden = true;
    groupFooter.hidden = false;
    settFooter.hidden = true;
}

function indicateSave() {
    globalSave.innerText = "OK";
    setTimeout(() => {
        globalSave.innerText = "Save";
    }, 1000)
}

function clearAllHandler(e) {
    groupList.innerHTML = "";
    blacklist.innerHTML = "";
    whitelist.innerHTML = "";
    chrome.storage.local.clear();
    storeOrder();
    rebuild();
    clearAll.textContent = "Done";
    setTimeout(() => {
        clearAll.textContent = "Clear";
    }, 1000);
    clearAllBtn.click();
}

function returnToConf(e) {
    document.getElementById(e.composedPath()[2].dataset.id).hidden = false;
    footer.hidden = false;

    custsettingsPage.hidden = true;
    custSettFooter.hidden = true;
}

function customSettingsConf(e) {
    let activeConf = document.querySelector('.active');
    custsettingsPage.hidden = false;
    custSettFooter.hidden = false;

    activeConf.hidden = true;
    footer.hidden = true;
    custsettingsPage.dataset.id = activeConf.id;
    custSettFooter.dataset.id = activeConf.id;
}

function enableCustSettings(e) {

    let isEnabled = e.target.checked;

    if (isEnabled) {
        cssStyle(custom, 'filter: grayscale(0); pointer-events: initial');
        custom.className = "settings-enabled";
    } else {
        cssStyle(custom, 'filter: grayscale(1); pointer-events: none');
        custom.className = "settings-disabled";
    }

}

function resetCustSettings() {
    customToggle.checked = false;
    custSync.checked = true;
    customToggle.dispatchEvent(new Event('change'));
    isRegexCust.checked = false;
    isWholeWords.checked = true;
    blacklistCust.innerHTML = "";
    whitelistCustinnerHTML = "";
    document.getElementById('current-color').checked = true; // false or undefined = single mode, true = random mode
    document.getElementById('settings_random_color').click();
}

function clearListHandler(e) {
    let activeList = document.querySelector('.active');
    let items = activeList.querySelectorAll('.item');
    items = activeList.querySelectorAll('.item');
    for (let i = 0; i < items.length; i++) {
        chrome.runtime.sendMessage({ command: { message: 'delete', id: [`[id="${items[i].querySelector('textarea').id}"]`, items[i].querySelector('textarea').id] } });
        items[i].remove();
    }
    // items[0].children[1].value = '';
    newLine({ referenceElement: activeList.children[1] })
    store([activeList])
}

function eraseCheckedHandler() {
    let activeList = document.querySelector('.active');
    let checkboxes = activeList.querySelectorAll('input.chkbx:checked')
    for (let i = 0; i < checkboxes.length; i++) {
        const item = checkboxes[i].parentElement;
        chrome.runtime.sendMessage({ command: { message: 'delete', id: [`[id="${item.querySelector('textarea').id}"]`, item.querySelector('textarea').id] } });
        item.remove();
    }
    store([activeList])

    if (!activeList.children[1].childElementCount) {
        newLine({ referenceElement: activeList.children[1] })
    }
    enableOptions(activeList)
}

importCheck.addEventListener("click", (e) => {
    let checkboxes = chooseImport.querySelectorAll('input[type="checkbox"]');

    if (e.target.checked) {
        checkboxes.forEach(box => box.checked = true);
    } else {
        checkboxes.forEach(box => box.checked = false);
    }
})

function changeSync(id, isChecked) {
    let option = document.getElementById(`menu_sync_${id}`).lastElementChild;
    let row = document.getElementById(`row_${id}`);

    if (isChecked) {
        option.innerText = "Turn off Sync";
    } else {
        option.innerText = "Turn on Sync"
    }
    row.dataset.sync = isChecked;
}

let root = document.querySelector(':root');
let bgPicker = document.getElementById('bg-picker');
let textPicker = document.getElementById('text-picker');

bgPicker.addEventListener('input', e => {
    pickerInputHandler(e, '--bg-picker-color');
    document.getElementById('style_example').style.backgroundColor = e.target.value
})
bgPicker.addEventListener('click', pickerClickHandler);

textPicker.addEventListener('input', e => {
    pickerInputHandler(e, '--text-picker-color');
    document.getElementById('style_example').style.color = e.target.value
})
textPicker.addEventListener('click', pickerClickHandler);

function pickerClickHandler(e) {
    e.composedPath()[2].style.setProperty('--color', e.target.value)
    e.composedPath()[2].click()
}

function pickerInputHandler(e, property) {
    let rgb = hexToRGB(e.target.value);
    let color = visibleColor(rgb);
    root.style.setProperty(property, color);
    e.composedPath()[2].style.setProperty('--color', e.target.value);
    e.composedPath()[2].previousElementSibling.dataset.color = e.target.value;
}

let bgColorOpts = Array.from(document.getElementsByName('bg-option'))
let textColorOpts = Array.from(document.getElementsByName('color-option'))

bgColorOpts.forEach(opt => {
    opt.addEventListener('change', e => {
        document.getElementById('style_example').style.backgroundColor = e.target.dataset.color;
    })
})

textColorOpts.forEach(opt => {
    opt.addEventListener('change', e => {
        document.getElementById('style_example').style.color = e.target.dataset.color;
    })
})

const selectOpts = document.getElementById('color_selection_options')
document.getElementById('settings_single_color').addEventListener('change', e => {
    selectOpts.style.maxHeight = `${selectOpts.scrollHeight}px`;
    document.getElementById('style_example').style.backgroundColor = document.querySelector('[name="bg-option"]:checked').dataset.color;
    document.getElementById('style_example').style.color = document.querySelector('[name="color-option"]:checked').dataset.color;
});

document.getElementById('settings_random_color').addEventListener('change', e => {
    selectOpts.style.maxHeight = "0";
    document.getElementById('style_example').style.backgroundColor = '#ffff00';
    document.getElementById('style_example').style.color = '#000';
});

document.getElementById('nav_general').addEventListener('change', e => {
    document.getElementById('custom_general').hidden = false;
    document.getElementById('custom_style').hidden = true;
});

document.getElementById('nav_style').addEventListener('change', e => {
    document.getElementById('custom_general').hidden = true;
    document.getElementById('custom_style').hidden = false;
});

document.getElementById('bold_style').addEventListener('change', e => {
    e.preventDefault();
    document.getElementById('style_example').style.fontWeight = e.target.checked ? '800' : 'initial';
});

document.getElementById('italic_style').addEventListener('change', e => {
    e.preventDefault();
    document.getElementById('style_example').style.fontStyle = e.target.checked ? 'italic' : 'normal';
});

document.getElementById('underline_style').addEventListener('change', e => {
    e.preventDefault();
    document.getElementById('style_example').style.textDecoration = e.target.checked ? 'underline' : 'none';
});

document.getElementById('filter').addEventListener('input', e => {
    const activeList = document.querySelector('.active');
    const words = activeList.querySelectorAll('textarea');

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if (word.value.toLowerCase().indexOf(e.target.value.toLowerCase()) !== 0) {
            word.parentElement.classList.replace('visible', 'hidden');
        } else {
            word.parentElement.classList.replace('hidden', 'visible');
        }

    }
});

document.getElementById('darkMode').addEventListener('change', async e => {

    let themeCSS = document.getElementById('theme')

    if (e.target.checked) {
        themeCSS.href = "popup_dark.css";
        themeCSS.classList.replace('light', 'dark');
    } else {
        themeCSS.href = "popup.css";
        themeCSS.classList.replace('dark', 'light');
    }

    let settings = await storageGet('settings');
    settings.dm = e.target.checked;
    await storageSet('settings', settings);
})