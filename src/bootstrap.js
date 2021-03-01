Components.utils.import("resource://gre/modules/Services.jsm");

let appinfo = Services.appinfo;

let options = {
  application: appinfo.ID,
  appversion: appinfo.version,
  platformversion: appinfo.platformVersion,
  os: appinfo.OS,
  osversion: Services.sysinfo.getProperty("version"),
  abi: appinfo.XPCOMABI
};

let man = `
overlay	chrome://browser/content/browser.xhtml	chrome://roomybookmarkstoolbar/content/overlay.xhtml
`;
/**
 * restartApplication: Restarts the application, keeping it in
 * safe mode if it is already in safe mode.
 */
function restartApplication() {
  const cancelQuit = Cc["@mozilla.org/supports-PRBool;1"].createInstance(
    Ci.nsISupportsPRBool
  );
  Services.obs.notifyObservers(
    cancelQuit,
    "quit-application-requested",
    "restart"
  );
  if (cancelQuit.data) {
    // The quit request has been canceled.
    return false;
  }
  // if already in safe mode restart in safe mode
  if (Services.appinfo.inSafeMode) {
    Services.startup.restartInSafeMode(
      Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart
    );
    return undefined;
  }
  Services.startup.quit(
    Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart
  );
  return undefined;
}

function showRestartNotifcation(verb, window) {
  window.PopupNotifications._currentNotifications.shift();
  window.PopupNotifications.show(
    window.gBrowser.selectedBrowser,
    'addon-install-restart',
	'Roomy Bookmarks Toolbar has been ' + verb + ', but a restart is required to ' + ((verb == 'upgraded' || verb == 'installed') || verb == 're-enabled' ? 'enable' : 'remove') + ' add-on functionality.',
    'addons-notification-icon',
    {
      label: 'Restart Now',
      accessKey: 'R',
      callback() {
        restartApplication();
      }
    },
    [{
      label: 'Not Now',
      accessKey: 'N',
      callback: () => {},
    }],
    {
      popupIconURL: 'chrome://roomybookmarkstoolbar/skin/addon-install-restart.svg',
      persistent: false,
      hideClose: true,
      timeout: Date.now() + 30000,
      removeOnDismissal: true
    }
  );
}

function install(data, reason) {
  const window = Services.wm.getMostRecentWindow('navigator:browser');
  showRestartNotifcation("installed", window);
  return;
}

function uninstall() { }

function startup(data, reason) {
  var temp = {};
  Services.scriptloader.loadSubScript("chrome://roomybookmarkstoolbar/content/prefs.js", temp, 'UTF-8');
  delete temp;

  Components.utils.import("chrome://roomybookmarkstoolbar/content/ChromeManifest.jsm");
  Components.utils.import("chrome://roomybookmarkstoolbar/content/Overlays.jsm");
  Components.utils.import("resource:///modules/CustomizableUI.jsm");

  // Create toolbar icon here
  CustomizableUI.createWidget({
    id: 'rbtlibbutton',
    defaultArea: CustomizableUI.AREA_NAVBAR,
    label: 'Show bookmarks toolbar',
    tooltiptext: 'Show bookmarks toolbar',
    onCreated: function (toolbaritem) {
      toolbaritem.setAttribute('image', 'chrome://roomybookmarkstoolbar/skin/button32.png');
    }
  });
  
  const window = Services.wm.getMostRecentWindow('navigator:browser');

  // This may be relevant if colorMenu is used
  if (reason === ADDON_UPGRADE || reason === ADDON_DOWNGRADE) {
      showRestartNotifcation("upgraded", window);
      return;
  } else if (reason === ADDON_ENABLE && window.document.getElementById('roomybookmarkstoolbar')) {
      showRestartNotifcation("re-enabled", window);
      return;
  }  
  
  if (reason === ADDON_INSTALL || (reason === ADDON_ENABLE && !window.document.getElementById('roomybookmarkstoolbar'))) {
    var enumerator = Services.wm.getEnumerator(null);
    while (enumerator.hasMoreElements()) {
      var win = enumerator.getNext();

      (async function (win) {
        let chromeManifest = new ChromeManifest(function () { return man; }, options);
        await chromeManifest.parse();
        if (win.document.createXULElement) {
          Overlays.load(chromeManifest, win.document.defaultView);
        }
      })(win);
    }
  }

  (async function () {
    let chromeManifest = new ChromeManifest(function () { return man; }, options);
    await chromeManifest.parse();

    let documentObserver = {
      observe(document) {
        if (document.createXULElement) {
          Overlays.load(chromeManifest, document.defaultView);
        }
      }
    };
    Services.obs.addObserver(documentObserver, "chrome-document-loaded");
  })();

}

function shutdown(data, reason) {
  const window = Services.wm.getMostRecentWindow('navigator:browser');
  if (reason === ADDON_DISABLE) {
      showRestartNotifcation("disabled", window);
      return;
  } else if (reason === ADDON_UNINSTALL) {
      showRestartNotifcation("uninstalled", window);
      return;
  }
  
  CustomizableUI.destroyWidget('rbtlibbutton');
}
