import Vue from "vue";
import Vuex from "vuex";
import { assign, groupBy, map, values } from "lodash";
import FlexSearch from "flexsearch";
import TarGZ from "@/utils/targz";
import { Buffer } from "buffer";
import { stringFromBinaryString } from "@/utils/binaryStringToUTF8";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    /** @type {Store.Shortcut[]} */
    shortcuts: [],
    preferences: {

    },
    language: {},
    showMainTitle: true,
    showBackButton: false,
    /** @type {Store.ProcessResult[]} */
    processResult: [],
    globals: {
      functionDefinition: "cut [n], copy [n], save [remove|replace] [n], end [paste|insert], pause [n], resume [n], " +
        "paste [replace [n]], insert [replace [n]]",
      noSnippetName: " "
    },
    snippetListItemEditing: false,
    snippetActions: {
      title: null,
      bplist: null
    },
    userPreferencesChanged: false
  },
  mutations: {
    shortcuts(state, data) {
      state.shortcuts = data;
      state.shortcuts.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
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
      state.processResult = data;
    },
    snippetListItemEditing(state, data) {
      state.snippetListItemEditing = data;
    },
    snippetActions(state, data) {
      state.snippetActions = data;
    }
  },
  actions: {
    async loadShortcuts({ commit }) {
      const zipData = document.getElementById("datastore").innerText.replace(/\s+/g, "");
      if (!zipData) return;

      const zipFiles = await new Promise((resolve, reject) => {
        TarGZ.parse(atob(zipData), (f) => {
          resolve(f.filter(f => !f.filename.startsWith("PaxHeader")).map(f => {
            f.filename = stringFromBinaryString(f.filename);
            return f;
          }));
        }, null, (error) => {
          /* eslint-disable-next-line no-console */
          console.error("Error in TarGZ.parse():", error);
          reject(error);
        });
      });
      const files = [];

      zipFiles.forEach(({ filename, data }) => {
        if (filename.endsWith("data.json")) {
          const content = JSON.parse(stringFromBinaryString(data));
          files.push(...content.names.map((n, i) => {
            return {
              name: n,
              size: content.size[i]
            };
          }));
        } else if (filename.endsWith(".png")) {
          const blob = new Blob([Buffer.from(data, "binary")]);
          files.push({
            name: filename.replace(/\.png$/, ""),
            image: URL.createObjectURL(blob)
          });
        } else if (filename.endsWith(".shortcut") || filename.endsWith(".wflow")) {
          const content = Buffer.from(data, "binary");
          files.push({
            name: filename.replace(/\.(shortcut|wflow)$/, ""),
            data: content
          });
        }
      });

      const shortcuts = map(values(groupBy(files, "name")), (i) => {
        return assign({ selected: false }, ...i);
      });
      let noImage = shortcuts.filter(s => !s.image);
      let noSize = shortcuts.filter(s => !s.size);
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
          noImage = shortcuts.filter(s => !s.image);
          noSize = shortcuts.filter(s => !s.size);
        }
        if (noImage.length || noSize.length) {
          // expose the two arrays for debugging
          window.shortcutsNoImage = noImage;
          window.shortcutsNoSize = noSize;
          /* eslint-disable-next-line no-console */
          console.warn(
            `There are ${noImage.length}/${noSize.length} shortcuts without an image/a size:`,
            noImage,
            noSize
          );
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
    }
  }
});
