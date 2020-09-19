<template>
  <div>
    <!-- TODO: overall "no inserts found" when there are none -->
    <h2>{{ lang.title }}</h2>

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
            :class="{'bg-lightgray': insert.exclude}"
          >
            <div class="card-body">
              <span
                class="card-title font-weight-bold"
                :class="{'font-italic': hasNoName(insert.name)}"
              >{{ noSnippetName(insert.name) }}</span>
              <div class="card-text">
                <div>{{ insert.isClipboard ? lang.clipboardItem : lang.snippet }}</div>
                <div v-if="insert.replacesNActions > 0">
                  {{
                    lang
                      .replacesNActions[insert.replacesNActions === 1 ? "singular" : "plural"]
                      .replace("$number", insert.replacesNActions)
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
                  <label :for="'excludeInsert' + insert.id" class="custom-control-label">{{ lang.exclude }}</label>
                </div>
                <div>
                  <hr class="my-2">
                  {{ lang.inserts[insert.isClipboard ? "clipboard" : "snippet"] }}
                  <SnippetListItem
                    v-if="getSnippet(insert)"
                    :snippet="getSnippet(insert)"
                    class="snippet-list-item"
                    show-actions-btn-outline
                  />
                  <div v-else>
                    <i>{{ lang.noSnippetFound[insert.isClipboard ? "clipboard" : "snippet"] }}<span
                      class="sr-only"
                    >.</span></i>
                  </div>
                  <button class="btn btn-block btn-primary mt-2" @click="selectSnippet(insert)">
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

    <div ref="toolbar" class="fixed-bottom container">
      <ButtonBar :buttons="buttons" />
    </div>
  </div>
</template>

<script>
import SnippetListItem from "@/components/SnippetListItem.vue";
import ButtonBar from "@/components/ButtonBar.vue";

export default {
  name: "FoundInserts",
  components: {
    SnippetListItem,
    ButtonBar
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
    preferences() {
      return this.$store.state.preferences;
    },
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
          icon: ["far", "save"],
          click: function() {
            if (!this.allInsertsHaveSnippetsOrExcluded) {
              alert(this.lang.insertWithoutSnippetOrNotExcluded);
              return;
            }

            // assign snippet to insert
            for (const shortcut of this.shortcuts) {
              for (const insert of shortcut.inserts) {
                if (!insert.exclude) {
                  const snippet = this.getSnippet(insert);
                  insert.actions = snippet.actions;
                  insert.uuids = snippet.uuids;
                }
              }
            }

            this.$root.$emit("navigate", "MergeSnippetsIntoShortcut");
          }.bind(this)
        },
        {
          text: this.$store.getters.langToMainMenu,
          class: "btn-outline-primary",
          icon: "chevron-left",
          click: function() {
            this.$root.$emit("navigate", "MainMenu");
          }.bind(this)
        }
      ];
    },
    /** @returns {boolean} */
    allInsertsHaveSnippetsOrExcluded() {
      return this.shortcuts.every(
        (s) =>
          s.inserts && s.inserts.every((i) => i.exclude || this.getSnippet(i))
      );
    }
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    const height = this.$refs.toolbar.clientHeight;
    this.$refs.list.style.paddingBottom = `calc(${height}px + 0.25rem)`;
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
          snippet.name === insert.name &&
          snippet.isClipboard === insert.isClipboard
      );
    },
    selectSnippet(insert) {
      this.$root.$emit("navigate", "ListSnippets", {
        editable: false,
        clipboardFirst: insert.isClipboard,
        highlight: this.getSnippet(insert),
        onSelect(snippet) {
          insert.name = snippet.name;
          insert.isClipboard = snippet.isClipboard;
          window.history.back();
        }
      });
    }
  }
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
  background-color: lightgray !important;
}
</style>
