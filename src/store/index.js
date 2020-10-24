import Vue from "vue";
import Vuex from "vuex";
import { assign, groupBy, map, values } from "lodash";
import FlexSearch from "flexsearch";
import TarGZ from "@/utils/targz";
import { Buffer } from "buffer";
import { stringFromBinaryString } from "@/utils/binaryStringToUTF8";

import prefConstraints from "@/assets/prefConstraints.json";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    /** @type {Store.Shortcut[]} */
    shortcuts: [],
    /** @type {Store.AppSettings} */
    preferences: {},
    prefConstraints: prefConstraints,
    language: {},
    showMainTitle: true,
    showBackButton: false,
    /** @type {Store.ProcessResult[]} */
    processResult: [],
    globals: {
      functionDefinition:
        "cut [n], copy [n], save [remove|replace] [n], end [paste|insert], "
        + "pause [n], resume [n], paste [replace [n]], insert [replace [n]]",
      noSnippetName: " ",
    },
    snippetListItemEditing: false,
    userPreferencesChanged: false,
    snippets: [],
    snippetsChanged: false,
    importURLs: null,
    /** @type {Store.UpdateAvailable} */
    updateAvailable: false,
    // {
    //   version: "2.1",
    //   url: "localhost:8080/update",
    //   notes: "new version notes should go here. how about\nline breaks?",
    //   release: new Date()
    // },
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
  },
  mutations: {
    shortcuts(state, data) {
      state.shortcuts = data;
      state.shortcuts.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
    },
    preferences(state, data) {
      state.preferences = data;
    },
    userPreferences(state, data) {
      Object.assign(state.preferences.Preferences, data);
      state.userPreferencesChanged = true;
    },
    language(state, data) {
      state.language = data;
    },
    showMainTitle(state, data) {
      state.showMainTitle = data;
    },
    showBackButton(state, data) {
      state.showBackButton = data;
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
      const files = [];

      zipFiles.forEach(({ filename, data }) => {
        if (filename.endsWith("data.json")) {
          const content = JSON.parse(stringFromBinaryString(data));
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
            name: filename.replace(/\.png$/, ""),
            image: URL.createObjectURL(blob),
          });
        } else if (
          filename.endsWith(".shortcut")
          || filename.endsWith(".wflow")
        ) {
          const content = Buffer.from(data, "binary");
          files.push({
            name: filename.replace(/\.(shortcut|wflow)$/, ""),
            data: content,
          });
        } else if (filename === "snippets.json") {
          const snippets = JSON.parse(stringFromBinaryString(data));
          if (snippets && snippets.snippets && snippets.snippets.length) {
            commit("snippets", snippets.snippets);
          }
        } else if (filename === "import urls.json") {
          const content = JSON.parse(stringFromBinaryString(data));
          commit("importURLs", content);
        } else if (filename === "icloud urls.json") {
          const content = JSON.parse(stringFromBinaryString(data));
          commit(
            "icloudUrls",
            content.urls.map((i) => {
              i.date = new Date(i.date);
              return i;
            }),
          );
        }
      });

      const shortcuts = map(values(groupBy(files, "name")), (i) => {
        return assign({ selected: false }, ...i);
      });
      if (process.env.NODE_ENV === "development") {
        let noImage = shortcuts.filter((s) => !s.image);
        let noSize = shortcuts.filter((s) => !s.size);
        if (noImage.length || noSize.length) {
          if (noImage.length === noSize.length) {
            const fuzzy = new FlexSearch("match");
            noImage.forEach((s, i) => fuzzy.add(i, s.name.replace(/\//g, ":")));
            for (const i of noSize) {
              const match = fuzzy.search(i.name);
              if (match.length) {
                noImage[match[0]].image = i.image;
                shortcuts.splice(shortcuts.indexOf(i), 1);
              }
            }
            noImage = shortcuts.filter((s) => !s.image);
            noSize = shortcuts.filter((s) => !s.size);
          }
          if (noImage.length || noSize.length) {
            // expose the two arrays for debugging
            window.shortcutsNoImage = noImage;
            window.shortcutsNoSize = noSize;
            /* eslint-disable-next-line no-console */
            console.warn(
              `There are ${noImage.length}/${noSize.length} shortcuts without an image/a size:`,
              noImage,
              noSize,
            );
          }
        }
      }
      commit("shortcuts", shortcuts);
    },
    loadPreferences({ commit }) {
      const prefsData = document.getElementById("preferences").innerText.trim();
      if (!prefsData) return;

      const prefs = JSON.parse(prefsData);
      if (!prefs) return;

      commit("preferences", prefs);
    },
    loadLanguage({ commit }) {
      const prefsData = document.getElementById("language").innerText.trim();
      if (!prefsData) return;

      const prefs = JSON.parse(prefsData);
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
    /** @returns {Store.ShortcutsToImport} */
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
  },
});
