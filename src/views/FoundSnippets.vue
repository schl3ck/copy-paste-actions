<template>
  <div>
    <h2>{{ lang.title }}</h2>
    <div
      v-if="hasConflicts"
      class="alert alert-danger"
    >
      <h5 class="d-flex flex-row align-items-center">
        <FontAwesomeIcon icon="exclamation-circle" class="text-danger fa-2x mb-n1 mr-2" /> {{ lang.conflicts }}
      </h5>
      <hr class="my-2">
      <div v-for="(conflicts, key) in conflictingSnippets" :key="key" class="mb-2">
        <div v-for="(snippets, name) in conflicts" :key="name" class="mb-2">
          <div class="sticky-top alert-danger">
            <h5>
              {{ key === "clipboard" ? lang.clipboardItem : lang.snippet }}
              <span :class="{'font-italic': hasNoName(name)}">
                {{ noSnippetName(name) }}
              </span>
            </h5>
            <hr class="my-2">
          </div>
          <SnippetListItem
            v-for="snippet in snippets"
            :key="name + snippet.shortcut.name"
            :snippet="snippet"
            shortcut-instead-of-snippet-name
            class="snippet-list-item"
          />
        </div>
      </div>
    </div>
    <div v-for="shortcut in shortcuts" :key="shortcut.name" class="mb-2">
      <div class="sticky-top">
        <div class="d-flex flex-row align-items-center pt-2">
          <img v-if="shortcut.image" :src="shortcut.image" class="mr-2 img">
          <h5>{{ shortcut.name }}</h5>
        </div>
        <hr class="my-2">
      </div>
      <template v-if="shortcut.snippets.length">
        <SnippetListItem
          v-for="snippet in shortcut.snippets"
          :key="snippet.name"
          :snippet="snippet"
          class="snippet-list-item ml-3"
        />
      </template>
      <div v-else class="text-center mt-n1">
        {{ lang.noSnippetsFound }}
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
      return this.$store.state.language.foundSnippets;
    },
    /** @returns {object[]} */
    shortcuts() {
      return this.$store.state.processResult.shortcuts;
    },
    conflictingSnippets() {
      const res = {
        clipboard: {},
        snippet: {}
      };

      for (const shortcut of this.shortcuts) {
        for (const snippet of shortcut.snippets) {
          const o = snippet.isClipboard ? res.clipboard : res.snippet;
          snippet.shortcut = shortcut;
          if (snippet.discard) continue;
          if (!(snippet.name in o)) o[snippet.name] = [];
          o[snippet.name].push(snippet);
        }
      }

      for (const o of Object.values(res)) {
        for (const [k, v] of Object.entries(o)) {
          if (v.length < 2) delete o[k];
        }
      }

      return res;
    },
    hasConflicts() {
      return Object.values(this.conflictingSnippets).some(c => Object.keys(c).length > 0);
    },
    preferences() {
      return this.$store.state.preferences;
    },
    globals() {
      return this.$store.state.globals;
    },
    buttons() {
      return [
        {
          text: this.lang.saveAndContinue,
          class: {
            "btn-success": !this.hasConflicts,
            "btn-secondary": this.hasConflicts
          },
          icon: ["far", "save"],
          disabled: this.hasConflicts,
          click: function() {
            if (this.hasConflicts) return;
            // TODO:
            alert("TODO");
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
