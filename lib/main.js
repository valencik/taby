var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
let { search, UNSORTED } = require("sdk/places/bookmarks");

var githubQuery = require("githubQuery");
var setBookmarks = githubQuery.setBookmarks;
var getBookmarks = githubQuery.getBookmarks;
var base64 = require("sdk/base64");

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
        getBookmarks(function(singleBookmark){ //required callback
            var content64 = singleBookmark.content.replace(/(\r\n|\n|\r)/gm,"");
            console.log(base64.decode(content64, "utf-8"));
        });
    }
    if ( option == "push"){
        sendTestBookmark();
    }
    panel.hide();
});

// A simple test to create a new file. (Fails for updates)
function sendTestBookmark() {
    var testContent = {
        "url": "http://www.reddit.com/",
        "note": [
          "I love reddit"
        ]
    };
    var testBookmark = [ {
        path: "test.txt",
        data: {
            "message": "Taby's test commit",
            "committer": {
                "name": "Taby Cat",
                "email": "taby@cs.smu.ca"
            },
            "content": base64.encode(testContent, "utf-8"),
        }
    }];
    setBookmarks(testBookmark, function(data){ //optional callback
        console.log(data);
    });
}


// Returns all bookmarks matching query
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
