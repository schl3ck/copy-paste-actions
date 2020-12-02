<template>
  <div class="width-maxcontent">
    <div class="sticky-top sticky-left max-vw-100">
      <div class="container">
        <div
          class="d-flex justify-content-between align-items-center pb-2 w-100"
        >
          <h2 class="flex-grow-1 mb-0" :class="{ 'font-italic': hasNoName }">
            {{ hasNoName ? lang.noSnippetName : title }}
          </h2>
          <button type="button" class="close" aria-label="Close" @click="close">
            <span class="fs-2x text-secondary" aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="btn-group btn-group-sm w-100">
          <button class="btn btn-outline-primary" @click="setZoom(-1)">
            <IconSearchMinus />
          </button>
          <button class="btn btn-outline-primary" @click="setZoom(0)">
            <BIcon icon="arrow-counterclockwise" />
          </button>
          <button class="btn btn-outline-primary" @click="setZoom(1)">
            <IconSearchPlus />
          </button>
          <button class="btn btn-outline-primary" @click="saveZoom">
            <IconSave />
          </button>
        </div>
      </div>
    </div>
    <pre
      class="text-pre width-maxcontent bg-transparent"
      :style="{ 'font-size': zoom + 'rem' }"
    ><code
      ref="code"
      class="lang-json"
      v-html="actionsHighlighted"
    /></pre>
  </div>
</template>

<script>
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
hljs.registerLanguage("json", json);

export default {
  name: "SnippetActions",
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
      return hljs.highlight("json", JSON.stringify(this.actions, null, 2));
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
  created() {
    this.zoom = this.preferences.codeZoom;
  },
  activated() {
    this.$store.commit("useGlobalContainer", false);
  },
  deactivated() {
    this.$store.commit("useGlobalContainer", true);
  },
  methods: {
    close() {
      history.back();
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
