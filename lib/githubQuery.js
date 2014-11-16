var githubUser = "tabycat",
    githubPass = "tabycat0",
    githubRepo = "bookmarks",
    BASE_URL = "http://api.github.com/repos/" + githubUser + "/" + githubRepo + "/contents",
    Request = require("sdk/request").Request,
    base64 = require("sdk/base64"),
    authMessage = base64.encode(githubUser + ':' + githubPass),
    timers = require("sdk/timers");

// Only export the minimum necessary functions.
exports.pullBookmarks = getBookmarks;
exports.pushBookmarks = buildGitHubPayload;
exports.setGithubInfo = setGithubInfo;

// Set user's github information for authentication
function setGithubInfo(username, password, repo){
    githubUser = username;
    githubPass = password;
    githubRepo = repo;
    BASE_URL = "http://api.github.com/repos/" + githubUser + "/" + githubRepo + "/contents";
}

/*
Callback to decide what you want with the data.
The callback will actually be called many times for each bookmark.
*/
function getBookmarks(callback, filename) {
    Request({
        url: BASE_URL + "/" + (filename ? filename:"exampleBookmarks.json"),
        onComplete: function(response) {
            var responseData = JSON.parse(response["text"]);
            var data = responseData.content.replace(/(\r\n|\n|\r)/gm,"");
            var contentBase64 = base64.decode(data);
            callback(JSON.parse(contentBase64));
        }
    }).get();
}

/*
Data will be an array of bookmarks file names, if it is in a folder from
root directory then it is more correctly the path of the bookmark. For ways to format this
See https://developer.github.com/v3/repos/contents/#update-a-file.
The only change is the bookmarks is an array of objects of path and data.
Handles both create and update.
*/
function setBookmarks(bookmarks, callback) {
    for (var i in bookmarks) {
        var bookmark = bookmarks[i];
        console.log(bookmark.path);
        if (callback) {
            Request({
                url: BASE_URL + "/" + bookmark.path,
                onComplete: function(response) {
                    var responseObj = JSON.parse(response["text"]);
                    if (responseObj.message && responseObj.message.split(" ")[0] === "Invalid") {
                        updateBookmark(bookmark, callback);
                    } else {
                        console.log("create finished");
                        if (callback) {

                            callback(responseObj);
                        }
                    }
                },
                headers: {
                    'Authorization': 'Basic ' + authMessage
                },
                content: JSON.stringify(bookmark.data, null, 4)
            }).put();
        }
    }
}

//helper function to update one booking
function updateBookmark(bookmark, callback) {
    timers.setTimeout(function() {
        if (bookmark.data.sha) { //this means there was some kind of error
            timers.setTimeout(function(){
                makeUpdateRequest(bookmark, callback);
            }, 1000);
        } else {
            getBookmark(BASE_URL + "/" + bookmark.path, function(data) {
                bookmark.data.sha = data.sha;
                bookmark.data.ref = "refs/heads/master";
                makeUpdateRequest(bookmark, callback);
            });
        }
    }, 100);
}

function makeUpdateRequest(bookmark, callback) {
    Request({
        url: BASE_URL + "/" + bookmark.path,
        onComplete: function(innerData) {
            var innerDataObj = JSON.parse(innerData["text"]);
            if(innerDataObj.message && innerDataObj.message.split(" ")[0] === "refs/heads/master") {
                updateBookmark(bookmark, callback);
            } else {
                console.log(bookmark.path + " update finished");
                if (callback) {
                    callback(innerDataObj);
                }
            }
        },
        headers: {
            'Authorization': 'Basic ' + authMessage
        },
        content: JSON.stringify(bookmark.data)
    }).put();
}

//helper function to get one bookmark from some path
function getBookmark(path, callback) {
    Request({
        url: path,
        onComplete: function(response2) {
            var innerData = JSON.parse(response2["text"]);
            callback(innerData);
        }
    }).get();
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
        header: {
            'Authorization': 'Basic ' + authMessage
        },
        content: JSON.stringify(bookmark.data)
    }).delete();
}

// A simple test to create a new file. (Fails for updates)
function buildGitHubPayload(localBookmarks) {
    var githubPayloadArray = [];
    var bookmarksArray = [];
    for (var i = 0; i < localBookmarks.length; i++) {
        var bookmark = localBookmarks[i];
        var singleBookmarkContent = {
            "title": bookmark.title,
            "url": bookmark.url,
            "group": bookmark.group,
            "tags": bookmark.tags,
            "updated": bookmark.updated
        };
        bookmarksArray.push(singleBookmarkContent);
        var bookmarkPath = bookmark.path ? bookmark.path : "bookmarks.json";
        var bookmarkPayload = {
            path: bookmarkPath,
            data: {
                "message": "Updating bookmarks",
                "committer": {
                    "name": "Taby Cat",
                    "email": "taby@cs.smu.ca"
                },
                "content": base64.encode(JSON.stringify(bookmarksArray, null, 4), "utf-8"),
            }
        };

        githubPayloadArray.push(bookmarkPayload);
    }
    setBookmarks(githubPayloadArray, function(data){ //optional callback
        console.log(data);
    });
}
