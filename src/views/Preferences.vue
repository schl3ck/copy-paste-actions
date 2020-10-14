<template>
  <div>
    <h2 class="pt-1">
      {{ lang.title }}
    </h2>
    <div v-if="updateAvailable" class="card bg-warning mb-4">
      <div class="card-header font-weight-bold">
        {{ lang.updateAvailable.title }}
      </div>
      <div class="card-body pt-3 d-flex flex-row align-items-center justify-content-between">
        <div>
          <b class="mr-2">{{ lang.updateAvailable.version }}</b>
          {{ appSettings.Version }}
          <FontAwesomeIcon icon="long-arrow-alt-right" class="small" />
          {{ updateAvailable.version }}
          <br>
          <b class="mr-2">{{ lang.updateAvailable.releaseDate }}</b>
          {{ updateAvailable.release.toLocaleDateString() }}
          <template v-if="prefGlobal.ignoreVersion === updateAvailable.version">
            <br>{{ lang.updateAvailable.ignored }}
          </template>
        </div>
        <button class="btn btn-outline-dark" @click="showUpdate">
          <FontAwesomeIcon icon="chevron-left" class="rotate-180" />
        </button>
      </div>
    </div>

    <div v-if="prefGlobal.includeShortcutImages" class="card">
      <div class="card-header font-weight-bold">
        {{ lang.shortcutIconCache }}
      </div>
      <div class="card-body pt-3">
        <p>
          {{ langDescriptionForIconCache }}
        </p>
        <p>
          {{ lang.refreshIconCacheNote }}
        </p>
        <ButtonBar :buttons="cacheButtons" size="normal" />
      </div>
    </div>

    <hr>

    <div ref="list" class="transition-padding-bottom">
      <div v-for="(pref, index) in prefsWithLang" :key="pref.key" class="card mb-2">
        <label
          :for="pref.key"
          class="card-header d-flex flex-row justify-content-between align-items-center font-weight-bold"
        >
          {{ pref.lang.title }}
          <div v-if="pref.type === 'boolean'" class="custom-switch2">
            <input
              :id="pref.key"
              v-model="preferences[pref.key]"
              type="checkbox"
              class="custom-control-input"
              @change="prefChanged(index)"
            >
            <label class="custom-control-label" :for="pref.key" />
            <label
              v-if="preferences.switchCaption || pref.key === 'switchCaption'"
              class="custom-control-label-caption"
              :for="pref.key"
            />
          </div>
        </label>
        <ul v-if="pref.type !== 'boolean'" class="list-group list-group-flush">
          <li class="list-group-item">
            <template v-if="pref.type==='number'">
              <template v-if="Array.isArray(pref.constraints)">
                <div v-for="constraint in pref.constraints" :key="constraint" class="custom-control custom-radio">
                  <input
                    :id="pref.key + constraint"
                    v-model="preferences[pref.key]"
                    type="radio"
                    :name="pref.key"
                    class="custom-control-input"
                    :value="constraint"
                    @change="prefChanged(index)"
                  >
                  <label
                    class="custom-control-label"
                    :for="pref.key + constraint"
                  >{{ pref.lang.values[constraint] }}</label>
                </div>
              </template>
              <div v-else-if="pref.constraints" class="form-row align-items-center">
                <input
                  :id="pref.key"
                  v-model.number="preferences[pref.key]"
                  type="range"
                  class="custom-range col-10"
                  :min="pref.constraints.min"
                  :max="pref.constraints.max"
                  :step="pref.constraints.step"
                  @change="prefChanged(index)"
                >
                <input
                  v-model.number="preferences[pref.key]"
                  type="number"
                  class="form-control col-2"
                  :step="pref.constraints.step"
                  @change="prefChanged(index)"
                >
              </div>
            </template>
            <input
              v-else-if="pref.type === 'string'"
              :id="pref.key"
              v-model="preferences[pref.key]"
              type="text"
              class="form-control"
              @keyup.enter="$event.target.blur()"
              @keyup.esc="$event.target.blur()"
              @change="prefChanged(index)"
            >
          </li>
        </ul>
        <div class="card-body py-2">
          <div class="d-flex flex-row justify-content-between">
            <div class="text-muted small mr-3">
              <p class="mb-1">
                {{ pref.lang.description }}
              </p>
              <p class="mb-0">
                <b>{{ lang.defaultsTo }}</b>
                <code
                  v-if="pref.type === 'string' || (pref.type === 'number' && !Array.isArray(pref.constraints))"
                  class="ml-2"
                >{{ getDefault(pref) }}</code>
                <template v-else>
                  {{ getDefault(pref) }}
                </template>
              </p>
            </div>
            <div class="mw-content align-self-center">
              <button type="button" class="btn btn-outline-danger btn-sm" @click="reset(pref.key)">
                <FontAwesomeIcon icon="undo-alt" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div ref="toolbar" class="fixed-bottom container">
      <ButtonBar :buttons="buttons" />
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import ButtonBar from "@/components/ButtonBar.vue";
import { navigateAndBuildZip } from "@/utils/openApp";

/**
 * @typedef { {
 *   title: string,
 *   description: string,
 *   values?: {[key: string]: string}
 * } } LangItem
 */
/**
 * @typedef {number[] | {min: number, max: number, step: number}} Constraints
 */
export default {
  name: "Preferences",
  components: {
    ButtonBar
  },
  data() {
    return {
      /** @type {Store.Preferences} */
      preferences: {},
      lastChanged: false
    };
  },
  computed: {
    /** @returns {Store.AppSettings} */
    appSettings() {
      return this.$store.state.preferences;
    },
    /** @returns {Store.Preferences} */
    prefGlobal() {
      return this.appSettings.Preferences;
    },
    prefConstraints() {
      return this.$store.state.prefConstraints;
    },
    /** @returns {Store.Preferences} */
    prefDefault() {
      return this.appSettings["Default Preferences"];
    },
    /** @returns {object} */
    lang() {
      return this.$store.state.language.preferences;
    },
    prefsWithLang() {
      const res = Object.entries(this.preferences)
        .filter(([key, val]) => key !== "ignoreVersion")
        .map(([key, val]) => {
          return {
            key,
            /** @type {string | number | boolean} */
            value: val,
            type: typeof this.prefDefault[key],
            /** @type {Constraints} */
            constraints: this.prefConstraints[key],
            /** @type {LangItem} */
            lang:
              key in this.lang.prefs
                ? this.lang.prefs[key]
                : {
                  title: "" + key,
                  description: "This language entry does not exist."
                }
          };
        });
      res.sort((a, b) => a.lang.title.localeCompare(b.lang.title));
      return res;
    },
    /** @returns {boolean} */
    hasChanges() {
      return Object.entries(this.preferences).some(
        ([key, value]) => value !== this.prefGlobal[key]
      );
    },
    /** @returns {boolean} */
    notDefaultValues() {
      return Object.entries(this.preferences).some(
        ([key, value]) => value !== this.prefDefault[key]
      );
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      /** @type {ButtonBar.Button[]} */
      const res = [];
      if (this.hasChanges) {
        res.push({
          text: this.lang.saveLocal,
          class: "btn-success",
          icon: ["far", "save"],
          click: () => {
            this.$store.commit("userPreferences", this.preferences);
          }
        });
        res.push({
          text: this.lang.saveToApp,
          class: "btn-success",
          icon: ["far", "save"],
          click: () => {
            this.$store.commit("userPreferences", this.preferences);
            navigateAndBuildZip(this.$root, {
              actions: ["Build.toSafari"],
              closePage: false,
              toMainMenu: true
            });
          }
        });
      }
      if (this.notDefaultValues) {
        res.push({
          text: this.lang.resetAll,
          class: "btn-danger",
          icon: "undo-alt",
          click: () => {
            this.preferences = Object.assign({}, this.prefDefault);
          }
        });
      }
      if (this.hasChanges) {
        res.push({
          text: this.lang.discardChanges,
          class: "btn-secondary",
          icon: "times",
          click: () => {
            this.preferences = Object.assign({}, this.prefGlobal);
          }
        });
      }
      return res;
    },
    /** @returns {Store.UpdateAvailable} */
    updateAvailable() {
      return this.$store.state.updateAvailable;
    },
    /** @returns {number} */
    nIconsCached() {
      return this.$store.state.shortcuts.filter((s) => s.image).length;
    },
    /** @returns {number} */
    nShortcutsWithoutIcon() {
      return this.$store.state.shortcuts.length - this.nIconsCached;
    },
    /** @returns {string} */
    langDescriptionForIconCache() {
      let key = "";
      switch (this.nIconsCached) {
        case 0:
          key += "no";
          break;
        case 1:
          key += "singular";
          break;
        default:
          key += "plural";
          break;
      }
      key += "Icon";
      switch (this.nShortcutsWithoutIcon) {
        case 0:
          key += "No";
          break;
        case 1:
          key += "Singular";
          break;
        default:
          key += "Plural";
          break;
      }
      key += "Shortcut";
      return this.lang.nIconsCached[key]
        .replace(/\$icons/g, this.nIconsCached)
        .replace(/\$shortcuts/g, this.nShortcutsWithoutIcon);
    },
    /** @returns {ButtonBar.Button[]} */
    cacheButtons() {
      return [
        {
          text: this.lang.refreshIconCache,
          class: "btn-success",
          icon: "undo-alt",
          click: () => {
            navigateAndBuildZip(this.$root, {
              actions: [
                "Shortcuts.refreshImages",
                "Build.toMainMenu"
              ],
              closePage: true
            });
          }
        },
        {
          text: this.lang.clearIconCache,
          class: "btn-danger",
          icon: ["far", "trash-alt"],
          click: () => {
            navigateAndBuildZip(this.$root, {
              actions: [
                "Shortcuts.clearImages",
                "Build.toSafari"
              ],
              closePage: true
            });
          }
        }
      ];
    }
  },
  watch: {
    buttons() {
      this.setToolbarClearing();
    }
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", false);
    this.preferences = Object.assign({}, this.prefGlobal);
  },
  mounted() {
    this.setToolbarClearing();
  },
  methods: {
    /**
     * @param { {key: string, constraints: Constraints, lang: LangItem} } pref
     * @returns {string}
     */
    getDefault(pref) {
      const def = this.prefDefault[pref.key];
      switch (typeof def) {
        case "boolean":
          return this.lang[def ? "switchOn" : "switchOff"];

        case "number":
          if (Array.isArray(pref.constraints)) {
            return pref.lang.values
              ? pref.lang.values[def]
              : `Language item for "${pref.key}.values" not found`;
          } else {
            return def;
          }
        default:
          return def;
      }
    },
    /** @param {string} key */
    reset(key) {
      this.preferences[key] = this.prefDefault[key];
    },
    setToolbarClearing() {
      const prevHeight = this.$refs.toolbar.clientHeight;
      Vue.nextTick(() => {
        const height = this.$refs.toolbar.clientHeight;
        if (prevHeight < height) {
          this.$refs.list.style.transition = "none";
          Vue.nextTick(() => {
            this.$refs.list.style.transition = null;
          });
        }
        this.$refs.list.style.paddingBottom = `calc(${height}px + 0.25rem)`;
        if (this.lastChanged && prevHeight < height) {
          window.scrollBy({
            left: 0,
            top: height - prevHeight,
            behavior: "smooth"
          });
        }
        this.lastChanged = false;
      });
    },
    prefChanged(index) {
      this.lastChanged = index === this.prefsWithLang.length - 1;
    },
    showUpdate() {
      this.$root.$emit("navigate", "ConfirmNewUpdate");
    }
  }
};
</script>

<style lang="scss" scoped>
.transition-padding-bottom {
  transition: padding-bottom 0.25s ease-in-out;
}

.rotate-180 {
  transform: rotate(180deg);
}

.custom-switch2 {
  font-size: 1.75rem;
  > .custom-control-label {
    &::before {
      height: 1em;
      top: 0.25em;
      left: -1.75em;
      width: 1.75em;
      pointer-events: all;
      border-radius: 0.5em;
    }
    &::after {
      top: calc(0.25em + 2px);
      left: calc(-1.75em + 2px);
      width: calc(1em - 4px);
      height: calc(1em - 4px);
      border-radius: 0.5em;
      background-color: #adb5bd;
      transition: transform 0.15s ease-in-out,
        background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
    }
  }
  > .custom-control-label-caption {
    position: relative;
    margin-bottom: 0;
    vertical-align: top;

    &::before {
      display: block;
      position: absolute;
      content: "";
      top: 0.5em;
      left: -2.05em;
      width: 2px;
      height: 0.5em;
      background: white;
      border-radius: 2px;
      opacity: 0;
      transition: transform 0.15s ease-in-out, opacity 0.15s ease-out;
    }
    &::after {
      display: block;
      position: absolute;
      content: "";
      top: 0.5em;
      left: -0.7em;
      width: 0.5em;
      height: 0.5em;
      border: 2px solid #adb5bd;
      border-radius: 0.3em;
      opacity: 1;
      transition: transform 0.15s ease-in-out, opacity 0.1s ease-in 0.05s;
    }
  }
  .custom-control-input:checked {
    ~ .custom-control-label {
      &::before {
        color: #fff;
        border-color: #007bff;
        background-color: #007bff;
      }
      &::after {
        background-color: #fff;
        transform: translateX(0.75em);
        box-shadow: 0 0 2px #000000a0;
      }
    }
    ~ .custom-control-label-caption {
      &::before {
        opacity: 1;
        transform: translateX(0.75em);
        transition: transform 0.15s ease-in-out, opacity 0.15s ease-in;
      }
      &::after {
        opacity: 0;
        transform: translateX(0.75em);
        transition: transform 0.15s ease-in-out, opacity 0.15s ease-out;
      }
    }
  }
}
</style>
