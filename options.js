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
      var buttons = document.getElementById("buttons");
      for (var i = 0; i < results.length; i++) {
        var res = results[i];
        var li = document.createElement("li");
        var resStr = res.get("page").get("url") + " : \t" + res.get("content");
        console.log(resStr);
        li.innerHTML = resStr;
        list.appendChild(li);

        var btn = document.createElement("BUTTON");
        btn.id = res.id;
        var txt = document.createTextNode("\u2716");
        btn.appendChild(txt);
        buttons.appendChild(btn);
        $("#" + btn.id).on("click", { obj: res }, deletePayload); 
      }
    });
  }

  function deletePayload(event) {
    var obj = event.data.obj;
    console.log("Deleting " + obj.get("content"));
    obj.destroy();
  }

})();
