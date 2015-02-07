/* Script runs once in background */

/*chrome.runtime.onStartup.addListener(function() {
  console.log("initializing Parse");
  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");
});*/

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