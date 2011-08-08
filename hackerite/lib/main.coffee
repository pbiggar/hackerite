tabs = require("tabs")
data = require("self").data
request = require("request")
notificationBox = require("notification-box")

# Stories that point to front-pages of large sites are largely useless.
blacklist = []; # make it easy to test using reddit
#blacklist = ['http://news.ycombinator.com/', 'http://www.reddit.com/', 'http://reddit.com/']


tabs.on "ready", onReady = (tab) ->

  # Skip blacklisted sites.
  return unless blacklist.indexOf(tab.url) == -1

  search tab.url, (result) ->
    console.log result.results.length

    return if result.results.length == 0

    # The query is ordered, so the 0th story is the latest.
    post = result.results[0].item

    date = pretty_date(post.create_ts)
    message = "#{post.points} | #{post.title} | #{post.username} | #{date}"

    buttons = [
      label: "#{post.num_comments} comments"
      style: "min-width: 0px;"
      callback: ->
        goto_story tab, post.id
    ,
      label: "\u21E7" # up
      style: "min-width: 0px;"
      callback: ->
        vote post.id, "up"
#    ,
#     # FIXME: Do stories even have a downvote?
#     label: "\u21E9", # down
#     style: 'min-width: 0px;'
#     callback: ->
#       vote post.id, "down"
#   ,
#     # FIXME: how does the fnid work?
#     label: "\u2690", # flag
#     style: 'min-width: 0px;'
#   ,
#     # FIXME: not implemented yet.
#     label: "\u20E0", # ignore
#     style: 'min-width: 0px;'
    ]

    # Bring up the notifiation window
    notification = new notificationBox.NotificationBox(tab.url,
      message,
      "hackerite",
      data.url("images/ycombinator.ico"), buttons)


goto_story = (tab, id) ->
  tab.url = "http://news.ycombinator.com/item?id=" + id


vote = (id, dir) ->
  if dir != "up" and dir != "down"
    throw "Invalid direction: " + dir

  # On HN itself, there are 'auth' and 'by' fields, but when I manually
  # omitted them, they didn't appear to matter.

  endpoint = "http://news.ycombinator.com/vote?" +
    "&for=#{id}" +
    "&dir=#{dir}" +
    "&whence=hackerite"

  req endpoint


search = (url, callback) ->
  endpoint = "http://api.thriftdb.com/api.hnsearch.com/items/_search?" +
    "&filter[fields][url]=" + encodeURIComponent(url) +
    "&sortby=create_ts desc" +
    "&limit=1" +
    "&filter[fields][type]=submission"

  console.log endpoint + "&pretty_print=true"
  req endpoint, callback


req = (url, callback) ->
  request.Request(
    url: url
    onComplete: (response) ->
     if response.status == 200
        callback response.json if callback
      else
        console.log "Error (#{response.status}) in response: #{response.text}"
  ).get()


# Stolen and tweaked from http://ejohn.org/files/pretty.js
pretty_date = (time) ->
  date = new Date(time)
  diff = ((new Date()).getTime() - date.getTime()) / 1000
  days = Math.floor(diff / 86400)

  return date or time if isNaN(days)

  if days == 0
    return "just now" if diff < 60

    return "1 minute ago" if diff < 120
    minutes = Math.floor(diff / 60)
    return  "#{minutes} minutes ago" if diff < 3600

    return "1 hour ago" if diff < 7200
    hours = Math.floor(diff / 3600)
    return "#{hours} hours ago" if diff < 172800

  return "Yesterday" if days == 1
  return "#{days} days ago"


