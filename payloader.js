/* Content script for loading payloads */

(function() {

  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");

  var payloads;

  function attachPayload(payload) {
    var payloadEl = document.querySelector(payload.get('domPath'));
    var icon = document.createElement("icon");
    var img = document.createElement("img");
    var imgLoc = chrome.extension.getURL("images/payload-icon.gif");
    img.setAttribute("src", imgLoc);
    icon.appendChild(img);
    var iconEl = payloadEl.appendChild(icon);

    var drop = new Drop({
      target: iconEl,
      content: payload.get('content'),
      position: 'top left',
      openOn: 'hover',
      classes: 'drop-theme-arrows-bounce'
    });
  }

  // Load all payloads on message from event page
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'newUrl' && request.url) {
      var newUrl = request.url.split("?")[0]; // remove url parameters
      console.log('Searching for payloads on ' + newUrl);

      var Page = Parse.Object.extend("Page");
      var pageQuery = new Parse.Query(Page);
      pageQuery.equalTo("url", newUrl);
      pageQuery.find().then(function(results) {
        if (results.length > 0) {
          var page = results[0];
          var Payload = Parse.Object.extend("Payload");
          var payloadQuery = new Parse.Query(Payload);
          payloadQuery.equalTo("page", page);
          return payloadQuery.find();
        }
        return Parse.Promise.as([]);

      }).then(function(results) {
        payloads = results;
        console.log(payloads.length + " payloads found");
        console.log(payloads);

        for (var i = 0; i < payloads.length; i++) {
          attachPayload(payloads[i]);
        }
      });
    }
  });

})();