<template>
  <div>
    <div
      v-if="noItems || analyserError"
      :class="[
        'fixed-top fixed-bottom container',
        'd-flex flex-column justify-content-center align-items-center',
      ]"
    >
      <template v-if="noItems">
        <div class="sad-face mb-2 mt-n5">
          <b-icon icon="emoji-frown" />
        </div>
        <span class="text-center" v-html="lang.noItemsFound" />
      </template>
      <div v-else class="alert alert-danger d-flex flex-column">
        <div class="sad-face mb-2">
          <b-icon icon="emoji-frown" />
        </div>
        <div v-html="lang.errorMessage" />
        <pre class="pre-wrap"><code>{{ analyserError }}</code></pre>
      </div>
    </div>
    <ProcessBar v-else :percent="percent" :done="done" :statusLabel="status" />

    <NavigationToolbar />
  </div>
</template>

<script>
import ProcessBar from "@/components/ProcessBar.vue";
import worker from "@/utils/worker";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "ProcessShortcuts",
  components: {
    ProcessBar,
    NavigationToolbar,
  },
  data() {
    return {
      percent: null,
      status: "\u00A0",
      done: false,
      noItems: false,
      analyserError: null,
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.processShortcuts;
    },
    /** @returns {object[]} */
    shortcuts() {
      let loaded = this.$store.getters.loadedShortcuts;
      if (loaded.some((s) => s.selected)) {
        loaded = loaded.filter((s) => s.selected);
      }
      return loaded;
    },
    /** @returns {object} */
    preferences() {
      return this.$store.state.preferences;
    },
  },
  activated() {
    if (this.shortcuts.length) {
      this.init();
    } else {
      this.$root.$once("loadShortcutsFinished", this.init);
    }
    this.$store.commit("showMainTitle", false);
  },
  methods: {
    init() {
      const dict = {
        shortcuts: this.shortcuts.map((s) => {
          return {
            name: s.name,
            shortcut: Buffer.from(s.data, "base64"),
          };
        }),
        excludeAllCPAComments: this.preferences.Preferences
          .excludeAllCPAComments,
        cleanUp: this.preferences.Preferences.cleanUp,
        commentMarker: this.preferences.Preferences.commentMarker,
        // defaultNewShortcutName: this.preferences.Preferences
        //   .defaultNewShortcutName,
        noSnippetName: this.$store.state.globals.noSnippetName,
      };

      if (dict.shortcuts.length > 0) {
        this.status = this.lang.processing;
        worker("analyser", dict, (percent) => {
          this.percent = percent;
        })
          .then((result) => {
            result.shortcuts.forEach((s) => {
              const other = this.shortcuts.find(
                (other) => other.name === s.name,
              );
              if (other) {
                s.image = other.image;
              }
            });
            this.done = true;
            this.$store.commit("processResult", result);
            if (result.warnings.length > 0) {
              this.$router.replace({ name: "AnalyserWarnings" });
            } else if (result.nItems === 0) {
              this.noItems = true;
            } else if (result.shortcuts.some((s) => s.snippets.length > 0)) {
              this.$router.replace({ name: "FoundSnippets" });
            } else {
              this.$router.replace({ name: "FoundInserts" });
            }
          })
          .catch((err) => {
            this.analyserError = err.message || err;
          });
      } else {
        this.status = this.lang.noShortcuts;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sad-face {
  font-size: 5rem;
  display: flex;
  justify-content: center;
}
.no-items-text {
  text-align: center;
  white-space: pre-line;
}
</style>
