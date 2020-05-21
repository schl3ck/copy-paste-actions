<template>
  <div>
    <ProcessBar
      :restoring-state="restoringState"
      :done="done"
      :percent="percent"
      :done-button-label="lang.openApp"
      :status-label="lang.buildingUrl"
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

export default {
  name: "OpenApp",
  components: {
    ProcessBar
  },
  data() {
    return {
      percent: null,
      done: false,
      secondsBeforeTimeout: null,
      timeoutIds: [],
      options: {
        closePage: false,
        toMainMenu: false
      },
      base64: "",
      restoringState: false
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
    }
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
    }
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", true);
  },
  deactivated() {
    this.timeoutIds.forEach(id => clearTimeout(id));
  },
  methods: {
    cancelTimeout(listenAgain = true) {
      this.timeoutIds.forEach(id => clearTimeout(id));
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

      const close = () => {
        this.timeoutIds.push(
          setInterval(() => {
            window.close();
          }, 250)
        );
      };
      const mainMenu = () => {
        this.$root.$emit("navigate", "MainMenu");
      };
      const timeout = callback => {
        this.timeoutIds.push(
          setTimeout(callback, this.preferences.Preferences.closePageTimeout)
        );
      };

      const action = this.options.closePage
        ? close
        : this.options.toMainMenu
          ? mainMenu
          : null;
      timeout(() => {
        location.href = `workflow://run-workflow?name=${encodeURIComponent(
          this.$store.state.preferences["Shortcut Name"]
        )}&input=text&text=${this.base64}`;
        action && action();
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
