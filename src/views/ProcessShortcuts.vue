<template>
  <div>
    <div v-if="noItems" class="fixed-top fixed-bottom d-flex flex-column justify-content-center align-items-center">
      <span class="sad-face">:(</span>
      <span class="no-items-text">{{ lang.noItemsFound }}</span>
    </div>
    <ProcessBar
      v-else
      :restoringState="restoringState"
      :percent="percent"
      :done="done"
      :statusLabel="status"></ProcessBar>
  </div>
</template>

<script>
import ProcessBar from "@/components/ProcessBar.vue";
import worker from "@/utils/worker";

export default {
  name: "ProcessShortcuts",
  components: {
    ProcessBar
  },
  data() {
    return {
      percent: null,
      status: "\u00A0",
      restoringState: false,
      done: false,
      noItems: false
    };
  },
  created() {
    if (this.shortcuts.length) {
      this.init();
    } else {
      this.$root.$once("loadShortcutsFinished", this.init);
    }
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", true);
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.processShortcuts;
    },
    /** @returns {object} */
    shortcuts() {
      let loaded = this.$store.state.shortcuts.filter(s => s.data);
      if (loaded.some(s => s.selected)) {
        loaded = loaded.filter(s => s.selected);
      }
      return loaded;
    },
    /** @returns {object} */
    preferences() {
      return this.$store.state.preferences;
    },
    historyReplaceState() {
      return true;
    }
  },
  methods: {
    init() {
      const dict = {
        shortcuts: this.shortcuts.map(s => {
          return {
            name: s.name,
            shortcut: Buffer.from(s.data, "base64")
          };
        }),
        excludeAllCPAComments: this.preferences.Preferences
          .excludeAllCPAComments,
        cleanUp: this.preferences.Preferences.cleanUp,
        commentMarker: this.preferences.Preferences.commentMarker,
        defaultNewShortcutName: this.preferences.Preferences
          .defaultNewShortcutName
      };

      if (dict.shortcuts.length > 0) {
        this.status = this.lang.processing;
        worker("analyser", dict, percent => {
          this.percent = percent;
        }).then(result => {
          // TODO: go to next page
          this.done = true;
          this.$store.commit("processResult", result);
          if (result.warnings.length > 0) {
            this.$root.$emit("navigate", "AnalyserWarnings");
          } else if (result.nItems === 0) {
            this.noItems = true;
          } else {
            this.$root.$emit("navigate", "ProcessedSnippets");
          }
        });
      } else {
        this.status = this.lang.noShortcuts;
      }
    },
    toMainMenu() {
      this.$root.$emit("navigate", "MainMenu");
    }
  }
};
</script>

<style lang="scss" scoped>
.sad-face {
  font-size: 5rem;
  margin-top: -3rem;
}
.no-items-text {
  text-align: center;
  white-space: pre-line;
}
</style>
