var API_URL = "http://api.github.com/repos/";
var githubUser = "tabycat";
var githubPass = "tabycat0";
var githubRepo = "bookmarks";
var Request = require("sdk/request").Request;
var base64 = require("sdk/base64");

exports.getBookmarks = getBookmarks;
exports.setBookmarks = setBookmarks;
/*
callback to decide what you want with the data. the callback will actually
be called many times for each bookmark.
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
data will be an array of bookmarks file names, if it is in a folder from
root directory then it is more correctly the path of the bookmark. for ways to format this
see https://developer.github.com/v3/repos/contents/#update-a-file.
The only change is the bookmarks is an array of objects of path and data. for example
[
    { // where this one creates a new one
        path: "newCoolBookmarName",
        data: {
          "message": "my commit message",
          "committer": {
            "name": "Scott Chacon",
            "email": "schacon@gmail.com"
          },
          "content": "bXkgbmV3IGZpbGUgY29udGVudHM="
        }
    },
    {//where this one updates one
        path: "oldSaggyBookmar",
        data: {
          "message": "my commit message",
          "committer": {
            "name": "Scott Chacon",
            "email": "schacon@gmail.com"
          },
          "content": "bXkgdXBkYXRlZCBmaWxlIGNvbnRlbnRz",
          "sha": "329688480d39049927147c162b9d2deaf885005f"
        }
    }
]
there is an optional callback in this one.
*/
function setBookmarks(bookmarks, callback) {
    if (callback) {
        for (var i in bookmarks) {
            var bookmark = bookmarks[i];

            console.log(bookmark);
            console.log("bookmark.data......");
            console.log(JSON.stringify(bookmark.data));

            var authMessage = base64.encode(githubUser+':'+githubPass);
            Request({
                url: API_URL + githubUser + "/" + githubRepo + "/contents/" + bookmark.path,
                onComplete: function(response) {
                    callback(JSON.parse(response["text"]));
                },
                headers: {'Authorization': 'Basic ' + authMessage}
            }).put(JSON.stringify(bookmark.data));
        }
    } else { // same thing but with no onComplete and I didnt want to check this over and over in loop.
        for (var i in bookmarks) {
            var bookmark = bookmarks[i];
            Request({
                url: API_URL + githubUser + "/" + githubRepo + "/contents/" + bookmark.path
            }).put(bookmark.data);
        }
    }
}
