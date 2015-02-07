(function () {

  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");

  chrome.storage.sync.get("userid", function(items) {
    if (!items.userid) {
      console.log("Error: no userid found.");
      return;
    }
    displayList(items.userid);
    displayGroups(items.userid);
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

  function displayGroups(curUser) {
    var Group = Parse.Object.extend("Group");
    var groupQuery = new Parse.Query(Group);

    var joinOrLeaveGroup = function() {
      var $this = $(this);
      groupQuery = new Parse.Query(Group);
      groupQuery.get($this.attr('id')).then(function(group) {
        if ($this.text() === 'Join') {
          group.add("users", curUser.toString());
          $this.text('Leave');
        } else {
          group.remove("users", curUser.toString());
          $this.text('Join');
        }
        group.save();
      });
    };

    groupQuery.find().then(function(results) {
      var list = $("#groups");
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var joinOrLeave;
        if (result.get("users").indexOf(curUser) === -1) {
          joinOrLeave = '<a href="#" class="join-leave" id="' + result.id + '">Join</a>';
        } else {
          joinOrLeave = '<a href="#" class="join-leave" id="' + result.id + '">Leave</a>';
        }
        list.append('<li>' + result.get("name") + ' (' + joinOrLeave + ')</li>');
      }
      list.find('li > a.join-leave').click(joinOrLeaveGroup);
      list.append('<li id="new-group-list">' +
                    '<input type="text" id="new-group-text" placeholder="New Group Name"/>' +
                    '<button type="button" id="new-group">+ Add</button>' +
                  '</li>');

      $('#new-group').click(function() {
        var group = new Group();
        var groupName = $('#new-group-text').val();
        group.set("name", groupName);
        group.set("users", [curUser]);
        group.save().then(function(newGroup) {
          $('#new-group-text').val('');
          var leave = '<a href="#" class="join-leave" id="' + newGroup.id + '">Leave</a>';
          $('#new-group-list').before('<li>' + groupName + ' (' + leave + ')</li>');
          $('#' + newGroup.id).click(joinOrLeaveGroup);
        });
      });
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
