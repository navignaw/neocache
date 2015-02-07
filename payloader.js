/* Content script for loading payloads */

(function() {

  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");

  var payloads;

  function attachPayload(payload) {
    var drop = new Drop({
      target: document.querySelector(payload.get('domPath')),
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

  // Saves payload to Parse and page if it does not exist
  function createPayload(url, domPath, content) {
    var Page = Parse.Object.extend("Page");
    var pageQuery = new Parse.Query(Page);
    pageQuery.equalTo("url", url);
    pageQuery.find().then(function(results) {
      var page;
      if (results.length > 0) {
        page = results[0];
      } else {
        page = new Page();
        page.set("url", url);
        page.save();
      }

      var Payload = Parse.Object.extend("Payload");
      var payload = new Payload();
      payload.set("page", page);
      payload.set("doomPath", domPath);
      payload.set("content", content);
      payload.save();
    });
  }
})();