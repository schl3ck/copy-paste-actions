<template>
  <div class="d-flex flex-column">
    <div ref="content">
      <div :class="{ 'order-2': !clipboardFirst }">
        <div class="sticky-top">
          <h2 class="mb-0">
            {{ lang.clipboard }}
          </h2>
          <hr class="my-2">
        </div>

        <template v-if="clipboard && clipboard.length">
          <SnippetListItem
            v-for="snippet in clipboard"
            :key="'clip' + snippet.name"
            :snippet="snippet"
            :editable="editable"
            showActionsBtnOutline
            :onSelect="onSelect"
            :highlight="snippet === highlight"
            class="snippet-list-item"
          />
        </template>
        <div v-else class="text-center">
          {{ lang.noSnippets.clipboard }}<span class="sr-only">.</span>
        </div>
      </div>
      <div :class="{ 'order-1': !clipboardFirst }">
        <div class="sticky-top">
          <h2 class="mb-0">
            {{ lang.snippets }}
          </h2>
          <hr class="my-2">
        </div>

        <template v-if="snippets && snippets.length">
          <SnippetListItem
            v-for="snippet in snippets"
            :key="'clip' + snippet.name"
            :snippet="snippet"
            :editable="editable"
            showActionsBtnOutline
            :onSelect="onSelect"
            :highlight="snippet === highlight"
            class="snippet-list-item"
          />
        </template>
        <div v-else class="text-center">
          {{ lang.noSnippets.snippets }}<span class="sr-only">.</span>
        </div>
      </div>
    </div>

    <NavigationToolbar :buttons="buttons" contentRefName="content" />
  </div>
</template>

<script>
import SnippetListItem from "@/components/SnippetListItem.vue";
import { navigateAndBuildZip } from "@/utils/openApp";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "ListSnippets",
  components: {
    SnippetListItem,
    NavigationToolbar,
  },
  props: {
    editable: {
      type: Boolean,
      default: true,
    },
    clipboardFirst: {
      type: Boolean,
      default: true,
    },
    /** @type {import("vue").PropOptions<(snippet: object) => void>} */
    onSelect: {
      type: Function,
      default: null,
    },
    /** The snippet to highlight */
    highlight: {
      type: Object,
      default: null,
    },
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.listSnippets;
    },
    /** @returns {object[]} */
    snippets() {
      return this.$store.state.snippets.filter((s) => !s.isClipboard);
    },
    /** @returns {object[]} */
    clipboard() {
      return this.$store.state.snippets.filter((s) => s.isClipboard);
    },
    /** @returns {boolean} */
    unsavedSnippets() {
      return this.$store.state.snippetsChanged;
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      /** @type {ButtonBar.Button[]} */
      const res = [];
      if (this.editable && this.unsavedSnippets) {
        res.push({
          text: this.lang.save,
          class: "btn-success",
          icon: { component: "IconSave" },
          click: () => {
            // let the method append all changes
            navigateAndBuildZip({
              actions: ["Build.toSafari"],
            });
          },
        });
      }
      return res;
    },
  },
  activated() {
    this.$store.commit("showMainTitle", false);
  },
};
</script>

<style lang="scss" scoped>
.snippet-list-item:not(:last-child) {
  margin-bottom: 0.5rem;
}
</style>
