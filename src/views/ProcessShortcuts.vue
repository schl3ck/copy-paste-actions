<template>
  <div>
    <div class="fixed-top fixed-bottom d-flex flex-column justify-content-center align-items-center">
      <div class="w-75 text-center">
        <div class="progress mb-2">
          <div
            class="progress-bar"
            :class="{'progress-bar-striped progress-bar-animated': status === '\u00A0'}"
            role="progressbar"
            :style="{'width': (status === '\u00A0' ? 100 : percent) + '%'}"
            :aria-valuenow="percent"
            aria-valuemin="0"
            aria-valuemax="100"></div>
        </div>
        <span class="status-label">{{ status }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import worker from "@/utils/worker";

export default {
  name: "ProcessShortcuts",
  data() {
    return {
      percent: 0,
      status: "\u00A0"
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
    }
  },
  methods: {
    toMainMenu() {
      this.$root.$emit("navigate", "MainMenu");
    }
  }
};
</script>
