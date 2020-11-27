<template>
  <div id="app" ref="app" class="container">
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
      <component :is="componentToDisplay" v-bind="compProps" />
    </keep-alive>
    <div v-if="showBackButton" ref="backBtn" class="fixed-bottom container">
      <ButtonBar :buttons="buttons" />
    </div>

    <transition name="slide-down">
      <div
        v-if="showUpdateBanner || showProbablyOutdated"
        class="fixed-top text-center stacked-borders"
      >
        <div
          v-if="showUpdateBanner"
          class="alert alert-info overlay-message update-available"
          @click="toUpdate"
        >
          {{ lang.updateAvailable.text }}
          <span class="link-style">{{ lang.updateAvailable.link }}</span>
        </div>
        <div
          v-if="showProbablyOutdated"
          class="alert alert-danger overlay-message"
          @click="showProbablyOutdated = false"
        >
          {{ lang.probablyOutdated.text }}
          <span class="link-style">{{ lang.probablyOutdated.link }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Vue from "vue";
import MainMenu from "@/views/MainMenu.vue";
import SelectShortcuts from "@/views/SelectShortcuts.vue";
import ConfirmSelectedShortcuts from "@/views/ConfirmSelectedShortcuts";
import OpenApp from "@/views/OpenApp.vue";
import ProcessShortcuts from "@/views/ProcessShortcuts.vue";
import AnalyserWarnings from "@/views/AnalyserWarnings.vue";
import FoundSnippets from "@/views/FoundSnippets.vue";
import SnippetActions from "@/views/SnippetActions.vue";
import FoundInserts from "@/views/FoundInserts.vue";
import ListSnippets from "@/views/ListSnippets.vue";
import MergeSnippetsIntoShortcut from "@/views/MergeSnippetsIntoShortcut.vue";
import ImportShortcuts from "@/views/ImportShortcuts.vue";
import Preferences from "@/views/Preferences.vue";
import PrefAutoLoadShortcuts from "@/views/PrefAutoLoadShortcuts.vue";
import PrefLanguage from "@/views/PrefLanguage.vue";
import ConfirmNewUpdate from "@/views/ConfirmNewUpdate.vue";
import ListiCloudUrls from "@/views/ListiCloudUrls.vue";
import ConfirmAutoAnalyser from "@/views/ConfirmAutoAnalyser.vue";
import HelpMenu from "@/views/HelpMenu.vue";
import HelpGetStarted from "@/views/HelpGetStarted.vue";
import HelpFAQ from "@/views/HelpFAQ.vue";
import HelpDocumentation from "@/views/HelpDocumentation.vue";
import HelpBugReport from "@/views/HelpBugReport.vue";
import ButtonBar from "@/components/ButtonBar.vue";

import MainIcon from "@/icons/mainIcon.png";

class Popstate {
  constructor(state) {
    this.state = state;
  }
}

export default {
  name: "App",
  components: {
    MainMenu,
    SelectShortcuts,
    ConfirmSelectedShortcuts,
    OpenApp,
    ProcessShortcuts,
    AnalyserWarnings,
    FoundSnippets,
    SnippetActions,
    FoundInserts,
    ListSnippets,
    MergeSnippetsIntoShortcut,
    ImportShortcuts,
    Preferences,
    PrefAutoLoadShortcuts,
    PrefLanguage,
    ConfirmNewUpdate,
    ListiCloudUrls,
    ConfirmAutoAnalyser,
    HelpMenu,
    HelpGetStarted,
    HelpFAQ,
    HelpDocumentation,
    HelpBugReport,
    ButtonBar,
  },
  data() {
    return {
      componentToDisplay: "MainMenu",
      /** @type {ButtonBar.Button[]} */
      buttons: [],
      /** @type {
       * Map<Vue, {scrollPos: {x: number, y: number}, props: object}>
       * } */
      compSettings: new Map(),
      compProps: {},
      hideUpdateBanner: false,
      showProbablyOutdated: false,
      probablyOutdatedTimeouts: [],
      mainIcon: MainIcon,
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
    showBackButton() {
      return this.$store.state.showBackButton;
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
      return this.updateAvailable && !this.hideUpdateBanner;
    },
    /** @returns {boolean} */
    probablyOutdated() {
      return this.$store.state.probablyOutdated;
    },
  },
  watch: {
    showBackButton(val) {
      Vue.nextTick(() => {
        this.$refs.app.style.paddingBottom = val
          ? `calc(${this.$refs.backBtn.clientHeight}px + 0.25rem)`
          : null;
      });
    },
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
    this.$root.$on("navigate", this.navigate);
    window.addEventListener("popstate", (event) => {
      const comp =
        (event && event.state && event.state.componentToDisplay)
        || this.preferences.componentToDisplay;
      this.navigate(comp, new Popstate(event.state));
    });

    const component = this.preferences.componentToDisplay;
    // "navigate" to the predefined page to push a state onto the history stack
    if (component) {
      if (
        this.$store.state.preferences.Preferences.autoAnalyseShortcuts
        && component === "MainMenu"
      ) {
        this.$root.$emit("navigate", "ConfirmAutoAnalyser");
      } else {
        this.$root.$emit("navigate", component);
      }
    }

    this.buttons = [
      {
        class: "btn-outline-primary",
        icon: "chevron-left",
        text: this.lang.toMainMenu,
        click: this.toMainMenu,
      },
    ];
  },
  methods: {
    /** @param {string} componentName */
    navigate(componentName, options) {
      if (componentName === "ConfirmNewUpdate") {
        this.hideUpdateBanner = true;
      }

      /** @type {"pushState" | "replaceState"} */
      let historyStateMethod = "pushState";
      const comp = this.getCurrentComponent();
      if (!(options instanceof Popstate)) {
        // get the method for the History API
        historyStateMethod =
          comp && comp.historyReplaceState
            ? "replaceState"
            : historyStateMethod;
      }
      if (comp) {
        this.compSettings.set(this.componentToDisplay, {
          scrollPos: {
            x: window.scrollX,
            y: window.scrollY,
          },
          props: this.compProps,
        });
      }

      // now load the new component
      this.compProps =
        options instanceof Popstate
          ? this.compSettings.has(componentName)
            ? this.compSettings.get(componentName).props
            : {}
          : options;
      this.componentToDisplay = componentName;

      // call that with a slight delay so that Vue has mounted the component
      Vue.nextTick(() => {
        const comp = this.getCurrentComponent();
        let scrollPos =
          this.compSettings.has(componentName)
          && this.compSettings.get(componentName).scrollPos;
        if (!(options instanceof Popstate)) {
          window.history[historyStateMethod](
            { componentToDisplay: componentName },
            componentName,
          );
          scrollPos = null;
        }
        const compLang = this.lang[
          componentName[0].toLowerCase() + componentName.substr(1)
        ];
        document.title =
          "CopyPaste Actions - "
          + ((compLang && compLang.title) || componentName);
        window.scrollTo({
          left: scrollPos ? scrollPos.x : 0,
          top: scrollPos ? scrollPos.y : 0,
          behavior: "auto",
        });
        this.$root.$emit("navigated." + componentName, comp);
      });
    },
    getCurrentComponent() {
      return this.$children.find(
        (c) => c.$options.name === this.componentToDisplay,
      );
    },
    toMainMenu() {
      this.$root.$emit("toMainMenu");
      this.$root.$emit("navigate", "MainMenu");
    },
    toUpdate() {
      this.$root.$emit("navigate", "ConfirmNewUpdate");
    },
  },
};
</script>

<style lang="scss">
@use "@/styles/markdownRendered";
@use "@/styles/darkMode";

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background-color);
  padding-top: 0.5rem;
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

.mw-content {
  max-width: max-content !important;
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
