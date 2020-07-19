var roomybookmarkstoolbar = {
	branch: null,				//Perf system
	cssStr: null,				//CSS string for user style
	colorCSS: null,				//CSS string for bookmarks color
	visible: null,				//Autohide visible
	hovered: null,				//Autohide if mous on browser panel- not hide
	popup: null,				//Autohide if popup open- not hide bookmrks bar
	autohide: null,				//Autohide enabled\disabled
	hideBarTime: null,			//Auto-hide time
	timeOutHide: null,			//Timer for autohide
	PersonalToolbar: null,			//PersonalToolbar CSS id?

	register: function() {
		var thisPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService)
		this.branch = thisPrefs.getBranch('extensions.roomybookmarkstoolbar.');
		if (!("addObserver" in this.branch)) {
			this.branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
		}
		this.branch.addObserver("", this, false);
	},

	unregister: function() {
		this.branch.removeObserver("", this);
		window.removeEventListener("beforecustomization", function() {roomybookmarkstoolbar.styleService('file','multirowBar', true);}, false);
		window.removeEventListener("aftercustomization", function() {roomybookmarkstoolbar.styleService('file','multirowBar');}, false);

	},

	observe: function(subject, topic, data) {
		if (topic == "nsPref:changed") {
			roomybookmarkstoolbar.optionsHandler();
        } else {
			return;
		}
	},

	styleService: function(type, object, unregister) {
		var styleSheet = Components.classes['@mozilla.org/content/style-sheet-service;1'].getService(Components.interfaces.nsIStyleSheetService);
		var styleIO = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
		var styleURI;
		if (type == 'file') {
			styleURI = styleIO.newURI('chrome://roomybookmarkstoolbar/skin/css/'+object+'.css', null, null);
		}
		if (type == 'string') {
			styleURI = styleIO.newURI("data:text/css,"+encodeURIComponent(object), null, null);
		}
		if (unregister === true) {
			if (styleSheet.sheetRegistered(styleURI, styleSheet.USER_SHEET)) {styleSheet.unregisterSheet(styleURI, styleSheet.USER_SHEET);}
		} else {
			if (!styleSheet.sheetRegistered(styleURI, styleSheet.USER_SHEET)) {styleSheet.loadAndRegisterSheet(styleURI, styleSheet.USER_SHEET);}
		}
	},

	setVisibly: function() {
		roomybookmarkstoolbar.PersonalToolbar.collapsed = !roomybookmarkstoolbar.visible;
	},

	hideHandler: function() {
		// var popup = roomybookmarkstoolbar.popup;
		var visible = roomybookmarkstoolbar.visible;
		var hovered = roomybookmarkstoolbar.hovered;

		if (this.timeOutHide) {
			clearTimeout(this.timeOutHide);
		}
		this.timeOutHide = null;

		if (/* !popup &&  */!roomybookmarkstoolbar.PersonalToolbar.collapsed && !hovered /* && !roomybookmarkstoolbar.toolboxOver */) {
			roomybookmarkstoolbar.visible = false;
			this.timeOutHide = setTimeout(roomybookmarkstoolbar.setVisibly, roomybookmarkstoolbar.hideBarTime);
		} else {
			// if (roomybookmarkstoolbar.toolboxOver ) {
				if(!visible && hovered) {
					roomybookmarkstoolbar.visible = true;
					roomybookmarkstoolbar.setVisibly();
				}
			// } else {	//Hide bookmarks bar after fast mouse out (event not caught)
			// 	this.timeOutHide = setTimeout(roomybookmarkstoolbar.setVisibly, 700);
			// }
		}
	},

	onMouseOver: function(e) {
		roomybookmarkstoolbar.lastY = null;
		var toolbox = document.getElementById("navigator-toolbox");

		if (roomybookmarkstoolbar.autohide) {
			if (this.timeOutHide) {
				clearTimeout(this.timeOutHide);
			}
			this.timeOutHide = null;

			roomybookmarkstoolbar.hovered = true;
			roomybookmarkstoolbar.hideHandler();

			// roomybookmarkstoolbar.eventListenerhandler(false, true);
		}

		try { toolbox.removeEventListener("mousemove", roomybookmarkstoolbar.onMouseMove, false);} catch(e) {}
	},

	onMouseOutput: function(e) {
		if (roomybookmarkstoolbar.autohide) {
			// var toolbox = document.getElementById("navigator-toolbox");
			// if(e.relatedTarget) {
			// 	var target = e.relatedTarget;
			// 	while(target) {					//Get all parents of target element
			// 		if(target == toolbox) {		//Check parent == toolbox, if true - mouse out not happaned
			// 			return;
			// 		}
			// 		if (target.class == 'anonymous-div') {
			// 			return;
			// 		}
			// 		target = target.parentNode;	//Get next parent
			// 	}
			// }
			roomybookmarkstoolbar.hovered = false;

			var toolbox = document.getElementById("navigator-toolbox");
			
			toolbox.addEventListener("mousemove",roomybookmarkstoolbar.onMouseMove, false);
		

			// roomybookmarkstoolbar.toolboxOver = false;

			if(e.target == toolbox){
				this.timeOutHide = setTimeout(roomybookmarkstoolbar.hideHandler, 700);
			}
			// roomybookmarkstoolbar.eventListenerhandler(true, true);

		}
	},

	onMouseMove: function(e) {
		var toolbox = document.getElementById("navigator-toolbox");

		if(roomybookmarkstoolbar.PersonalToolbar.collapsed || !roomybookmarkstoolbar.autohide) {
			try { toolbox.removeEventListener("mousemove", roomybookmarkstoolbar.onMouseMove, false);} catch(e) {}
			roomybookmarkstoolbar.lastY = null;
			return;
		}

		if (this.timeOutHide) {
			clearTimeout(this.timeOutHide);
		}
		this.timeOutHide = null;

		var rect = PersonalToolbar.getBoundingClientRect();
		var y = Math.abs(e.clientY - rect.top);
		if(roomybookmarkstoolbar.lastY){
			if(y > roomybookmarkstoolbar.lastY){
				roomybookmarkstoolbar.lastY = null;
				roomybookmarkstoolbar.hideHandler();
				try { toolbox.removeEventListener("mousemove", roomybookmarkstoolbar.onMouseMove, false);} catch(e) {}
			}
		}
		roomybookmarkstoolbar.lastY = y;
	},

	// onPopupshown: function(e){
	// 	roomybookmarkstoolbar.popup = true;
	// 	roomybookmarkstoolbar.hideHandler();
	// },

	// onPopuphidden: function(e){
	// 	roomybookmarkstoolbar.popup = false;
	// 	roomybookmarkstoolbar.hideHandler();
	// },

	onMouseOverFix: function(e) {		//Fix problem with wrong hide, when enabled menu\nav bar\tabs
		if (this.timeOutHide) {
			clearTimeout(this.timeOutHide);
		}
		this.timeOutHide = null;
		roomybookmarkstoolbar.toolboxOver = true;
		roomybookmarkstoolbar.hideHandler(false, true);
	},

	eventListenerhandler: function(register, type) {
		var autoHideZoneAll = this.branch.getBoolPref('autoHideZoneAll');
		var autoHideZoneTab = this.branch.getBoolPref('autoHideZoneTab');
		var autoHideZoneNav = this.branch.getBoolPref('autoHideZoneNav');
		var autoHideZoneMenu = this.branch.getBoolPref('autoHideZoneMenu');
		var autoHideZoneButton = this.branch.getBoolPref('autoHideZoneButton');
		var autoHideZoneBackButton = this.branch.getBoolPref('autoHideZoneBackButton');
		var autoHideZoneMenuButton = this.branch.getBoolPref('autoHideZoneMenuButton');
		var toolbox = document.getElementById("navigator-toolbox");
		var toolbarmenubar = document.getElementById("toolbar-menubar");
		var TabsToolbar = document.getElementById("TabsToolbar");
		var navBar = document.getElementById("nav-bar");
		var rbtlibbutton = document.getElementById("rbtlibbutton");
		var backButton = document.getElementById("back-button");
		var menuButton = document.getElementById("PanelUI-menu-button");
		
		if (register) {
			PersonalToolbar.addEventListener("mouseenter", this.onMouseOver, false);
			PersonalToolbar.addEventListener("mouseleave", this.onMouseOutput, false);
			if (type) {
				if(autoHideZoneAll) {
					toolbox.addEventListener("mouseenter", this.onMouseOver, false);
					// toolbox.addEventListener("mouseenter", this.onMouseOverFix, false);
				} else {
					if(autoHideZoneNav) {try { navBar.addEventListener("mouseenter", this.onMouseOver, false);} catch(e) {}}
					if(autoHideZoneMenu) {try { toolbarmenubar.addEventListener("mouseenter", this.onMouseOver, false);} catch(e) {}}
					if(autoHideZoneTab) {try { TabsToolbar.addEventListener("mouseenter", this.onMouseOver, false);} catch(e) {}}
					if(autoHideZoneButton) {try { rbtlibbutton.addEventListener("mouseenter", this.onMouseOver, false);} catch(e) {}}
					if(autoHideZoneBackButton) {try { backButton.addEventListener("mouseenter", this.onMouseOver, false);} catch(e) {}}
					if(autoHideZoneMenuButton) {try { menuButton.addEventListener("mouseenter", this.onMouseOver, false);} catch(e) {}}
					// try { toolbox.addEventListener("mouseenter", this.onMouseOverFix, false);} catch(e) {}
				}
		
				// toolbox.addEventListener("popupshown", this.onPopupshown, false);
				// toolbox.addEventListener("popuphidden", this.onPopuphidden, false);
			} else {
				// if(autoHideZoneAll) {
					try { toolbox.addEventListener("mouseleave", this.onMouseOutput, false);} catch(e) {}
				// } else {
					if(autoHideZoneNav) {try { navBar.addEventListener("mouseleave", this.onMouseOutput, false);} catch(e) {}}
					if(autoHideZoneMenu) {try { toolbarmenubar.addEventListener("mouseleave", this.onMouseOutput, false);} catch(e) {}}
					if(autoHideZoneTab) {try { TabsToolbar.addEventListener("mouseleave", this.onMouseOutput, false);} catch(e) {}}
					if(autoHideZoneButton) {try { rbtlibbutton.addEventListener("mouseleave", this.onMouseOutput, false);} catch(e) {}}
					if(autoHideZoneBackButton) {try { backButton.addEventListener("mouseleave", this.onMouseOutput, false);} catch(e) {}}
					if(autoHideZoneMenuButton) {try { menuButton.addEventListener("mouseleave", this.onMouseOutput, false);} catch(e) {}}
				// }
		
			}
		} else {
			PersonalToolbar.removeEventListener("mouseenter", this.onMouseOver, false);
			PersonalToolbar.removeEventListener("mouseleave", this.onMouseOutput, false);
			if (type) {
				try { navBar.removeEventListener("mouseenter", roomybookmarkstoolbar.onMouseOver, false); } catch(e) {}
				try { toolbarmenubar.removeEventListener("mouseenter", roomybookmarkstoolbar.onMouseOver, false); } catch(e) {}
				try { TabsToolbar.removeEventListener("mouseenter", roomybookmarkstoolbar.onMouseOver, false); } catch(e) {}
				try { rbtlibbutton.removeEventListener("mouseenter", roomybookmarkstoolbar.onMouseOver, false); } catch(e) {}
				try { backButton.removeEventListener("mouseenter", roomybookmarkstoolbar.onMouseOver, false); } catch(e) {}
				try { menuButton.removeEventListener("mouseenter", roomybookmarkstoolbar.onMouseOver, false); } catch(e) {}
				try { toolbox.removeEventListener("mouseenter", roomybookmarkstoolbar.onMouseOver, false); } catch(e) {}		
			} else {
				try { navBar.removeEventListener("mouseleave", roomybookmarkstoolbar.onMouseOutput, false); } catch(e) {}
				try { toolbarmenubar.removeEventListener("mouseleave", roomybookmarkstoolbar.onMouseOutput, false); } catch(e) {}
				try { TabsToolbar.removeEventListener("mouseleave", roomybookmarkstoolbar.onMouseOutput, false); } catch(e) {}
				try { rbtlibbutton.removeEventListener("mouseleave", roomybookmarkstoolbar.onMouseOutput, false); } catch(e) {}
				try { backButton.removeEventListener("mouseleave", roomybookmarkstoolbar.onMouseOutput, false); } catch(e) {}
				try { menuButton.removeEventListener("mouseleave", roomybookmarkstoolbar.onMouseOutput, false); } catch(e) {}
				try { toolbox.removeEventListener("mouseleave", roomybookmarkstoolbar.onMouseOutput, false);} catch(e) {}
			}
		}
	},

	autoHideBookmarksBar: function(change) {
		var bookmarkItem = document.getElementsByClassName("bookmark-item");
		var autoHideBar = this.branch.getBoolPref('autoHideBar');
		var BBonNewTab = this.branch.getBoolPref('BBonNewTab');

		if (this.PersonalToolbar) {
			if (autoHideBar && !BBonNewTab) {
				roomybookmarkstoolbar.autohide = true;
				roomybookmarkstoolbar.popup = false;
				setTimeout(function(){roomybookmarkstoolbar.PersonalToolbar.collapsed = true;}, 1000);
				roomybookmarkstoolbar.visible = false;
				// roomybookmarkstoolbar.toolboxOver = false;
				roomybookmarkstoolbar.hideBarTime = this.branch.getIntPref('autoHideBarTime')*1000+250;

				this.eventListenerhandler(false, true);
				this.eventListenerhandler(false, false);
				this.eventListenerhandler(true, true);
				this.eventListenerhandler(true, false);
				
				this.styleService('string', '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul); @-moz-document url(chrome://browser/content/browser.xul) {#TabsToolbar {margin-top: 0px !important;}}');

			} else {
				this.eventListenerhandler(false, true);
				this.eventListenerhandler(false, false);
				roomybookmarkstoolbar.autohide = false;
				this.PersonalToolbar.collapsed = false;
			}
		}
	},

	separatorAdded: function(heightSep) {
		var heightOrig = heightSep;
		var bookmarkService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Components.interfaces.nsINavBookmarksService);
		var bookmarkObserver = {
				onItemAdded: function(aItemId, aFolder, aIndex) {
					var tseparator = document.getElementsByTagName("toolbarseparator");
					for (var i = 0; i < tseparator.length; i++) {
						tseparator[i].style.height = heightOrig+'px';
					}
				},
				QueryInterface: ChromeUtils.generateQI([Ci.nsINavBookmarkObserver])
		   }
		bookmarkService.addObserver(bookmarkObserver, false);
	},

	multirow: function(change) {
		var PlacesToolbar = document.getElementById('PlacesToolbar');
		var multirowBar = this.branch.getBoolPref('multirowBar');
		var heightOrig = 0;

		if (multirowBar && this.PersonalToolbar) {
			this.styleService('file','multirowBar', true);
			this.styleService('file', 'multirowBar');

			var fixedHeight = this.branch.getBoolPref('fixedHeight');
			var heightFix = this.branch.getBoolPref('heightFix');
			var rows = this.branch.getIntPref('rows');

			// When bookmarks bar collapsed- height = 0px. Make it visible in 800 ms.
			if(this.PersonalToolbar.collapsed) {
				roomybookmarkstoolbar.hideBookmarksBar();
				var timeOut = setTimeout(function() {roomybookmarkstoolbar.hideBookmarksBar();}, 800);
			}

			var bookmarkItem = document.getElementsByClassName("bookmark-item");		//get bookmarks tree and check only 33%(for fast and low load)
			if (heightFix) {
				for (var i=0; i<bookmarkItem.length; i=i+3) {
					var marginTop = +document.defaultView.getComputedStyle(bookmarkItem[i], null).getPropertyValue('margin-top').replace('px','');
					var marginBottom = +document.defaultView.getComputedStyle(bookmarkItem[i], null).getPropertyValue('margin-bottom').replace('px','');
					heightOrig = Math.max(heightOrig, bookmarkItem[i].boxObject.height+marginTop+marginBottom);
				}
			} else {
				for (var i=0; i<bookmarkItem.length; i=i+3) {
					heightOrig = Math.max(heightOrig, bookmarkItem[i].boxObject.height);
				}
			}

			if (Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULRuntime).OS == 'Linux') {
				if (this.branch.getBoolPref('disableLinuxFix') == false) {
					heightOrig +=6;
				} 
			}  else if (Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULRuntime).OS == 'Darwin') {
				heightOrig +=3;
			} else {
				if (this.branch.getIntPref('iconSize') >= 18) {
					heightOrig +=3;
				} else {
					heightOrig +=2;
				}
			}


			if (heightOrig < this.branch.getIntPref('iconSize') && this.PersonalToolbar) {			//If height not correct - set it = icon size
				heightOrig = this.branch.getIntPref('iconSize')
				if(this.branch.getIntPref('height') > this.branch.getIntPref('iconSize')) {		//If height was set and correct (bigger than icon size) set it as height
					heightOrig =  this.branch.getIntPref('height')
				}
			}

			var height = heightOrig * rows;
			this.branch.setIntPref('height', heightOrig);

			var tseparator = document.getElementsByTagName("toolbarseparator");
			for (var i = 0; i < tseparator.length; i++) {
				tseparator[i].style.height = heightOrig+'px';
			}

			PlacesToolbar.style.maxHeight = height+'px';
			this.PersonalToolbar.style.maxHeight = height+'px';
			if (fixedHeight) {
				PlacesToolbar.style.minHeight = height+'px';
			} else {
				PlacesToolbar.style.minHeight = heightOrig+'px';
			}

			//this.separatorAdded(heightOrig);				//Separator fix(apply css if added new element)
		
			window.addEventListener("beforecustomization", function() {roomybookmarkstoolbar.styleService('file','multirowBar', true);}, false);
			window.addEventListener("aftercustomization", function() {roomybookmarkstoolbar.styleService('file','multirowBar');}, false);
		}
		if(change && !multirowBar) {
			PlacesToolbar.style.minHeight = heightOrig+'px';
			this.styleService('file', 'multirowBar', true);
			this.branch.setBoolPref('fixedHeight', false); //change with options.js:33
			window.removeEventListener("beforecustomization", function() {roomybookmarkstoolbar.styleService('file','multirowBar', true);}, false);
			window.removeEventListener("aftercustomization", function() {roomybookmarkstoolbar.styleService('file','multirowBar');}, false);
		
		}
	},

	userStyle: function() {
		var opacity = this.branch.getBoolPref('opacity');
		var iconSize = this.branch.getIntPref('iconSize');
		var userWidthEnabled = this.branch.getBoolPref('userWidthEnabled');
		var folderMargin = this.branch.getIntPref('folderMargin');
		var textSize = this.branch.getIntPref('textSize');

		if (opacity || iconSize !=16 || userWidthEnabled) {
			var opacityTime = this.branch.getIntPref('opacityTime');
			var opacityTimeLong = this.branch.getIntPref('opacityTimeLong');
			var userWidth = this.branch.getIntPref('userWidth');
			if (userWidth < iconSize) { var userWidth = iconSize };		//We cannot set 0px as width (bookmarks bar will collapse)

			if(this.cssStr !== 'null') {
				this.styleService('string', this.cssStr, true)
			}

			this.cssStr = '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);';

			this.cssStr += '@-moz-document url(chrome://browser/content/browser.xul), url(chrome://navigator/content/navigator.xul) {';

			if (opacity) {
				this.cssStr += '#PersonalToolbar{opacity:0.4; transition: opacity '+opacityTimeLong+'s linear '+opacityTime+'s !important;}#navigator-toolbox:hover >#PersonalToolbar{opacity:1; transition:opacity !important}';
			}
			if (iconSize !=16) {
				this.cssStr += '#personal-bookmarks toolbarbutton.bookmark-item .toolbarbutton-icon{width:'+iconSize+'px !important;height:'+iconSize+'px !important}';
			}
			if (userWidthEnabled) {
				this.cssStr += '#personal-bookmarks toolbarbutton.bookmark-item{max-width: '+userWidth+'px !important}';
			}
			if (folderMargin != 0) { //repurposed
				this.cssStr += '#personal-bookmarks #PlacesToolbar toolbarbutton.bookmark-item{margin-top: '+folderMargin+'px !important;margin-bottom: '+folderMargin+'px !important}'
			}
			if (textSize != 100) {
				this.cssStr += '#PersonalToolbar .toolbarbutton-text{font-size: '+textSize+'% !important}';
			}
			if (Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULRuntime).OS == 'Darwin') {
				this.cssStr += '#personal-bookmarks toolbarbutton.bookmark-item .toolbarbutton-icon{max-height:1000px !important;}'
			}
			this.cssStr += '}';

			this.styleService('string', this.cssStr)
		} else {
			if(this.cssStr !== 'null') {
				this.styleService('string', this.cssStr, true)
			}
		}
	},

	hideByDefault: function() {
		if(this.branch.getBoolPref('hideByDefault')) {
			this.PersonalToolbar.collapsed = true;
		} else {
			if(!this.branch.getBoolPref('autoHideBar') && !this.branch.getBoolPref('BBonNewTab')) {this.PersonalToolbar.collapsed = false;}
		}
	},

	BBonNewTab: function() {
		var tabContainer = gBrowser.tabContainer;

		function hideBBonPage() {
			if(roomybookmarkstoolbar.branch.getBoolPref('BBonNewTab')) {
				var tabUrl = gBrowser.currentURI.scheme;
				if(tabUrl == 'about' || tabUrl == 'chrome' ) {
					roomybookmarkstoolbar.PersonalToolbar.collapsed = false;
				} else {
					roomybookmarkstoolbar.PersonalToolbar.collapsed = true;
				}
			}
		}

		if(this.branch.getBoolPref('BBonNewTab')) {
			tabContainer.removeEventListener("TabSelect", hideBBonPage, false);
			tabContainer.addEventListener("TabSelect", hideBBonPage, false);
			tabContainer.removeEventListener("TabAttrModified", hideBBonPage, false);
			tabContainer.addEventListener("TabAttrModified", hideBBonPage, false);
		} else {
			tabContainer.removeEventListener("TabSelect", hideBBonPage, false);
			tabContainer.removeEventListener("TabAttrModified", hideBBonPage, false);
			if(!this.branch.getBoolPref('autoHideBar') && !this.branch.getBoolPref('hideByDefault')) {this.PersonalToolbar.collapsed = false;}
		}
	},

	hideBookmarksBar: function() {
		this.PersonalToolbar.collapsed = !this.PersonalToolbar.collapsed;
	},

	optionsHandler: function() {
		if (this.PersonalToolbar) {
			if(this.branch.getBoolPref('hideBookmarksName')) {this.branch.setBoolPref('showBookmarksNames', false)}		//We change old options to new
			roomybookmarkstoolbar.userStyle();
			roomybookmarkstoolbar.unRegisterCss();
			roomybookmarkstoolbar.registerCss();
			roomybookmarkstoolbar.autoHideBookmarksBar();
			roomybookmarkstoolbar.multirow(true);
			roomybookmarkstoolbar.hideByDefault();
			roomybookmarkstoolbar.BBonNewTab();
		}
	},

	unRegisterCss: function() {
		this.styleService('file', 'base', true);
		this.styleService('file', 'main', true);
		this.styleService('file', 'linux', true);
		this.styleService('file', 'mousehover', true);
		this.styleService('file', 'hideFoldersNames', true);
		this.styleService('file', 'hideNoFaviconNames', true);
		this.styleService('file', 'hideFolderIcons', true);
		this.styleService('file', 'hideNoFavicon', true);
		this.styleService('file', 'hideBookmarksIcons', true);
		this.styleService('file', 'multirowBar', true);
		this.styleService('file', 'top', true);
		this.styleService('file', 'folderArrow', true);
		this.styleService('file', 'overPage', true);

		this.styleService('file', 'spacing-0', true);
		this.styleService('file', 'spacing-1', true);
		this.styleService('file', 'spacing-2', true);
		this.styleService('file', 'spacing-3', true);
		this.styleService('file', 'spacing-4', true);

		this.styleService('file', 'location-1', true);
		this.styleService('file', 'location-2', true);
	},

	registerCss: function() {
		var hideFoldersNames = this.branch.getBoolPref('hideFoldersNames');
		var hideNoFaviconNames = this.branch.getBoolPref('hideNoFaviconNames');
		var hideFolderIcons = this.branch.getBoolPref('hideFolderIcons');
		var hideDefaultIcons = this.branch.getBoolPref('hideDefaultIcons');
		var hideBookmarksName = this.branch.getBoolPref('hideBookmarksName');
		var hideBookmarksIcons = this.branch.getBoolPref('hideBookmarksIcons');
		var disableLinuxFix = this.branch.getBoolPref('disableLinuxFix');
		var location = this.branch.getIntPref('location');

 		//If was enabled showBookmarksNames - need disable hiding
		if(this.branch.getBoolPref('showBookmarksNames')) {
			this.branch.setBoolPref('hideBookmarksName', false);
		}

		this.styleService('file', 'main');
		this.styleService('file', 'button'); 

		if (hideFoldersNames) { this.styleService('file', 'hideFoldersNames');}
		if (hideNoFaviconNames) {this.styleService('file', 'hideNoFaviconNames');}
		if (hideFolderIcons && !hideFoldersNames) {this.styleService('file', 'hideFolderIcons');}
		if (hideDefaultIcons && !hideNoFaviconNames) {this.styleService('file', 'hideNoFavicon'); }
		if (hideBookmarksName) {this.styleService('file', 'base');}
		if (hideBookmarksIcons && !hideBookmarksName) {this.styleService('file', 'hideBookmarksIcons');}

		if (this.branch.getBoolPref('mousehover')) {this.styleService('file', 'mousehover');}
		if (this.branch.getBoolPref('bookmarksAboveTab')) {this.styleService('file', 'top');}
		if (this.branch.getBoolPref('overPage')) {this.styleService('file', 'overPage'); }
		if (this.branch.getBoolPref('folderArrow')) {this.styleService('file', 'folderArrow'); }

		this.styleService('file', 'spacing-'+this.branch.getIntPref('spacing'));
		if(location != 0) {this.styleService('file', 'location-'+location);}

		//fix style in linux
		if (Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULRuntime).OS == 'Linux' && disableLinuxFix == false) {
			this.styleService('file', 'linux');
		}
	},

	startUpMainCheck: function() {
		var PersonalToolbar = document.getElementById('PersonalToolbar');
		var bookmarkItem = document.getElementsByClassName("bookmark-item");
		if (PersonalToolbar && bookmarkItem.length>=0) {
			this.PersonalToolbar = document.getElementById('PersonalToolbar');
			this.userStyle();
			if (this.branch.getBoolPref('multirowBar')) {
				this.multirow();
			}
			if (this.branch.getBoolPref('autoHideBar')) {
				if(this.PersonalToolbar.collapsed){
					this.branch.setBoolPref('bookmarksBarHided', true)
					//popup("Roomy Bookmarks Toolbar enabled") //I promise I'll remove this
				} else {
					this.autoHideBookmarksBar();
					this.branch.setBoolPref('bookmarksBarHided', false)
				}
			} else {
				if(this.PersonalToolbar.collapsed){
					this.branch.setBoolPref('bookmarksBarHided', true)
				} else {
					this.branch.setBoolPref('bookmarksBarHided', false)
				}
			}
			if (this.branch.getBoolPref('hideByDefault')) {
				this.hideByDefault();
			}
			if (this.branch.getBoolPref('BBonNewTab')) {
				this.BBonNewTab();
			}
			/*var timeOut = setTimeout(function() {roomybookmarkstoolbar.setColor();}, 3000);

			//After customisation colors are wiped
			window.addEventListener("aftercustomization", function() {setTimeout(function() {roomybookmarkstoolbar.setColor();}, 1000)}, false);*/
		}
		// function popup(title, msg) {
		//   var image = null;
		//   var win = Components.classes['@mozilla.org/embedcomp/window-watcher;1']
		// 					  .getService(Components.interfaces.nsIWindowWatcher)
		// 					  .openWindow(null, 'chrome://global/content/alerts/alert.xul',
		// 								  '_blank', 'chrome,titlebar=no,popup=yes', null);
		//   win.arguments = [image, title, msg, false, ''];
		// }
	},

	//I don't think this method works any more
	/*setColor: function(data, DBevent, callback) {
		var bookmarkItem = document.getElementsByClassName("bookmark-item");
		//Set context menu id listener
		for (var i=0; i<bookmarkItem.length; i++) {
			bookmarkItem[i].addEventListener("contextmenu", function (event) {
				roomybookmarkstoolbar.id = PlacesUtils.getConcreteItemId(event.target._placesNode);
			}, false);
		}

		//If user not set colors, or delete db - stop
		if (!this.branch.getBoolPref('DBcreated')) {
			if (this.colorCSS) {
				this.styleService('string', this.colorCSS, true);
			}
			let file = FileUtils.getFile("ProfD", ["roomybookmarkstoolbar.sqlite"]);
			try {file.remove(false);} catch(e) {} 
			return;
		}

		Components.utils.import("resource://gre/modules/Services.jsm");
		Components.utils.import("resource://gre/modules/FileUtils.jsm");
		this.colorCSS = '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);'+'\n'+'\n';
		this.colorCSS += '@-moz-document url(chrome://browser/content/browser.xul), url(chrome://navigator/content/navigator.xul) {'+'\n';
		var firstBookmarksId=0;
		var macOS = false;

		if (Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULRuntime).OS == 'Darwin') {
			macOS = true;
		}

		let dbFile = FileUtils.getFile("ProfD", ["roomybookmarkstoolbar.sqlite"]);
		let dbConn = Services.storage.openDatabase(dbFile);
		dbConn.executeSimpleSQL("create table if not exists colors (id INTEGER NOT NULL PRIMARY KEY, textcolor TEXT, backgroundcolor TEXT)");

		try {
			var statement = dbConn.createStatement("SELECT * FROM colors");
			statement.executeAsync({
					handleResult: function(aResultSet) {
							for (var row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
								setColor(row.getResultByName("id"), row.getResultByName("textcolor"), row.getResultByName("backgroundcolor"));
							}
					},
					handleCompletion: function(aResultSet) {
						if (macOS) {
							roomybookmarkstoolbar.colorCSS += '#personal-bookmarks toolbarbutton.bookmark-item:hover > .toolbarbutton-text {color: #000000;}'
							roomybookmarkstoolbar.colorCSS += '#personal-bookmarks toolbarbutton.bookmark-item:hover {background-color:transparent !important;}#personal-bookmarks toolbarbutton.bookmark-item > .toolbarbutton-text {text-shadow: none !important;}';
						}
						roomybookmarkstoolbar.colorCSS += '}'
						roomybookmarkstoolbar.styleService('string', roomybookmarkstoolbar.colorCSS);
						dbConn.asyncClose()
					}
			});
		} finally {
		}
			
		function getBookmrksBarId() {				//Get id for root bookmarks folder. Different in systems\ versions
			if(bookmarkItem[firstBookmarksId]) {
				var target = bookmarkItem[firstBookmarksId];
	
				while(target) {
					if(target.id == 'PersonalToolbar') {
						return firstBookmarksId;
					}
					target = target.parentNode;
					if (!target) {
						firstBookmarksId=firstBookmarksId+1;
						target = bookmarkItem[firstBookmarksId]
					}
				}
			}
		}
		
		function setColor(id, texColor, bacColor) {
			var bookmarksid = PlacesUtils.bookmarks.getItemIndex(id);
			getBookmrksBarId();

			if (bookmarkItem[firstBookmarksId].parentNode.children[bookmarksid]) {
				bookmarkItem[firstBookmarksId].parentNode.children[bookmarksid].style.color = texColor; 	//Set text color
				bookmarkItem[firstBookmarksId].parentNode.children[bookmarksid].setAttribute('rbtid', id);	//Set id(for css selection)
				if (bacColor == '') {bacColor = 'transparent';}
				if (macOS) {		//Mac need gray background fix
					roomybookmarkstoolbar.colorCSS += '#personal-bookmarks toolbarbutton.bookmark-item[rbtid="'+id+'"] > .toolbarbutton-text {background-color:'+bacColor+'; border-radius: 6px;}#personal-bookmarks toolbarbutton.bookmark-item:hover[rbtid="'+id+'"] > .toolbarbutton-text {color: '+texColor+';}';
				} else {
					roomybookmarkstoolbar.colorCSS += '#personal-bookmarks toolbarbutton.bookmark-item[rbtid="'+id+'"] > .toolbarbutton-text {background-color:'+bacColor+'; border-radius: 6px;}';
				}
			}
		}
	},

	openColorMenu: function() {
		var elementURL;
		if (PlacesUtils.nodeIsBookmark(roomybookmarkstoolbar.id) == true) { //If bookmarks
			var URIObject = PlacesUtils.bookmarks.getBookmarkURI(roomybookmarkstoolbar.id);
			elementURL = URIObject.scheme+'://'+URIObject.host+URIObject.path;
		}
		if (PlacesUtils.nodeIsFolder(roomybookmarkstoolbar.id) == true) {	//If folder
			elementURL = 'Folder'
		}
		var bookmarkData = {inn:{id:roomybookmarkstoolbar.id, url:elementURL, title:PlacesUtils.bookmarks.getItemTitle(roomybookmarkstoolbar.id)}, out:null};
		openDialog("chrome://roomybookmarkstoolbar/content/colorMenu.xul","dlg","chrome, dialog, modal, centerscreen",bookmarkData).focus();
		this.setColor();	//After dialog close - set colors
	},*/
}

window.addEventListener("load", function load(){
    window.removeEventListener("load", load, false);
	roomybookmarkstoolbar.register();
	roomybookmarkstoolbar.registerCss();
	var timeOut = setTimeout(function() {roomybookmarkstoolbar.startUpMainCheck();}, 3000);

	//Load event so fast for linux/old version. Css can't apply
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);
			roomybookmarkstoolbar.startUpMainCheck();
		}
	}, 10);
},false);

window.addEventListener("unload", function(event){roomybookmarkstoolbar.unregister();}, false);