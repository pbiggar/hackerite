const tabs = require("tabs");
const data = require("self").data;
const request = require("request");
const notificationBox = require("notification-box");

// Stories that point to front-pages of large sites are largely useless.
var blacklist = []; // make it easy to test using reddit
//var blacklist = ['http://news.ycombinator.com/', 'http://www.reddit.com/', 'http://reddit.com/'];


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
    var buttons = [
    {
      label: post.num_comments + ' comments',
      callback: function () { goto_story(tab, post.id); },
    },
    {
      label: "\u21E7", // up
      callback: function () { vote(post.id, "up"); },
    },
  /*
   * FIXME:
   *    flag: I don't understand how it works, so disable.
   *    downvote: I can't test this, and amn't sure there is even a downvote option on stories.
   *    ignore: not implemented yet.
    {

      label: "\u21E9", // down
      callback: function () { vote(post.id, "down"); },
    },
    {
      label: "\u2690", // flag
    },
    {
      label: "\u20E0", // ignore
    },
  */
    ];

    // Bring up the notifiation window
    var notification = new notificationBox.NotificationBox(
      tab.url,
      message,
      "hackerite",
      data.url('images/ycombinator.ico'),
      buttons);

    // Allow the buttons to be as small as their contents
    notification.childNodes[1].setAttribute('style', 'min-width: 0px;');
    notification.childNodes[2].setAttribute('style', 'min-width: 0px;');
    notification.childNodes[3].setAttribute('style', 'min-width: 0px;');
    notification.childNodes[4].setAttribute('style', 'min-width: 0px;');
  });
});

function goto_story(tab, id) {
  tab.url = 'http://news.ycombinator.com/item?id=' + id;
}

function vote(id, dir) {
  if (dir != "up" && dir != "down")
    throw "Invalid direction: " + dir

  // On HN itself, there are 'auth' and 'by' fields, but when I manually
  // omitted them, they didn't appear to matter.

  var endpoint = 'http://news.ycombinator.com/vote?' +
      '&for=' + id +
      '&dir=' + dir +
      '&whence=hackerite';

  req(endpoint);
}

function search(url, callback) {
  var endpoint = 
      'http://api.thriftdb.com/api.hnsearch.com/items/_search?'
    + '&filter[fields][url]=' + encodeURIComponent(url)
    + '&sortby=create_ts desc'
    + '&limit=1'
    + '&filter[fields][type]=submission'
    ;

  console.log(endpoint + '&pretty_print=true');

  req(endpoint, callback);
}

function req(url, callback) {
  request.Request({
    url: url,
    onComplete: function (response) {
      if (response.status == 200) {
        if (callback) {
          callback(response.json);
        }
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
