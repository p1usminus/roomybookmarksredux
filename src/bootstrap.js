const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");

var Globals = {};

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
      callback: () => { },
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
  if (reason === ADDON_INSTALL) {
    Services.prefs.setBoolPref("extensions.roomybookmarkstoolbar.hide_warning", true);
  }
  
  const window = Services.wm.getMostRecentWindow('navigator:browser');
  showRestartNotifcation("installed", window);
  return;
}

function uninstall() { }

async function startup(data, reason) {
  var temp = {};
  Services.scriptloader.loadSubScript("chrome://roomybookmarkstoolbar/content/prefs.js", temp, 'UTF-8');
  delete temp;

  const { CustomizableUI } = ChromeUtils.importESModule("resource:///modules/CustomizableUI.sys.mjs");

  try {
    CustomizableUI.createWidget({
      id: 'rbtlibbutton',
      defaultArea: CustomizableUI.AREA_NAVBAR,
      label: 'Show bookmarks toolbar',
      tooltiptext: 'Show bookmarks toolbar',
      onCreated: function (toolbaritem) {
        toolbaritem.setAttribute('image', 'chrome://roomybookmarkstoolbar/skin/button32.png');
      }
    });
  } catch (error) { }

  const window = Services.wm.getMostRecentWindow('navigator:browser');

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
        if (win.document.createXULElement) {
          if (win.location.origin + win.location.pathname == "chrome://browser/content/browser.xhtml") {
            win.document.ownerGlobal.roomybookmarkstoolbarGlobals = Globals;
            Services.scriptloader.loadSubScript("chrome://roomybookmarkstoolbar/content/overlay.js", win.document.defaultView);
          }
        }
      })(win);
    }
  }

  (async function () {
    let documentObserver = {
      observe(document) {
        if (document.createXULElement) {
          if (document.defaultView.location.origin + document.defaultView.location.pathname == "chrome://browser/content/browser.xhtml") {
            document.ownerGlobal.roomybookmarkstoolbarGlobals = Globals;
            Services.scriptloader.loadSubScript("chrome://roomybookmarkstoolbar/content/overlay.js", document.defaultView);
          }
        }
      }
    };
    Services.obs.addObserver(documentObserver, "chrome-document-loaded");
  })();

  (async function () {
    try {
      Services.prefs.getBoolPref("extensions.roomybookmarkstoolbar.hide_warning") ?
        (await AddonManager.getAddonByID(`${data.id}`)).__AddonInternal__.signedState = AddonManager.SIGNEDSTATE_NOT_REQUIRED
        : (await AddonManager.getAddonByID(`${data.id}`)).__AddonInternal__.signedState === AddonManager.SIGNEDSTATE_NOT_REQUIRED ? (await AddonManager.getAddonByID(`${data.id}`)).__AddonInternal__.signedState = AddonManager.SIGNEDSTATE_MISSING : '';
    } catch (error) { }
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
