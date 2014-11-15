var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
let { search, UNSORTED } = require("sdk/places/bookmarks");

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

var button = ToggleButton({
    id: "taby",
    label: "Taby Menu",
    icon: {
        "32": "./icon-32.png"
    },
    onChange: handleChange
});

var panel = panels.Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: self.data.url("panel.js"),
    onHide: handleHide
});

// Emit event 'show' when panel gets displayed
panel.on("show", function() {
    panel.port.emit("show");
    console.log("Emitting show");
});

// Listen for panelAction event from panel.js
panel.port.on("panelAction", function (text) {
    console.log("Heard panelAction:"+text);
    panel.hide();
});

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

function handleHide() {
    button.state('window', {checked: false});
}

// Returns all bookmarks
search(
    { query: "" },
    { sort: "title" }
).on("end", function (results) {
    // results matching any bookmark that has "firefox"
    // in its URL, title or tag, sorted by title
    console.log('bookmarks ' + results);
    for (var i=0; i<results.length; i++){
    console.log(results[i].title + " " +
                results[i].url + " " +
                results[i].group + " " +
                results[i].tags);
    }
});

// Multiple queries are OR'd together
// search(
//   [{ query: "firefox" }, { group: UNSORTED, tags: ["mozilla"] }],
//   { sort: "title" }
// ).on("end", function (results) {
//   // Our first query is the same as the simple query above;
//   // all of those results are also returned here. Since multiple
//   // queries are OR'd together, we also get bookmarks that
//   // match the second query. The second query's properties
//   // are AND'd together, so results that are in the platform's unsorted
//   // bookmarks folder, AND are also tagged with 'mozilla', get returned
//   // as well in this query
//   console.log('bookmarks ' + results);
// });
