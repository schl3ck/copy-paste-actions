<template>
  <div id="app" ref="app" class="container">
    <div v-if="showMainTitle" class="sticky-top">
      <span class="title text-warning">
        <FontAwesomeIcon icon="clipboard" /> {{ preferences["Shortcut Name"] }}
      </span>
      <hr>
    </div>
    <keep-alive>
      <component :is="componentToDisplay" v-bind="compProps" />
    </keep-alive>
    <div v-if="showBackButton" ref="backBtn" class="fixed-bottom container">
      <ButtonBar :buttons="buttons" />
    </div>
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
import ButtonBar from "@/components/ButtonBar.vue";

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
    ButtonBar
  },
  data() {
    return {
      componentToDisplay: "MainMenu",
      /** @type {ButtonBar.Button[]} */
      buttons: [],
      /** @type {Map<Vue, {scrollPos: {x: number, y: number}, props: object} } */
      compSettings: new Map(),
      compProps: {}
    };
  },
  computed: {
    /** @returns {object} */
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
    }
  },
  watch: {
    showBackButton(val) {
      Vue.nextTick(() => {
        this.$refs.app.style.paddingBottom = val
          ? `calc(${this.$refs.backBtn.clientHeight}px + 0.25rem)`
          : null;
      });
    }
  },
  created() {
    this.$root.$on("navigate", this.navigate);
    window.addEventListener("popstate", (event) => {
      const comp =
        (event && event.state && event.state.componentToDisplay) ||
        this.preferences.componentToDisplay;
      this.navigate(comp, new Popstate(event.state));
    });

    const component = this.preferences.componentToDisplay;
    // "navigate" to the predefined page to push a state onto the history stack
    if (component) this.$root.$emit("navigate", component);

    this.buttons = [
      {
        class: "btn-outline-primary",
        icon: "chevron-left",
        text: this.lang.toMainMenu,
        click: this.toMainMenu
      }
    ];
  },
  methods: {
    /** @param {string} componentName */
    navigate(componentName, options) {
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
            y: window.scrollY
          },
          props: this.compProps
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
        let scrollPos = this.compSettings.has(componentName) && this.compSettings.get(componentName).scrollPos;
        if (!(options instanceof Popstate)) {
          window.history[historyStateMethod](
            { componentToDisplay: componentName },
            componentName
          );
          scrollPos = null;
        }
        window.scrollTo({
          left: scrollPos ? scrollPos.x : 0,
          top: scrollPos ? scrollPos.y : 0,
          behavior: "auto"
        });
        this.$root.$emit("navigated." + componentName, comp);
      });
    },
    getCurrentComponent() {
      return this.$children.find(
        (c) => c.$options.name === this.componentToDisplay
      );
    },
    toMainMenu() {
      this.$root.$emit("toMainMenu");
      this.$root.$emit("navigate", "MainMenu");
    }
  }
};
</script>

<style lang="scss">
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding-top: 0.5rem;
}
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  background: white;
}

.pre-line {
  white-space: pre-line;
}

.title {
  margin-bottom: 0.5rem;
  font-weight: 700;
  line-height: 1.2;
  font-size: 1.55rem;

  @media (min-width: 375px) {
    font-size: 1.95rem;
    font-weight: 500;
  }
  @media (min-width: 576px) {
    font-size: 2.5rem;
  }
}
</style>
