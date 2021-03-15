# Roomy Bookmarks Toolbar redux #
Now color setting is working.

Now no favicon hide are working.

Roomy Bookmarks Toolbar for Waterfox G3 & Firefox Developer Edition (with [userChromeJS](https://github.com/xiaoxiaoflood/firefox-scripts) or [bootstrapLoader](https://github.com/xiaoxiaoflood/firefox-scripts/tree/master/extensions/bootstrapLoader)) - __[download here!](https://github.com/p1usminus/roomybookmarksredux/releases/latest)__

Originally created by [Someone free](https://web.archive.org/web/20191029180906/https://legacycollector.org/firefox-addons/210846/index.html)

Most of the features work, but it is slightly buggy. Please read the tips.

## Tips ##
* :warning: If using Waterfox and/or bootstrapLoader the browser __must__ be restarted after installation, (and then install the extension again?)
  * (If using userChromeJS the startup cache may need to be cleared between updates.)
* The fixed height option should be used when the multirow option is selected, otherwise the toolbar will try to stay at single row height.
* The toolbar behaves strangely when using the multirow option with a non-standard favicon size. Solution: Use the option to fix incorrect height __with__ a non-zero margin size (see 2nd option tab). I wish this was less complicated.
* Firefox: Set `browser.toolbars.bookmarks.2h2020` to false otherwise the extension will misbehave.
* Sometimes the toolbar simply breaks - such as when disabling the multirow option (while using the auto-hide feature).
  * Re-enabling the bookmarks toolbar from the customise menu (or restarting the browser) should fix this.
  
- - - -

## Not working


## Other notes ##
* :question: I would like to know if users prefer having the option to scroll when using the multirow option. It can be avoided using a combination of the multirow and margin options as above.
  * The single row multirow toolbar is neat.
* I repurposed one of the prefs to change the top & bottom margin of bookmark items. Adding new prefs looks like it could be annoying, but there may be a couple of other ones that could be re-used.
* Please highlight any issues you find, but I honestly don't know if I will be able to fix them! I uploaded everything here in the hopes that even if I cannot do anything more, perhaps someone else can...
	* CSS fixes are always welcome.

<details>
  <summary>P.S.</summary>
  <p>Thank you to Someone free, xiaoxiaoflood, 117649, Alex and the Thunderbird team! :clap:</p>
  <p>I only really use the autohide feature of Roomy, but after getting that to work again I thought it would be fun to get the rest of the features of this extension working again. It was, mostly.</p>
</details>
