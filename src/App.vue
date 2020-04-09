<template>
  <div id="app" class="container">
    <div v-if="showMainTitle" class="sticky-app">
      <h1 class="text-warning">
        <FontAwesomeIcon icon="clipboard"></FontAwesomeIcon> {{ preferences["Shortcut Name"] }}
      </h1>
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
}
</style>
