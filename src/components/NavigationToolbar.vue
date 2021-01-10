<template>
  <div ref="toolbar" class="fixed-bottom pb-2 bg-opaque">
    <div class="container">
      <ButtonBar
        v-if="buttons && buttons.length"
        :buttons="buttons"
        :size="buttonSize"
        class="pb-2"
      />

      <div class="btn-group w-100" role="group" aria-label="navigation buttons">
        <button
          class="btn"
          :class="canGoBack ? 'btn-outline-primary' : 'btn-outline-secondary'"
          :disabled="!canGoBack"
          :title="lang.back"
          @click="back"
        >
          <BIcon icon="chevron-left" />
        </button>
        <button
          class="btn"
          :class="[
            canGoMainMenu ? 'btn-outline-primary' : 'btn-outline-secondary',
          ]"
          :disabled="!canGoMainMenu"
          :title="lang.mainMenu"
          @click="mainMenu"
        >
          <BIcon icon="house-fill" />
        </button>
        <button
          class="btn"
          :class="
            showHistoryOverview
              ? 'btn-success'
              : canGoHistoryOverview
                ? 'btn-outline-primary'
                : 'btn-outline-secondary'
          "
          :disabled="!canGoHistoryOverview"
          :title="lang.navigationHistory"
          @click="historyOverview"
        >
          <BIcon icon="list-ol" />
        </button>
        <button
          class="btn"
          :class="[
            canGoForward ? 'btn-outline-primary' : 'btn-outline-secondary',
          ]"
          :disabled="!canGoForward"
          :title="lang.forward"
          @click="forward"
        >
          <BIcon icon="chevron-left" rotate="180" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";

export default {
  name: "NavigationToolbar",
  components: {
    ButtonBar,
  },
  props: {
    buttons: {
      type: Array,
      default: null,
    },
    buttonSize: {
      type: String,
      default: null,
    },
    contentRefName: {
      type: String,
      default: null,
    },
    routerMethod: {
      validator(value) {
        return value === "push" || value === "replace";
      },
      default: "push",
    },
  },
  data() {
    return {
      /** @type {import("vue-router").Route[]} */
      historyStack: null,
      /** @type {number} */
      historyIndex: null,
      /** @type {Function} */
      unhookRouter: null,
    };
  },
  computed: {
    /** @return {object} */
    lang() {
      return this.$store.state.language.navigationToolbar;
    },
    /** @returns {boolean} */
    canGoBack() {
      return this.historyIndex > 0;
    },
    /** @returns {boolean} */
    canGoForward() {
      return this.historyIndex < this.historyStack?.length - 1;
    },
    /** @returns {boolean} */
    canGoHistoryOverview() {
      return this.historyStack?.length > 1;
    },
    /** @returns {boolean} */
    canGoMainMenu() {
      return this.$route.name !== "MainMenu";
    },
    /** @returns {boolean} */
    showHistoryOverview() {
      return this.$store.state.showHistoryOverview;
    },
  },
  watch: {
    buttons() {
      this.onToolbarResize();
    },
    buttonSize() {
      this.onToolbarResize();
    },
  },
  activated() {
    window.addEventListener("resize", this.onToolbarResize);
    this.onToolbarResize();
    this.unhookRouter = this.$router.afterEach(this.refreshHistory);
    this.refreshHistory();
  },
  deactivated() {
    window.removeEventListener("resize", this.onToolbarResize);
    this.unhookRouter?.();
    this.unhookRouter = null;
  },
  destroyed() {
    window.removeEventListener("resize", this.onToolbarResize);
  },
  methods: {
    async onToolbarResize() {
      if (this.contentRefName) {
        const height = this.$refs.toolbar.clientHeight;
        this.$parent.$refs[
          this.contentRefName
        ].style.paddingBottom = `calc(${height}px + 0.25rem)`;
        await this.$nextTick();
        this.$emit("resize", this.$refs.toolbar.clientHeight, height);
      }
    },
    refreshHistory() {
      this.historyStack = this.$router.history.stack;
      this.historyIndex = this.$router.history.index;
    },
    back() {
      this.$router.back();
      if (this.showHistoryOverview) {
        this.historyOverview();
      }
    },
    forward() {
      this.$router.forward();
      if (this.showHistoryOverview) {
        this.historyOverview();
      }
    },
    mainMenu() {
      this.$router.push({ name: "MainMenu" });
      if (this.showHistoryOverview) {
        this.historyOverview();
      }
    },
    historyOverview() {
      this.$store.commit("showHistoryOverview", !this.showHistoryOverview);
    },
  },
};
</script>

<style lang="scss" scoped>
.bg-opaque {
  background: var(--background-color);
}
</style>
