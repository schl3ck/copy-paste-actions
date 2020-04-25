<template>
  <div id="app" class="container">
    <div v-if="showMainTitle" class="sticky-app">
      <span class="title text-warning">
        <FontAwesomeIcon icon="clipboard"></FontAwesomeIcon> {{ preferences["Shortcut Name"] }}
      </span>
      <hr>
    </div>
    <component :is="componentToDisplay"></component>
    <div v-if="showBackButton" class="fixed-bottom">
      <button class="btn btn-outline-primary btn-block btn-lg" @click="toMainMenu">
        <FontAwesomeIcon icon="chevron-left"></FontAwesomeIcon> {{ lang.toMainMenu }}
      </button>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import MainMenu from "@/views/MainMenu.vue";
import SelectShortcuts from "@/views/SelectShortcuts.vue";
import OpenApp from "@/views/OpenApp.vue";

export default {
  name: "App",
  components: {
    MainMenu,
    OpenApp,
    SelectShortcuts
  },
  data() {
    return {
      componentToDisplay: "MainMenu"
    };
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
  methods: {
    /** @param {string} componentName */
    navigate(componentName, popstate) {
      this.componentToDisplay = componentName;
      // call that with a slight delay so that Vue has mounted the component
      Vue.nextTick(() => {
        const comp = this.$children.find(
          c => c.$options.name === componentName
        );
        if (!popstate) {
          window.scrollTo({
            left: 0,
            top: 0,
            behavior: "auto"
          });
          window.history.pushState(
            { componentToDisplay: componentName },
            componentName
          );
        }
        if (popstate && popstate.data) {
          Object.assign(comp, popstate.data);
        }
        this.$root.$emit("navigated." + componentName, comp);
      });
    },
    toMainMenu() {
      this.$root.$emit("toMainMenu");
      this.$root.$emit("navigate", "MainMenu");
    }
  }
};
</script>

<style lang="scss">
.sticky-app {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding-top: 0.5rem;
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
