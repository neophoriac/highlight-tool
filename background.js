chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.command === "initialize") {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { command: 'initialize' });
            });
        };
        if (request.command.id) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { command: request.command });
            });
        }
        if (request.command.query) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { command: request.command });
                }
            });
        }
        if (request.command.changeColor) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { command: request.command });
            });
        }
        if (request.command.toggle) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { command: request.command });
                }
            });
        }
        if (request.command === "donate") {
            chrome.tabs.create({ url: 'https://paypal.me/neophoriac' });
        }
        if (request.command === "getLocation") {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                sendResponse({ host: (new URL(tabs[0].url)).host })
            });
        }
        return true;
    })