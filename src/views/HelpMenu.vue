<template>
  <div>
    <h2>{{ lang.title }}</h2>

    <div ref="content">
      <MenuList :items="menuItems" :columns="2" />
    </div>

    <NavigationToolbar contentRefName="content" />
  </div>
</template>

<script>
import MenuList from "@/components/MenuList.vue";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "HelpMenu",
  components: {
    MenuList,
    NavigationToolbar,
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
            this.$router.push({ name: "HelpGetStarted" });
          },
        },
        {
          ...this.lang.faq,
          icon: "question-circle",
          click: () => {
            this.$router.push({ name: "HelpFAQ" });
          },
        },
        {
          ...this.lang.documentation,
          icon: "book",
          click: () => {
            this.$router.push({ name: "HelpDocumentation" });
          },
        },
        {
          ...this.lang.bugReport,
          icon: "bug",
          click: () => {
            this.$router.push({ name: "HelpBugReport" });
          },
        },
      ];
    },
  },
  activated() {
    this.$store.commit("showMainTitle", true);
  },
};
</script>

<style lang="scss" scoped></style>
