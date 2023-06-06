(function () {
  function pref(name, value) {
    let branch = Services.prefs.getBranch("");
    let defaultBranch = Services.prefs.getDefaultBranch("");
    if (defaultBranch.getPrefType(name) == Services.prefs.PREF_INVALID) {
      // Only use the default branch if it doesn't already have the pref set.
      // If there is already a pref with this value on the default branch, the
      // extension wants to override a built-in value.
      branch = defaultBranch;
    } else if (defaultBranch.prefHasUserValue(name)) {
      // If a pref already has a user-set value it proper type
      // will be returned (not PREF_INVALID). In that case keep the user's
      // value and overwrite the default.
      branch = defaultBranch;
    }

    if (typeof value == "boolean") {
      branch.setBoolPref(name, value);
    } else if (typeof value == "number" && Number.isInteger(value)) {
      branch.setIntPref(name, value);
    }
  }

	pref("extensions.roomybookmarkstoolbar.mousehover", true);
	pref("extensions.roomybookmarkstoolbar.hideBookmarksName", true);
	pref("extensions.roomybookmarkstoolbar.hideFoldersNames", true);
	pref("extensions.roomybookmarkstoolbar.hideNoFaviconNames", true);
	pref("extensions.roomybookmarkstoolbar.hideFolderIcons", false);
	pref("extensions.roomybookmarkstoolbar.hideBookmarksIcons", false);
	pref("extensions.roomybookmarkstoolbar.hideDefaultIcons", false);
	pref("extensions.roomybookmarkstoolbar.spacing", 2);
	pref("extensions.roomybookmarkstoolbar.iconSize", 16);
	pref("extensions.roomybookmarkstoolbar.location", 0);
	pref("extensions.roomybookmarkstoolbar.userWidthEnabled", false);
	pref("extensions.roomybookmarkstoolbar.userWidth", 170);
	pref("extensions.roomybookmarkstoolbar.autoHideBar", false);
	pref("extensions.roomybookmarkstoolbar.autoHideBarTime", 5);
	pref("extensions.roomybookmarkstoolbar.autoHideZoneTab", true);
	pref("extensions.roomybookmarkstoolbar.autoHideZoneNav", true);
	pref("extensions.roomybookmarkstoolbar.autoHideZoneMenu", true);
	pref("extensions.roomybookmarkstoolbar.autoHideZoneButton", true);
	pref("extensions.roomybookmarkstoolbar.autoHideZoneBackButton", true);
	pref("extensions.roomybookmarkstoolbar.autoHideZoneMenuButton", true);
	pref("extensions.roomybookmarkstoolbar.autoHideZoneAll", true);
	pref("extensions.roomybookmarkstoolbar.hideByDefault", false);
	pref("extensions.roomybookmarkstoolbar.BBonNewTab", false);
	pref("extensions.roomybookmarkstoolbar.opacity", false);
	pref("extensions.roomybookmarkstoolbar.opacityTime", 5);
	pref("extensions.roomybookmarkstoolbar.opacityTimeLong", 2);
	pref("extensions.roomybookmarkstoolbar.multirowBar", false);
	pref("extensions.roomybookmarkstoolbar.rows", 2);
	pref("extensions.roomybookmarkstoolbar.fixedHeight", false);
	pref("extensions.roomybookmarkstoolbar.heightFix", false);
	pref("extensions.roomybookmarkstoolbar.bookmarksAboveTab", false);
	pref("extensions.roomybookmarkstoolbar.overPage", false);
	pref("extensions.roomybookmarkstoolbar.folderMargin", 0);
	pref("extensions.roomybookmarkstoolbar.height", 0);
	pref("extensions.roomybookmarkstoolbar.DBcreated", false);
	pref("extensions.roomybookmarkstoolbar.textSize", 100);
	pref("extensions.roomybookmarkstoolbar.hide_warning", true);
	pref("browser.preferences.instantApply", true);
 
})()