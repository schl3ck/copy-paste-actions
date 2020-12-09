import tarball from "tarballjs";
import gzip from "gzip-js";
import { Buffer } from "buffer";
import store from "@/store/index";

/**
 * Opens the Shortcut to perform some actions
 * @param {import("vue").default} root
 * @param {object} options
 * @param {string[]} options.actions Array of actions the Shortcut should
 * perform
 * @param {boolean} [options.closePage] If `true`, closes the current page after
 * the user switched to Shortcuts
 * @param {boolean} [options.toMainMenu] If `true`, switches to main menu after
 * the user has been redirected to the app
 * @param {string[]} [options.messages] Messages that should be displayed
 * @param {object[]} [options.data] Array of files that are passed as data to
 * the Shortcut
 * @param {string} options.data[].name Filename
 * @param {
 *    string | ArrayBuffer | Uint8Array | Buffer | Blob
 * } options.data[].content Content of the file
 * @param {object} [options.data[].tarOptions] Options for JSZip
 * @see https://github.com/schl3ck/tarballjs/blob/master/tarball.js#L380
 */
export function navigateAndBuildZip(root, options) {
  if (!root) {
    throw new TypeError("Missing parameter 'root'");
  }
  if (!options.actions) {
    throw new TypeError("Missing property 'actions'");
  }

  root.$once("navigated.OpenApp", navigated);
  root.$emit("navigate", "OpenApp");

  async function navigated(OpenApp) {
    OpenApp.options = options;
    OpenApp.base64 = "";
    OpenApp.done = false;
    OpenApp.percent = null;

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

const timeoutIds = [];

/**
 * Open the shortcuts app now
 * @param {import("vue")} $root The root Vue instance
 * @param {string} shortcutInput A string that is passed to the shortcut
 * @param {
 *    {closePage?: boolean, toMainMenu?: boolean, doNotRun?: boolean}
 * } options
 */
export function openNow($root, shortcutInput, options) {
  const close = () => {
    timeoutIds.push(
      setInterval(() => {
        window.close();
      }, 250),
    );
  };
  const mainMenu = () => {
    $root.$emit("navigate", "MainMenu");
  };
  const timeout = (callback) => {
    timeoutIds.push(setTimeout(callback, 2000));
  };

  const action = options.closePage
    ? close
    : options.toMainMenu
      ? mainMenu
      : null;
  if (options.closePage) {
    store.commit("probablyOutdated", true);
  }
  if (options.doNotRun) {
    // eslint-disable-next-line no-console
    console.log("switching to app");
    location.href = "workflow://";
  } else {
    // assume that the method `navigateAndBuildZip` built the .tar.gz so there
    // are any unsaved changes in it
    store.commit("userChangesSaved");

    const url = `workflow://run-workflow?name=${encodeURIComponent(
      store.state.preferences["Shortcut Name"],
    )}&input=text&text=${shortcutInput}`;
    // eslint-disable-next-line no-console
    console.log("switching to app with url", url);
    location.href = url;
  }
  timeout(() => {
    action && action();
  });

  return timeoutIds;
}

/**
 * Open `url` and close this page afterwards
 * @param {string} url
 */
export function openURLAndCloseSelf(url) {
  location.href = url;
  return setInterval(() => {
    window.close();
  }, 250);
}
