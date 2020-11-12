<template>
  <div class="markdown-content" v-html="html" />
</template>

<script>
import handleAnchorLinksMixin from "@/utils/handleAnchorLinksMixin";

export default {
  name: "HelpDocumentation",
  mixins: [handleAnchorLinksMixin],
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.helpFAQ;
    },
    /** @returns {string} */
    html() {
      return this.lang.html;
    },
  },
  activated() {
    this.$store.commit("showMainTitle", true);
    this.$store.commit("showBackButton", false);
  },
};
</script>

<style lang="scss" scoped>
</style>
