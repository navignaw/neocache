/* Script runs once in background */

chrome.runtime.onStartup.addListener(function() {
  console.log("initializing Parse");
  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");
});

var addmode = false;

// TODO: figure out how to only add one listener at a time
chrome.browserAction.onClicked.addListener(function() {
      chrome.tabs.sendMessage(
      chrome.tabs.executeScript({
        file: 'addpayload.js'
      });
//      function() {
//       addmode = false;
//    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  addmode = false;
});
