/* Content script for loading payloads */

(function() {

  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");

  var payloads;

  // Load all payloads on tab update
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.url) {
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
      });
    }
  });
})();