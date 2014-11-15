var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
/* this is how you call my query
var githubQuery = require("githubQuery");
var updateBookmars = githubQuery.setBookmarks;
var getBookmarks = githubQuery.getBookmarks;

updateBookmars(allBookmarkObjs,function(data){ //optionalCallback
    console.log("do something with " + data);
});

getBookMarks(function(singleBookmark){ //required callback
    console.log("do something with " + singleBookmark);
});
*/

var button = buttons.ActionButton({
  id: "taby-link",
  label: "Visit Taby!",
  icon: {
    "32": "./icon-32.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  tabs.open("https://github.com/valencik/taby");
}