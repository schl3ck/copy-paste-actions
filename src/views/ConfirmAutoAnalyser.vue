<template>
  <div>
    <h2>{{ lang.title }}</h2>
    <div ref="content">
      <p v-html="message" />
      <h5>{{ lang.loadedShortcuts }}</h5>
      <div :class="['list-group', 'list-group-custom-flush']">
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

    <div ref="toolbar" class="fixed-bottom container">
      <ButtonBar :buttons="buttons" />
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";
import handleButtonToolbarMixin from "@/utils/handleButtonToolbarMixin";

export default {
  name: "ConfirmAutoAnalyser",
  components: {
    ButtonBar,
  },
  mixins: [handleButtonToolbarMixin("content", "toolbar")],
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
            this.$root.$once("navigated.MainMenu", () => {
              this.$root.$emit("navigate", "Preferences");
            });
            this.$root.$once("navigated.Preferences", (comp) => {
              const pref = comp.prefsWithLang.find(
                (p) => p.key === "autoLoadShortcuts",
              );
              comp.openPrefSettings(pref);
            });
            this.$root.$emit("navigate", "MainMenu");
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
            this.$root.$emit("navigate", "ProcessShortcuts");
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
            this.$root.$emit("navigate", "MainMenu");
          },
        },
        {
          text: this.lang.toMainMenu,
          class: "btn-outline-primary",
          icon: "chevron-left",
          click: () => {
            this.$root.$emit("navigate", "MainMenu");
          },
        },
      ]);
    },
    /** @returns {Store.Shortcut[]} */
    loadedShortcuts() {
      return this.$store.state.shortcuts.filter((s) => s.data);
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
    this.$store.commit("showBackButton", false);
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
