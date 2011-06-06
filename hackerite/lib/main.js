const tabs = require("tabs");
const notificationBox = require("notification-box");

tabs.on("ready", function onReady(tab) {
  var nb = notificationBox.NotificationBox(tab.url, "id", "label");
});

