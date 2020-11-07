<template>
  <div>
    <h2>{{ lang.title }}</h2>

    <MenuList :items="menuItems" :columns="2" />
  </div>
</template>

<script>
import MenuList from "@/components/MenuList.vue";

export default {
  name: "HelpMenu",
  components: {
    MenuList,
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.helpMenu;
    },
    /** @returns {MenuList.MenuItem[]} */
    menuItems() {
      return [
        {
          ...this.lang.getStarted,
          icon: "info-circle",
          click: () => {
            this.$root.$emit("navigate", "HelpGetStarted");
          },
        },
        {
          ...this.lang.faq,
          icon: "question-circle",
          click: () => {
            alert("FAQ");
          },
        },
        {
          ...this.lang.documentation,
          icon: "book",
          click: () => {
            alert("Documentation");
          },
        },
        {
          ...this.lang.bugReport,
          icon: "bug",
          click: () => {
            alert("bug report");
          },
        },
      ];
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
