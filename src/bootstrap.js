const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
let cuiModule;
try {
  cuiModule = ChromeUtils.importESModule("moz-src:///browser/components/customizableui/CustomizableUI.sys.mjs");
} catch(e) {
  cuiModule = ChromeUtils.importESModule("resource:///modules/CustomizableUI.sys.mjs");
}
const { CustomizableUI } = cuiModule;

let Globals = {};

function install() { }
function uninstall() { }

function loadIntoBrowserDocument(document) {
  if (document.createXULElement &&
      document.defaultView &&
      document.defaultView.location.origin + document.defaultView.location.pathname === "chrome://browser/content/browser.xhtml") {
    
    // Prevent duplicate injection
    if (document.defaultView.roomybookmarkstoolbar) return;

    (document.ownerGlobal ?? document.documentGlobal).roomybookmarkstoolbarGlobals = Globals;
    Services.scriptloader.loadSubScript("chrome://roomybookmarkstoolbar/content/overlay.js", document.defaultView);
  }
}

const documentObserver = {
  observe(document, topic, data) {
    if (topic === "chrome-document-loaded") {
      loadIntoBrowserDocument(document);
    }
  }
};

async function startup(data, reason) {
  Services.scriptloader.loadSubScript("chrome://roomybookmarkstoolbar/content/prefs.js", {}, 'UTF-8');

  // Register CustomizableUI widget
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
  } catch (error) {}

  // Load into all current open windows
  const enumerator = Services.wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    const win = enumerator.getNext();
    loadIntoBrowserDocument(win.document);
  }

  // Listen for new windows
  Services.obs.addObserver(documentObserver, "chrome-document-loaded");

  // Bypass signature check if preferred
  try {
    const addon = await AddonManager.getAddonByID(data.id);
    if (addon && addon.__AddonInternal__) {
      addon.__AddonInternal__.signedState = Services.prefs.getBoolPref("extensions.roomybookmarkstoolbar.hide_warning", false)
        ? AddonManager.SIGNEDSTATE_NOT_REQUIRED
        : AddonManager.SIGNEDSTATE_MISSING;
    }
  } catch (e) {}
}

function shutdown(data, reason) {
  if (reason === APP_SHUTDOWN) {
    return;
  }

  // Unregister window observer
  try {
    Services.obs.removeObserver(documentObserver, "chrome-document-loaded");
  } catch (e) {}

  // Remove CustomizableUI widget
  try {
    CustomizableUI.destroyWidget('rbtlibbutton');
  } catch (e) {}

  // Clean up injected overlay in all open browser windows
  const enumerator = Services.wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    const win = enumerator.getNext();
    
    if (win.roomybookmarkstoolbar && typeof win.roomybookmarkstoolbar.unload === 'function') {
      try {
        win.roomybookmarkstoolbar.unload();
      } catch (e) {
        console.error("Error unloading roomybookmarkstoolbar:", e);
      }
      delete win.roomybookmarkstoolbar;
    }
  }
}
