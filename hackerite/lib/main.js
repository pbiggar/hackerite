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
          callback: function () { goto_tab(tab, post.id); },
        }];

        var nb = notificationBox.NotificationBox(
          tab,
          message,
          "id",
          data.url('images/ycombinator.ico'),
          buttons);
      });
    }
  });
});

tabs.open('http://www.troyhunt.com/2011/06/brief-sony-password-analysis.html');
tabs.open('http://matt-welsh.blogspot.com/2011/05/what-im-working-on-at-google-making.html');

function goto_tab(tab, id) {
  tab.url = 'http://news.ycombinator.com/item?id=' + id;
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
