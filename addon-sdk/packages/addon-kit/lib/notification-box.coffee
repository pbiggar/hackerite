# vim:set ts=2 sw=2 sts=2 ft=coffee et: */
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is Jetpack Packages.
#
# The Initial Developer of the Original Code is Paul Biggar.
# Portions created by the Initial Developer are Copyright (C) 2010
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Paul Biggar <pbiggar@mozilla.com> (Original Author)
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

"use strict"

[Cc, Ci] = require("chrome")

require("xpcom").utils.defineLazyServiceGetter(
  this,
  "windowMediator",
  "@mozilla.org/appshell/window-mediator;1",
  "nsIWindowMediator")

exports.NotificationBox = (url, message, id, image, buttons) ->
  # We don't have a very good way of relating the tab (which was given to use
  # by a jetpack module) back to the real browser tab.  The only information
  # we do have is the tabindex, but we don't even know what browser window it
  # relates to. We could search for tabs with that index, but that's
  # presumably also racy. If we change the window or the tab numbering between
  # sending the callback and opening the notification, we might open the
  # notification on the wrong tab.
  #
  # So this takes the very simple approach of just checking the url of every
  # tab, and opening a notification if it uses the right url. Of course, we
  # should only do that once because the user might have closed it.
 
  enumerator = windowMediator.getEnumerator("navigator:browser")
  while enumerator.hasMoreElements()
    browser_window = enumerator.getNext()
    tab_browser = browser_window.gBrowser
    
    for i in [0..tab_browser.browsers.length]
      tab = tab_browser.getBrowserAtIndex(i)

      if url == tab.currentURI.spec

        # Extract the button's styles
        styles = []
        for j of buttons
          styles[j] = buttons[j].style
          delete (buttons[j].style)

        # Create the notification
        nb = browser_window.gBrowser.getNotificationBox(tab)
        priority = nb.PRIORITY_INFO_MEDIUM
        notification = nb.appendNotification(message, id, image, priority, buttons)

        # Add the styles to the buttons
        for j of styles
          notification.childNodes[j].setAttribute "style", styles[j]

        return notification
