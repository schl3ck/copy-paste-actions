<template>
  <div>
    <MenuList :items="menuItems" :columns="2" />
  </div>
</template>

<script>
import MenuList from "@/components/MenuList.vue";

export default {
  name: "MainMenu",
  components: {
    MenuList
  },
  data() {
    return {
      menuItems: []
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language;
    },
    /** @returns {object} */
    mainMenu() {
      return this.lang.mainMenu;
    }
  },
  created() {
    const self = this;
    this.menuItems = [
      {
        icon: "hammer",
        click() {
          self.$root.$emit("navigate", "SelectShortcuts");
        },
        ...this.mainMenu.selectShortcuts
      },
      {
        icon: "pencil-alt",
        click() {
          self.$root.$emit("navigate", "ListSnippets", {
            editable: true,
            clipboardFirst: true
          });
        },
        ...this.mainMenu.editSnippets
      },
      {
        icon: "cogs",
        click() {
          self.$root.$emit("navigate", "Preferences");
        },
        ...this.mainMenu.preferences
      },
      {
        icon: "question",
        click() {
          alert("Select Shortcuts");
        },
        ...this.mainMenu.help
      }
    ];
  },
  activated() {
    this.$store.commit("showMainTitle", true);
    this.$store.commit("showBackButton", false);
  }
};
</script>

<style lang="sass" scoped>

</style>
