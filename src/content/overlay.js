if (!document.getElementById('placesContext')) throw 'overlay.js not in place';
const doc = new window.DOMParser().parseFromSafeString(`
	<!DOCTYPE box SYSTEM "chrome://roomybookmarkstoolbar/locale/overlay.dtd">
	<box xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
			xmlns:html="http://www.w3.org/1999/xhtml">
		<menuseparator id="rbtSeparator"
			insertafter="placesContext_delete"/>
		<menuitem id="rbtChangeColor"
			label="&roomybookmarkstoolbar.overlay.rbtChangeColor.label;"
			insertafter="rbtSeparator"/>
	</box>
    `,"application/xml");
const range = doc.createRange();
range.selectNodeContents(doc.querySelector("box"));
document.getElementById('placesContext').insertBefore(range.extractContents(),
document.getElementById('placesContext_delete').nextSibling);
document.getElementById('rbtChangeColor').addEventListener('command', _ => { roomybookmarkstoolbar.openColorMenu() });

// Restrict colour context menu entry to bookmark items on main toolbar only
document.getElementById('placesContext').addEventListener('popupshowing', event => {
  const separator = document.getElementById('rbtSeparator');
  const menuitem = document.getElementById('rbtChangeColor');
  
  if (separator && menuitem) {
    let onToolbar = event.target.triggerNode?.parentNode?.id === "PlacesToolbarItems";
    
    separator.hidden = !onToolbar;
    menuitem.hidden = !onToolbar;
  }
});

let toolbarVisible = true;

const progressListener = {
	QueryInterface: ChromeUtils.generateQI([Ci.nsIWebProgressListener]),
	
	onLocationChange: function (aWebProgress, aRequest, aLocationURI, aFlags) {
		if (roomybookmarkstoolbar.autohide) {
			// This is like a secondary autoHideBookmarksBar function, just for tab switching
			if (!(aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT)) { roomybookmarkstoolbar.setVisibility(); }
		}
	}
};

const roomybookmarkstoolbar = {
	branch: null,				//Perf system
	cssStr: null,				//CSS string for user style
	colorCSS: null,				//CSS string for bookmarks color
	visible: null,				//Autohide visible
	hovered: null,				//Autohide if mouse on browser panel- not hide
	popup: null,				//Autohide if popup open- not hide bookmrks bar
	autohide: null,				//Autohide enabled\disabled
	hideBarTime: null,			//Auto-hide time
	timeOutHide: null,			//Timer for autohide
	PersonalToolbar: null,			//PersonalToolbar CSS id?

	register: function () {
		this.branch = Services.prefs.getBranch("extensions.roomybookmarkstoolbar.");
		this.branch.addObserver("", this, false);
	},

	unregister: function () {
		this.branch.removeObserver("", this);
		window.removeEventListener("beforecustomization", roomybookmarkstoolbar.onBeforeCustomise, false);
		window.removeEventListener("aftercustomization", roomybookmarkstoolbar.onAfterCustomise, false);
	},

	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			roomybookmarkstoolbar.optionsHandler();
		} else {
			return;
		}
	},

	styleService: function (type, object, unregister) {
		const styleSheet = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
		let styleURI;
		if (type == 'file') {
			styleURI = Services.io.newURI('chrome://roomybookmarkstoolbar/skin/css/' + object + '.css', null, null);
		}
		if (type == 'string') {
			styleURI = Services.io.newURI("data:text/css," + encodeURIComponent(object), null, null);
		}
		if (unregister === true) {
			if (styleSheet.sheetRegistered(styleURI, styleSheet.USER_SHEET)) { styleSheet.unregisterSheet(styleURI, styleSheet.USER_SHEET); }
		} else {
			if (!styleSheet.sheetRegistered(styleURI, styleSheet.USER_SHEET)) { styleSheet.loadAndRegisterSheet(styleURI, styleSheet.USER_SHEET); }
		}
	},

	setVisibility: function () {
		roomybookmarkstoolbar.hideBookmarksBar(!toolbarVisible);
	},

	hideHandler: async function () {
		const hovered = roomybookmarkstoolbar.hovered;
		const popup = roomybookmarkstoolbar.popup;

		if (this.timeOutHide) {
			clearTimeout(this.timeOutHide);
		}
		this.timeOutHide = null;

		if (roomybookmarkstoolbar.autohide && !roomybookmarkstoolbar.PersonalToolbar.collapsed && !hovered && !popup) {
			toolbarVisible = false;
			this.timeOutHide = setTimeout(roomybookmarkstoolbar.setVisibility, roomybookmarkstoolbar.hideBarTime);
		} else {
			if (hovered) {
				toolbarVisible = true;
				roomybookmarkstoolbar.setVisibility();

				document.addEventListener('mousemove',e =>{
					if(!document.getElementById("navigator-toolbox").contains(e.target)){
						roomybookmarkstoolbar.hovered = false;
						roomybookmarkstoolbar.hideHandler();
						document.removeEventListener('mousemove', arguments.callee);
					}
				});
				if (typeof document.getElementById('PlacesToolbar')._placesView == 'undefined') {
					await PlacesToolbarHelper._resetView();
				}
				document.getElementById('PlacesToolbar')?._placesView?.updateNodesVisibility();
			}
		}
	},

	onMouseOver: function (e) {
		roomybookmarkstoolbar.lastY = null;

		if (roomybookmarkstoolbar.autohide) {
			if (roomybookmarkstoolbar.timeOutHide) {
				clearTimeout(roomybookmarkstoolbar.timeOutHide);
			}
			roomybookmarkstoolbar.timeOutHide = null;

			roomybookmarkstoolbar.hovered = true;
			roomybookmarkstoolbar.hideHandler();
		}

		roomybookmarkstoolbar.mouseMoveListenerhandler(false);
	},

	onMouseOutput: function (e) {
		if (roomybookmarkstoolbar.autohide) {
			roomybookmarkstoolbar.hovered = false;

			if (!roomybookmarkstoolbar.toolboxOver) {
				const toolbox = document.getElementById("navigator-toolbox");

				roomybookmarkstoolbar.mouseMoveListenerhandler(true);

				if (e.target == toolbox) roomybookmarkstoolbar.timeOutHide = setTimeout(roomybookmarkstoolbar.hideHandler, 100);
			}
			else roomybookmarkstoolbar.hideHandler();

		}
	},

	onMouseMove: function (e) {
		if (e.target == document.getElementById("PanelUI-button")) return;

		if (roomybookmarkstoolbar.PersonalToolbar.collapsed || !roomybookmarkstoolbar.autohide) {
			roomybookmarkstoolbar.mouseMoveListenerhandler(false);
			roomybookmarkstoolbar.lastY = null;
			return;
		}

		if (roomybookmarkstoolbar.timeOutHide) {
			clearTimeout(roomybookmarkstoolbar.timeOutHide);
		}
		roomybookmarkstoolbar.timeOutHide = null;

		let rect = PersonalToolbar.getBoundingClientRect();
		let y = Math.abs(e.clientY - rect.top);
		if (roomybookmarkstoolbar.lastY) {
			if (y > roomybookmarkstoolbar.lastY) {
				roomybookmarkstoolbar.lastY = null;
				roomybookmarkstoolbar.hideHandler();
				roomybookmarkstoolbar.mouseMoveListenerhandler(false);
			}
		}
		roomybookmarkstoolbar.lastY = y;
	},

	onpopupshown: function (e) {
		roomybookmarkstoolbar.popup = true;
		roomybookmarkstoolbar.hideHandler();
	},

	onpopuphidden: function (e) {
		roomybookmarkstoolbar.popup = false;
		roomybookmarkstoolbar.hideHandler();
	},

	onBeforeCustomise: function () {
		roomybookmarkstoolbar.styleService('file', 'multirowBar', true);
	},

	onAfterCustomise: function () {
		roomybookmarkstoolbar.styleService('file', 'multirowBar');
	},

	mouseMoveListenerhandler: function (on) {
		const toolbox = document.getElementById("navigator-toolbox");

		if (on && !roomybookmarkstoolbar.moveListener) {
			toolbox.addEventListener("mousemove", roomybookmarkstoolbar.onMouseMove, false);
			roomybookmarkstoolbar.moveListener = true;
		} else if (!on) {
			toolbox.removeEventListener("mousemove", roomybookmarkstoolbar.onMouseMove, false);
			roomybookmarkstoolbar.moveListener = false;
		}
	},

	eventListenerhandler: function (register, type) {
		const autoHideZoneAll = this.branch.getBoolPref('autoHideZoneAll');
		const autoHideZoneTab = this.branch.getBoolPref('autoHideZoneTab');
		const autoHideZoneNav = this.branch.getBoolPref('autoHideZoneNav');
		const autoHideZoneMenu = this.branch.getBoolPref('autoHideZoneMenu');
		const autoHideZoneButton = this.branch.getBoolPref('autoHideZoneButton');
		const autoHideZoneBackButton = this.branch.getBoolPref('autoHideZoneBackButton');
		const autoHideZoneMenuButton = this.branch.getBoolPref('autoHideZoneMenuButton');
		const toolbox = document.getElementById("navigator-toolbox");
		const toolbarmenubar = document.getElementById("toolbar-menubar");
		const TabsToolbar = document.getElementById("TabsToolbar");
		const navBar = document.getElementById("nav-bar");
		const rbtlibbutton = document.getElementById("rbtlibbutton");
		const backButton = document.getElementById("back-button");
		const menuButton = document.getElementById("PanelUI-menu-button");
		const mainPopupSet = document.getElementById("mainPopupSet");
		let MPSEventHandler = (e) => {if(["customizationui-widget-panel","placesContext"].includes(e.target.id)) this["on" + e.type]();};

		let E, H, P, T = type ? (E = "mouseenter", H = this.onMouseOver, P = "popupshown", void 0) :
			(E = "mouseleave", H = this.onMouseOutput, P = "popuphidden", autoHideZoneAll && (this.toolboxOver = true), toolbox)
		if (register) {
			(autoHideZoneAll ? [toolbox] : [PersonalToolbar, T,
				autoHideZoneNav	? navBar : void 0,		autoHideZoneMenu	? toolbarmenubar : void 0,	autoHideZoneBackButton ? backButton : void 0,
				autoHideZoneTab	? TabsToolbar : void 0,	autoHideZoneButton	? rbtlibbutton : void 0,	autoHideZoneMenuButton ? menuButton : void 0])
				.forEach(e => e?.addEventListener(E, H, false));
			try { mainPopupSet.addEventListener(P, MPSEventHandler, false); } catch (e) { }
		} else {
			roomybookmarkstoolbar.mouseMoveListenerhandler(false);
			[toolbox, PersonalToolbar, navBar, toolbarmenubar, TabsToolbar, rbtlibbutton, backButton, menuButton]
				.forEach(e => e?.removeEventListener(E, H, false));
			try { mainPopupSet.removeEventListener(P, MPSEventHandler, false); } catch (e) { }
		}
	},

	autoHideBookmarksBar: function (change) {
		const autoHideBar = this.branch.getBoolPref('autoHideBar');
		const BBonNewTab = this.branch.getBoolPref('BBonNewTab');

		if (this.PersonalToolbar) {
			if (autoHideBar && !BBonNewTab) {
				roomybookmarkstoolbar.autohide = true;
				roomybookmarkstoolbar.popup = false;
				setTimeout(function () { roomybookmarkstoolbar.PersonalToolbar.collapsed = true; }, 1000);
				toolbarVisible = false;
				roomybookmarkstoolbar.toolboxOver = false;
				roomybookmarkstoolbar.moveListener = false;
				roomybookmarkstoolbar.hideBarTime = this.branch.getIntPref('autoHideBarTime') * 1000 + 250;

				this.eventListenerhandler(false, true);
				this.eventListenerhandler(false, false);
				this.eventListenerhandler(true, true);
				this.eventListenerhandler(true, false);

			} else {
				this.eventListenerhandler(false, true);
				this.eventListenerhandler(false, false);
				roomybookmarkstoolbar.autohide = false;
				this.hideBookmarksBar(false);
			}
		}
	},

	multirow: function (change) {
		const PlacesToolbar = document.getElementById('PlacesToolbar');
		const multirowBar = this.branch.getBoolPref('multirowBar');
		let heightOrig = 0;

		if (multirowBar && this.PersonalToolbar) {
			this.styleService('file', 'multirowBar', true);
			this.styleService('file', 'multirowBar');

			const fixedHeight = this.branch.getBoolPref('fixedHeight');
			const heightFix = this.branch.getBoolPref('heightFix');
			const rows = this.branch.getIntPref('rows');

			// When bookmarks bar collapsed- height = 0px. Make it visible in 800 ms.
			if (this.PersonalToolbar.collapsed) {
				roomybookmarkstoolbar.hideBookmarksBar();
				const timeOut = setTimeout(function () { roomybookmarkstoolbar.hideBookmarksBar(); }, 800);
			}

			const bookmarkItem = document.querySelectorAll("#PlacesToolbar toolbarbutton.bookmark-item"); // get snapshot of bookmark items, some objects outside #PlacesToolbar have the same class name
			if (heightFix && bookmarkItem.length > 0) {
				const computedStyle = document.defaultView.getComputedStyle(bookmarkItem[0], null);
				let marginTop = +computedStyle.getPropertyValue('margin-top').replace('px', '');
				let marginBottom = +computedStyle.getPropertyValue('margin-bottom').replace('px', '');
				for (let i = 0; i < bookmarkItem.length; i = i + 3) {
					heightOrig = Math.max(heightOrig, bookmarkItem[i].getBoundingClientRect().height + marginTop + marginBottom);
				}
			} else {
				for (let i = 0; i < bookmarkItem.length; i = i + 3) {
					heightOrig = Math.max(heightOrig, bookmarkItem[i].getBoundingClientRect().height);
				}
			}

			if (this.branch.getIntPref('iconSize') >= 18) {
				heightOrig += 3;
			} else {
				heightOrig += 2;
			}

			if (heightOrig < this.branch.getIntPref('iconSize') && this.PersonalToolbar) {			//If height not correct - set it = icon size
				heightOrig = this.branch.getIntPref('iconSize');
				if (this.branch.getIntPref('height') > this.branch.getIntPref('iconSize')) {		//If height was set and correct (bigger than icon size) set it as height
					heightOrig = this.branch.getIntPref('height');
				}
			}

			let height = heightOrig * rows;
			this.branch.setIntPref('height', heightOrig);  // why?

			PlacesToolbar.style.maxHeight = height + 'px';
			this.PersonalToolbar.style.maxHeight = height + 'px';

			if (fixedHeight) {
				PlacesToolbar.style.minHeight = height + 'px';
			} else {
				PlacesToolbar.style.minHeight = heightOrig + 'px';
			}

			window.addEventListener("beforecustomization", roomybookmarkstoolbar.onBeforeCustomise, false);
			window.addEventListener("aftercustomization", roomybookmarkstoolbar.onAfterCustomise, false);
		}

		if (change && !multirowBar) {
			PlacesToolbar.style.minHeight = heightOrig + 'px';
			this.styleService('file', 'multirowBar', true);
			this.branch.setBoolPref('fixedHeight', false);
			window.removeEventListener("beforecustomization", roomybookmarkstoolbar.onBeforeCustomise, false);
			window.removeEventListener("aftercustomization", roomybookmarkstoolbar.onAfterCustomise, false);
		}
	},

	userStyle: function () {
		const opacity = this.branch.getBoolPref('opacity');
		const iconSize = this.branch.getIntPref('iconSize');
		const userWidthEnabled = this.branch.getBoolPref('userWidthEnabled');
		const folderMargin = this.branch.getIntPref('folderMargin');
		const textSize = this.branch.getIntPref('textSize');

		if (opacity || iconSize != 16 || userWidthEnabled || folderMargin != 0 || textSize != 100) {
			const opacityTime = this.branch.getIntPref('opacityTime');
			const opacityTimeLong = this.branch.getIntPref('opacityTimeLong');
			const userWidth = this.branch.getIntPref('userWidth');
			if (userWidth < iconSize) { userWidth = iconSize };		//We cannot set 0px as width (bookmarks bar will collapse)

			if (this.cssStr !== 'null') {
				this.styleService('string', this.cssStr, true)
			}

			this.cssStr = '@-moz-document url(chrome://browser/content/browser.xhtml) {';

			if (opacity) {
				this.cssStr += '#PersonalToolbar{opacity:0.4; transition: opacity ' + opacityTimeLong + 's linear ' + opacityTime + 's !important;} #navigator-toolbox > #PersonalToolbar:hover {opacity:1; transition:opacity !important}';
			}
			if (iconSize != 16) {
				this.cssStr += '.bookmark-item > .toolbarbutton-icon{width:' + iconSize + 'px !important;height:' + iconSize + 'px !important}';
			}
			if (userWidthEnabled) {
				this.cssStr += '.bookmark-item{max-width: ' + userWidth + 'px !important}';
			}
			if (folderMargin != 0) {
				this.cssStr += '#personal-bookmarks #PlacesToolbar toolbarbutton.bookmark-item{margin-top: ' + folderMargin + 'px !important;margin-bottom: ' + folderMargin + 'px !important}'
			}
			if (textSize != 100) {
				this.cssStr += '#PersonalToolbar .toolbarbutton-text{font-size: ' + textSize + '% !important}';
			}
			this.cssStr += '}';

			this.styleService('string', this.cssStr)
		} else {
			if (this.cssStr !== 'null') {
				this.styleService('string', this.cssStr, true)
			}
		}
	},

	hideByDefault: function () {
		if (this.branch.getBoolPref('hideByDefault')) {
			this.PersonalToolbar.collapsed = true;
			Services.prefs.setCharPref("browser.toolbars.bookmarks.visibility", "never");
		} else {
			if (!this.branch.getBoolPref('autoHideBar') && !this.branch.getBoolPref('BBonNewTab')) {
				this.hideBookmarksBar(false);
				Services.prefs.setCharPref("browser.toolbars.bookmarks.visibility", "always");
			}
		}
	},

	BBonNewTab: function () {
		if (this.branch.getBoolPref('BBonNewTab')) {
			Services.prefs.setCharPref("browser.toolbars.bookmarks.visibility", "newtab");
		} else {
			if (!this.branch.getBoolPref('autoHideBar') && !this.branch.getBoolPref('hideByDefault')) {
				this.hideBookmarksBar(false);
				Services.prefs.setCharPref("browser.toolbars.bookmarks.visibility", "always");
			}
		}
	},

	hideBookmarksBar: function (arg = !this.PersonalToolbar.collapsed) {
		this.PersonalToolbar.collapsed = arg;
		toolbarVisible = !arg;
	},

	optionsHandler: function () {
		if (this.PersonalToolbar) {
			roomybookmarkstoolbar.userStyle();
			roomybookmarkstoolbar.unRegisterCss();
			roomybookmarkstoolbar.registerCss();
			roomybookmarkstoolbar.autoHideBookmarksBar();
			roomybookmarkstoolbar.multirow(true);
			roomybookmarkstoolbar.hideByDefault();
			roomybookmarkstoolbar.BBonNewTab();
		}
	},

	unRegisterCss: function () {
		this.styleService('file', 'base', true);
		this.styleService('file', 'main', true);
		this.styleService('file', 'fullscreen', true);
		this.styleService('file', 'mousehover', true);
		this.styleService('file', 'hideFoldersNames', true);
		this.styleService('file', 'hideNoFaviconNames', true);
		this.styleService('file', 'hideFolderIcons', true);
		this.styleService('file', 'hideNoFavicon', true);
		this.styleService('file', 'hideBookmarksIcons', true);
		this.styleService('file', 'multirowBar', true);
		this.styleService('file', 'top', true);
		this.styleService('file', 'overPage', true);

		this.styleService('file', 'spacing-0', true);
		this.styleService('file', 'spacing-1', true);
		this.styleService('file', 'spacing-2', true);
		this.styleService('file', 'spacing-3', true);
		this.styleService('file', 'spacing-4', true);

		this.styleService('file', 'location-1', true);
		this.styleService('file', 'location-2', true);
	},

	registerCss: function () {
		const hideFoldersNames = this.branch.getBoolPref('hideFoldersNames');
		const hideNoFaviconNames = this.branch.getBoolPref('hideNoFaviconNames');
		const hideFolderIcons = this.branch.getBoolPref('hideFolderIcons');
		const hideDefaultIcons = this.branch.getBoolPref('hideDefaultIcons');
		const hideBookmarksName = this.branch.getBoolPref('hideBookmarksName');
		const hideBookmarksIcons = this.branch.getBoolPref('hideBookmarksIcons');
		const location = this.branch.getIntPref('location');

		this.styleService('file', 'main');
		this.styleService('file', 'fullscreen');

		if (hideFoldersNames) { this.styleService('file', 'hideFoldersNames'); }
		if (hideNoFaviconNames) { this.styleService('file', 'hideNoFaviconNames'); }
		if (hideFolderIcons && !hideFoldersNames) { this.styleService('file', 'hideFolderIcons'); }
		if (hideDefaultIcons && !hideNoFaviconNames) { this.styleService('file', 'hideNoFavicon'); }
		if (hideBookmarksName) { this.styleService('file', 'base'); }
		if (hideBookmarksIcons && !hideBookmarksName) { this.styleService('file', 'hideBookmarksIcons'); }

		if (this.branch.getBoolPref('mousehover')) { this.styleService('file', 'mousehover'); }
		if (this.branch.getBoolPref('bookmarksAboveTab')) { this.styleService('file', 'top'); }
		if (this.branch.getBoolPref('overPage')) { this.styleService('file', 'overPage'); }

		this.styleService('file', 'spacing-' + this.branch.getIntPref('spacing'));
		if (location != 0) { this.styleService('file', 'location-' + location); }
	},

	startUpMainCheck: async function () {
		if (typeof PlacesToolbarHelper == 'undefined') return;
		await PlacesToolbarHelper.init(); // wait until bookmarks bar has loaded
		try { gBrowser.addProgressListener(progressListener); } catch(e) { };
		const PersonalToolbar = document.getElementById('PersonalToolbar');
		const bookmarkItem = document.querySelectorAll("#PlacesToolbar toolbarbutton.bookmark-item");
		if (PersonalToolbar && bookmarkItem.length >= 0) {

			this.PersonalToolbar = document.getElementById('PersonalToolbar');
			this.userStyle();
			if (this.branch.getBoolPref('multirowBar')) {
				this.multirow();
			}
			if (this.branch.getBoolPref('autoHideBar')) {
				if (!this.PersonalToolbar.collapsed) {
					this.autoHideBookmarksBar();
				}
			}
			if (this.branch.getBoolPref('hideByDefault')) {
				this.hideByDefault();
			}
			if (this.branch.getBoolPref('BBonNewTab')) {
				this.BBonNewTab();
			}

			if (!roomybookmarkstoolbarGlobals.colorCSS) this.setColor();

			//favicon 
			let defaultFavicon = (await fetchIconForSpec(PlacesUtils.favicons.defaultFavicon.spec))?.data;
			for (const node of document.querySelectorAll("#PlacesToolbar toolbarbutton.bookmark-item")) {
				if (node.image &&
					(await fetchIconForSpec(node.image))?.data == defaultFavicon) node.setAttribute('rbtdf', '');
			}

			//After customisation colors are wiped
			const PlacesToolbar = document.getElementById('PlacesToolbar');
			PlacesToolbar.addEventListener("contextmenu", (event) => { if (event.target.classList.contains("bookmark-item")) roomybookmarkstoolbar.id = event.target._placesNode; }, false);

			for (const node of document.querySelectorAll("#PlacesToolbar toolbarbutton.bookmark-item")) {
				node._placesNode ? node.setAttribute('rbtid', node._placesNode.bookmarkGuid) : '';
			}

			const config = { childList: true, subtree: true, attributes: true, attributeFilter: ["image"] };
			const callback = async function (mutationList) {
				for (const mutation of mutationList) {
					for (const node of mutation.addedNodes) {
						if (node.classList?.contains("bookmark-item") && node.tagName == "toolbarbutton") {
							node._placesNode ? node.setAttribute('rbtid', node._placesNode.bookmarkGuid) : '';
							if (node.image && (await fetchIconForSpec(node.image))?.data == defaultFavicon) node.setAttribute('rbtdf', '');
						}
					}
					if (mutation.type === 'attributes') { //firefox update favicon by remove then re-set 'image'
						if (mutation.target.image && (await fetchIconForSpec(mutation.target.image))?.data == defaultFavicon) mutation.target.setAttribute('rbtdf', '');
						else if (mutation.target.hasAttribute('rbtdf')) mutation.target.removeAttribute('rbtdf');
					}
				}
			};
			const observer = new MutationObserver(callback);
			observer.observe(PlacesToolbar, config);
		}

		function fetchIconForSpec(spec) { //took from mozilla's test file
			return new Promise((resolve, reject) => {
				NetUtil.asyncFetch(
					{
						uri: NetUtil.newURI(spec),
						loadUsingSystemPrincipal: true,
						contentPolicyType: Ci.nsIContentPolicy.TYPE_INTERNAL_IMAGE_FAVICON,
					},
					(input, status, request) => {
						if (!Components.isSuccessCode(status)) {
							reject(new Error("unable to load icon"));
							return;
						}

						try {
							let data = NetUtil.readInputStreamToString(input, input.available());
							let contentType = request.QueryInterface(Ci.nsIChannel).contentType;
							input.close();
							resolve({ data, contentType });
						} catch (ex) {
							reject(ex);
						}
					}
				);
			});
		}
	},

	setColor: function () {
		const { FileUtils } = ChromeUtils.importESModule("resource://gre/modules/FileUtils.sys.mjs");
		
		if (roomybookmarkstoolbarGlobals.colorCSS) {
			this.styleService('string', roomybookmarkstoolbarGlobals.colorCSS, true);
		}
		//If user not set colors, or delete db - stop
		if (!this.branch.getBoolPref('DBcreated')) {
			const file = new FileUtils.File(PathUtils.join(PathUtils.profileDir, "roomybookmarkstoolbar.sqlite"));
			try { file.remove(false); } catch (e) { console.log(e) }
			return;
		}
		
		roomybookmarkstoolbarGlobals.colorCSS = '';
		roomybookmarkstoolbarGlobals.colorCSS += '@-moz-document url(chrome://browser/content/browser.xhtml) {' + '\n';

		const dbFile = new FileUtils.File(PathUtils.join(PathUtils.profileDir, "roomybookmarkstoolbar.sqlite"));
		const dbConn = Services.storage.openDatabase(dbFile);
		dbConn.executeSimpleSQL("create table if not exists colors (id TEXT NOT NULL PRIMARY KEY, textcolor TEXT, backgroundcolor TEXT)");

		try {
			let canClose;
			let promise = new Promise(resolve => {
				canClose = resolve;
			});
			const statement = dbConn.createStatement("SELECT * FROM colors");
			statement.executeAsync({
				handleResult: async function (aResultSet) {
					let p = [];
					for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
						p.push(setColor(row.getResultByName("id"), row.getResultByName("textcolor"), row.getResultByName("backgroundcolor")));
					}
					Promise.allSettled(p).then(canClose);
				},
				handleCompletion: async function (aResultSet) {
					await promise;
					roomybookmarkstoolbarGlobals.colorCSS += '}';
					roomybookmarkstoolbar.styleService('string', roomybookmarkstoolbarGlobals.colorCSS);
					try { dbConn.asyncClose(); } catch (e) { console.log(e) }
				}
			});

		} finally {
		}

		async function setColor(id, texColor, bacColor) {
			if (await PlacesUtils.bookmarks.fetch(id).then(r => {
				if (r?.parentGuid == "toolbar_____") return true;
				try {
					if (!r) {
						dbConn.executeSimpleSQL(`DELETE FROM colors WHERE id = "${id}"`);
					}
				} catch (e) { console.log(e) }
				return false;
			})) {
				let colorCSS = '';
				colorCSS += '#personal-bookmarks toolbarbutton.bookmark-item[rbtid="' + id + '"] {' + '\n';
				if (texColor != '') colorCSS += ' color: ' + texColor + '!important;' + '\n';
				if (bacColor != '') colorCSS += ' background-color:' + bacColor + '!important;' + '\n';
				colorCSS += ' border-radius: 6px;' + '\n' + '}' + '\n';
				roomybookmarkstoolbarGlobals.colorCSS += colorCSS;
			}
		}
	},

	openColorMenu: function () {
		const isBookmark = PlacesUtils.nodeIsBookmark(roomybookmarkstoolbar.id);
		const isFolder = (PlacesUtils.nodeIsFolder ?? PlacesUtils.nodeIsFolderOrShortcut)(roomybookmarkstoolbar.id);
		
		const elementURL = isBookmark ? roomybookmarkstoolbar.id.uri : (isFolder ? 'Folder' : null);
		const bookmarkData = { inn: { id: roomybookmarkstoolbar.id.bookmarkGuid, url: elementURL, title: roomybookmarkstoolbar.id.title }, out: null };
		openDialog("chrome://roomybookmarkstoolbar/content/colorMenu.xhtml", "dlg", "chrome, dialog, modal, centerscreen", bookmarkData).focus();
		this.setColor();	//After dialog close - set colors
	},
}

window.addEventListener("load", function load() {
	roomybookmarkstoolbar.startUpMainCheck();
	roomybookmarkstoolbar.register();
	roomybookmarkstoolbar.registerCss();
}, { once: true });

window.addEventListener("unload", function (event) { roomybookmarkstoolbar.unregister(); }, false);
