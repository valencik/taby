var {
    ToggleButton
} = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
let {
    search, UNSORTED, Bookmark, Group, save
} = require("sdk/places/bookmarks");
var base64 = require("sdk/base64");

var githubQuery = require("githubQuery");
var pushBookmarks = githubQuery.pushBookmarks;
var pullBookmarks = githubQuery.pullBookmarks;
var setGithubInfo = githubQuery.setGithubInfo;

var panelSizeRegular = 225;
var panelSizeSettings = 150;

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
    button.state('window', {
        checked: false
    });
}

// Emit event 'show' when panel gets displayed
panel.on("show", function() {
    panel.port.emit("show");
});

// Listen for panelAction event from panel.js
panel.port.on("panelAction", function (option, content) {
    console.log("Panel Action: "+option);
    if ( option == "pull"){
        var singleBookmark = null;
        pullBookmarks(function(bookmarks) { //required callback
            // console.log(singleBookmark);
            let group = Group({
                title: "taby"
            });
            let bookmarksObj = [];
            for(var i in bookmarks) {
                bookmarksObj.push(Bookmark({title: bookmarks[i].title, url:bookmarks[i].url, group:group}));
            }
            save(bookmarksObj).on("data", function(saved, input) {
            }).on("end", function(saves, inputs) {
                console.log("done: " + saves);
            });
        });
        panel.hide();
    }
    if (option == "push") {
        pushBookmarks(localBookmarks);
        panel.hide();
    }
    if (option == "saveTabs") {
        var localTabs = [];
        var date = getTimestamp();
        for (let tab of tabs){
            var singleTab = {};
            singleTab.title = tab.title.replace(/\W/gm,"");
            singleTab.path = "tabs/" + date.timestamp + "/tabs.json";
            singleTab.url = tab.url;
            singleTab.updated = date.updated;
            localTabs.push(singleTab);
        }
        pushBookmarks(localTabs);
        panel.hide();
    }
    if ( option == "setup"){
        panel.height = panelSizeSettings;
        panel.contentURL = self.data.url("settings.html");
    }
    if ( option == "save"){
        panel.height = panelSizeRegular;
        setGithubInfo(content.username, content.password, content.repository);
        panel.contentURL = self.data.url("panel.html");
    }
    if ( option == "cancel"){
        panel.height = panelSizeRegular;
        panel.contentURL = self.data.url("panel.html");
    }
});

// Get local bookmarks.
var localBookmarks = [];
search({
    query: ""
}, {
    sort: "title"
}).on("end", function(results) {
    for (var i = 0; i < results.length; i++) {
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

// Timestamps
function getTimestamp() {
    var objTime = new Date(),
        curDay = objTime.getDate(),
        curMonth = objTime.getMonth() + 1,
        curYear = objTime.getFullYear(),
        curHour = objTime.getHours() < 10 ? "0" + objTime.getHours() : objTime.getHours(),
        curMinute = objTime.getMinutes() < 10 ? "0" + objTime.getMinutes() : objTime.getMinutes(),
        curSeconds = objTime.getSeconds() < 10 ? "0" + objTime.getSeconds() : objTime.getSeconds();
    var iso8601 = curYear + '-' + curMonth + '-' + curDay + 'T' + curHour + ':' + curMinute + ':' + curSeconds;
    var unixTime = objTime.getTime();
    return {
        updated: unixTime,
        timestamp: iso8601
    };
}
