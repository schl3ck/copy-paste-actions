<template>
  <div>
    <ProcessBar
      :done="done"
      :percent="percent"
      :doneButtonLabel="lang.openApp"
      :statusLabel="lang.buildingUrl"
      :messages="options.messages"
      @doneButtonClick="openNow"
    />

    <NavigationToolbar />
  </div>
</template>

<script>
import ProcessBar from "@/components/ProcessBar.vue";
import { openNow } from "@/utils/openApp";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "OpenApp",
  components: {
    ProcessBar,
    NavigationToolbar,
  },
  data() {
    return {
      percent: null,
      done: false,
      options: {
        closePage: false,
        toMainMenu: false,
        messages: [],
      },
      base64: "",
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.openApp;
    },
    /** @returns {object} */
    preferences() {
      return this.$store.state.preferences;
    },
    historyReplaceState() {
      return !this.base64;
    },
  },
  watch: {
    base64(newV) {
      if (newV && this.preferences.Preferences.autoOpenApp) {
        this.openNow();
      }
    },
  },
  activated() {
    this.$store.commit("showMainTitle", false);
  },
  methods: {
    openNow() {
      /** @type {Parameters<openNow>[1]} */
      const options = Object.assign({}, this.options);
      options.routerMethod = this.historyReplaceState ? "replace" : "push";

      openNow(this.base64, options);
    },
  },
};
</script>

<style lang="scss" scoped></style>
