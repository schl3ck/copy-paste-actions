<template>
  <div>
    <!-- TODO: overall "no inserts found" when there are none -->
    <h2>{{ lang.title }}</h2>

    <div v-for="shortcut in shortcuts" :key="shortcut.name" class="mb-2">
      <div class="sticky-top">
        <div class="d-flex flex-row align-items-center">
          <img v-if="shortcut.image" :src="shortcut.image" class="mr-2 img">
          <h5>{{ shortcut.name }}</h5>
        </div>
        <hr class="my-2">
      </div>

      <template v-if="shortcut.inserts.length">
        <div
          v-for="insert in shortcut.inserts"
          :key="shortcut.name + insert.id"
          class="card ml-3"
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
              <!-- TODO: add checkbox to exclude this from being processed -->
              <div>
                <!-- TODO: add button to change this (test if above or beneath snippet) -->
                <!-- TODO: warn when no snippet was found with the name and prevent continuation -->
                <hr class="my-2">
                {{ lang.inserts[insert.isClipboard ? "clipboard" : "snippet"] }}
                <SnippetListItem
                  :snippet="getSnippet(insert)"
                  class="snippet-list-item"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center mt-n1">
        {{ lang.noInsertsFound }}
      </div>
    </div>

    <ButtonBar :buttons="buttons" />
  </div>
</template>

<script>
import SnippetListItem from "@/components/SnippetListItem.vue";
import ButtonBar from "@/components/ButtonBar.vue";

export default {
  name: "FoundSnippets",
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
    clipboard() {
      return this.$store.state.clipboard;
    },
    buttons() {
      return [
        {
          text: this.lang.saveAndContinue,
          class: "btn-success",
          icon: ["far", "save"],
          click: function() {
            // TODO:
            const snippets = {};
            const clipboard = {};
            for (const shortcut of this.shortcuts) {
              for (const snippet of shortcut.snippets) {
                if (snippet.discard) continue;
                if (snippet.isClipboard) {
                  clipboard[snippet.name] = snippet;
                } else {
                  snippets[snippet.name] = snippet;
                }
              }
            }
            if (Object.keys(clipboard).length > 0) {
              this.$store.commit("amendClipboard", clipboard);
            }
            if (Object.keys(snippets).length > 0) {
              this.$store.commit("amendSnippets", snippets);
            }
          }.bind(this)
        },
        {
          text: this.$store.state.language.toMainMenu,
          class: "btn-outline-primary",
          icon: "chevron-left",
          click() {
            this.$root.$emit("navigate", "MainMenu");
          }
        }
      ];
    }
  },
  activated() {
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
      const o = insert.isClipboard ? this.clipboard : this.snippets;
      return o[insert.name];
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
</style>
