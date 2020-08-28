<template>
  <div id="app" ref="app" class="container">
    <div v-if="showMainTitle" class="sticky-top">
      <span class="title text-warning">
        <FontAwesomeIcon icon="clipboard" /> {{ preferences["Shortcut Name"] }}
      </span>
      <hr>
    </div>
    <keep-alive>
      <component :is="componentToDisplay" />
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
import ButtonBar from "@/components/ButtonBar.vue";

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
    ButtonBar
  },
  data() {
    return {
      componentToDisplay: "MainMenu",
      buttons: []
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
    window.addEventListener("popstate", event => {
      const comp =
        (event && event.state && event.state.componentToDisplay) ||
        this.preferences.componentToDisplay;
      this.navigate(comp, event.state);
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
    navigate(componentName, popstate) {
      let historyStateMethod = "pushState";
      if (!popstate) {
        // get the method for the History API
        const comp = this.getCurrentComponent();
        historyStateMethod =
          comp && comp.historyReplaceState
            ? "replaceState"
            : historyStateMethod;
      }

      // now load the new component
      this.componentToDisplay = componentName;
      // call that with a slight delay so that Vue has mounted the component
      Vue.nextTick(() => {
        const comp = this.getCurrentComponent();
        if (!popstate) {
          window.scrollTo({
            left: 0,
            top: 0,
            behavior: "auto"
          });
          window.history[historyStateMethod](
            { componentToDisplay: componentName },
            componentName
          );
        }
        this.$root.$emit("navigated." + componentName, comp);
      });
    },
    getCurrentComponent() {
      return this.$children.find(
        c => c.$options.name === this.componentToDisplay
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
  margin-top: 0.5rem;
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
