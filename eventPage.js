/* Script runs once in background */

/*chrome.runtime.onStartup.addListener(function() {
  console.log("initializing Parse");
  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");
});*/

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

// Initializes new user ID upon install or upon message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "init") {
    initUser();
  }
});

chrome.runtime.onInstalled.addListener(function(details) {
  // if (details.reason == "install") {
  initUser();
  // }
});

function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

function initUser() {
  userid = getRandomToken();
  var user = new Parse.User();
  user.set("username", userid);
  user.set("password", "abc");
  user.signUp(null);
  chrome.storage.sync.set({userid: userid}, function() {
      console.log("Initialized user.");
  });
}
