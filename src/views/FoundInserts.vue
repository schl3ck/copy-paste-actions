<template>
  <div>
    <h2>{{ lang.title }}</h2>

    <div v-if="noInserts" class="alert alert-warning">
      {{ lang.noInserts }}<span class="sr-only">.</span>
    </div>

    <div ref="list">
      <div v-for="shortcut in shortcuts" :key="shortcut.name" class="mb-2">
        <div class="sticky-top">
          <div class="d-flex flex-row align-items-center">
            <img v-if="shortcut.image" :src="shortcut.image" class="mr-2 img">
            <h5 class="mb-0">
              {{ shortcut.name }}
            </h5>
          </div>
          <hr class="my-2">
        </div>

        <template v-if="shortcut.inserts.length">
          <div
            v-for="insert in shortcut.inserts"
            :key="shortcut.name + insert.id"
            class="card ml-3"
            :class="{ 'bg-lightgray': insert.exclude }"
          >
            <div class="card-body">
              <span
                class="card-title font-weight-bold"
                :class="{ 'font-italic': hasNoName(insert.name) }"
              >{{ noSnippetName(insert.name) }}</span>
              <div class="card-text">
                <div>
                  {{ insert.isClipboard ? lang.clipboardItem : lang.snippet }}
                </div>
                <div v-if="insert.replacesNActions > 0">
                  {{
                    lang.replacesNActions[
                      insert.replacesNActions === 1 ? "singular" : "plural"
                    ].replace("$number", insert.replacesNActions)
                  }}
                </div>
                <div>
                  {{
                    lang.insertAfterAction.replace("$number", insert.position)
                  }}
                </div>
                <div class="custom-control custom-checkbox text-danger">
                  <input
                    :id="'excludeInsert' + insert.id"
                    v-model="insert.exclude"
                    type="checkbox"
                    class="custom-control-input"
                  >
                  <label
                    :for="'excludeInsert' + insert.id"
                    class="custom-control-label"
                  >{{ lang.exclude }}</label>
                </div>
                <div>
                  <hr class="my-2">
                  {{
                    lang.inserts[insert.isClipboard ? "clipboard" : "snippet"]
                  }}
                  <SnippetListItem
                    v-if="getSnippet(insert)"
                    :snippet="getSnippet(insert)"
                    class="snippet-list-item"
                    show-actions-btn-outline
                  />
                  <div v-else>
                    <i>{{
                      lang.noSnippetFound[
                        insert.isClipboard ? "clipboard" : "snippet"
                      ]
                    }}<span class="sr-only">.</span></i>
                  </div>
                  <button
                    class="btn btn-block btn-primary mt-2"
                    @click="selectSnippet(insert)"
                  >
                    {{ lang.selectSnippet }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="text-center mt-n1">
          {{ lang.noInsertsFound }}<span class="sr-only">.</span>
        </div>
      </div>
    </div>

    <NavigationToolbar
      :buttons="buttons"
      contentRefName="list"
      :routerMethod="routerMethod"
    />
  </div>
</template>

<script>
import SnippetListItem from "@/components/SnippetListItem.vue";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "FoundInserts",
  components: {
    SnippetListItem,
    NavigationToolbar,
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.foundInserts;
    },
    /** @returns {object[]} */
    shortcuts() {
      return this.$store.state.processResult.shortcuts;
    },
    /** @returns {Store.AppSettings} */
    preferences() {
      return this.$store.state.preferences;
    },
    /** @returns {Store.Globals} */
    globals() {
      return this.$store.state.globals;
    },
    snippets() {
      return this.$store.state.snippets;
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      return [
        {
          text: this.lang.saveAndContinue,
          class: this.allInsertsHaveSnippetsOrExcluded
            ? "btn-success"
            : "btn-secondary",
          icon: { component: "IconSave" },
          click: () => {
            if (!this.allInsertsHaveSnippetsOrExcluded) {
              alert(this.lang.insertWithoutSnippetOrNotExcluded);
              return;
            }

            this.assignSnippetsToInserts();

            this.$router[this.routerMethod]({
              name: "MergeSnippetsIntoShortcut",
            });
          },
        },
      ];
    },
    /** @returns {boolean} */
    allInsertsHaveSnippetsOrExcluded() {
      return this.shortcuts.every(
        (s) =>
          s.inserts && s.inserts.every((i) => i.exclude || this.getSnippet(i)),
      );
    },
    /** @returns {boolean} */
    noInserts() {
      return this.shortcuts.every((s) => !s.inserts || s.inserts.length === 0);
    },
    /** @returns {boolean} */
    autoAcceptInserts() {
      return (
        this.preferences.Preferences.autoAcceptInserts
        && this.allInsertsHaveSnippetsOrExcluded
      );
    },
    /** @returns {boolean} */
    historyReplaceState() {
      return (
        (this.preferences.Preferences.skipFoundInsertsOnNoInsert
          && this.noInserts)
        || this.autoAcceptInserts
      );
    },
    /** @returns {"replace" | "push"} */
    routerMethod() {
      return this.historyReplaceState ? "replace" : "push";
    },
  },
  activated() {
    if (this.historyReplaceState) {
      if (this.autoAcceptInserts) {
        this.assignSnippetsToInserts();
      }

      this.$router[this.routerMethod]({ name: "MergeSnippetsIntoShortcut" });
      return;
    }

    this.$store.commit("showMainTitle", false);
  },
  methods: {
    noSnippetName(val) {
      return val === this.globals.noSnippetName ? this.lang.noSnippetName : val;
    },
    hasNoName(name) {
      return name === this.globals.noSnippetName;
    },
    getSnippet(insert) {
      return this.snippets.find(
        (snippet) =>
          snippet.name === insert.name
          && snippet.isClipboard === insert.isClipboard,
      );
    },
    selectSnippet(insert) {
      const router = this.$router;
      router.push({
        name: "ListSnippets",
        params: {
          editable: false,
          clipboardFirst: insert.isClipboard,
          highlight: this.getSnippet(insert),
          onSelect(snippet) {
            insert.name = snippet.name;
            insert.isClipboard = snippet.isClipboard;
            router.back();
          },
        },
      });
    },
    assignSnippetsToInserts() {
      for (const shortcut of this.shortcuts) {
        for (const insert of shortcut.inserts) {
          if (!insert.exclude) {
            const snippet = this.getSnippet(insert);
            insert.actions = snippet.actions;
            insert.uuids = snippet.uuids;
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.img {
  width: 40px;
  height: 40px;
}

.snippet-list-item:not(:last-child) {
  margin-bottom: 0.5rem;
}

.bg-lightgray {
  background-color: var(--darken-background) !important;
}
</style>
