import JSZip from "jszip";

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
 * @param {object} [options.data[].zipOptions] Options for JSZip
 * @see https://stuk.github.io/jszip/documentation/api_jszip/file_data.html
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

    const zip = new JSZip();
    zip.file("actions.txt", options.actions.join("\n"), {
      createFolders: false
    });
    if (options.data && options.data.length) {
      for (const item of options.data) {
        const options = {
          createFolders: false
        };
        if (item.zipOptions) {
          Object.assign(options, item.zipOptions);
        }
        zip.file(item.name, item.content, options);
      }
    }

    const base64 = await zip.generateAsync({
      type: "base64",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9
      }
    }, function onUpdate(metadata) {
      OpenApp.percent = metadata.percent;
    });
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
