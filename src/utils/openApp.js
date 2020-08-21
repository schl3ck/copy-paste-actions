import tarball from "tarballjs";
import gzip from "gzip-js";
import { Buffer } from "buffer";

/**
 * Opens the Shortcut to perform some actions
 * @param {import("vue").default} root
 * @param {object} options
 * @param {string[]} options.actions Array of actions the Shortcut should perform
 * @param {boolean} [options.closePage] If `true`, closes the current page after the user switched to Shortcuts
 * @param {boolean} [options.toMainMenu] If `true`, switches to main menu after the user has been redirected to the app
 * @param {object[]} [options.data] Array of files that are passed as data to the Shortcut
 * @param {string} options.data[].name Filename
 * @param {string | ArrayBuffer | Uint8Array | Buffer | Blob} options.data[].content Content of the file
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

    if (OpenApp.$store.state.userPreferencesChanged && !options.actions.includes("Preferences.save")) {
      options.actions.push("Preferences.save");
      options.data = options.data || [];
      options.data.push({
        name: "preferences.json",
        content: JSON.stringify(OpenApp.$store.state.preferences.Preferences)
      });
    }

    const tar = new tarball.TarWriter();
    tar.addTextFile("actions.txt", options.actions.join("\n"));
    if (options.data && options.data.length) {
      for (const item of options.data) {
        if (typeof item.content === "string") {
          tar.addTextFile(item.name, item.content, item.tarOptions);
        } else {
          tar.addFileArrayBuffer(item.name, Uint8Array.from(item.content), item.tarOptions);
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
