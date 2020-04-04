<template>
  <div>
    <div class="sticky">
      <h2>{{ lang.title }}</h2>
      <div class="list-group list-group-custom-flush">
        <input class="list-group-item no-rounded-bottom border-bottom" type="text" v-model="searchText"
          :placeholder="lang.searchPlaceholder"
          ref="input"
          autofocus>
      </div>
    </div>
    <div class="list-group list-group-custom-flush no-rounded-top">
      <a
        v-for="shortcut in filteredShortcuts"
        :key="shortcut.name"
        class="list-group-item list-group-item-action d-flex align-items-center"
        @click="toggleSelection(shortcut)">
        <FontAwesomeIcon
          icon="check"
          class="text-primary mr-2 fa-1o5x"
          :class="{'invisible': !shortcut.selected}"></FontAwesomeIcon>
        <img :src="'data:image/png;base64,' + shortcut.image" class="mr-2">
        <span v-html="shortcut.escapedName"></span>
      </a>
    </div>

    <div class="btn-group btn-group-lg fixed-bottom" role="group">
      <!-- TODO: link to actions -->
      <button type="button" class="btn btn-light" @click="$root.$emit('navigate', 'MainMenu')">
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
    this.fuse = new Fuse(this.shortcuts, {
      includeMatches: true,
      keys: ["name"],
      threshold: 0.4
    });
    this.search("");
  },
  mounted() {
    // this.$refs.input.focus();
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
    /** @returns {boolean} */
    hasSelection() {
      return this.shortcuts.some(s => s.selected);
    }
  },
  methods: {
    search(value) {
      const map = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "&": "&amp;"
      };
      const escape = str => str.replace(/[<>"&]/g, m => map[m]);

      if (value) {
        this.filteredShortcuts = this.fuse.search(value).map(shortcut => {
          const item = shortcut.item;
          const name = shortcut.item.name;
          item.escapedName = escape(name);
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
            res += escape(name[i]);
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
          s.escapedName = escape(s.name);
          return s;
        });
      }
    },
    toggleSelection(shortcut) {
      shortcut.selected = !shortcut.selected;
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
