<template>
  <div>
    <h2>{{ lang.title }}</h2>
    <div ref="content">
      <p v-html="message" />
      <MissingShortcuts />
      <h5>{{ lang.loadedShortcuts }}</h5>
      <div class="list-group list-group-custom-flush">
        <div
          v-for="shortcut in loadedShortcuts"
          :key="shortcut.name"
          :class="[
            'list-group-item',
            'custom-list-group-item',
            'd-flex',
            'align-items-center',
            'text-left',
          ]"
        >
          <img
            v-if="shortcut.image"
            :src="shortcut.image"
            class="mr-2 icon"
            alt="icon"
          >
          <span>{{ shortcut.name }}<span class="sr-only">.</span></span>
        </div>
      </div>
    </div>

    <NavigationToolbar :buttons="buttons" contentRefName="content" />
  </div>
</template>

<script>
import NavigationToolbar from "@/components/NavigationToolbar.vue";
import MissingShortcuts from "@/components/MissingShortcuts.vue";

export default {
  name: "ConfirmAutoAnalyser",
  components: {
    NavigationToolbar,
    MissingShortcuts,
  },
  data() {
    return {
      noShortcuts: false,
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.confirmAutoAnalyser;
    },
    /** @returns {string} */
    message() {
      return (
        "<p>"
        + (this.noShortcuts ? this.lang.noShortcuts : this.lang.message)
        + "</p>"
      );
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      /** @type {ButtonBar.Button[]} */
      const buttons = [];
      if (this.noShortcuts) {
        buttons.push({
          text: this.lang.selectAutoLoadShortcuts,
          class: "btn-primary",
          icon: "list-check",
          click: () => {
            this.$router
              .push({ name: "MainMenu" })
              .then(() => {
                return this.$router.push({
                  name: "Preferences",
                  params: {
                    scrollToPref: "autoLoadShortcuts",
                  },
                });
              })
              .then(() => {
                const comp = this.$store.state.activeRouterView;
                const pref = comp.prefsWithLang.find(
                  (p) => p.key === "autoLoadShortcuts",
                );
                comp.openPrefSettings(pref);
              });
          },
        });
      } else {
        buttons.push({
          text: this.lang.analyse,
          class: "btn-success",
          icon: "play-fill",
          iconOptions: {
            scale: 1.25,
          },
          click: () => {
            this.$router.push({ name: "ProcessShortcuts" });
          },
        });
      }
      return buttons.concat([
        {
          text: this.lang.disablePreference,
          class: "btn-warning",
          icon: "x",
          iconOptions: {
            scale: 1.5,
          },
          click: () => {
            this.$store.commit("userPreferences", {
              autoAnalyseShortcuts: false,
            });
            this.$router.push({ name: "MainMenu" });
          },
        },
      ]);
    },
    /** @returns {Store.Shortcut[]} */
    loadedShortcuts() {
      return this.$store.getters.loadedShortcuts;
    },
  },
  created() {
    if (this.$store.state.shortcuts?.length) {
      this.checkShortcuts();
    } else {
      this.$root.$once("loadShortcutsFinished", this.checkShortcuts);
    }
  },
  activated() {
    this.$store.commit("showMainTitle", true);
  },
  methods: {
    checkShortcuts() {
      this.noShortcuts = this.loadedShortcuts.length === 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.icon {
  width: 30px;
  height: 30px;
}
</style>
