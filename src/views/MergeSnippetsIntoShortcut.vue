<template>
  <div>
    <div
      v-if="noItems || mergerError"
      :class="
        'fixed-top fixed-bottom container ' +
          'd-flex flex-column justify-content-center align-items-center'
      "
    >
      <template v-if="noItems">
        <BIcon
          v-if="!unsavedChanges"
          icon="check"
          class="center-icon text-success"
        />
        <span class="text-center">{{ lang.noItemsFound }}</span>
        <button class="btn btn-primary" @click="openApp">
          {{ lang.openApp }}
        </button>
      </template>
      <div v-else class="alert alert-danger d-flex flex-column">
        <div class="sad-face mb-2">
          <b-icon icon="emoji-frown" />
        </div>
        <div v-html="lang.errorMessage" />
        <pre class="pre-wrap"><code>{{ mergerError }}</code></pre>
      </div>
    </div>
    <ProcessBar
      v-else-if="!unsavedChanges"
      :restoringState="restoringState"
      :percent="percent"
      :done="done"
      :statusLabel="status"
    />
  </div>
</template>

<script>
import ProcessBar from "@/components/ProcessBar.vue";
import worker from "@/utils/worker";
import { navigateAndBuildZip, openNow } from "@/utils/openApp";

export default {
  name: "MergeSnippetsIntoShortcut",
  components: {
    ProcessBar,
  },
  data() {
    return {
      percent: null,
      status: "\u00A0",
      restoringState: false,
      done: false,
      noItems: false,
      mergerError: null,
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
          (s.inserts && s.inserts.filter((i) => !i.exclude).length)
          || (s.actionsToRemove && s.actionsToRemove.length),
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
              shortcut: s.data,
            },
          };
        });
    },
    historyReplaceState() {
      return true;
    },
    unsavedChanges() {
      return this.$store.getters.hasUnsavedChanges;
    },
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
          shortcuts: this.shortcuts.map((s) => s.shortcut),
        };

        this.status = this.lang.processing;
        worker("merger", dict, (percent) => {
          this.percent = percent;
        })
          .then(
            /** @param {
             *  { shortcuts: { name: string, shortcut: string }[] }
             * } result */
            (result) => {
              this.done = true;
              navigateAndBuildZip(this.$root, {
                actions: [
                  "Preferences.get",
                  "Shortcuts.getNames",
                  "Snippets.get",
                  "Snippets.save",
                  "Shortcuts.import",
                ],
                closePage: true,
                data: result.shortcuts.map((s) => {
                  return {
                    name: s.name + ".shortcut",
                    content: Buffer.from(s.shortcut, "base64"),
                  };
                }),
              });
            },
          )
          .catch((err) => {
            this.mergerError = err.message || err;
          });
      } else {
        this.noItems = true;
        this.status = this.lang.noShortcuts;

        if (this.unsavedChanges) {
          this.done = true;
          navigateAndBuildZip(this.$root, {
            // rely on automatic injection of unsaved settings/snippets
            actions: ["Build.toSafari"],
            closePage: false,
            messages: [this.lang.noItemsFound, this.lang.unsavedChanges],
          });
        }
      }
    },
    toMainMenu() {
      this.$root.$emit("navigate", "MainMenu");
    },
    openApp() {
      openNow(this.$root, "", {
        closePage: true,
        doNotRun: true,
      });
    },
  },
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
.sad-face {
  font-size: 5rem;
  display: flex;
  justify-content: center;
}
</style>
