var API_URL = "http://api.github.com/repos/";
var githubUser = "tabycat";
var githubPass = "tabycat0";
var githubRepo = "bookmarks";
var Request = require("sdk/request").Request;
var base64 = require("sdk/base64");

exports.getBookmarks = getBookmarks;
exports.setBookmarks = setBookmarks;

/*
Callback to decide what you want with the data.
The callback will actually be called many times for each bookmark.
*/
function getBookmarks(callback) {
    Request({
        url: API_URL + githubUser + "/" + githubRepo + "/contents",
        onComplete: function(response) {
            var responseData = JSON.parse(response["text"]);
            for (var i in responseData) {
                Request({
                    url: responseData[i].git_url,
                    onComplete: function(response2) {
                        var innerData = JSON.parse(response2["text"]);
                        callback(innerData);
                    }
                }).get();
            }
        }
    }).get();
}

/*
Data will be an array of bookmarks file names, if it is in a folder from
root directory then it is more correctly the path of the bookmark. For ways to format this
See https://developer.github.com/v3/repos/contents/#update-a-file.
The only change is the bookmarks is an array of objects of path and data.
*/
function setBookmarks(bookmarks, callback) {
    var authMessage = base64.encode(githubUser+':'+githubPass);
    for (var i in bookmarks) {
        var bookmark = bookmarks[i];
        if (callback) {
            Request({
                url: API_URL + githubUser + "/" + githubRepo + "/contents/" + bookmark.path,
                onComplete: function(response) {
                    callback(JSON.parse(response["text"]));
                },
                headers: {'Authorization': 'Basic ' + authMessage},
                content: JSON.stringify(bookmark.data)
            }).put();
        } else { // Same request but with no onComplete.
            Request({
                url: API_URL + githubUser + "/" + githubRepo + "/contents/" + bookmark.path,
                headers: {'Authorization': 'Basic ' + authMessage},
                content: JSON.stringify(bookmark.data)
            }).put();
        }
    }
}
