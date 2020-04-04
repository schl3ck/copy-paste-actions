<template>
  <div id="app" class="container">
    <div class="sticky-app">
      <h1 class="text-warning">
        <FontAwesomeIcon icon="clipboard"></FontAwesomeIcon> {{ preferences["Shortcut Name"] }}
      </h1>
      <hr>
    </div>
    <component :is="componentToDisplay"></component>
  </div>
</template>

<script>
import MainMenu from "@/Views/MainMenu.vue";
import SelectShortcuts from "@/Views/SelectShortcuts.vue";

export default {
  name: "App",
  components: {
    MainMenu,
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
    });
  },
  computed: {
    /** @returns {object} */
    preferences() {
      return this.$store.state.preferences;
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
