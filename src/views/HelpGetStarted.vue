<template>
  <div class="markdown-content" v-html="html" />
</template>

<script>
import example1screenshot from "@/assets/example1screenshot.jpg";

export default {
  name: "HelpGetStarted",
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.helpGetStarted;
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

<style lang="scss" scoped></style>
