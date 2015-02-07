/* Content script for loading and saving payloads */

(function() {

  Parse.initialize("Qh5UNx6rO5d9RPKHkW7OAAgabKGlbcByuaWZXdFB", "NcwUMIqVFnmYHjzkrlRFIPWaKhytP0kIhwLKdpBa");

  var payloads = [];
  var drop = null;
  var payloadEnabled = false;

  // Save payload icon on screen
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
        content: payload.get('content'),
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

  function getDomPath(el) {
    var stack = [];
    while ( el.parentNode !== null ) {
      /* console.log(el.nodeName);
      var sibCount = 0;
      var sibIndex = 0;
      for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
        var sib = el.parentNode.childNodes[i];
        if ( sib.nodeName == el.nodeName ) {
          if ( sib === el ) {
            sibIndex = sibCount;
          }
          sibCount++;
        }
      } */
      var nodeName = el.nodeName.toLowerCase();

      if (el.className) {
        nodeName += '.' + el.className.replace(/ /g, '.');
      }
      if (el.hasAttribute('id') && el.id !== '') {
        nodeName += '#' + el.id;
      } /*else if ( sibCount > 1 ) {
        nodeName += ':eq(' + sibIndex + ')';
      } */
      stack.unshift(nodeName);
      el = el.parentNode;
    }

    return stack.slice(1).join(' '); // removes the html element
  }

  // Allow creating payloads on click (mode toggled by browser action)
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'browserAction' && request.url) {
    payloadEnabled = !payloadEnabled;
    sendResponse({enabled: payloadEnabled});

    $(document).undelegate();
    $(document).delegate('*', 'click', function(e) {
      if (drop && !$(e.target).closest('.drop').length) {
        drop.destroy();
        drop = null;
      } else if (!drop && payloadEnabled) {
        var domPath = getDomPath($(this)[0]);
        attachPopover(request.url.split("?")[0], domPath);
      }
      return false;
    });
  }


  // Attach a popover element to the DOM
  function attachPopover(url, domPath) {
    console.log('creating new drop at ' + domPath);
    drop = new Drop({
      target: document.querySelector(domPath),
      content: 'Content: <input class="payload-content" type="text" />' +
               '<button id="add-payload">Save</button>',
      position: 'top left',
      openOn: 'always',
      classes: 'drop drop-theme-arrows-bounce'
    });

    drop.on('open', function() {
      $('.drop-content #add-payload').on('click', function(e) {
        createPayload(url, domPath, $('.drop-content input.payload-content').val());
        drop.destroy();
        drop = null;
      });
    });
  }

  // Saves payload to Parse and page if it does not exist
  function createPayload(url, domPath, content) {
    var curUser = Parse.User.current();
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
    }
    var Page = Parse.Object.extend("Page");
    var pageQuery = new Parse.Query(Page);
    console.log(curUser);
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
      payload.set("domPath", domPath);
      payload.set("content", content);
      payload.set("user", curUser);
      payload.save();

      attachPayload(payload);
    });
  }
});

})();
