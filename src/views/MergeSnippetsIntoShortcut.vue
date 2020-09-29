<template>
  <div>
    <!-- TODO: when no items: notify -->
    <div
      v-if="noItems"
      class="fixed-top fixed-bottom d-flex flex-column justify-content-center align-items-center container"
    >
      <FontAwesomeIcon icon="check" class="center-icon text-success" />
      <span class="text-center">{{ lang.noItemsFound }}</span>
      <!-- TODO: add button to open app anyway. check for unsaved changes in vuex and open app -->
      <button class="btn btn-primary"></button>
    </div>
    <ProcessBar
      v-else
      :restoring-state="restoringState"
      :percent="percent"
      :done="done"
      :status-label="status"
    />
  </div>
</template>

<script>
import ProcessBar from "@/components/ProcessBar.vue";
import worker from "@/utils/worker";
import { navigateAndBuildZip } from "@/utils/openApp";

export default {
  name: "MergeSnippetsIntoShortcut",
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
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.mergeSnippetsIntoShortcut;
    },
    /** @returns {object[]} */
    shortcutsToProcess() {
      return this.$store.state.processResult.shortcuts.filter(
        (s) =>
          (s.inserts && s.inserts.filter((i) => !i.exclude).length) ||
          (s.actionsToRemove && s.actionsToRemove.length)
      );
    },
    /** @returns {object[]} */
    shortcuts() {
      if (this.shortcutsToProcess.length < 1) return [];
      const names = this.shortcutsToProcess.map((s) => s.name);
      return this.$store.state.shortcuts
        .filter((s) => names.includes(s.name))
        .map((s) => {
          return {
            name: s.name,
            shortcut: {
              ...this.shortcutsToProcess.find((pr) => pr.name === s.name),
              shortcut: s.data
            }
          };
        });
    },
    historyReplaceState() {
      return true;
    }
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", true);
    this.init();
  },
  methods: {
    init() {
      if (this.shortcuts.length > 0) {
        const dict = {
          shortcuts: this.shortcuts.map((s) => s.shortcut)
        };

        this.status = this.lang.processing;
        worker("merger", dict, (percent) => {
          this.percent = percent;
        }).then(
          /** @param { {shortcuts: {name: string, shortcut: string}[]} } result */
          (result) => {
            this.done = true;
            navigateAndBuildZip(this.$root, {
              actions: [
                "Preferences.get",
                "Shortcuts.getNames",
                "Snippets.get",
                "Snippets.save",
                "Shortcuts.import"
              ],
              closePage: true,
              data: result.shortcuts.map((s) => {
                return {
                  name: s.name + ".shortcut",
                  content: Buffer.from(s.shortcut, "base64")
                };
              })
            });
          }
        );
      } else {
        this.noItems = true;
        // TODO: do we need this?
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
.center-icon {
  font-size: 5rem;
  margin-top: -3rem;
}
.no-items-text {
  text-align: center;
  white-space: pre-line;
}
</style>
