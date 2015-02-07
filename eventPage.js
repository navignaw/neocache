/* Script runs once in background */

/*chrome.runtime.onStartup.addListener(function() {
  console.log("initializing Parse");
  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");
});*/

var addmode = false;

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({
      file: 'addpayload.js'
    });
});

/* chrome.browserAction.onClicked.addListener(function(tab) {
      chrome.tabs.executeScript({
        file: 'addpayload.js'
      });
      chrome.tabs.sendMessage(tabId, {addmode});
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message) {
    case "true":
      addmode = true;
      break;
    case "false":
      addmode = false;
      break;
}); */
       
// Load all payloads on tab creation/update
chrome.tabs.onCreated.addListener(function(tab) {
  if (tab.active) {
    chrome.tabs.sendMessage(tabId, {url: tab.url});
  }
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.tabs.sendMessage(tabId, {type: 'newUrl', url: tab.url});
  }
});
