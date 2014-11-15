var githubUser = "tabycat",
    githubPass = "tabycat0",
    githubRepo = "bookmarks",
    BASE_URL = "http://api.github.com/repos/" + githubUser + "/" + githubRepo + "/contents",
    Request = require("sdk/request").Request,
    base64 = require("sdk/base64"),
    authMessage = base64.encode(githubUser+':'+githubPass);

exports.getBookmarks = getBookmarks;
exports.setBookmarks = setBookmarks;
exports.deleteBookmark = deleteBookmark;

/*
Callback to decide what you want with the data.
The callback will actually be called many times for each bookmark.
*/
function getBookmarks(callback) {
    Request({
        url: BASE_URL,
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
    for (var i in bookmarks) {
        var bookmark = bookmarks[i];
        if (callback) {
            Request({
                url: BASE_URL +"/" + bookmark.path,
                onComplete: function(response) {
                    callback(JSON.parse(response["text"]));
                },
                headers: {'Authorization': 'Basic ' + authMessage},
                content: JSON.stringify(bookmark.data)
            }).put();
        } else { // Same request but with no onComplete.
            Request({
                url: BASE_URL +"/" + bookmark.path,
                headers: {'Authorization': 'Basic ' + authMessage},
                content: JSON.stringify(bookmark.data)
            }).put();
        }
    }
}

/*
bookmark is formatted the same way as setBookmerks but the only difference is not
as an array; just one object of path and data.
*/
function deleteBookmark(bookmark, callback) {
    Request({
        url: BASE_URL + "/" + bookmark.path,
        onComplete: function(response) {
            callback(JSON.parse(response));
        },
        header: {'Authorization': 'Basic ' + authMessage},
        content: JSON.stringify(bookmark.data)
    }).delete();
}
