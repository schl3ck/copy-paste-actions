<template>
  <div class="markdown-content" v-html="html" />
</template>

<script>
import example1screenshot from "@/assets/example1screenshot.jpg";
import handleAnchorLinksMixin from "@/utils/handleAnchorLinksMixin";

export default {
  name: "HelpDocumentation",
  mixins: [handleAnchorLinksMixin],
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.helpDocumentation;
    },
    /** @returns {string} */
    html() {
      return this.lang.html.replace(
        /<p>#example1screenshot<\/p>/gm,
        `<p><img class="example-image" src="${example1screenshot}"></p>`,
      );
    },
  },
  activated() {
    this.$store.commit("showMainTitle", true);
    this.$store.commit("showBackButton", false);
  },
};
</script>

<style lang="scss" scoped>
.markdown-content ::v-deep {
  > div > p:last-child {
    margin-bottom: 0;
  }

  .table.nowrap-first-column td:first-child {
    white-space: nowrap;
  }
  .table > tbody > tr:last-child {
    border-bottom: 1px solid #dee2e6;
  }
}
</style>
