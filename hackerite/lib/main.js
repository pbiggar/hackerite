const tabs = require("tabs");
const data = require("self").data;
const request = require("request");
const notificationBox = require("notification-box");

var blacklist = ['http://news.ycombinator.com', 'http://reddit.com'];


tabs.on("ready", function onReady(tab) {
  if (tab.url in blacklist)
    return;

  get_ids(tab.url, function (ids) {

    if (ids.length > 0) {
      var latest = max(ids);
      get_data(latest, function (post) {
        var message = post.points
            + ' | ' + post.title 
            + ' | [' + post.postedBy + ']'
            + ' | ' + post.postedAgo;

        var buttons = [{
          label: post.commentCount + ' comments',
          callback: function () { goto_tab(post.id); },
        }];

        var nb = notificationBox.NotificationBox(
          message,
          "id",
          data.url('images/ycombinator.ico'),
          buttons);
      });
    }
  });
});

function goto_tab(id) {
  tabs.activeTab.url = 'http://news.ycombinator.com/item?id=' + id;
}

function get_ids(url, callback) {
  req('http://api.ihackernews.com/getid?url=' + encodeURI(url), callback);
}

function get_data(id, callback) {
  req('http://api.ihackernews.com/post/' + id, callback);
}

function req(url, callback) {
  request.Request({
    url: url,
    onComplete: function (response) {
      if (response.status == 200) {
        callback(response.json);
      }
      else {
        console.log('Error (' + response.status + ') in response: ' + response.text);
      }
    },
  }).get();
}

function max(arr) {
  return Math.max.apply(Math, arr);
}
