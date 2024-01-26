let lists = {} // will hold lists once retrieved from local storage
let listOrder = [];

const toggle                = document.getElementById('toggleOnOff');
const donate                = document.getElementById('donate');
const eraseChecked          = document.getElementById('erase_checked');
const groupList             = document.getElementById('group');
const groupFooter           = document.getElementById('group_footer');
let footer                  = document.getElementById("conf_footer");
const menuOpts              = document.getElementById("menu_options");
const alertMessage          = document.getElementById("alert_message");
const alertExit             = document.getElementById("alert_exit");

// ---------------- Name Entry Selectors ---------------------//
const nameEntry             = document.getElementById('name_entry');
const cancel                = nameEntry.querySelector('#name_entry_cancel');
let nameValue               = nameEntry.querySelector('#name');
const ok                    = nameEntry.querySelector('#name_entry_ok');
const insertRow             = document.getElementById('insert_row');
const rawURL                = document.getElementById('raw_url');
const importBtn             = document.getElementById('import_raw_file');

// ------------------- Settings Page ------------------------//
const globalSettings        = document.getElementById("global_settings");
const settingsPage          = document.getElementById("settings_page");
const settReturnBtn         = document.getElementById('settings_to_group_btn');
const settFooter            = document.getElementById('global_settings_footer');
const globalSave            = document.getElementById('save_global');

const isRegex               = document.getElementById('regex');
const isWholeWords          = document.getElementById('completeWords');
const blacklist             = document.getElementById('blacklist');
const whitelist             = document.getElementById('whitelist');
const darkMode              = document.getElementById('darkMode');

const clearAllBtn           = document.getElementById('clearAll');
const confirmClear          = document.getElementById('confirm_clear');
const clearProceed          = document.getElementById('clear_proceed');
const clearCancel           = document.getElementById('clear_cancel');

const exportAllBtn          = document.getElementById("exportAll");
const importFileBtn         = document.getElementById("import");

const importContainer       = document.getElementById("imported_lists")
const chooseImport          = document.getElementById("choose_import");
const chooseImportTitle     = document.getElementById("imported_title");
const importCheck           = document.getElementById("import_check");
const importProceed         = document.getElementById("import_proceed");
const importCancel          = document.getElementById("import_cancel");
const importSettings        = document.getElementById("import_settings");

// ------------------ Custom Settings Page -------------------//
const customSettings        = document.getElementById("custom_settings");
const custom                = document.getElementById("custom");
const customToggle          = document.getElementById("toggle_custom");
const custEnableBox         = document.getElementById("cust_enable");
const custSync              = document.getElementById("sync_storage");
const custsettingsPage      = document.getElementById("custom_settings_page");
const custSettReturnBtn     = document.getElementById('settings_to_conf_btn');
const custSettFooter        = document.getElementById('custom_settings_footer');
const customSave            = document.getElementById('save_custom');

const isRegexCust           = document.getElementById('regexCust');
const isWholeWordsCust      = document.getElementById('completeWordsCust');
const blacklistCust         = document.getElementById('blacklistCust');
const whitelistCust         = document.getElementById('whitelistCust');

// -------------------------- Sync ---------------------------//
const sync                    = document.querySelector(".sync");
const syncDone              = document.querySelector(".sync-done");