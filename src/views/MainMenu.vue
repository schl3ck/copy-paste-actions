<template>
  <div>
    <template v-if="hasUnsavedChanges">
      <div class="card bg-warning mb-2">
        <div class="card-header font-weight-bold">
          {{ mainMenu.unsavedChanges.title }}
        </div>
        <div class="card-body pt-3">
          <p>
            {{ unsavedSnippets
              ? unsavedPrefs
                ? mainMenu.unsavedChanges.snippetsPreferences
                : mainMenu.unsavedChanges.snippets
              : mainMenu.unsavedChanges.preferences }}
          </p>
          <p>
            {{ mainMenu.unsavedChanges.looseChanges }}
          </p>
          <button class="btn btn-block btn-success" @click="saveChanges">
            <span class="mr-2">
              <IconSave />
            </span>
            {{ mainMenu.unsavedChanges.save }}
          </button>
        </div>
      </div>
      <hr>
    </template>
    <MenuList :items="menuItems" :columns="2" />
  </div>
</template>

<script>
import MenuList from "@/components/MenuList.vue";
import { navigateAndBuildZip } from "@/utils/openApp";

export default {
  name: "MainMenu",
  components: {
    MenuList
  },
  data() {
    return {
      /** @type {MenuList.MenuItem[]} */
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
    },
    /** @returns {boolean} */
    hasUnsavedChanges() {
      return this.$store.getters.hasUnsavedChanges;
    },
    /** @returns {boolean} */
    unsavedPrefs() {
      return this.$store.state.userPreferencesChanged;
    },
    /** @returns {boolean} */
    unsavedSnippets() {
      return this.$store.state.snippetsChanged;
    }
  },
  created() {
    const self = this;
    /** @type {MenuList.MenuItem[]} */
    this.menuItems = [
      {
        icon: "hammer",
        click() {
          self.$root.$emit("navigate", "SelectShortcuts");
        },
        ...this.mainMenu.selectShortcuts
      },
      {
        icon: "pencil-fill",
        click() {
          self.$root.$emit("navigate", "ListSnippets", {
            editable: true,
            clipboardFirst: true
          });
        },
        ...this.mainMenu.editSnippets
      },
      {
        icon: "gear-wide-connected",
        click() {
          self.$root.$emit("navigate", "Preferences");
        },
        ...this.mainMenu.preferences
      },
      {
        icon: "question",
        iconOptions: {
          scale: 1.75
        },
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
  },
  methods: {
    saveChanges() {
      // let the method itself append all changes
      navigateAndBuildZip(this.$root, {
        actions: ["Build.toSafari"]
      });
    }
  }
};
</script>

<style lang="sass" scoped>

</style>
