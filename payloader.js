/* Content script for loading and saving payloads */

(function() {

  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");

  var payloads = [];
  var drop = null;
  var payloadEnabled = false;

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
    var payloadEl = document.querySelector(payload.get('domPath'));
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
        name += '.' + realNode.className.replace(/ /g, '.');
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
    console.log('creating new drop at: "' + domPath + '"');
    drop = new Drop({
      target: document.querySelector(domPath),
      content: '<label for="payload-content">Content:</label> <input id="payload-content" type="text" /><br/>' +
               '<label for="payload-image">Image:</label> <input type="file" accept="image/*" id="payload-image" /><br/>' +
               '<button id="add-payload">Save</button>',
      position: 'top left',
      openOn: 'always',
      classes: 'drop drop-theme-arrows-bounce'
    });

    drop.on('open', function() {
      $('.drop-content #add-payload').on('click', function(e) {
        var fileControl = $(".drop-content input#payload-image")[0];
        var content = $('.drop-content input#payload-content').val();
        if (fileControl.files.length > 0) {
          createPayload(url, domPath, fileControl.files[0], content);
          drop.remove();
          drop = null;
        } else if (content) {
          createPayload(url, domPath, null, content);
          drop.remove();
          drop = null;
        } else {
          alert("Please enter content or upload an image.");
        }
      });
    });
  }

  // Saves payload to Parse and page if it does not exist
  function createPayload(url, domPath, image, content) {
    /* var curUser = Parse.User.current();
    if (!curUser) {
      console.log("Logging in.")
      chrome.storage.sync.get("userid", function(items) {
        console.log(items);
        if (items.userid) {
          Parse.User.logIn(items.userid, "abc");
        }
        else {
          chrome.runtime.sendMessage({type: "init"});
        }
        curUser = Parser.User.current();
      });
      curUser = Parse.User.current();
      console.log("Login successful.");
    } */

    chrome.storage.sync.get("userid", function(items) {
      if (!items.userid) {
        console.log("Error: userid not found");
      }
      
      var imageFile;
      var page;
      if (image) {
        imageFile = new Parse.File('image.jpg', image);
      }
      var Page = Parse.Object.extend("Page");
      var pageQuery = new Parse.Query(Page);
      console.log(items.userid);
      pageQuery.equalTo("url", url);
      pageQuery.find().then(function(results) {
        if (results.length > 0) {
          page = results[0];
          return Parse.Promise.as(null);
        } else {
          page = new Page();
          page.set("url", url);
          return page.save();
        }
      }).then(function() {
        if (imageFile) {
          return imageFile.save();
        } else {
          return Parse.Promise.as(null);
        }
      }).then(function() {
        var Payload = Parse.Object.extend("Payload");
        var payload = new Payload();
        payload.set("page", page);
        payload.set("domPath", domPath);
        payload.set("content", content);
        payload.set("user", items.userid);
        if (image) {
          payload.set("image", imageFile);
        }
        payload.save();

        attachPayload(payload);
      });
    });
  }
});

})();
