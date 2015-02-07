console.log("blah");
$(document).delegate('*', 'click', function(){
  var path = getDomPath($(this)[0]); 
  $(document).undelegate();
  chrome.runtime.sendMessage(chrome.runtime.id, {domPath: path});
  return false;
});

function getDomPath(el) {
  var stack = [];
  while ( el.parentNode != null ) {
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

    if ( el.className ) {
      nodeName += '.' + el.className.replace(/ /g, '.');
    }
    if ( el.hasAttribute('id') && el.id != '' ) {
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
