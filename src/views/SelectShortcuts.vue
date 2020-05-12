<template>
  <div>
    <div class="sticky">
      <h2>{{ lang.title }}</h2>
      <div class="list-group list-group-custom-flush">
        <div class="list-group-item no-rounded-bottom border-bottom p-0">
          <div class="input-group flex-row">
            <span class="sr-only">{{ lang.searchCaption }}</span>
            <input class="input-group-form-control" type="text"
              v-model="searchText"
              :placeholder="lang.searchCaption"
              ref="input">
            <div class="input-group-append">
              <!-- TODO: show selected shortcuts without marking the matched letters -->
              <button type="button" class="btn" @click="showSelected = !showSelected">
                <FontAwesomeIcon icon="bars" class="mr-1"></FontAwesomeIcon>
                <span class="sr-only">{{ lang.srShowSelected }}</span>
                <span class="sr-only">{{ langNumberOfShortcutsSelected.before }}</span>
                <span class="badge badge-pill badge-primary">{{ selectedCount }}</span>
                <span class="sr-only">{{ langNumberOfShortcutsSelected.after }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="list-group list-group-custom-flush no-rounded-top" ref="list">
      <div v-show="showSelected && filteredShortcuts && filteredShortcuts.length">
        <div v-show="selectedShortcutsDisplay.length === 0" class="list-group-item text-center">
          <i>{{ lang.nothingSelected }}</i>
        </div>
        <template v-show="selectedShortcutsDisplay.length > 0">
          <button
            v-for="shortcut in selectedShortcutsDisplay"
            :key="shortcut.name"
            class="list-group-item list-group-item-action d-flex align-items-center text-left"
            @click="toggleSelection(shortcut)">
            <FontAwesomeIcon
              icon="check"
              class="text-primary mr-2 fa-1o5x"
              :class="{'invisible': !shortcut.selected}"></FontAwesomeIcon>
            <img v-show="shortcut.image" :src="shortcut.image" class="mr-2 icon"
              alt="icon">
            <span>{{ shortcut.name }}</span>
            <span class="sr-only">.</span>
            <span class="ml-auto small text-secondary text-right"><span
                class="text-nowrap">{{ shortcut.size | fileSize }}</span><template v-if="shortcut.data"><span
                  class="sr-only">.</span><br><span
                  class="text-nowrap">
                  <FontAwesomeIcon icon="file" class="mr-1"></FontAwesomeIcon>{{ lang.shortcutLoaded }}
                </span></template></span>
          </button>
        </template>
      </div>
      <div v-show="!showSelected && filteredShortcuts && filteredShortcuts.length">
        <button
          v-for="shortcut in filteredShortcuts"
          :key="shortcut.name"
          class="list-group-item list-group-item-action d-flex align-items-center cursor-pointer text-left"
          @click="toggleSelection(shortcut)">
          <FontAwesomeIcon
            icon="check"
            class="text-primary mr-2 fa-1o5x"
            :class="{'invisible': !shortcut.selected}"></FontAwesomeIcon>
          <img v-show="shortcut.image" :src="shortcut.image" class="mr-2 icon"
            alt="icon">
          <span v-html="shortcut.escapedName"></span>
          <span class="sr-only">.</span>
          <span class="ml-auto small text-secondary text-right"><span
              class="text-nowrap">{{ shortcut.size | fileSize }}</span><template v-if="shortcut.data"><span
                class="sr-only">.</span><br><span
                class="text-nowrap">
                <FontAwesomeIcon icon="file" class="mr-1"></FontAwesomeIcon>{{ lang.shortcutLoaded }}
              </span></template></span>
        </button>
      </div>
      <div v-show="!showSelected && !(filteredShortcuts && filteredShortcuts.length)">
        <div class="list-group-item text-center">
          <i>{{ lang.loading }}</i>
        </div>
      </div>
    </div>

    <div class="fixed-bottom container" ref="toolbar">
      <button type="button" class="btn btn-block btn-lg"
        :class="{'btn-success': hasSelection, 'btn-secondary': !hasSelection}"
        :disabled="!hasSelection" @click="toProcessShortcuts">
        <FontAwesomeIcon icon="hammer"></FontAwesomeIcon> {{ lang.continueProcessing }}
      </button>
    </div>
  </div>
</template>

<script>
import Fuse from "fuse.js";
import { debounce } from "lodash";

export default {
  name: "SelectShortcuts",
  data() {
    return {
      searchText: "",
      filteredShortcuts: [],
      selectedShortcutsDisplay: [],
      fuse: null,
      showSelected: false
    };
  },
  created() {
    // TODO: make debounce time a preference?
    this.debouncedSearch = debounce(this.search, 400);

    if (this.shortcuts.length) {
      this.init();
    } else {
      this.filteredShortcuts = null;
      this.$root.$once("loadShortcutsFinished", this.init.bind(this));
    }
  },
  mounted() {
    const height = this.$refs.toolbar.clientHeight;
    this.$refs.list.style.paddingBottom = `calc(${height}px + 0.25rem)`;
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", false);
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
      const str = this.lang.srNumberOfShortcutsSelected;
      const parts = (" " + str + " ").split("$number", 2); // ensure that there are 2 parts every time
      return {
        before: parts && parts.length ? parts[0].trim() : "",
        after: parts && parts.length ? parts[1].trim() : str.trim()
      };
    },
    /** @returns {boolean} */
    hasSelection() {
      return this.shortcuts.some(s => s.selected);
    },
    /** @returns {object[]} */
    selectedShortcuts() {
      return this.shortcuts.filter(s => s.selected);
    },
    /** @returns {number} */
    selectedCount() {
      return this.selectedShortcuts.length;
    }
  },
  methods: {
    init() {
      this.fuse = new Fuse(this.shortcuts, {
        includeMatches: true,
        keys: ["name"],
        threshold: 0.4
      });
      this.search("");
    },
    escape(value) {
      const map = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "&": "&amp;"
      };
      return value.replace(/[<>"&]/g, m => map[m]);
    },
    search(value) {
      if (value) {
        this.filteredShortcuts = this.fuse.search(value).map(shortcut => {
          const item = shortcut.item;
          const name = shortcut.item.name;
          item.escapedName = this.escape(name);
          if (!shortcut.matches) {
            return item;
          }

          const indices = shortcut.matches[0].indices;
          let res = "";
          let curIndices = indices.shift();
          if (!curIndices) {
            return item;
          }

          for (let i = 0; i < name.length; i++) {
            if (curIndices[0] === i) {
              // range starts here
              res += '<u class="text-danger">';
            }
            res += this.escape(name[i]);
            if (curIndices[1] === i) {
              // range ends here
              res += "</u>";
              curIndices = indices.shift();
              if (!curIndices) {
                res += name.substring(i + 1);
                break;
              }
            }
          }
          item.escapedName = res;
          return item;
        });
      } else {
        this.filteredShortcuts = this.shortcuts.map(s => {
          s.escapedName = this.escape(s.name);
          return s;
        });
      }
    },
    toggleSelection(shortcut) {
      shortcut.selected = !shortcut.selected;
    },
    toProcessShortcuts() {
      if (this.shortcuts.every(s => !s.selected)) return;

      this.$root.$emit("navigate", "ConfirmSelectedShortcuts");
    }
  },
  filters: {
    fileSize(size) {
      let unit = " B";
      const units = [" kB", "MB", "GB"];
      while (units.length && size >= 1024) {
        size /= 1024;
        unit = units.shift();
      }

      return Math.round(size * 100) / 100 + unit;
    }
  },
  watch: {
    searchText(newV) {
      this.debouncedSearch(newV);
    },
    showSelected(newV) {
      if (newV) {
        this.selectedShortcutsDisplay = this.selectedShortcuts;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.sticky {
  position: sticky;
  top: 0;
  z-index: 110;
  background: white;
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

.cursor-pointer {
  cursor: pointer;
}

.fa-1o5x {
  font-size: 1.5em;
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
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
}

@media (max-width: 575px) {
  .list-group-item {
    padding-left: 0;
    padding-right: 0;
  }
  .list-group-custom-flush .list-group-item {
    border-left-width: 0;
    border-right-width: 0;
    border-radius: 0;
    z-index: 105;

    &:first-child {
      border-top-width: 0;
    }
    &:last-child {
      border-bottom-width: 0;
    }
  }
}
</style>
