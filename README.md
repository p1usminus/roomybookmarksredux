# Roomy Bookmarks Toolbar redux #

Roomy Bookmarks Toolbar for Waterfox G3 & Firefox Developer Edition (with [userChromeJS](https://github.com/xiaoxiaoflood/firefox-scripts) or [bootstrapLoader](https://github.com/xiaoxiaoflood/firefox-scripts/tree/master/extensions/bootstrapLoader)) - __[download here!](https://github.com/p1usminus/roomybookmarksredux/releases/latest)__

Originally created by [Someone free](https://web.archive.org/web/20191029180906/https://legacycollector.org/firefox-addons/210846/index.html)

Most of the features work, but it is slightly buggy. Please read the tips.

## Tips ##
* :warning: If using Waterfox and/or bootstrapLoader the browser __must__ be restarted after installation, (and then install the extension again?)
  * (If using userChromeJS the startup cache may need to be cleared between updates.)
* The fixed height option should be used when the multirow option is selected, otherwise the toolbar will try to stay at single row height.
* The toolbar behaves strangely when using the multirow option with a non-standard favicon size. Solution: Use the option to fix incorrect height __with__ a non-zero margin size (see 2nd option tab). I wish this was less complicated.
* Setting the about:config option `browser.preferences.instantApply` to true will make the options apply without having to click the OK button in the dialog box.
* Firefox: Set `browser.toolbars.bookmarks.2h2020` to false otherwise the extension will misbehave.
* Sometimes the toolbar simply breaks - such as when disabling the multirow option (while using the auto-hide feature).
  * Re-enabling the bookmarks toolbar from the customise menu (or restarting the browser) should fix this.
  
- - - -

## Not working
* Colour menu
  * I don't think this method works at all any more so I have commented out virtually everything related to it.
  * There is an alternative of sorts, see [issue #3](https://github.com/p1usminus/roomybookmarksredux/issues/3)
* Hide default icons - I can make them invisible but that's about it...
* 'Hide bookmark names with no favicon'
* Scrolling within the multirow toolbar

## Other notes ##
* :question: ~~I would like to know if users prefer having the scrollbar visible when using the multirow option, or would rather have it hidden.~~ The scrolling within the toolbar is currently not working.
  * The single row multirow toolbar is neat.
* I repurposed one of the prefs to change the top & bottom margin of bookmark items. Adding new prefs looks like it could be annoying, but there may be a couple of other ones that could be re-used.
* Please highlight any issues you find, but I honestly don't know if I will be able to fix them! I uploaded everything here in the hopes that even if I cannot do anything more, perhaps someone else can...
	* CSS fixes are always welcome.
* Linux/OS X fix - Seems to affect some height settings. Enlarged favicons are squashed when this fix is not selected.

<details>
  <summary>P.S.</summary>
  <p>Thank you to Someone free, xiaoxiaoflood, 117649, Alex and the Thunderbird team! :clap:</p>
  <p>I only really use the autohide feature of Roomy, but after getting that to work again I thought it would be fun to get the rest of the features of this extension working again. It was, mostly.</p>
</details>
