<template>
  <div>
    <h2>{{ lang.title }}</h2>

    <div
      v-show="hasConflicts"
      ref="conflicts"
      class="alert alert-danger"
    >
      <h5 class="d-flex flex-row align-items-center">
        <FontAwesomeIcon icon="exclamation-circle" class="text-danger fa-2x mb-n1 mr-2" /> {{ lang.conflicts }}
      </h5>
      <hr class="my-2">

      <div v-for="(conflicts, key) in conflictingSnippets" :key="key" class="mb-2">
        <div v-for="(snippets, name) in conflicts" :key="name" class="mb-2">
          <div class="sticky-top alert-danger">
            <h5 class="mb-0">
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
            check-overrides
            class="snippet-list-item text-body"
          />
        </div>
      </div>
    </div>

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

      <template v-if="shortcut.snippets.length">
        <SnippetListItem
          v-for="snippet in shortcut.snippets"
          :key="snippet.name"
          :snippet="snippet"
          check-overrides
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
import Vue from "vue";
import SnippetListItem from "@/components/SnippetListItem.vue";
import ButtonBar from "@/components/ButtonBar.vue";
import { getFullHeight } from "@/utils/utils";

export default {
  name: "FoundSnippets",
  components: {
    SnippetListItem,
    ButtonBar
  },
  data() {
    return {
      editingElemTop: 0
    };
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
    enableContinueButton() {
      return !this.hasConflicts && !this.$store.state.snippetListItemEditing;
    },
    buttons() {
      return [
        {
          text: this.lang.saveAndContinue,
          class: {
            "btn-success": this.enableContinueButton,
            "btn-secondary": !this.enableContinueButton
          },
          icon: ["far", "save"],
          click: function() {
            if (!this.enableContinueButton) {
              let top = 0;
              if (this.hasConflicts) {
                alert(this.lang.resolveConflicts);
              } else {
                alert(this.lang.finishEditing);
                top = this.editingElemTop;
              }
              window.scrollTo({
                left: 0,
                top: top,
                behavior: "smooth"
              });
              return;
            }

            let snippets = [];
            for (const shortcut of this.shortcuts) {
              snippets = snippets.concat(shortcut.snippets.filter((s) => !s.discard));
                }
            if (snippets.length > 0) {
              this.$store.commit("replaceSnippets", snippets);
            }
            this.$root.$emit("navigate", "FoundInserts");
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
  watch: {
    hasConflicts(newVal) {
      const scrollTop = window.scrollY;
      let height = 0;
      const getHeight = () => {
        height = getFullHeight(this.$refs.conflicts);
      };
      const correctScrollPos = () => {
        // the browser already corrected it
        if (scrollTop !== window.scrollY) return;

        window.scrollBy({ top: newVal ? height : -height, behavior: "auto" });
      };

      if (newVal) {
        Vue.nextTick(() => {
          getHeight();
          correctScrollPos();
        });
      } else {
        getHeight();
        Vue.nextTick(correctScrollPos);
      }
    }
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.$root.$on("snippetBeginEdit", this.onSnippetEdit);
  },
  deactivated() {
    this.$root.$off("snippetBeginEdit", this.onSnippetEdit);
  },
  methods: {
    noSnippetName(val) {
      return val === this.globals.noSnippetName ? this.lang.noSnippetName : val;
    },
    hasNoName(name) {
      return name === this.globals.noSnippetName;
    },
    onSnippetEdit(vm) {
      const bodyRect = document.body.getBoundingClientRect();
      const elemRect = vm.$el.getBoundingClientRect();
      let stickyTop = vm.$el;
      // search for a possible .sticky-top sibling (the shortcut name)
      // in case a saved snippet will be overridden and that one is edited, it doesn't have such a sibling
      while (
        stickyTop.nodeType !== Node.ELEMENT_NODE || !stickyTop.classList.contains("sticky-top")
      ) {
        if (stickyTop.previousSibling === null) {
          stickyTop = stickyTop.parentElement;
        } else {
          stickyTop = stickyTop.previousSibling;
        }
      }
      this.editingElemTop = elemRect.top - bodyRect.top - (stickyTop ? stickyTop.getBoundingClientRect().height : 0);
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
