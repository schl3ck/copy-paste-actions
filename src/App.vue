<template>
  <div id="app">
    <component :is="comp"></component>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      comp: ""
    };
  }
};
</script>

<style lang="scss">
#app {
  font-family: -apple-system, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
