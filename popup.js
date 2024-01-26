
chrome.action.setPopup(
   {popup: 'popup_dark.html' }
  )

let isChecked = false;

let globalList = document.getElementById('globalList');
let domain = document.getElementById('domain');
let save = document.getElementById('save');
let list = document.getElementById('list');

chrome.storage.local.get('toggle', function (result) {
    if (result.toggle) {
        toggle.checked = result.toggle[0];
    };
    // check if the extension is on or off
});

tooltip(insertRow, nameEntry, 'top-end', 'click', 'prompt');
nameEntryHandler(insertRow);

tooltip(clearAllBtn, confirmClear, 'bottom-start', 'click', 'prompt');
clearProceed.addEventListener('click', clearAllHandler);
clearCancel.addEventListener('click', (e) => clearAllBtn.click())

toggle.addEventListener('click', toggleOnOff);
donate.addEventListener('click', donateHandler);

custSettReturnBtn.addEventListener('click', returnToConf);
customSettings.addEventListener('click', customSettingsConf)
customSave.addEventListener('click', async (e) => {
    const activeList = document.querySelector('.active');
    const storedList = await storageGet(activeList.id);
    const curColorMode = storedList.settings.cm // false or undefined = single mode, true = random mode

    const selectedColorMode = document.getElementById('settings_random_color').checked
    const bgColor = document.querySelector('[name="bg-option"]:checked').dataset.color;
    const textColor = document.querySelector('[name="color-option"]:checked').dataset.color
    const isItalic = document.getElementById('italic_style').checked;
    const isBold = document.getElementById('bold_style').checked;
    const isUnderline = document.getElementById('underline_style').checked;

    let assignedColors = {};


    // if single color mode is enabled
    if (!selectedColorMode) {
        document.getElementsByName('bkgrColor').forEach(el => {
            el.value = bgColor;
            el.nextElementSibling.value = textColor;
        });
    } else if (selectedColorMode && !curColorMode) {
        document.getElementsByName('bkgrColor').forEach(el => {
            let color = getColor();
            el.value = color[0];
            el.nextElementSibling.value = color[1];
        });
    }

    document.getElementById('current-color').checked = selectedColorMode; // false or undefined = single mode, true = random mode

    store([activeList])

    const randColor = getColor();
    const italic = isItalic ? 'font-style: italic;' : 'font-style: normal;';
    const bold = isBold ? 'font-weight: 800;' : 'font-weight: initial;';
    const underline = isUnderline ? "text-decoration: underline;" : 'text-decoration: none;';
    const items = Array.from(document.querySelectorAll('.active .item'))


    items.forEach(item => {
        const randColor = getColor();
        const id = item.querySelector('textarea').id;
        const bgColor = item.querySelector('[name="bkgrColor"]').value;
        const color = item.querySelector('[name="color"]').value;

        assignedColors[id] = { bgColor: bgColor, color: color }
    })

    chrome.runtime.sendMessage({ command: { changeStyle: { style: `${italic} ${bold} ${underline}`, assignedColors: assignedColors } } })

})

tooltip(custEnableBox, 'Overrides global settings', 'bottom-end', 'mouseover');

alertExit.addEventListener("click", (e) => {
    alertMessage.parentElement.hidden = true;
})

const comment = 'Due to sync limitations, sync might fail. \n\n Exclude lists or use export as alternative.';
tooltip(sync, comment, 'top-center', 'mouseover');
sync.addEventListener('click', syncLists);

exportAllBtn.addEventListener("click", exportFile);
importFileBtn.addEventListener("click", importFile);

const wildcardInfo = "\n\nAllows use of * to match zero or more characters after it.\n e.g. https://*.google.com/*. \n\n If you want to match a specific page, add page URL as is.";
const blackInfo = "These sites/pages will be excluded from highlighting. \n Exclusive list takes precedence." + wildcardInfo;
const whiteInfo = "Your list will become exclusive on these sites/pages. \n Every other site will be excluded." + wildcardInfo;

tooltip(document.getElementById("global_black_info"), blackInfo, "bottom-start", "mouseover");
tooltip(document.getElementById("cust_black_info"), blackInfo, "bottom-start", "mouseover");
tooltip(document.getElementById("global_white_info"), whiteInfo, "bottom-start", "mouseover");
tooltip(document.getElementById("cust_white_info"), whiteInfo, "bottom-start", "mouseover");