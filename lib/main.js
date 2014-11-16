var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
let { search, UNSORTED } = require("sdk/places/bookmarks");
var base64 = require("sdk/base64");

var githubQuery = require("githubQuery");
var pushBookmarks = githubQuery.pushBookmarks;
var pullBookmarks = githubQuery.pullBookmarks;

// Create main UI button with Taby icon
var button = ToggleButton({
    id: "taby",
    label: "Taby Menu",
    icon: {
        "32": "./icon-32.png"
    },
    onChange: handleChange
});

// Create UI panel which loads panel.html and panel.js
var panel = panels.Panel({
    width: 175,
    height: 225,
    contentURL: self.data.url("panel.html"),
    contentScriptFile: self.data.url("panel.js"),
    onHide: handleHide
});

// Handler for when panel is changed
function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

// Handler for when panel is hidden
function handleHide() {
    button.state('window', {checked: false});
}

// Emit event 'show' when panel gets displayed
panel.on("show", function() {
    panel.port.emit("show");
});

// Listen for panelAction event from panel.js
panel.port.on("panelAction", function (option) {
    console.log("Panel Action: "+option);
    if ( option == "pull"){
        var singleBookmark = null;
        pullBookmarks(function(singleBookmark){ //required callback
            var content64 = singleBookmark.content.replace(/(\r\n|\n|\r)/gm,"");
            console.log(base64.decode(content64, "utf-8"));
        });
    }
    if ( option == "push"){
        pushBookmarks(localBookmarks);
    }
    panel.hide();
});

// Get local bookmarks.
var localBookmarks = [];
search(
    { query: "" },
    { sort: "title" }
).on("end", function (results) {
    for (var i=0; i<results.length; i++){
    localBookmarks.push(results[i]);
    console.log("Bookmark " + i + " " +
                results[i].title + " " +
                results[i].url + " " +
                results[i].group + " " +
                results[i].tags + " " +
                results[i].updated);
    }
    return results;
});
