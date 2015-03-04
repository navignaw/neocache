/* Content script for loading and saving payloads */

(function() {

  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");

  var drop = null;
  var payloadEnabled = false;
  var groups = [];
  var payloads = {};

  function escapeHTML(input) {
    var MAP = { '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'};

    return input.replace(/[&<>'"]/g, function(c) {
      return MAP[c];
    });
  }

  // Get current user id; returns a promise
  function getCurrentUser() {
    var promise = new Parse.Promise();
    chrome.storage.sync.get("userid", function(items) {
      if (!items.userid) {
        console.log("Error: userid not found");
        promise.reject("Error: userid not found");
      } else {
        console.log('User: ', items.userid);
        promise.resolve(items.userid);
      }
    });
    return promise;
  }

  // Compute and cache user's groups
  getCurrentUser().then(function(userId) {
    var Group = Parse.Object.extend("Group");
    var groupsQuery = new Parse.Query(Group);
    groupsQuery.equalTo("users", userId);

    return groupsQuery.find();
  }).then(function(results) {
    groups = results;
  });

  // Save payload icon on screen and display content on hover
  function payloadHTML(payload) {
    var html = '';
    var image = payload.get('image');
    var content = payload.get('content');
    if (image) {
      html += '<img src=' + image.url() + '></img>';
    }
    if (content) {
      html += '<div>' + content + '</div>';
    }
    return html;
  }

  function attachPayload(payload) {
    var domPath = payload.get('domPath');
    if (payloads.hasOwnProperty(domPath)) {
      return;
    }

    payloads[domPath] = true;
    var payloadEl = document.querySelector(domPath);
    if (payloadEl) {
      var icon = document.createElement("icon");
      var img = document.createElement("img");
      var imgLoc = chrome.extension.getURL("images/payload-icon.png");
      img.setAttribute("src", imgLoc);
      icon.appendChild(img);
      var iconEl = payloadEl.appendChild(icon);

      var drop = new Drop({
        target: iconEl,
        content: payloadHTML(payload),
        position: 'top left',
        openOn: 'hover',
        classes: 'drop-theme-arrows-bounce'
      });
    }
  }

  // Load all payloads on message from event page
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'newUrl' && request.url) {
      var newUrl = request.url.split("?")[0]; // remove url parameters
      var userId;
      console.log('Searching for payloads on ' + newUrl);

      // Get current user id
      getCurrentUser().then(function(user) {
        userId = user;

        // Filter by current url
        var Page = Parse.Object.extend("Page");
        var pageQuery = new Parse.Query(Page);
        pageQuery.equalTo("url", newUrl);
        return pageQuery.find();
      }).then(function(results) {
        if (results.length > 0) {
          var page = results[0];

          // Filter by user's groups
          var Group = Parse.Object.extend("Group");
          var groupsQuery = new Parse.Query(Group);
          groupsQuery.equalTo("users", userId);

          var Payload = Parse.Object.extend("Payload");
          var payloadQuery = new Parse.Query(Payload);
          payloadQuery.equalTo("page", page);
          payloadQuery.matchesQuery("group", groupsQuery);
          return payloadQuery.find();
        }
        return Parse.Promise.as([]);

      }).then(function(payloads) {
        console.log(payloads.length + " payloads found");

        for (var i = 0; i < payloads.length; i++) {
          attachPayload(payloads[i]);
        }
      });
    }
  });

  function getDomPath(el) {
    var stack = [];

    var path, node = el;
    while (node.length) {
      var realNode = node[0],
          name = realNode.localName;
      if (!name) break;
      name = name.toLowerCase();

      if (realNode.className) {
        name += '.' + $.trim(realNode.className).replace(/\s+/g, '.');
      }
      if (realNode.hasAttribute('id') && realNode.id !== '') {
        name += '#' + realNode.id;
      }

      var parent = node.parent();
      var sameTagSiblings = parent.children(name);
      if (sameTagSiblings.length > 1) {
        allSiblings = parent.children();
        var index = allSiblings.index(realNode) + 1;
        if (index > 1) {
          name += ':nth-child(' + index + ')';
        }
      }

      stack.unshift(name);
      node = parent;
    }

    return stack.slice(1).join(' > '); // removes the html element
  }

  // Allow creating payloads on click (mode toggled by browser action)
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'browserAction' && request.url) {
    payloadEnabled = !payloadEnabled;
    sendResponse({enabled: payloadEnabled});

    $(document).undelegate();
    $(document).delegate('*', 'click', function(e) {
      if (drop && !$(e.target).closest('.drop').length) {
        drop.remove();
        drop = null;
      } else if (!drop && payloadEnabled) {
        var domPath = getDomPath($(this));
        attachPopover(request.url.split("?")[0], domPath);
      }
      return false;
    });
  }


  // Attach a popover element to the DOM
  function attachPopover(url, domPath) {
    // TODO: fileControl does not work :(
    console.log('creating new drop at: "' + domPath + '"');
    var content = '<label for="payload-content">Content:</label> <input id="payload-content" type="text" />',
        image   = '<label for="payload-image">Image:</label> <input type="file" accept="image/*" id="payload-image" />',
        group   = '<label for="payload-group">Group:</label> <select id="payload-group">',
        save    = '<button id="add-payload">Save</button>';

    for (var i = 0; i < groups.length; i++) {
      group += '<option value="' + groups[i].id + '">' + groups[i].get("name") + "</option>";
    }
    group += '</select>';

    drop = new Drop({
      target: document.querySelector(domPath),
      content: [content, image, group, save].join('<br/>'),
      position: 'top left',
      openOn: 'always',
      classes: 'drop drop-theme-arrows-bounce'
    });

    drop.on('open', function() {
      $('.drop-content #add-payload').on('click', function(e) {
        var fileControl = $(".drop-content input#payload-image")[0];
        var content = escapeHTML($('.drop-content input#payload-content').val() || '');
        var groupId = $('.drop-content select#payload-group').val();
        if (!groupId) {
          alert("Please select a group to post under. (You may add groups in the Options page.)");
        } else if (fileControl.files.length > 0 || content) {
          var image = fileControl.files.length > 0 ? fileControl.files[0] : null;
          createPayload(url, domPath, image, content, groupId);
          drop.remove();
          drop = null;
        } else {
          alert("Please enter content or upload an image.");
        }
      });
    });
  }

  // Saves payload to Parse and page if it does not exist
  function createPayload(url, domPath, image, content, groupId) {
    var imageFile;
    var page;
    var userId;

    if (image) {
      imageFile = new Parse.File('image.jpg', image);
    }

    var Page = Parse.Object.extend("Page");

    // Get current user id
    getCurrentUser().then(function(user) {
      userId = user;

      var pageQuery = new Parse.Query(Page);
      pageQuery.equalTo("url", url);
      return pageQuery.find();
    }).then(function(results) {
      // Get page based on current url
      if (results.length > 0) {
        page = results[0];
        return Parse.Promise.as(null);
      } else {
        page = new Page();
        page.set("url", url);
        return page.save();
      }
    }).then(function() {
      if (image) {
        return imageFile.save();
      } else {
        return Parse.Promise.as(null);
      }
    }).then(function() {
      var Group = Parse.Object.extend("Group");
      var groupQuery = new Parse.Query(Group);
      return groupQuery.get(groupId);
    }).then(function(group) {
      var Payload = Parse.Object.extend("Payload");
      var payload = new Payload();
      payload.set("page", page);
      payload.set("domPath", domPath);
      payload.set("content", content);
      payload.set("user", userId);
      payload.set("group", group);
      if (image) {
        payload.set("image", imageFile);
      }
      payload.save();

      attachPayload(payload);
    });
  }
});

})();
