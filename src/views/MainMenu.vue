<template>
  <div>
    <div ref="content">
      <MissingShortcuts skipMainMenu />
      <template v-if="hasUnsavedChanges">
        <div class="card bg-warning mb-2">
          <div class="card-header font-weight-bold">
            {{ mainMenu.unsavedChanges.title }}
          </div>
          <div class="card-body pt-3">
            <p>
              {{ unsavedMessage }}
            </p>
            <p>
              {{ mainMenu.unsavedChanges.looseChanges }}
            </p>
            <button
              class="btn btn-block btn-success"
              @click.prevent="saveChanges"
            >
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

    <NavigationToolbar contentRefName="content" />

    <FirstRun v-if="firstRun" />
  </div>
</template>

<script>
import MenuList from "@/components/MenuList.vue";
import MissingShortcuts from "@/components/MissingShortcuts.vue";
import FirstRun from "@/components/FirstRun.vue";
import NavigationToolbar from "@/components/NavigationToolbar.vue";
import { navigateAndBuildZip } from "@/utils/openApp";
import { joinReadable } from "@/utils/utils";

export default {
  name: "MainMenu",
  components: {
    MenuList,
    MissingShortcuts,
    FirstRun,
    NavigationToolbar,
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
    unsavedMessage() {
      /** @type {typeof import("@/store/index").default["state"]} */
      const state = this.$store.state;

      const changed = [];
      if (state.snippetsChanged) {
        changed.push("snippets");
      }
      if (state.userPreferencesChanged) {
        changed.push("preferences");
      }
      if (state.icloudUrlsChanged) {
        changed.push("icloudUrls");
      }

      return this.mainMenu.unsavedChanges.message.replace(
        /\$list/g,
        joinReadable(
          changed.map((i) => this.mainMenu.unsavedChanges[i]),
          this.mainMenu.unsavedChanges.separator,
          this.mainMenu.unsavedChanges.separatorLast,
        ),
      );
    },
    /** @returns {MenuList.MenuItem[]} */
    menuItems() {
      const self = this;
      /** @type {MenuList.MenuItem[]} */
      const res = [
        {
          icon: "list-check",
          click() {
            self.$router.push({ name: "SelectShortcuts" });
          },
          ...this.mainMenu.selectShortcuts,
        },
        {
          icon: "pencil-fill",
          click() {
            self.$router.push({
              name: "ListSnippets",
              params: {
                editable: true,
                clipboardFirst: true,
              },
            });
          },
          ...this.mainMenu.editSnippets,
        },
        {
          icon: "gear-wide-connected",
          click() {
            self.$router.push({ name: "Preferences" });
          },
          ...this.mainMenu.preferences,
        },
        {
          icon: "question-circle",
          click() {
            self.$router.push({ name: "HelpMenu" });
          },
          ...this.mainMenu.help,
        },
      ];

      if (this.icloudUrls.length > 0) {
        res.splice(2, 0, {
          icon: { component: "IconCloudLink" },
          click() {
            self.$router.push({ name: "ListiCloudUrls" });
          },
          ...this.mainMenu.icloudUrls,
        });
      }
      return res;
    },
    /** @returns {Store.ICloudShortcut[]} */
    icloudUrls() {
      return this.$store.getters.icloudUrls;
    },
    /** @returns {boolean} */
    firstRun() {
      return this.$store.state.preferences["First Run"];
    },
  },
  activated() {
    this.$store.commit("showMainTitle", true);
  },
  methods: {
    saveChanges() {
      // let the method itself append all changes
      navigateAndBuildZip({
        actions: ["Build.toSafari"],
        toMainMenu: true,
        closePage: false,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
