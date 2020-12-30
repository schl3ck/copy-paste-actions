<template>
  <div>
    <div ref="content" class="markdown-content" v-html="html" />

    <NavigationToolbar contentRefName="content" />
  </div>
</template>

<script>
import handleAnchorLinksMixin from "@/utils/handleAnchorLinksMixin";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "HelpFAQ",
  components: { NavigationToolbar },
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
  },
};
</script>

<style lang="scss" scoped></style>
