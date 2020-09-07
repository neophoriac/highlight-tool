chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.command === "initialize") {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { command: 'initialize' });
            });
        };
        if(request.command.id){
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { command: request.command });
            });
        }
        if(request.command.query){
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { command: request.command });
            });
        }
        if(request.command.changeColor){
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { command: request.command });
            });
        }
    })