import Vue from "vue";
import Vuex from "vuex";
import JSZip from "jszip";
import { assign, flatten, groupBy, map, values } from "lodash";
import Fuse from "fuse.js";

Vue.use(Vuex);

/**
 * @typedef {object} Shortcut
 * @property {string} name
 * @property {boolean} selected
 * @property {string} [escapedName]
 * @property {string} [image]
 * @property {Uint8Array} [data]
 * @property {number} [size]
 */

export default new Vuex.Store({
  state: {
    /** @type {Shortcut[]} */
    shortcuts: [],
    preferences: {

    },
    language: {},
    showMainTitle: true,
    showBackButton: false
  },
  mutations: {
    shortcuts(state, data) {
      state.shortcuts = data;
      state.shortcuts.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    },
    preferences(state, data) {
      state.preferences = data;
    },
    language(state, data) {
      state.language = data;
    },
    showMainTitle(state, data) {
      state.showMainTitle = data;
    },
    showBackButton(state, data) {
      state.showBackButton = data;
    }
  },
  actions: {
    async loadShortcuts({ commit }) {
      const zipData = document.getElementById("datastore").innerText.replace(/\s+/g, "");
      if (!zipData) return;

      const zip = await JSZip.loadAsync(zipData, { base64: true });
      const proms = [];

      zip.forEach((relativePath, file) => {
        if (relativePath.endsWith("data.json")) {
          proms.push(file.async("text").then((content) => {
            content = JSON.parse(content);
            return content.names.map((n, i) => {
              return {
                name: n,
                size: content.size[i]
              };
            });
          }));
        } else if (relativePath.endsWith(".png")) {
          proms.push(file.async("base64").then((content) => {
            return {
              name: relativePath.replace(/\.png$/, ""),
              image: content
            };
          }));
        } else if (relativePath.endsWith(".shortcut") || relativePath.endsWith(".wflow")) {
          proms.push(file.async("uint8array").then((content) => {
            return {
              name: relativePath.replace(/\.(shortcut|wflow)$/, ""),
              shortcut: content
            };
          }));
        }
      });

      let shortcuts = await Promise.all(proms);
      shortcuts = map(values(groupBy(flatten(shortcuts), "name")), (i) => {
        return assign({ selected: false }, ...i);
      });
      let noImage = shortcuts.filter(s => !s.image);
      let noSize = shortcuts.filter(s => !s.size);
      if (noImage.length || noSize.length) {
        if (noImage.length === noSize.length) {
          const fuse = new Fuse(noImage, {
            keys: ["name"],
            threshold: 0.2
          });
          for (const i of noSize) {
            const match = fuse.search(i.name);
            if (match.length) {
              match[0].item.image = i.image;
              shortcuts.splice(shortcuts.indexOf(i), 1);
            }
          }
          noImage = shortcuts.filter(s => !s.image);
          noSize = shortcuts.filter(s => !s.size);
        }
        if (noImage.length || noSize.length) {
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
