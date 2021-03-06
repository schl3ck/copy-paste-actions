import Vue from "vue";
import Vuex from "vuex";
import { assign, groupBy, map, values } from "lodash";
import TarGZ from "@/utils/targz";
import { Buffer } from "buffer";
import { stringFromBinaryString } from "@/utils/binaryStringToUTF8";

import prefConstraints from "@/assets/prefConstraints.json";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    /** @type {Vue} */
    activeRouterView: null,
    showHistoryOverview: false,
    /** @type {Store.Shortcut[]} */
    shortcuts: [],
    /** @type {Store.AppSettings} */
    preferences: {},
    prefConstraints: Object.assign({}, prefConstraints),
    language: {},
    showMainTitle: true,
    useGlobalContainer: true,
    /** @type {Store.ProcessResult[]} */
    processResult: [],
    globals: {
      functionDefinition:
        '<ul class="mb-0"><li><code>cut [n]</code></li>'
        + "<li><code>copy [n]</code></li>"
        + "<li><code>save [remove|replace] [n]</code></li>"
        + "<li><code>end [paste|insert]</code></li>"
        + "<li><code>pause [n]</code></li>"
        + "<li><code>resume [n]</code></li>"
        + "<li><code>paste [replace [n]]</code></li>"
        + "<li><code>insert [replace [n]]</code></li></ul>",
      noSnippetName: " ",
    },
    snippetListItemEditing: false,
    userPreferencesChanged: false,
    snippets: [],
    snippetsChanged: false,
    /** @type { {shortcuts: string[], urls: string[]} } */
    importURLs: null,
    /** @type {Store.UpdateAvailable} */
    updateAvailable: false,
    // {
    //   version: "2.2",
    //   url: "localhost:8080/update",
    //   notes: "new version notes should go here. how about\nline breaks?",
    //   notesHtml: "<ul><li>a bullet</li><li>another bullet<br>with a line break</li></ul>",
    //   release: new Date(),
    // },
    hideUpdateBanner: false,
    probablyOutdated: false,
    /** @type {Store.ICloudUrl[]} */
    icloudUrls: [
      // {
      //   name: "CopyPaste Test Shortcut",
      //   url: "https://www.icloud.com/shortcuts/1",
      //   date: new Date(),
      // },
      // {
      //   name: "CopyPaste Test Shortcut no items",
      //   url: "https://www.icloud.com/shortcuts/2",
      //   date: new Date(),
      // },
    ],
    icloudUrlsChanged: false,
    changedAutoLoadShortcuts: false,
    parsingErrors: {
      snippets: false,
      importUrls: false,
      icloudUrls: false,
      selectedShortcuts: false,
    },
  },
  mutations: {
    activeRouterView(state, component) {
      state.activeRouterView = component;
    },
    showHistoryOverview(state, value) {
      state.showHistoryOverview = value;
    },
    shortcuts(state, data) {
      state.shortcuts = data;
      state.shortcuts.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
    },
    preferences(state, data) {
      const lookup = {};
      for (const [key, val] of Object.entries(data.availableLanguages)) {
        lookup[val] = key;
      }
      data["Default Preferences"].language =
        lookup[data["Default Preferences"].language];
      data.Preferences.language = lookup[data.Preferences.language];
      state.preferences = data;
      state.prefConstraints.language = Object.keys(data.availableLanguages);
    },
    userPreferences(state, data) {
      Object.assign(state.preferences.Preferences, data);
      state.userPreferencesChanged = true;
    },
    firstRun(state) {
      state.preferences["First Run"] = false;
    },
    language(state, data) {
      state.language = data;
    },
    showMainTitle(state, data) {
      state.showMainTitle = data;
    },
    useGlobalContainer(state, data) {
      state.useGlobalContainer = data;
    },
    processResult(state, data) {
      for (const shortcut of data.shortcuts) {
        for (const snippet of shortcut.snippets) {
          snippet.discard = false;
          snippet.description = "";
        }
        for (const insert of shortcut.inserts) {
          insert.exclude = false;
        }
      }
      state.processResult = data;
    },
    snippetListItemEditing(state, data) {
      state.snippetListItemEditing = data;
    },
    snippets(state, data) {
      if (!Array.isArray(data)) {
        data = [data];
      }
      state.snippets = data;
    },
    replaceSnippets(state, data) {
      if (!Array.isArray(data)) {
        data = [data];
      }
      for (const item of data) {
        const i = state.snippets.findIndex(
          (s) => s.name === item.name && s.isClipboard === item.isClipboard,
        );
        if (i >= 0) {
          state.snippets.splice(i, 1, item);
        } else {
          state.snippets.push(item);
        }
      }

      state.snippetsChanged = true;
    },
    removeSnippet(state, data) {
      if (!Array.isArray(data)) {
        data = [data];
      }
      for (const item of data) {
        const i = state.snippets.findIndex(
          (s) => s.name === item.name && s.isClipboard === item.isClipboard,
        );
        if (i >= 0) {
          state.snippets.splice(i, 1);
        }
      }

      state.snippetsChanged = true;
    },
    /**
     * @param {
     *  {snippet: object, new: object}
     * } data `snippet` is the original object (must be the same reference!),
     *  `new` contains all new properties
     */
    updateSnippet(state, data) {
      const snippet = state.snippets.find((s) => s === data.snippet);
      Object.assign(snippet, data.new);
      state.snippetsChanged = true;
    },
    importURLs(state, data) {
      state.importURLs = data;
    },
    updateAvailable(state, data) {
      state.updateAvailable = data;
    },
    hideUpdateBanner(state) {
      state.hideUpdateBanner = true;
    },
    userChangesSaved(state) {
      state.userPreferencesChanged = false;
      state.snippetsChanged = false;
      state.icloudUrlsChanged = false;
    },
    probablyOutdated(state, data) {
      state.probablyOutdated = data;
    },
    icloudUrls(state, data) {
      state.icloudUrls = data;
    },
    removeiCloudUrl(state, url) {
      state.icloudUrls.splice(
        state.icloudUrls.findIndex((i) => i.url === url),
        1,
      );
      state.icloudUrlsChanged = true;
    },
    changedAutoLoadShortcuts(state) {
      state.changedAutoLoadShortcuts = true;
    },
    /**
     * @param {"snippets"
     *  | "importUrls"
     *  | "icloudUrls"
     *  | "selectedShortcuts"
     * } what
     */
    parsingErrors(state, what) {
      if (what in state.parsingErrors) {
        state.parsingErrors[what] = true;
      }
    },
  },
  actions: {
    async loadShortcuts({ commit }) {
      const zipData = document
        .getElementById("datastore")
        .innerText.replace(/\s+/g, "");
      if (!zipData) return;

      const zipFiles = await new Promise((resolve, reject) => {
        TarGZ.parse(
          atob(zipData),
          (f) => {
            resolve(
              f
                .filter((f) => !f.filename.startsWith("PaxHeader"))
                .map((f) => {
                  f.filename = stringFromBinaryString(f.filename);
                  return f;
                }),
            );
          },
          null,
          (error) => {
            /* eslint-disable-next-line no-console */
            console.error("Error in TarGZ.parse():", error);
            reject(error);
          },
        );
      });
      /** @type { {name: string, data: Buffer}[] } */
      const files = [];
      let selectedShortcuts = [];

      zipFiles.forEach(({ filename, data }) => {
        if (filename.endsWith("data.json")) {
          const content = JSON.parse(
            decodeOptionalURI(stringFromBinaryString(data)),
          );
          files.push(
            ...content.names.map((n, i) => {
              return {
                name: n,
                size: content.size[i],
              };
            }),
          );
        } else if (filename.endsWith(".png")) {
          const blob = new Blob([Buffer.from(data, "binary")]);
          files.push({
            name: stringFromBinaryString(
              atob(filename.replace(/\.png$/, "").replace(/:/g, "/")),
            ),
            image: URL.createObjectURL(blob),
          });
        } else if (
          filename.endsWith(".shortcut")
          || filename.endsWith(".wflow")
        ) {
          const content = Buffer.from(data, "binary");
          files.push({
            name: stringFromBinaryString(
              atob(
                filename.replace(/\.(shortcut|wflow)$/, "").replace(/:/g, "/"),
              ),
            ),
            data: content,
          });
        } else if (filename === "snippets.json") {
          try {
            const snippets = JSON.parse(
              decodeOptionalURI(stringFromBinaryString(data)),
            );
            if (snippets && snippets.snippets && snippets.snippets.length) {
              commit("snippets", snippets.snippets);
            }
          } catch (err) {
            commit("parsingErrors", "snippets");
          }
        } else if (filename === "import urls.json") {
          try {
            const content = JSON.parse(
              decodeOptionalURI(stringFromBinaryString(data)),
            );
            commit("importURLs", content);
          } catch (err) {
            commit("parsingErrors", "importUrls");
          }
        } else if (filename === "icloud urls.json") {
          try {
            let content = JSON.parse(
              decodeOptionalURI(stringFromBinaryString(data)),
            );
            content = Array.isArray(content.urls)
              ? content.urls
              : [content.urls];
            commit(
              "icloudUrls",
              content.map((i) => {
                i.date = new Date(i.date);
                return i;
              }),
            );
          } catch (err) {
            commit("parsingErrors", "icloudUrls");
          }
        } else if (filename === "selectedShortcuts.json") {
          try {
            const content = JSON.parse(
              decodeOptionalURI(stringFromBinaryString(data)),
            );
            selectedShortcuts = content.names;
          } catch (err) {
            commit("parsingErrors", "selectedShortcuts");
          }
        }
      });

      const shortcuts = map(values(groupBy(files, "name")), (i) => {
        const name = i[0].name;
        return assign({ selected: selectedShortcuts.includes(name) }, ...i);
      });
      commit("shortcuts", shortcuts);
    },
    loadPreferences({ commit }) {
      const prefsData = document.getElementById("preferences").innerText.trim();
      if (!prefsData) return;

      const prefs = JSON.parse(decodeOptionalURI(prefsData));
      if (!prefs) return;

      commit("preferences", prefs);
    },
    loadLanguage({ commit }) {
      const prefsData = document.getElementById("language").innerText.trim();
      if (!prefsData) return;

      const prefs = JSON.parse(decodeOptionalURI(prefsData));
      if (!prefs) return;

      commit("language", prefs);
    },
  },
  getters: {
    langToMainMenu(state) {
      return state.language.toMainMenu;
    },
    hasUnsavedChanges(state) {
      return (
        state.snippetsChanged
        || state.userPreferencesChanged
        || state.icloudUrlsChanged
      );
    },
    snippetsForSaving(state) {
      return {
        snippets: state.snippets.map((s) => {
          return {
            actions: s.actions,
            isClipboard: s.isClipboard,
            name: s.name,
            numberOfActions: s.numberOfActions,
            uuids: s.uuids,
          };
        }),
      };
    },
    preferencesForSaving(state) {
      const prefs = Object.assign({}, state.preferences.Preferences);
      prefs.language = state.preferences.availableLanguages[prefs.language];
      return prefs;
    },
    /** @returns {Store.ShortcutToImport} */
    shortcutsToImport(state) {
      const shortcuts = state.shortcuts;
      const toImport = state.importURLs;
      return toImport.shortcuts.map((shortcut, index) => {
        return {
          name: shortcut,
          url: toImport.urls[index],
          image: shortcuts.find((s) => s.name === shortcut).image,
          done: false,
        };
      });
    },
    /** @returns {Store.ICloudShortcut[]} */
    icloudUrls(state) {
      const shortcuts = state.shortcuts;
      const icloudUrls = state.icloudUrls;
      return icloudUrls.map((shortcut) => {
        const s = shortcuts.find((s) => s.name === shortcut.name);
        return {
          ...shortcut,
          image: s && s.image,
        };
      });
    },
    loadedShortcuts(state) {
      return state.shortcuts.filter((s) => s.data);
    },
  },
});

/**
 * @param {string} str
 */
function decodeOptionalURI(str) {
  if (str.startsWith("%7b") || str.startsWith("%7B")) {
    return decodeURIComponent(str);
  } else {
    return str;
  }
}
