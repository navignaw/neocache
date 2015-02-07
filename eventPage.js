/* Script runs once in background */

/*chrome.runtime.onStartup.addListener(function() {
  console.log("initializing Parse");
  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");
});*/

var addmode = false;

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {type: 'browserAction', url: tab.url}, function(response) {
      if (response.enabled) {
        chrome.browserAction.setIcon({path: 'images/icon.png'});
      } else {
        chrome.browserAction.setIcon({path: 'images/icon-grey.png'});
      }
    });
});

// Load all payloads on tab creation/update
chrome.tabs.onCreated.addListener(function(tab) {
  if (tab.active) {
    chrome.tabs.sendMessage(tab.id, {type: 'newUrl', url: tab.url});
  }
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.tabs.sendMessage(tabId, {type: 'newUrl', url: tab.url});
  }
});