ss = require('simple-storage')

ss.storage.blacklist = {} if not ss.storage.blacklist

exports.mark = (url) ->
  ss.storage.blacklist[url] = 1

exports.is_blacklisted = (url) ->
  ss.storage.blacklist[url]
