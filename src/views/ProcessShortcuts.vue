<template>
  <div>
    <ProcessBar
      :restoringState="restoringState"
      :percent="percent"
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
      restoringState: false
    };
  },
  created() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", true);

    this.$root.$once("loadShortcutsFinished", () => {
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
        });
      } else {
        this.status = this.lang.noShortcuts;
      }
    });
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.processShortcuts;
    },
    /** @returns {object} */
    shortcuts() {
      return this.$store.state.shortcuts.filter(s => s.data);
    },
    /** @returns {object} */
    preferences() {
      return this.$store.state.preferences;
    },
    getDataToSave() {
      return {
        replaceState: true
      };
    }
  },
  methods: {
    toMainMenu() {
      this.$root.$emit("navigate", "MainMenu");
    }
  }
};
</script>
