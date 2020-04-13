<template>
  <div id="app" class="container">
    <div v-if="showMainTitle" class="sticky-app">
      <span class="title text-warning">
        <FontAwesomeIcon icon="clipboard"></FontAwesomeIcon> {{ preferences["Shortcut Name"] }}
      </span>
      <hr>
    </div>
    <component :is="componentToDisplay"></component>
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
    const component = this.$store.state.preferences.componentToDisplay;
    if (component) this.componentToDisplay = component;

    this.$root.$on("navigate", componentName => {
      window.scrollTo({
        left: 0,
        top: 0,
        behavior: "auto"
      });
      this.componentToDisplay = componentName;
      // call that with a slight delay so that Vue has mounted the component
      Vue.nextTick(() => {
        const comp = this.$children.find(
          c => c.$options.name === componentName
        );
        this.$root.$emit("navigated", comp);
      });
    });
  },
  computed: {
    /** @returns {object} */
    preferences() {
      return this.$store.state.preferences;
    },
    /** @returns {boolean} */
    showMainTitle() {
      return this.$store.state.showMainTitle;
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
