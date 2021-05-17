<template>
  <div class="container">
    <div class="sticky-top">
      <div class="d-flex justify-content-between align-items-center pb-2 w-100">
        <h2 class="flex-grow-1 mb-0" :class="{ 'font-italic': hasNoName }">
          {{ hasNoName ? lang.noSnippetName : title }}
        </h2>
        <button
          type="button"
          class="close"
          aria-label="Close"
          @click.prevent="close"
        >
          <BIcon icon="x" class="fs-2x text-secondary" aria-hidden="true" />
        </button>
      </div>
      <div class="btn-group btn-group-sm w-100">
        <button class="btn btn-outline-primary" @click.prevent="setZoom(-1)">
          <IconSearchMinus />
        </button>
        <button class="btn btn-outline-primary" @click.prevent="setZoom(0)">
          <BIcon icon="arrow-counterclockwise" />
        </button>
        <button class="btn btn-outline-primary" @click.prevent="setZoom(1)">
          <IconSearchPlus />
        </button>
        <button class="btn btn-outline-primary" @click.prevent="saveZoom">
          <IconSave />
        </button>
      </div>
    </div>
    <div ref="content" class="max-vw-100 overflow-scroll">
      <div class="mw-content">
        <pre
          class="text-pre bg-transparent p-0 w-maxcontent"
          :style="{ 'font-size': zoom + 'rem' }"
        ><code
          ref="code"
          class="lang-json"
          v-html="actionsHighlighted"
        /></pre>
      </div>
    </div>
    <NavigationToolbar ref="toolbar" />
  </div>
</template>

<script>
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import NavigationToolbar from "@/components/NavigationToolbar.vue";
hljs.registerLanguage("json", json);

export default {
  name: "SnippetActions",
  components: { NavigationToolbar },
  props: {
    title: {
      type: String,
      required: true,
    },
    /** @type {import("vue").PropOptions<object[]>} */
    actions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      zoom: 1,
      checkHeightIntervalId: 0,
    };
  },
  computed: {
    /** @returns {boolean} */
    hasNoName() {
      return this.title === this.$store.state.globals.noSnippetName;
    },
    /** @returns {object} */
    lang() {
      return this.$store.state.language.snippetListItem;
    },
    /** @returns {object} */
    highlighted() {
      return hljs.highlight(JSON.stringify(this.actions, null, 2), {
        language: "json",
      });
    },
    /** @returns {string} */
    actionsHighlighted() {
      return this.highlighted.value;
    },
    /** @returns {object} */
    preferences() {
      return this.$store.state.preferences.Preferences;
    },
  },
  activated() {
    this.zoom = this.preferences.codeZoom;
    this.$store.commit("useGlobalContainer", false);
    this.$store.commit("showMainTitle", false);
    this.checkHeightIntervalId = setInterval(this.checkAvailableHeight, 250);
  },
  deactivated() {
    this.$store.commit("useGlobalContainer", true);
    if (this.checkHeightIntervalId) clearInterval(this.checkHeightIntervalId);
  },
  methods: {
    close() {
      this.$router.back();
    },
    setZoom(dir) {
      let inc;
      switch (dir) {
        case -1:
          if (this.zoom <= 1) {
            inc = 0.1;
          } else if (this.zoom <= 2) {
            inc = 0.25;
          } else {
            inc = 0.5;
          }
          this.zoom -= inc;
          break;
        case 0:
          this.zoom = 1;
          break;
        case 1:
          if (this.zoom < 1) {
            inc = 0.1;
          } else if (this.zoom < 2) {
            inc = 0.25;
          } else {
            inc = 0.5;
          }
          this.zoom += inc;
          break;
      }
    },
    saveZoom() {
      this.$store.commit("userPreferences", { codeZoom: this.zoom });
    },
    checkAvailableHeight() {
      /** @type {HTMLDivElement} */
      const content = this.$refs.content;
      /** @type {import("vue").default} */
      const toolbar = this.$refs.toolbar;

      const top = content.offsetTop;
      const bottom = toolbar.$el.offsetTop;

      content.style.maxHeight = `${bottom - top}px`;
    },
  },
};
</script>

<style lang="scss" scoped>
.fixed-top {
  background: var(--background-color);
}
.margin-for-fixed {
  margin-top: 6rem;
}
.btn:focus {
  box-shadow: none;
}
.text-pre {
  white-space: pre;
  > .lang-json {
    overflow-wrap: normal;
    word-break: normal;
  }
}
.width-maxcontent {
  width: max-content;
}
</style>
