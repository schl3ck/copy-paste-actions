<template>
  <div>
    <div class="fixed-top fixed-bottom container d-flex flex-column align-items-center justify-content-center">
      <template v-if="loaded || large">
        <div class="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
          <FontAwesomeIcon :icon="loaded ? 'file' : 'exclamation-circle'" class="fa-5x text-warning mb-2">
          </FontAwesomeIcon>
          <span class="text-center pre-line">{{ loaded ? lang.shortcutsLoaded : shortcutsSizeLarge }}</span>
        </div>
        <div class="w-100 d-flex flex-column-reverse flex-sm-row">
          <div class="col px-0 pt-1 pr-sm-1 pt-sm-0">
            <button class="btn btn-lg w-100" :class="{'btn-warning': loaded, 'btn-primary': large}"
              @click="loaded ? load() : goBack()">
              <FontAwesomeIcon :icon="loaded ? 'file-import' : 'chevron-left'" class="mr-2">
              </FontAwesomeIcon>{{ loaded ? lang.reload : lang.back }}
            </button>
          </div>
          <div class="col px-0 pb-1 pl-sm-1 pb-sm-0">
            <button class="btn btn-lg w-100" :class="{'btn-success': loaded, 'btn-warning': large}"
              @click="loaded ? useCached() : load()">
              <FontAwesomeIcon icon="play" class="mr-2"></FontAwesomeIcon>{{ lang.continue }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { navigateAndBuildZip } from "@/utils/openApp";

export default {
  name: "ConfirmSelectedShortcuts",
  data() {
    return {
      loaded: false,
      large: null
    };
  },
  activated() {
    this.loaded = false;
    this.large = null;
    if (this.selected.every(s => s.data)) {
      // all shortcuts already loaded
      this.loaded = true;
      return;
    }

    // if selected shortcuts are bigger than 3 MB
    let size = this.selected.reduce((acc, i) => acc + i.size, 0);
    if (size > 3 * 1024 * 1024) {
      size = Math.round((size / 1024) * 100) / 100;
      this.large = size;
      return;
    }

    this.load();
  },
  methods: {
    load() {
      const names = this.selected.map(s => s.name);

      navigateAndBuildZip(this.$root, {
        closePage: process.env.NODE_ENV !== "development",
        actions: [
          "Preferences.get",
          "Shortcuts.getNames",
          "Shortcuts.getFiles",
          "Snippets.get",
          "Clipboard.get",
          "Build.processShortcuts"
        ],
        data: [
          {
            name: "selectedShortcuts.json",
            content: JSON.stringify({ names })
          }
        ]
      });
    },
    useCached() {
      this.$root.$emit("navigate", "ProcessShortcuts");
    },
    goBack() {
      window.history.back();
    }
  },
  computed: {
    /** @returns {object[]} */
    selected() {
      return this.$store.state.shortcuts.filter(s => s.selected);
    },
    /** @returns {true} */
    historyReplaceState() {
      return true;
    },
    /** @returns {object} */
    lang() {
      return this.$store.state.language.confirmSelectedShortcuts;
    },
    shortcutsSizeLarge() {
      return this.lang.shortcutsSizeLarge.replace(
        /\$size/g,
        this.large + " kB"
      );
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
