import tarball from "tarballjs";
import gzip from "gzip-js";
import { Buffer } from "buffer";
import store from "@/store/index";
import router from "@/router";

let closePageTimeoutId = 0;

/**
 * Opens the Shortcut to perform some actions
 * @param {object} options
 * @param {string[]} options.actions Array of actions the Shortcut should
 * perform
 * @param {boolean} [options.closePage] If `true`, closes the current page after
 * the user switched to Shortcuts
 * @param {boolean} [options.toMainMenu] If `true`, switches to main menu after
 * the user has been redirected to the app
 * @param {string[]} [options.messages] Messages that should be displayed
 * @param {"push" | "replace"} [options.routerMethod] The router method to use.
 * Defaults to `"push"`
 * @param {object[]} [options.data] Array of files that are passed as data to
 * the Shortcut
 * @param {string} options.data[].name Filename
 * @param {string | ArrayBuffer | Uint8Array | Buffer | Blob
 *    } options.data[].content Content of the file
 * @param {object} [options.data[].tarOptions] Options for JSZip
 * @see https://github.com/schl3ck/tarballjs/blob/master/tarball.js#L380
 */
export function navigateAndBuildZip(options) {
  if (!options) {
    throw new TypeError("navigateAndBuildZip: missing options");
  }
  if (!options.actions) {
    throw new TypeError(
      "navigateAndBuildZip: missing options property 'actions'",
    );
  }
  if (
    options.routerMethod
    && options.routerMethod !== "push"
    && options.routerMethod !== "replace"
  ) {
    throw new TypeError(
      'navigateAndBuildZip: routerMethod has to be either "push" or "replace"',
    );
  }

  if (router.currentRoute.name === "OpenApp") {
    navigated();
  } else {
    router[options.routerMethod || "push"]({ name: "OpenApp" }).then(navigated);
  }

  async function navigated() {
    const OpenApp = store.state.activeRouterView;
    OpenApp.options = options;
    OpenApp.base64 = "";
    OpenApp.done = false;
    OpenApp.percent = null;
    OpenApp.offerArchiveRebuild = false;

    if (
      store.state.userPreferencesChanged
      && !options.actions.includes("Preferences.save")
    ) {
      options.actions.push("Preferences.save");
      options.data = options.data || [];
      options.data.push({
        name: "preferences.txt",
        content: JSON.stringify(store.getters.preferencesForSaving),
      });
    }

    if (
      store.state.snippetsChanged
      && !options.actions.includes("Snippets.save")
    ) {
      options.actions.push("Snippets.save");
      options.data = options.data || [];
      options.data.push({
        name: "snippets.txt",
        content: JSON.stringify(store.getters.snippetsForSaving).replace(
          /\ufffc/g,
          "\\ufffc",
        ),
      });
    }

    if (
      store.state.icloudUrlsChanged
      && !options.actions.includes("Shortcuts.saveiCloudUrls")
    ) {
      options.actions.push("Shortcuts.saveiCloudUrls");
      options.data = options.data || [];
      options.data.push({
        name: "icloud urls.txt",
        content: JSON.stringify({ urls: store.state.icloudUrls }),
      });
    }

    const tar = new tarball.TarWriter();
    tar.addTextFile("actions.txt", options.actions.join("\n"));
    if (options.data && options.data.length) {
      for (const item of options.data) {
        if (typeof item.content === "string") {
          tar.addTextFile(item.name, item.content, item.tarOptions);
        } else {
          tar.addFileArrayBuffer(
            item.name,
            Uint8Array.from(item.content),
            item.tarOptions,
          );
        }
      }
    }

    const arr = await tar.write((percent) => {
      OpenApp.percent = percent;
    });
    const base64 = Buffer.from(gzip.zip(arr, { level: 9 })).toString("base64");
    OpenApp.done = true;
    OpenApp.base64 = base64;

    // setTimeout(() => {
    //   OpenApp.percent = 0;
    //   const interval = setInterval(() => {
    //     OpenApp.percent++;
    //     if (OpenApp.percent >= 100) {
    //       clearInterval(interval);
    //       OpenApp.done = true;
    //     }
    //   }, 50);
    // }, 1000);
  }
}

/**
 * Open the shortcuts app now
 * @param {string} shortcutInput A string that is passed to the shortcut
 * @param {object} [options]
 * @param {boolean} [options.closePage] `true` when the window/tab should be
 * closed after opening the app
 * @param {boolean} [options.toMainMenu] `true` when it should return to the
 * main menu after opening the app
 * @param {boolean} [options.doNotRun] `true` when only the app should be opened
 * but the shortcut should not be executed
 * @param {"push" | "replace"} [options.routerMethod] The method to use for
 * navigating to the main menu. Defaults to `"push"`
 */
export function openNow(shortcutInput, options) {
  options = options || {};

  const closeTab = () => {
    closePageTimeoutId = setTimeout(
      window.close,
      store.state.preferences.Preferences.closePageTimeout * 1000 - 2000,
    );
  };
  const mainMenu = () => {
    router[options.routerMethod || "push"]({ name: "MainMenu" });
  };
  const timeout = (callback) => {
    setTimeout(callback, 2000);
  };

  const action = options.closePage
    ? closeTab
    : options.toMainMenu
      ? mainMenu
      : null;
  if (options.closePage) {
    store.commit("probablyOutdated", true);
  }
  timeout(() => {
    action && action();
  });
  if (options.doNotRun) {
    // eslint-disable-next-line no-console
    console.log("switching to app");
    location.href = "shortcuts://";
  } else {
    // assume that the method `navigateAndBuildZip` built the .tar.gz so there
    // are any unsaved changes in it
    store.commit("userChangesSaved");

    const url = `shortcuts://run-shortcut?name=${encodeURIComponent(
      store.state.preferences["Shortcut Name"],
    )}&input=${shortcutInput}`;
    // eslint-disable-next-line no-console
    console.log("switching to app with url", url);
    if (process.env.NODE_ENV !== "development") {
      location.href = url;
    }
  }
}

/**
 * Open `url` and close this page afterwards
 * @param {string} url
 */
export function openURLAndCloseSelf(url) {
  location.href = url;
  closePageTimeoutId = setTimeout(() => {
    window.close();
  }, store.state.preferences.Preferences.closePageTimeout * 1000);
}

/**
 * Cancels the timeout which will close this page
 * @returns `true` when there was a timeout to cancel, `false` otherwise
 */
export function cancelClosing() {
  if (closePageTimeoutId) {
    clearTimeout(closePageTimeoutId);
    closePageTimeoutId = 0;
    return true;
  } else {
    return false;
  }
}
