<template>
  <div>
    <div ref="content" class="markdown-content" v-html="html" />

    <NavigationToolbar contentRefName="content" />
  </div>
</template>

<script>
import example1copying from "@/assets/example1copying.jpg";
import example1pasting from "@/assets/example1pasting.jpg";
import copyFunction from "@/assets/copyFunction.jpg";
import endFunction from "@/assets/endFunction.jpg";
import pasteFunction from "@/assets/pasteFunction.jpg";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "HelpGetStarted",
  components: { NavigationToolbar },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.helpGetStarted;
    },
    /** @returns {string} */
    html() {
      return this.lang.html
        .replace(
          /<p>#example1copying<\/p>/gm,
          `<p><img class="example-image" src="${example1copying}"></p>`,
        )
        .replace(
          /<p>#example1pasting<\/p>/gm,
          `<p><img class="example-image" src="${example1pasting}"></p>`,
        )
        .replace(
          /<p>#copyFunction<\/p>/gm,
          `<p><img class="example-image" src="${copyFunction}"></p>`,
        )
        .replace(
          /<p>#endFunction<\/p>/gm,
          `<p><img class="example-image" src="${endFunction}"></p>`,
        )
        .replace(
          /<p>#pasteFunction<\/p>/gm,
          `<p><img class="example-image" src="${pasteFunction}"></p>`,
        );
    },
  },
  activated() {
    this.$store.commit("showMainTitle", true);
  },
};
</script>

<style lang="scss" scoped></style>
