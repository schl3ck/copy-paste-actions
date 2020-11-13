<template>
  <div>
    <ProcessBar
      :restoringState="restoringState"
      :done="done"
      :percent="percent"
      :doneButtonLabel="lang.openApp"
      :statusLabel="lang.buildingUrl"
      :messages="options.messages"
      @doneButtonClick="openNow"
    />
    <div v-if="closingIn" class="fixed-top text-center mt-2" role="alert">
      {{ closingIn }}
      <button class="badge badge-pill badge-secondary" @click="cancelTimeout">
        {{ lang.cancel }}
      </button>
    </div>
  </div>
</template>

<script>
import ProcessBar from "@/components/ProcessBar.vue";
import { openNow } from "@/utils/openApp";

export default {
  name: "OpenApp",
  components: {
    ProcessBar,
  },
  data() {
    return {
      percent: null,
      done: false,
      secondsBeforeTimeout: null,
      timeoutIds: [],
      options: {
        closePage: false,
        toMainMenu: false,
        messages: [],
      },
      base64: "",
      restoringState: false,
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
    /** @returns {string} */
    closingIn() {
      return this.secondsBeforeTimeout === null
        ? ""
        : this.secondsBeforeTimeout <= 0
        ? this.lang.closingNow
        : (this.options.closePage
            ? this.lang.closingIn
            : this.options.toMainMenu
            ? this.lang.returningToMainMenuIn
            : ""
          ).replace("$seconds", this.secondsBeforeTimeout);
    },
    historyReplaceState() {
      return !this.base64;
    },
  },
  watch: {
    base64(newV) {
      if (
        newV &&
        !this.restoringState &&
        this.preferences.Preferences.autoOpenApp
      ) {
        this.openNow();
      }
    },
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", true);
  },
  deactivated() {
    this.timeoutIds.forEach((id) => clearTimeout(id));
  },
  methods: {
    cancelTimeout(listenAgain = true) {
      this.timeoutIds.forEach((id) => clearTimeout(id));
      this.$emit("open-cancel", listenAgain);
      this.secondsBeforeTimeout = null;
    },
    openNow() {
      // this.secondsBeforeTimeout = Math.round(
      //   this.preferences.Preferences.closePageTimeout / 1000
      // );
      // this.timeoutIds.push(
      //   setInterval(() => {
      //     this.secondsBeforeTimeout--;
      //     if (this.secondsBeforeTimeout <= 0) {
      //       this.timeoutIds.forEach(id => clearInterval(id));
      //       this.timeoutIds = [];
      //     }
      //   }, 1000)
      // );

      this.timeoutIds = openNow(this.$root, this.base64, this.options);
    },
  },
};
</script>

<style lang="scss" scoped></style>
