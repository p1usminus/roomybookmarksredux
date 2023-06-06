﻿var roomybookmarkstoolbarOptions = {
	branch: null,
	showName: function() {
		if (document.getElementById('hideBookmarksNamePerf').checked) {
			document.getElementById('hideBookmarksIconsPerf').disabled = true;
		} else {
			document.getElementById('hideBookmarksIconsPerf').disabled = false;
		};
		if (document.getElementById('hideNoFaviconNamesPerf').checked ) {
			document.getElementById('hideDefaultIconsPerf').disabled = true;
		} else {
			document.getElementById('hideDefaultIconsPerf').disabled = false;
		};
		if (document.getElementById('hideFoldersNamesPerf').checked) {
			document.getElementById('hideFolderIconsPerf').disabled = true;
		} else {
			document.getElementById('hideFolderIconsPerf').disabled = false;
		};
	},

	location: function() {
		//If multirow is On, location don't work so:
		if (document.getElementById('multirowBarPerf').checked) {
			document.getElementById('locationPerf').disabled = true;
			this.branch.setIntPref('location', 0);	
		} else {
			document.getElementById('locationPerf').disabled = false;
		}
		document.getElementById('rowsPerf').disabled = !document.getElementById('multirowBarPerf').checked;
		document.getElementById('fixedHeightPerf').disabled = document.getElementById('rowsPerf').disabled;
		document.getElementById('heightFixPerf').disabled = !document.getElementById('multirowBarPerf').checked;
		//Reset fixed height (& incorrect height fix) boxes
		//if (document.getElementById('fixedHeightPerf').disabled) { document.getElementById('fixedHeightPerf').checked = false; }
		//if (document.getElementById('heightFixPerf').disabled) { document.getElementById('heightFixPerf').checked = false; }
	},

	autoHideBar: function() {
		if (document.getElementById('autoHideBarPerf').checked || document.getElementById('BBonNewTabPerf').checked) {
			document.getElementById('hideByDefaultPerf').checked = false;
			document.getElementById('hideByDefaultPerf').disabled = true;
			this.branch.setBoolPref('hideByDefault', false)
		} else {
			document.getElementById('hideByDefaultPerf').disabled = false;
		}
		
		if (document.getElementById('autoHideBarPerf').checked || document.getElementById('hideByDefaultPerf').checked) {
			document.getElementById('BBonNewTabPerf').checked = false;
			document.getElementById('BBonNewTabPerf').disabled = true;
			this.branch.setBoolPref('BBonNewTab', false)
		} else {
			document.getElementById('BBonNewTabPerf').disabled = false;
		}
		
		if (document.getElementById('hideByDefaultPerf').checked || document.getElementById('BBonNewTabPerf').checked) {
			document.getElementById('autoHideBarPerf').checked = false;
			document.getElementById('autoHideBarPerf').disabled = true;
			this.branch.setBoolPref('autoHideBar', false)
		} else {
			document.getElementById('autoHideBarPerf').disabled = false;
		}

		//If auto hide is Off, autoHideBarTime don't work so:
		document.getElementById('autoHideBarTimePerf').disabled = !document.getElementById('autoHideBarPerf').checked;
		document.getElementById('opacityTimePerf').disabled = !document.getElementById('opacityPerf').checked;
		document.getElementById('opacityTimeLongPerf').disabled = !document.getElementById('opacityPerf').checked;
		document.getElementById('autoHideZoneAllPerf').disabled = !document.getElementById('autoHideBarPerf').checked;
	},

	topOnPage: function() {
		document.getElementById('overPagePerf').disabled = document.getElementById('bookmarksAboveTabPerf').checked;
		document.getElementById('bookmarksAboveTabPerf').disabled = document.getElementById('overPagePerf').checked;
		if (document.getElementById('multirowBarPerf').checked) {
			document.getElementById('locationPerf').disabled = true;
			this.branch.setIntPref('location', 0);
		} else {
			document.getElementById('locationPerf').disabled = false;
		}
	},

	userWidth: function() {
		document.getElementById('userWidthPerf').disabled = !document.getElementById('userWidthEnabledPerf').checked;
	},

	autoHideZone: function() {
		document.getElementById('autoHideZoneTabPerf').disabled = document.getElementById('autoHideZoneAllPerf').disabled;
		document.getElementById('autoHideZoneNavPerf').disabled = document.getElementById('autoHideZoneAllPerf').disabled;
		document.getElementById('autoHideZoneMenuPerf').disabled = document.getElementById('autoHideZoneAllPerf').disabled;
		document.getElementById('autoHideZoneButtonPerf').disabled = document.getElementById('autoHideZoneAllPerf').disabled;
		document.getElementById('autoHideZoneBackButtonPerf').disabled = document.getElementById('autoHideZoneAllPerf').disabled;
		document.getElementById('autoHideZoneMenuButtonPerf').disabled = document.getElementById('autoHideZoneAllPerf').disabled;
		if(document.getElementById('autoHideZoneAllPerf').checked) {
			document.getElementById('autoHideZoneTabPerf').disabled = document.getElementById('autoHideZoneAllPerf').checked;
			document.getElementById('autoHideZoneNavPerf').disabled = document.getElementById('autoHideZoneAllPerf').checked;
			document.getElementById('autoHideZoneMenuPerf').disabled = document.getElementById('autoHideZoneAllPerf').checked;
			document.getElementById('autoHideZoneButtonPerf').disabled = document.getElementById('autoHideZoneAllPerf').checked;
			document.getElementById('autoHideZoneBackButtonPerf').disabled = document.getElementById('autoHideZoneAllPerf').checked;
			document.getElementById('autoHideZoneMenuButtonPerf').disabled = document.getElementById('autoHideZoneAllPerf').checked;
		}
	},

	resizeOptions: function() {
		//let options = document.getElementById("roomybookmarkstoolbarPreferences");
		//let pl = parseInt(getComputedStyle(options).getPropertyValue("-moz-padding-start"), 10);
		//let pr = parseInt(getComputedStyle(options).getPropertyValue("-moz-padding-end"), 10);
		window.requestAnimationFrame(() => {
			//window.resizeTo(document.getElementsByTagName("tabpanel")[0].scrollWidth+pl+pr, window.outerHeight); // Not working for me on W10
			window.sizeToContent();
		  });
	},

	onLoad: function() {
		this.branch = Services.prefs.getBranch("extensions.roomybookmarkstoolbar.");
		this.showName();
		this.location();
		this.autoHideBar();
		this.topOnPage();
		this.userWidth();
		this.autoHideZone();
		this.location();
		this.resizeOptions();
		Preferences.forceEnableInstantApply();
	},
};