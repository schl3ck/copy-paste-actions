<template>
  <div>
    <ProcessBar
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
      done: false
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
            shortcut: s.data
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
