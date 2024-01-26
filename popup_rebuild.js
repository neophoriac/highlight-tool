// the code that builds our extension when the user clicks on the tool
rebuild();

function rebuild() {
	chrome.storage.local.get(null, (items) => {
		lists = items; // set our stored items to the global var
		listOrder = items.listOrder; // the list order that's supposed to appear on the group view

		loadSettings(items.settings);

		if (!listOrder?.length) {
			let row = createRow({ title: 'Global List', parentElement: groupList });
			let id = row.firstChild.dataset.parent;
			let name = row.firstChild.dataset.title;
			initListInStorage(id, name)
			groupList.appendChild(row);
			return;
		};

		// append our groups in the group view
		for (let i = 0; i < listOrder.length; i++) {
			const obj = listOrder[i];
			insertRows(obj.name, obj.id);
		}

	})
}

function insertRows(name, id) {
	let row = createRow({ title: name, id: id, parentElement: groupList }); // create the group
	groupList.appendChild(row); // append the group to the group view
}

function loadSettings(settings) {

	if (settings) { // if the group list has settings
		isRegex.checked = settings.regex; // if regex is enabled
		isWholeWords.checked = settings.wholeWords; // if whole words is enabled
		darkMode.checked = settings.dm;
	} else {
		isRegex.checked = false;
		isWholeWords.checked = true;
		darkMode.checked = false;
	}

	if (settings?.blacklistItems && settings?.blacklistItems?.length) { // if list settings has a blacklist
		restrictionListFill(settings.blacklistItems, blacklist) // append them
	} else {
		newRestrictionLine({ // add initial line
			referenceElement: blacklist,
			method: "appendChild"
		})
	}

	if (settings?.whitelistItems && settings?.whitelistItems?.length) { // if list settings has a whitelist
		restrictionListFill(settings.whitelistItems, whitelist) // append them
	} else {
		newRestrictionLine({ // add initial line
			referenceElement: whitelist,
			method: "appendChild"
		})
	}

}

function loadCustomSettings(settings, id) {

	let selectionOpts = document.getElementById('color_selection_options');
	let singleColor = document.getElementById('settings_single_color');
	let currentColor = document.getElementById('current-color'); // false or undefined = single mode, true = random mode
	let italicBox = document.getElementById('italic_style');
	let boldBox = document.getElementById('bold_style');
	let underlineBox = document.getElementById('underline_style');
	let example = document.getElementById('style_example');

	custSync.checked = true;
	isRegexCust.checked = false;
	isWholeWordsCust.checked = true;
	blacklistCust.innerHTML = "";
	whitelistCust.innerHTML = "";

	custSync.dataset.id = id;

	if (!settings) { // if it's a new list and doesn't have any settings stored
		const randColor = getColor();
		const bgOpt = document.querySelector(`[name="bg-option"][data-name="picker-option"]`);
		const textOpt = document.querySelector(`[name="color-option"][data-color="${randColor[1]}"]`);

		singleColor.checked = true;
		currentColor.checked = false;
		selectionOpts.style.maxHeight = '130px';

		bgOpt.checked = true;
		textOpt.checked = true;

		bgOpt.nextElementSibling.style.setProperty('--color',randColor[0]);
		document.getElementById('bg-picker').value = randColor[0];
		document.getElementById('bg-picker').dispatchEvent(new Event('input'));

		example.style.cssText = `background-color: ${randColor[0]}; color: ${randColor[1]}`;

		return;
	}

	custSync.checked = settings.s;
	isRegexCust.checked = settings.regex;
	isWholeWordsCust.checked = settings.wholeWords;
	italicBox.checked = settings.is;
	boldBox.checked = settings.bs;
	underlineBox.checked = settings.us;
	currentColor.checked = true
	customToggle.checked = settings.e;

	let italic = settings?.is ? 'font-style: italic;' : "";
	let bold = settings?.bs ? 'font-weight: 800;' : "";
	let underline = settings?.us ? "text-decoration: underline;" : "";
	let color = settings?.cm === false ? `background-color: ${settings.cb}; color: ${settings.ct};` : "background-color: #ffff00; color: #000;";

	example.style.cssText = `${italic} ${bold} ${underline} ${color}`;

	customToggle.dispatchEvent(new Event('change'));
	if (settings.cm === false) {
		const bgOpt = document.querySelector(`[name="bg-option"][data-color="${settings.cb}"]`) || document.querySelector(`[name="bg-option"][data-name="picker-option"]`);
		const textOpt = document.querySelector(`[name="color-option"][data-color="${settings.ct}"]`) || document.querySelector(`[name="color-option"][data-name="picker-option"]`);
		const example = document.getElementById('style_example')

		singleColor.checked = !settings.cm;
		currentColor.checked = settings.cm;

		selectionOpts.style.maxHeight = '130px';

		bgOpt.checked = true;
		textOpt.checked = true;

		if (bgOpt?.dataset?.name === "picker-option") {
			bgOpt.nextElementSibling.style.setProperty('--color', settings.cb);
			document.getElementById('bg-picker').value = settings.cb;
			document.getElementById('bg-picker').dispatchEvent(new Event('input'));
		}

		if (textOpt?.dataset?.name === "picker-option") {
			textOpt.nextElementSibling.style.setProperty('--color', settings.ct);
			document.getElementById('text-picker').value = settings.ct;
			document.getElementById('text-picker').dispatchEvent(new Event('input'));
		}

	}


	if (settings?.b && settings?.b?.length) {
		restrictionListFill(settings.b, blacklistCust)
	} else {
		newRestrictionLine({
			referenceElement: blacklistCust,
			method: "appendChild"
		})
	}

	if (settings?.w && settings?.w?.length) {
		restrictionListFill(settings.w, whitelistCust)
	} else {
		newRestrictionLine({
			referenceElement: whitelistCust,
			method: "appendChild"
		})
	}

}

function restrictionListFill(items, list) {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		newRestrictionLine({
			referenceElement: list,
			transferText: item,
		})
	}
}