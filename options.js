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
    var payloadQuery = new Parse.Query(Payload);
    payloadQuery.equalTo("user", curUser);
    payloadQuery.include("page");
    payloadQuery.find().then(function(results) {
      var list = document.getElementById("payloads");
      for (var i = 0; i < results.length; i++) {
        var res = results[i];
        var li = document.createElement("li");
        var resStr = res.get("page").get("url") + " : \t" + res.get("content");
        console.log(resStr);
        li.innerHTML = resStr;
        list.insertBefore(li, list.firstChild);
      }
    });
  }

  /*
      var promise = Parse.Promise.as();
      var payload = [];
      for (var i = 0; i < results.length; i++) {
        
      //_.each(results, function(result) {
        promise = promise.then(function(payloads) {
          // var pageQuery = Parse.Object.extend("Page");
          // pageQuery.equalTo(result.get("page").id)
          payloads.push(
          return results[i].get("page").get("url");
        });
      }
      return promise;
      /* var list = document.getElementById("payloads");
      for (var i = 0; i < results.length; i++) {
        var res = results[i];
        var li = document.createElement("li");
        var resStr = res.get("page").get("url") + ":" + res.get("content");
        console.log(res);
        console.log(resStr);
        li.innerHTML = resStr;
      } */
  /*  }).then(function(promise) {
      var li = document.createElement("li");
      console.log(promise);
      li.innerHTML =  promise + ":" + results[i].get("content"));
    });
  }*/
})();
