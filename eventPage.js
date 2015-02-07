/* Script runs once in background */

chrome.runtime.onStartup.addListener(function() {
  console.log("initializing Parse");
  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.executeScript({
    file: 'addpayload.js'
  });
});
