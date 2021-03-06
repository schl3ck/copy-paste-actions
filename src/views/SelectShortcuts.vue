<template>
  <div>
    <div class="sticky">
      <h2 class="pt-1">
        {{ lang.title }}
      </h2>

      <div
        v-if="message"
        class="alert"
        :class="messageVariant"
        v-html="message"
      />

      <div class="list-group list-group-custom-flush no-top-bottom-border">
        <div
          :class="
            'list-group-item custom-list-group-item no-rounded-bottom ' +
              'border-bottom p-0'
          "
        >
          <div class="input-group flex-row">
            <span class="sr-only">{{ lang.searchCaption }}</span>
            <input
              ref="input"
              v-model="searchText"
              class="input-group-form-control"
              type="text"
              :placeholder="lang.searchCaption"
            >
            <div class="input-group-append">
              <button
                type="button"
                class="btn px-2"
                @click.prevent="toggleShowMode('selected')"
              >
                <BIcon icon="list-check" class="mr-1" />
                <span class="sr-only">{{ lang.srShowSelected }}</span>
                <span class="sr-only">{{
                  langNumberOfShortcutsSelected.before
                }}</span>
                <span class="badge badge-pill badge-primary">{{
                  selectedCount
                }}</span>
                <span class="sr-only">{{
                  langNumberOfShortcutsSelected.after
                }}</span>
              </button>
              <button
                type="button"
                class="btn px-2"
                @click.prevent="toggleShowMode('loaded')"
              >
                <BIcon icon="file-earmark-fill" class="mr-1" />
                <span class="sr-only">{{ lang.srShowLoaded }}</span>
                <span class="sr-only">{{
                  langNumberOfShortcutsLoaded.before
                }}</span>
                <span class="badge badge-pill badge-primary">{{
                  loadedCount
                }}</span>
                <span class="sr-only">{{
                  langNumberOfShortcutsLoaded.after
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      ref="list"
      :class="
        'list-group list-group-custom-flush no-top-bottom-border ' +
          'no-rounded-top'
      "
    >
      <div
        v-show="displayShortcuts.shortcuts && displayShortcuts.shortcuts.length"
      >
        <div
          v-show="displayShortcuts.shortcuts.length === 0"
          class="list-group-item custom-list-group-item text-center"
        >
          <i>
            {{ displayShortcuts.noItemsLang }}<span class="sr-only">.</span>
          </i>
        </div>
        <template v-if="displayShortcuts.shortcuts.length > 0">
          <button
            v-for="shortcut in displayShortcuts.shortcuts"
            :key="shortcut.name"
            :class="
              'list-group-item list-group-item-action custom-list-group-item ' +
                'd-flex align-items-center cursor-pointer text-left'
            "
            @click.prevent="toggleSelection(shortcut)"
          >
            <BIcon
              icon="check"
              class="text-primary mr-2 fs-2x"
              :class="{ invisible: !shortcut.selected }"
              scale="1.5"
            />
            <img
              v-if="shortcut.image"
              :src="shortcut.image"
              class="mr-2 icon"
              alt="icon"
            >
            <span class="mr-2">
              {{ shortcut.name }}<span class="sr-only">.</span>
            </span>
            <div class="ml-auto small text-secondary text-right">
              <div class="text-nowrap">
                {{ shortcut.size | fileSize }}<span class="sr-only">.</span>
              </div>
              <template v-if="shortcut.data">
                <div class="text-nowrap">
                  <BIcon icon="file-earmark-fill" class="mr-1" />
                  {{ lang.shortcutLoaded }}
                </div>
              </template>
            </div>
          </button>
        </template>
      </div>
      <div
        v-show="
          displayShortcuts.shortcuts && displayShortcuts.shortcuts.length === 0
        "
      >
        <div class="list-group-item custom-list-group-item text-center">
          <i>{{ lang.searchNoMatch }}<span class="sr-only">.</span></i>
        </div>
      </div>
      <div v-show="!displayShortcuts.shortcuts">
        <div class="list-group-item custom-list-group-item text-center">
          <i>{{ lang.loading }}</i>
        </div>
      </div>
    </div>

    <NavigationToolbar :buttons="buttons" contentRefName="list" />
  </div>
</template>

<script>
import FlexSearch from "flexsearch";
import { debounce } from "lodash";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

function splitLanguageString(str) {
  // ensure that there are 2 parts every time
  const parts = (" " + str + " ").split("$number", 2);
  return {
    before: parts && parts.length ? parts[0].trim() : "",
    after: parts && parts.length ? parts[1].trim() : str.trim(),
  };
}

/**
 * @typedef {"" | "selected" | "loaded"} ShowMode
 */

export default {
  name: "SelectShortcuts",
  components: {
    NavigationToolbar,
  },
  filters: {
    fileSize(size) {
      let unit = " B";
      const units = [" kB", " MB", " GB"];
      while (units.length && size >= 1024) {
        size /= 1024;
        unit = units.shift();
      }

      return Math.round(size * 100) / 100 + unit;
    },
  },
  props: {
    continue: {
      type: Function,
      default: null,
    },
    continueLabel: {
      type: String,
      default: "",
    },
    continueIcon: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    messageVariant: {
      type: String,
      default: "",
    },
    acceptNoSelection: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      searchText: "",
      filteredShortcuts: [],
      fuzzy: null,
      /** @type {ShowMode} */
      show: "",
      startUp: true,
    };
  },
  computed: {
    /** @returns {object} */
    shortcuts() {
      return this.$store.state.shortcuts;
    },
    /** @returns {object} */
    lang() {
      return this.$store.state.language.selectShortcuts;
    },
    /** @returns { {before: string, after: string} } */
    langNumberOfShortcutsSelected() {
      return splitLanguageString(this.lang.srNumberOfShortcutsSelected);
    },
    /** @returns { {before: string, after: string} } */
    langNumberOfShortcutsLoaded() {
      return splitLanguageString(this.lang.srNumberOfShortcutsLoaded);
    },
    /** @returns {boolean} */
    hasSelection() {
      return this.shortcuts.some((s) => s.selected);
    },
    /** @returns {object[]} */
    selectedShortcuts() {
      return this.shortcuts.filter((s) => s.selected);
    },
    /** @returns {number} */
    selectedCount() {
      return this.selectedShortcuts.length;
    },
    /** @returns {object[]} */
    loadedShortcuts() {
      return this.shortcuts.filter((s) => s.data);
    },
    /** @returns {number} */
    loadedCount() {
      return this.loadedShortcuts.length;
    },
    /** @returns { { shortcuts: object[], noItemsLang: string } } */
    displayShortcuts() {
      let res;
      switch (this.show) {
        case "selected":
          res = {
            shortcuts: this.selectedShortcuts,
            noItemsLang: this.lang.nothingSelected,
          };
          break;
        case "loaded":
          res = {
            shortcuts: this.loadedShortcuts,
            noItemsLang: this.lang.nothingLoaded,
          };
          break;
        default:
          res = {
            shortcuts: this.filteredShortcuts,
            noItemsLang: this.lang.nothingAvailable,
          };
          break;
      }
      if (this.startUp && res.shortcuts.length > 30) {
        res.shortcuts = res.shortcuts.slice(0, 30);
      }
      return res;
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      return [
        {
          class:
            this.acceptNoSelection || this.hasSelection
              ? "btn-success"
              : "btn-secondary",
          icon: this.continueIcon || "hammer",
          text: this.continueLabel || this.lang.continueProcessing,
          click: this.toProcessShortcuts,
          disabled: !this.acceptNoSelection && !this.hasSelection,
        },
      ];
    },
  },
  watch: {
    searchText(newV) {
      this.debouncedSearch(newV);
    },
  },
  created() {
    this.debouncedSearch = debounce(this.search, 400);

    if (this.shortcuts.length) {
      this.init();
    } else {
      this.filteredShortcuts = null;
      this.$root.$once("loadShortcutsFinished", this.init.bind(this));
    }
  },
  activated() {
    this.$store.commit("showMainTitle", false);
  },
  methods: {
    init() {
      this.fuzzy = FlexSearch.create();
      this.shortcuts.forEach((s, i) => {
        this.fuzzy.add(i, s.name);
      });
      this.search("");
      setTimeout(() => {
        this.startUp = false;
      }, 500);
    },
    search(value) {
      if (value) {
        const res = this.fuzzy.search(value, { suggest: true });
        this.filteredShortcuts = res.map((id) => {
          return this.shortcuts[id];
        });
      } else {
        this.filteredShortcuts = this.shortcuts;
      }
    },
    toggleSelection(shortcut) {
      shortcut.selected = !shortcut.selected;
    },
    toProcessShortcuts() {
      if (!this.acceptNoSelection && !this.hasSelection) {
        return;
      }

      if (this.continue) {
        this.continue();
      } else {
        this.$router.push({ name: "ConfirmSelectedShortcuts" });
      }
    },
    /** @param {ShowMode} mode */
    toggleShowMode(mode) {
      if (this.show === mode) {
        this.show = "";
      } else {
        this.show = mode;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sticky {
  position: sticky;
  top: 0;
  z-index: 110;
  background: var(--background-color);
}
.list-group.no-rounded-top .list-group-item:first-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top-width: 0;
}
.list-group-item.no-rounded-bottom {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group-lg > .btn {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.icon {
  width: 30px;
  height: 30px;
}

.input-group-form-control {
  flex: 1 1 0%;
  width: 100%;
  min-width: 0;
  border: 0;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;

  &:focus {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
  }
}
</style>
