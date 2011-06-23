const tabs = require("tabs");
const data = require("self").data;
const request = require("request");
const notificationBox = require("notification-box");

var blacklist = ['http://news.ycombinator.com', 'http://reddit.com'];


tabs.on("ready", function onReady(tab) {
  if (blacklist.indexOf(tab.url) != -1)
    return;

  search(tab.url, function (result) {
    console.log(result.results.length);

    if (result.results.length == 0)
      return;

    var post = result.results[0].item;
    for (var i in post) { console.log(i); }

    var message = post.points
        + ' | ' + post.title 
        + ' | [' + post.username + ']'
        + ' | ' + post.create_ts;

    var buttons = [{
      label: post.num_comments + ' comments',
      callback: function () { goto_tab(tab, post.id); },
    }];

    var nb = notificationBox.NotificationBox(
      tab.url,
      message,
      "id",
      data.url('images/ycombinator.ico'),
      buttons);
  });
});

//tabs.open('http://www.troyhunt.com/2011/06/brief-sony-password-analysis.html');
tabs.open('http://matt-welsh.blogspot.com/2011/05/what-im-working-on-at-google-making.html');

function goto_tab(tab, id) {
  tab.url = 'http://news.ycombinator.com/item?id=' + id;
}

function search(url, callback) {
  url = encodeURIComponent(url);
  console.log(url);
  req('http://api.thriftdb.com/api.hnsearch.com/items/_search?q=' + url + '&filter[fields][url]=' + url + '&sortby=create_ts desc&limit=1&filter[fields][type]=submission', callback)
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

