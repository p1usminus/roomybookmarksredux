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
overlay	chrome://browser/content/browser.xul	chrome://roomybookmarkstoolbar/content/overlay.xul
overlay	chrome://navigator/content/navigator.xul	chrome://roomybookmarkstoolbar/content/overlay.xul
style chrome://global/content/customizeToolbar.xul	chrome://roomybookmarkstoolbar/skin/css/button.css
`;

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
        window.BrowserUtils.restartApplication();
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

  const window = Services.wm.getMostRecentWindow('navigator:browser');
  if (reason === ADDON_UPGRADE || reason === ADDON_DOWNGRADE) {
      showRestartNotifcation("upgraded", window);
      return;
  } else if (reason === ADDON_ENABLE) {
      showRestartNotifcation("re-enabled", window);
      return;
  }

  if (reason === ADDON_INSTALL || reason === ADDON_ENABLE) {
    var enumerator = Services.wm.getEnumerator(null);
    while (enumerator.hasMoreElements()) {
      var win = enumerator.getNext();

      (async function (win) {
        let chromeManifest = new ChromeManifest(function () { return man; }, options);
        await chromeManifest.parse();
        if (win.document.constructor.name === "XULDocument") {
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
        if (document.constructor.name === "XULDocument") {
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
}
