<template>
  <div>
    <ProcessBar
      :restoringState="restoringState"
      :done="done"
      :percent="percent"
      :doneButtonLabel="lang.openApp"
      :statusLabel="lang.buildingUrl"
      @doneButtonClick="openNow"></ProcessBar>
    <div v-if="closingIn" class="fixed-top text-center mt-2" role="alert">
      {{ closingIn }}
      <button class="badge badge-pill badge-secondary" @click="cancelTimeout">{{ lang.cancel }}</button>
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
  created() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", true);

    this.$on("open-app", () => {
      this.secondsBeforeTimeout = Math.round(
        this.preferences.Preferences.closePageTimeout / 1000
      );
      this.timeoutIds.push(
        setInterval(() => {
          this.secondsBeforeTimeout--;
          if (this.secondsBeforeTimeout <= 0) {
            this.timeoutIds.forEach(id => clearInterval(id));
            this.timeoutIds = [];
          }
        }, 1000)
      );
    });
  },
  destroyed() {
    this.timeoutIds.forEach(id => clearTimeout(id));
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
    getDataToSave() {
      return {
        replaceState: !!this.base64,
        data: {
          done: this.done,
          base64: this.base64,
          options: this.options
        }
      };
    }
  },
  methods: {
    cancelTimeout(listenAgain = true) {
      this.timeoutIds.forEach(id => clearTimeout(id));
      this.$emit("open-cancel", listenAgain);
      this.secondsBeforeTimeout = null;
    },
    openNow() {
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
  }
};
</script>

<style lang="scss" scoped>
.spinner-container {
  left: 50%;
  transform: translateX(-50%);
}
.spinner-border {
  animation-duration: 1s;
  top: 0.7rem;
}
.progress {
  top: 1.7rem;
}
.progress-bar {
  transition-duration: 0.2s;
}

.margin {
  margin-bottom: 0.25rem;
}
.status-icon {
  height: 2.7rem;
}
.status-label {
  padding-bottom: 1.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.fade-enter {
  transform: translateX(50vw);
}
.fade-leave-to {
  transform: translateX(-50vw);
}
</style>
