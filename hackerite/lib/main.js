const widgets = require("widget");
const tabs = require("tabs");
const notificationBox = require("notification-box");

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    tabs.open("http://www.mozilla.org/");
  }
});

console.log("The add-on is running.");

var nb = notificationBox.NotificationBox("message", "id", "label");
