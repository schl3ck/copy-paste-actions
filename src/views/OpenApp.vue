<template>
  <div>
    <div
      v-if="opened"
      :class="[
        'fixed-top fixed-bottom d-flex flex-column',
        'justify-content-center align-items-center',
        'container',
      ]"
    >
      <h4>{{ closingPageIn }}</h4>
      <button class="btn btn-warning btn-lg" @click="cancelClosing">
        {{ lang.cancel }}
      </button>
    </div>
    <ProcessBar
      v-else
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
import { openNow, closePageTimeout, cancelClosing } from "@/utils/openApp";
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
      /** @type {Date} timestamp when the page should be closed */
      opened: null,
      closePageTimeoutId: 0,
      closePageRemaining: 0,
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
    /** @returns {boolean} */
    historyReplaceState() {
      return !this.base64;
    },
    /** @returns {string} */
    closingPageIn() {
      return this.lang.closingPageIn.replace(
        /\$remaining/g,
        this.closePageRemaining,
      );
    },
  },
  watch: {
    base64(newV) {
      if (newV && this.preferences.Preferences.autoOpenApp) {
        this.openNow();
      }
    },
    opened(val) {
      if (val) {
        this.closePageTimeoutId = setInterval(() => {
          this.closePageRemaining = Math.ceil(
            (this.opened - new Date()) / 1000,
          );
          if (this.closePageRemaining < 0) {
            this.opened = null;
          }
        }, 200);
      } else {
        if (this.closePageTimeoutId) {
          clearInterval(this.closePageTimeoutId);
          this.closePageTimeoutId = this.closePageRemaining = 0;
        }
      }
    },
  },
  activated() {
    this.$store.commit("showMainTitle", false);
  },
  deactivated() {
    this.opened = null;
  },
  methods: {
    openNow() {
      /** @type {Parameters<openNow>[1]} */
      const options = Object.assign({}, this.options);
      options.routerMethod = this.historyReplaceState ? "replace" : "push";

      openNow(this.base64, options);
      if (options.closePage) {
        const d = new Date();
        d.setMilliseconds(d.getMilliseconds() + closePageTimeout);
        this.opened = d;
      }
    },
    cancelClosing() {
      cancelClosing();
      this.opened = null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
