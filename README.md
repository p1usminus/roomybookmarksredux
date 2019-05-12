# Roomy Bookmarks Toolbar redux #
[Roomy Bookmarks Toolbar](https://legacycollector.org/firefox-addons/210846/index.html "Roomy Bookmarks Toolbar") for Waterfox 68

Most of the features work, but it is slightly buggy. Please read the tips.

## Tips ##
* :warning: The browser __must__ be restarted after installation, then enable the bookmarks toolbar (from the customise menu) then __restart again__!
* The fixed height option should be used when the multirow option is selected, otherwise the toolbar will try to stay at single row height.
* The toolbar behaves strangely when using the multirow option with a non-standard favicon size. Solution: Use the option to fix incorrect height __with__ a non-zero margin size (see 3rd option tab). I wish this was less complicated.
* Sometimes the toolbar simply breaks - such as when disabling the multirow option. Restarting the browser should fix this.
  * In other instances, re-enabling the bookmarks toolbar from the customise menu fixes this.

## Untested features ##
* Locales - do strings in languages other than English work?
* Linux/OS X fix - I don't even know what it's supposed to do

## Not working
* Colour menu
  * I don't think this method works at all any more so I have commented out virtually everything related to it.
  * Perhaps there is a way with CSS to change the appearance of a bookmark item with a specific label?
* Toolbar button
  * This may be related to browser changes because other legacy extensions I have tested (which all use bootstrap.js) cannot produce buttons either.
  * It may be possible to add the button bootstrap style (https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Toolbars/Creating_toolbar_buttons), but I don't know how to!
* Hide default icons

## Other notes ##
* :question: I would like to know if users prefer having the scrollbar visible when using the multirow option, or would rather have it hidden.
 * The single row multirow toolbar is neat.
* I repurposed one of the prefs to change the top & bottom margin of bookmark items. Adding new prefs looks like it could be annoying, but there may be a couple of other ones that could be re-used.
* The browser's hamburger menu (app menu) gets weird after enabling the multirow option. Probably related to the CSS the option uses but I couldn't fix it.
* Please highlight any issues you find, but I honestly don't know if I will be able to fix them! I uploaded everything here in the hopes that even if I cannot do anything more, perhaps someone else can...

<details>
  <summary>P.S.</summary>
  <p>Thank you to Alex and the Thunderbird team! :clap:</p>
  <p>I only really use the autohide feature of Roomy, but after getting that to work again I thought it would be fun to get the rest of the features of this extension working again. It was, mostly.</p>
</details>
