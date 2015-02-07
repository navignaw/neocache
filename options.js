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
      var list = $("#payloads");
      var buttons = document.getElementById("buttons");
      for (var i = 0; i < results.length; i++) {
        var res = results[i];
        var url = res.get("page").get("url");
        // var resStr = "<a href=\"" + url "\" id=\"" + res.id + "\">" + url + " </a> : \t" + res.get("content");
        list.append('<li><a href="' + url + '" id="' + res.id + '">' + url + '</a> : \t' + res.get("content") + '</li>');

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
})();
