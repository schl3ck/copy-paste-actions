<template>
  <div>
    <h2>{{ lang.title }}</h2>
    <div ref="content" v-html="message" />

    <div ref="toolbar" class="fixed-bottom container">
      <ButtonBar :buttons="buttons" />
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";
import { escapeHTML } from "@/utils/utils";

export default {
  name: "ConfirmAutoAnalyser",
  components: {
    ButtonBar,
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
      return "<p>" + this.noShortcuts
        ? this.lang.noShortcuts
        : this.lang.message + "</p>";
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
  },
  created() {
    if (this.$store.state.shortcuts?.length) {
      this.checkShortcuts();
    } else {
      this.$root.$once("loadShortcutsFinished", this.checkShortcuts);
    }
  },
  activated() {
    this.$store.commit("displayMainTitle", true);
    this.$store.commit("displayBackButton", false);
  },
  mounted() {
    const height = this.$refs.toolbar.clientHeight;
    this.$refs.content.style.paddingBottom = `calc(${height}px + 0.25rem)`;
  },
  methods: {
    checkShortcuts() {
      this.noShortcuts = this.$store.state.shortcuts.every((s) => !s.data);
    },
  },
};
</script>

<style lang="scss" scoped></style>
