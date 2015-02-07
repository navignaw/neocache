console.log("blah");
$(document).delegate('*', 'click', function(){
  var path = $(this).parents().andSelf();
  console.log(path);
  $(document).undelegate();
  return false;
});

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
