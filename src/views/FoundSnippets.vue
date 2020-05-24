<template>
  <div>
    <h2>{{ lang.title }}</h2>
    <div v-for="shortcut in shortcuts" :key="shortcut.name" class="mb-2">
      <div class="sticky-top">
        <div class="d-flex flex-row align-items-center pt-2">
          <img v-if="shortcut.image" :src="shortcut.image" class="mr-2 img">
          <h5>{{ shortcut.name }}</h5>
        </div>
        <hr class="my-2 ml-3">
      </div>
      <template v-if="Object.values(shortcut.snippets).length">
        <SnippetListItem v-for="snippet in Object.values(shortcut.snippets)" :key="snippet.name" :snippet="snippet" />
      </template>
      <div v-else class="text-center mt-n1">
        {{ lang.noSnippetsFound }}
      </div>
    </div>
  </div>
</template>

<script>
import SnippetListItem from "@/components/SnippetListItem.vue";

export default {
  name: "FoundSnippets",
  components: {
    SnippetListItem
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
    preferences() {
      return this.$store.state.preferences;
    },
    globals() {
      return this.$store.state.globals;
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
.sticky-top {
  position: sticky;
  top: 0;
}
</style>
