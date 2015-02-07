(function () {

  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");

  chrome.storage.sync.get("userid", function(items) {
    if (!items.userid) {
      console.log("Error: no userid found.");
    }
    displayList(items.userid);
  });

  function displayList(curUser) {
    var Payload = Parse.Object.extend("Payload");
    var userQuery = new Parse.Query(Payload);
    userQuery.equalTo("user", curUser);
    userQuery.find().then(function(results) {
      var list = document.getElementById("payloads");
      for (var i = 0; i < results.length; i++) {
        var res = results[i];
        console.log(res);
        var li = document.createElement("li");
        var resStr = res.get("page").get("url") + ":" + res.content;
        li.innerHTML = resStr;
      }
    });
  }
})();
