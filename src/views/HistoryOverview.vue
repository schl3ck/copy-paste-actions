<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <h2 class="mb-0">
        {{ lang.title }}
      </h2>
      <button
        type="button"
        class="close"
        aria-label="Close"
        @click.prevent="close"
      >
        <BIcon icon="x" class="text-secondary fs-2x" aria-hidden="true" />
      </button>
    </div>

    <ol ref="content" class="list-group">
      <li
        v-for="(route, index) of reverseHistoryStack"
        :key="route.name + index"
        class="list-group-item d-flex align-items-baseline"
        :class="{ 'list-group-item-success': index === reversehistoryIndex }"
        @click.prevent="go(index)"
      >
        <div
          class="marker"
          :class="{ visible: index === reversehistoryIndex }"
        />
        {{ routeToTitle(route) }}
      </li>
    </ol>

    <NavigationToolbar contentRefName="content" />
  </div>
</template>

<script>
import { routeToTitle } from "@/router";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "HistoryOverview",
  components: { NavigationToolbar },
  data() {
    return {
      /** @returns {import("vue-router").Route[]} */
      historyStack: null,
      /** @returns {number} */
      historyIndex: null,
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.historyOverview;
    },
    /** @returns {import("vue-router").Route[]} */
    reverseHistoryStack() {
      if (!this.historyStack) return null;
      const stack = Array.from(this.historyStack);
      stack.reverse();
      return stack;
    },
    reversehistoryIndex() {
      return this.historyStack?.length - this.historyIndex - 1;
    },
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.historyStack = this.$router.history.stack;
    this.historyIndex = this.$router.history.index;
  },
  methods: {
    routeToTitle,
    close() {
      this.$store.commit("showHistoryOverview", false);
    },
    go(reverseIndex) {
      const index = this.historyStack.length - reverseIndex - 1;
      const relative = index - this.historyIndex;
      if (relative !== 0) {
        this.$router.go(relative);
      }
      this.close();
    },
  },
};
</script>

<style lang="scss" scoped>
.marker {
  background-color: currentColor;
  border-radius: 50%;
  position: relative;
  width: 1rem;
  height: 1rem;
  top: 0.1rem;
  margin-right: 1rem;
  visibility: hidden;
}
</style>
