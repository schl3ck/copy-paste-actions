<template>
  <div>
    <div class="sticky">
      <h2>{{ lang.title }}</h2>
      <div class="list-group list-group-custom-flush">
        <div class="list-group-item no-rounded-bottom border-bottom p-0">
          <div class="input-group flex-row">
            <input class="input-group-form-control" type="text"
              v-model="searchText"
              :placeholder="lang.searchPlaceholder"
              ref="input">
            <div class="input-group-append">
              <!-- TODO: BUG or FEATURE?: if the shortcuts are filtered by search and all are selected,
              the button switches incorrectly to all shortcuts, and then back to the selected shortcuts -->
              <button type="button" class="btn" @click="showSelectedShortcuts">
                <FontAwesomeIcon icon="bars" class="mr-1"></FontAwesomeIcon>
                <span class="sr-only">{{ lang.showSelected }}</span>
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
      <div v-if="filteredShortcuts && filteredShortcuts.length">
        <a
          v-for="shortcut in filteredShortcuts"
          :key="shortcut.name"
          class="list-group-item list-group-item-action d-flex align-items-center"
          @click="toggleSelection(shortcut)">
          <FontAwesomeIcon
            icon="check"
            class="text-primary mr-2 fa-1o5x"
            :class="{'invisible': !shortcut.selected}"></FontAwesomeIcon>
          <img :src="'data:image/png;base64,' + shortcut.image" class="mr-2 icon">
          <span v-html="shortcut.escapedName"></span>
        </a>
      </div>
      <div v-else>
        <div class="list-group-item text-center">
          <i>{{ filteredShortcuts === null ? lang.loading : lang.nothingSelected }}</i>
        </div>
      </div>
    </div>

    <div class="btn-group btn-group-lg fixed-bottom" role="toolbar" ref="toolbar">
      <!-- TODO: link to actions -->
      <button type="button" class="btn btn-light" @click="toMainMenu">
        <FontAwesomeIcon icon="chevron-left"></FontAwesomeIcon> {{ lang.toMainMenu }}
      </button>
      <button type="button" class="btn" :class="{'btn-success': hasSelection, 'btn-secondary': !hasSelection}"
        :disabled="!hasSelection">
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
      fuse: null
    };
  },
  created() {
    // TODO: make debounce time a preference?
    this.debouncedSearch = debounce(this.search, 400);
    this.$store.commit("showMainTitle", false);

    if (this.shortcuts.length) {
      this.init();
    } else {
      this.filteredShortcuts = null;
      this.$root.$once("loadShortcutsFinished", this.init.bind(this));
    }
  },
  mounted() {
    const height = this.$refs.toolbar.clientHeight;
    this.$refs.list.style.paddingBottom = height + "px";
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
      const str = this.lang.numberOfShortcutsSelected;
      const match = str.match(/^((?:[^$]|\$[^n])*?) ?\$n ?(.*)/);
      return {
        before: match ? match[1] : "",
        after: match ? match[2] : str
      };
    },
    /** @returns {boolean} */
    hasSelection() {
      return this.shortcuts.some(s => s.selected);
    },
    /** @returns {number} */
    selectedCount() {
      return this.shortcuts.filter(s => s.selected).length;
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
    toMainMenu() {
      this.$store.commit("showMainTitle", true);
      this.$root.$emit("navigate", "MainMenu");
      window.scrollTo({
        left: 0,
        top: 0,
        behavior: "auto"
      });
    },
    showSelectedShortcuts() {
      const allSelected = this.shortcuts
        .filter(s => s.selected)
        .map(s => {
          s.escapedName = this.escape(s.name);
          return s;
        });
      if (
        this.filteredShortcuts.every(s => s.selected) &&
        this.filteredShortcuts.length === allSelected.length
      ) {
        this.search("");
      } else {
        this.filteredShortcuts = allSelected;
      }
    }
  },
  watch: {
    searchText(newV) {
      this.debouncedSearch(newV);
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

.fa-1o5x {
  font-size: 1.5em;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  z-index: 108;
  background: white;
  padding-bottom: 1rem;
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
  padding: 0.375rem 0.75rem;
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
