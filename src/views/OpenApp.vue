<template>
  <div>
    <div
      v-if="closingAt"
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
    >
      <div v-if="offerArchiveRebuild" class="container text-center mt-2">
        <span v-html="lang.rebuildInfo" />
        <br>
        <button class="btn btn-primary btn-sm" @click="rebuildArchive">
          {{ lang.rebuild }}
        </button>
      </div>
    </ProcessBar>

    <NavigationToolbar />
  </div>
</template>

<script>
import ProcessBar from "@/components/ProcessBar.vue";
import { openNow, cancelClosing, navigateAndBuildZip } from "@/utils/openApp";
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
      closingAt: null,
      closePageTimeoutId: 0,
      closePageRemaining: 0,
      offerArchiveRebuild: false,
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.openApp;
    },
    /** @returns {Store.Preferences} */
    preferences() {
      return this.$store.state.preferences.Preferences;
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
      if (newV && this.preferences.autoOpenApp) {
        this.openNow();
      }
    },
    closingAt(val) {
      if (val) {
        this.closePageTimeoutId = setInterval(() => {
          this.closePageRemaining = Math.ceil(
            (this.closingAt - new Date()) / 1000,
          );
          if (this.closePageRemaining < 0) {
            this.closingAt = null;
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
    this.closingAt = null;
  },
  methods: {
    openNow() {
      /** @type {Parameters<openNow>[1]} */
      const options = Object.assign({}, this.options);
      options.routerMethod = this.historyReplaceState ? "replace" : "push";

      openNow(this.base64, options);
      if (options.closePage) {
        const d = new Date();
        d.setMilliseconds(
          d.getMilliseconds() + this.preferences.closePageTimeout * 1000,
        );
        this.closingAt = d;
      } else {
        setTimeout(() => {
          this.offerArchiveRebuild = true;
        }, 2000);
      }
    },
    cancelClosing() {
      cancelClosing();
      this.closingAt = null;
      this.offerArchiveRebuild = true;
    },
    rebuildArchive() {
      navigateAndBuildZip(this.options);
    },
  },
};
</script>

<style lang="scss" scoped></style>
