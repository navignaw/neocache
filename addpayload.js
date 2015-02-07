/* Content script for adding payloads on click */

var drop = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if (request.type === 'browserAction' && request.url) {
    $(document).delegate('*', 'click', function() {
      if (drop) {
        drop.destroy();
        drop = null;
      } else {
        var domPath = getDomPath($(this)[0]);
        attachPopover(request.url.split("?")[0], domPath);
      }
      $(document).undelegate();
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
      dropExists = true;
      $('.drop-content #add-payload').on('click', function(e) {
        createPayload(url, domPath, $('.drop-content input.payload-content').val());
        drop.destroy();
        drop = null;
      });
    });
  }

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
      payload.set("domPath", domPath);
      payload.set("content", content);
      payload.save();
    });
  }

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

  /* console.log("loaded");

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(message);
    if (message == "false") {
      chrome.runtime.sendMessage(chrome.runtime.id, "true");
      $('body').click(function(e) {
        var clickelem = $(e.target);
        console.log(clickelem);
        chrome.runtime.sendMessage(chrome.runtime.id, "false");
      });
    }

  }); */

});