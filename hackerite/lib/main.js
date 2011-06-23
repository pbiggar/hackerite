const tabs = require("tabs");
const data = require("self").data;
const request = require("request");
const notificationBox = require("notification-box");

// Stories that point to front-pages of large sites are largely useless.
var blacklist = ['http://news.ycombinator.com/', 'http://www.reddit.com/', 'http://reddit.com/'];


tabs.on("ready", function onReady(tab) {

  // Skip blacklisted sites.
  if (blacklist.indexOf(tab.url) != -1)
    return;

  search(tab.url, function (result) {
    console.log(result.results.length);

    if (result.results.length == 0)
      return;

    // The query is ordered, so the 0th story is the latest.
    var post = result.results[0].item;

    var message = post.points
        + ' | ' + post.title 
        + ' | ' + post.username
        + ' | ' + post.create_ts;

    // "#n comments" button
    var buttons = [{
      label: post.num_comments + ' comments',
      callback: function () { goto_tab(tab, post.id); },
    }];

    // Bring up the notifiation window
    var nb = notificationBox.NotificationBox(
      tab.url,
      message,
      "id",
      data.url('images/ycombinator.ico'),
      buttons);
  });
});

tabs.open('http://matt-welsh.blogspot.com/2011/05/what-im-working-on-at-google-making.html');

function goto_tab(tab, id) {
  tab.url = 'http://news.ycombinator.com/item?id=' + id;
}

function search(url, callback) {
  req('http://api.thriftdb.com/api.hnsearch.com/items/_search'
    + '?q=' + get_domain(url) 
    + '&filter[fields][url]=' + encodeURIComponent(url)
    + '&sortby=create_ts desc'
    + '&limit=1'
    + '&filter[fields][type]=submission'
    , callback)
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

function get_domain(url) {
     return url.match(/:\/\/(.[^/]+)/)[1];
}
