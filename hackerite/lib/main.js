const tabs = require("tabs");
const request = require("request");
const notificationBox = require("notification-box");

tabs.on("ready", function onReady(tab) {
  get_ids(tab.url, function (ids) {
    get_data(ids[0], function (post) {
      var nb = notificationBox.NotificationBox(post.title, "id", "label");
    });
  });
});

function get_ids(url, callback) {
  req('http://api.ihackernews.com/getid?url=' + encodeURI(url), callback);
}

function get_data(id, callback) {
  req('http://api.ihackernews.com/post/' + id, callback);
}

function req(url, callback) {
  request.Request({
    url: url,
    onComplete: function (response) { callback(response.json); },
  }).get();
}
