<template>
  <div id="app" ref="app" :class="{ container: useGlobalContainer }">
    <div v-if="showMainTitle" id="mainTitle" class="sticky-top">
      <span class="title text-warning">
        <svg viewBox="0 0 500 55" fill="currentColor">
          <image
            :href="mainIcon"
            width="50"
            height="50"
            preserveAspectRatio="xMinYMid meet"
          />
          <text x="60" y="40">{{ preferences["Shortcut Name"] }}</text>
        </svg>
      </span>
      <hr class="mt-1">
    </div>
    <keep-alive>
      <HistoryOverview v-if="showHistoryOverview" />
      <router-view v-else />
    </keep-alive>

    <transition name="slide-down">
      <div
        v-if="showUpdateBanner || showProbablyOutdated"
        class="fixed-top text-center stacked-borders"
      >
        <div
          v-if="showUpdateBanner"
          class="alert alert-info overlay-message update-available"
          @click.prevent="toUpdate"
        >
          {{ lang.updateAvailable.text }}
          <span class="link-style">{{ lang.updateAvailable.link }}</span>
        </div>
        <div
          v-if="showProbablyOutdated"
          class="alert alert-danger overlay-message"
          @click.prevent="showProbablyOutdated = false"
        >
          {{ lang.probablyOutdated.text }}
          <span class="link-style">{{ lang.probablyOutdated.link }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import MainIcon from "@/icons/mainIcon.png";
import HistoryOverview from "@/views/HistoryOverview.vue";

export default {
  name: "App",
  components: { HistoryOverview },
  data() {
    return {
      showProbablyOutdated: false,
      probablyOutdatedTimeouts: [],
      mainIcon: MainIcon,
      testoutput: "",
    };
  },
  computed: {
    /** @returns {Store.AppSettings} */
    preferences() {
      return this.$store.state.preferences;
    },
    /** @returns {boolean} */
    showMainTitle() {
      return this.$store.state.showMainTitle;
    },
    /** @returns {boolean} */
    useGlobalContainer() {
      return this.$store.state.useGlobalContainer;
    },
    /** @returns {object} */
    lang() {
      return this.$store.state.language;
    },
    /** @returns {Store.UpdateAvailable} */
    updateAvailable() {
      return (
        this.$store.state.updateAvailable
        && this.$store.state.updateAvailable.version
          !== this.preferences.Preferences.ignoreVersion
      );
    },
    /** @returns {boolean} */
    showUpdateBanner() {
      return this.updateAvailable && !this.$store.state.hideUpdateBanner;
    },
    /** @returns {boolean} */
    probablyOutdated() {
      return this.$store.state.probablyOutdated;
    },
    /** @returns {boolean} */
    showHistoryOverview() {
      return this.$store.state.showHistoryOverview;
    },
  },
  watch: {
    probablyOutdated(val) {
      if (val) {
        const id = setTimeout(() => {
          this.probablyOutdatedTimeouts.splice(
            this.probablyOutdatedTimeouts.indexOf(id),
            1,
          );
          this.showProbablyOutdated = true;
        }, 2000);
        this.probablyOutdatedTimeouts.push(id);
      } else {
        this.showProbablyOutdated = false;
        if (this.probablyOutdatedTimeouts.length > 0) {
          for (const id of this.probablyOutdatedTimeouts) {
            clearTimeout(id);
          }
          this.probablyOutdatedTimeouts = [];
        }
      }
    },
  },
  created() {
    const component = this.preferences.componentToDisplay;
    // "navigate" to the predefined page to push a state onto the history stack
    if (component) {
      if (
        this.$store.state.preferences.Preferences.autoAnalyseShortcuts
        && component === "MainMenu"
      ) {
        this.$router.push({ name: "ConfirmAutoAnalyser" });
      } else {
        this.$router.push({ name: component });
      }
    }
  },
  methods: {
    toUpdate() {
      this.$router.push({ name: "ConfirmNewUpdate" });
    },
  },
};
</script>

<style lang="scss">
@use "@/styles/markdownRendered";
@use "@/styles/darkMode";

.touch-gesture {
  @at-root body#{&} {
    position: relative;
  }
  &.touch-gesture-transition {
    transition: left 0.2s cubic-bezier(0, 1, 1, 1),
      right 0.2s cubic-bezier(0, 1, 1, 1);
  }
}

.navigation-overlay {
  display: none;
  position: fixed;
  top: -1rem;
  bottom: -1rem;
  left: 0px;
  right: 0px;
  z-index: 1029;

  &.touch-gesture {
    display: block;
  }
  .left,
  .right {
    position: absolute;
    top: -1rem;
    bottom: -1rem;
    width: calc(100vw + 1rem);
    box-shadow: inset 0 0 0.5rem gray;
    background: var(--background-color);
  }
  .left {
    left: calc(-100vw - 1rem);
  }
  .right {
    right: calc(-100vw - 1rem);
  }
}

h2 {
  word-wrap: break-word;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 100;
  padding-top: 0.5rem;
  &:not([class*="alert-"]) {
    background: var(--background-color);
  }
}
.sticky-left {
  position: sticky;
  left: 0;
  z-index: 100;
  background: var(--background-color);
}
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  background: var(--background-color);
}

.fs-1x5 {
  font-size: 1.5em;
}
.fs-2x {
  font-size: 2em;
}
.fs-2x5 {
  font-size: 2.5em;
}
.fs-3x {
  font-size: 3em;
}
.fs-3x5 {
  font-size: 3.5em;
}
.fs-4x {
  font-size: 4em;
}
.fs-4x5 {
  font-size: 4.5em;
}
.fs-5x {
  font-size: 5em;
}
.fs-5x5 {
  font-size: 5.5em;
}
.fs-6x {
  font-size: 6em;
}
.fs-6x5 {
  font-size: 6.5em;
}

.pre-line {
  white-space: pre-line;
}
.pre-wrap {
  white-space: pre-wrap;
}

.w-maxcontent {
  width: max-content !important;
}
.mw-content {
  max-width: max-content !important;
}
.max-vw-100 {
  max-width: 100vw;
}
.max-vh-100 {
  max-height: 100vh;
}

.overflow-scroll {
  overflow: scroll !important;
}

.main-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.2rem;
}
.title {
  margin-bottom: 0.5rem;
  font-weight: 500;
  line-height: 1;
  font-size: 2.8rem;
  white-space: nowrap;
  > svg {
    width: 100%;
    max-width: 400px;
  }
}

.overlay-message {
  width: 80%;
  padding: 0.25rem 0.5rem;
  margin: 0 auto;
  cursor: pointer;
  pointer-events: all;
}
.link-style {
  color: var(--blue);
  text-decoration: underline;
}

.slide-down-enter,
.slide-down-and-up-enter {
  transform: translateY(-100%);
}
.slide-down-enter-active,
.slide-down-and-up-enter-active {
  transition: transform 0.5s ease-out;
}
.slide-down-and-up-leave-active {
  transform: translateY(-100%);
  transition: transform 0.5s ease-in;
}

.fade-enter {
  opacity: 0 !important;
}
.fade-enter-active {
  transition: opacity 0.3s ease-out;
}
.fade-leave-active {
  opacity: 0 !important;
  transition: opacity 0.3s ease-in;
}

.backdrop {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--darken-background);
  opacity: 1;
  z-index: 500;
}

.stacked-borders > div {
  &:not(:last-child) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  &:not(:first-child) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 575px) {
  .custom-list-group-item {
    padding-left: 0;
    padding-right: 0;
  }
  .list-group-custom-flush {
    &.no-top-bottom-border {
      .list-group-item {
        &:first-child {
          border-top-width: 0;
        }
        &:last-child {
          border-bottom-width: 0;
        }
      }
    }
    .list-group-item {
      border-left-width: 0;
      border-right-width: 0;
      border-radius: 0;
      z-index: 105;
    }
  }
}
</style>
