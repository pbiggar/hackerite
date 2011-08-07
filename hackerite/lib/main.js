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
        + ' | ' + pretty_date(post.create_ts);

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

function goto_tab(tab, id) {
  tab.url = 'http://news.ycombinator.com/item?id=' + id;
}

function search(url, callback) {
  var endpoint = 
      'http://api.thriftdb.com/api.hnsearch.com/items/_search?'
    + '&filter[fields][url]=' + encodeURIComponent(url)
    + '&sortby=create_ts desc'
    + '&limit=1'
    + '&filter[fields][type]=submission'
    ;
  req(endpoint, callback);
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

// Stolen and tweaked from http://ejohn.org/files/pretty.js
function pretty_date(time) {

  var date = new Date(time);
  var diff = (((new Date()).getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff))
    return date || time;

  if (day_diff == 0) {
      if (diff < 60)
        return "just now";
      if (diff < 120)
        return "1 minute ago";
      if (diff < 3600)
        return Math.floor( diff / 60 ) + " minutes ago";
      if (diff < 7200)
        return "1 hour ago";
      if (diff < 172800)
        return Math.floor( diff / 3600 ) + " hours ago";
  }

  if (day_diff == 1)
    return "Yesterday";

  return day_diff + " days ago";
}
