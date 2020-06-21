<template>
  <div>
    <div class="fixed-top container pb-2">
      <div class="d-flex justify-content-between align-items-end pb-2 w-100">
        <h2 class="flex-grow-1 mb-0" :class="{'font-italic': hasNoName}">
          {{ hasNoName ? lang.noSnippetName : title }}
        </h2>
        <button type="button" class="close" aria-label="Close" @click="close">
          <span class="fa-2x text-secondary" aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="btn-group btn-group-sm w-100">
        <button class="btn btn-outline-primary" @click="setZoom(-1)">
          <FontAwesomeIcon icon="search-minus" />
        </button>
        <button class="btn btn-outline-primary" @click="setZoom(0)">
          <FontAwesomeIcon icon="undo" />
        </button>
        <button class="btn btn-outline-primary" @click="setZoom(1)">
          <FontAwesomeIcon icon="search-plus" />
        </button>
        <!-- TODO: save zoom setting -->
        <button class="btn btn-outline-primary" @click="saveZoom">
          <FontAwesomeIcon :icon="['far', 'save']" />
        </button>
      </div>
    </div>
    <pre
      class="overflow-initial margin-for-fixed text-pre"
      :style="{'font-size': zoom + 'rem'}"
    ><code
      ref="code"
      class="lang-json"
      v-html="plist"
    /></pre>
  </div>
</template>

<script>
import Vue from "vue";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import { cloneDeep } from "lodash";
import { Buffer } from "buffer";
import { parse } from "@/utils/bplist";
hljs.registerLanguage("json", json);

export default {
  name: "SnippetActions",
  data() {
    return {
      zoom: 1
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
    /** @returns { {title: string, bplist: string} } */
    snippetActions() {
      return this.$store.state.snippetActions;
    },
    /** @returns {string} */
    title() {
      return this.snippetActions.title;
    },
    /** @returns {object} */
    highlighted() {
      return hljs.highlight(
        "json",
        JSON.stringify(
          parse(Buffer.from(this.snippetActions.bplist, "base64"))[0],
          null,
          2
        )
      );
    },
    /** @returns {string} */
    plist() {
      return this.highlighted.value;
    },
    preferences() {
      return this.$store.state.preferences.Preferences;
    }
  },
  created() {
    this.zoom = this.preferences.codeZoom;
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
    }
  }
};
</script>

<style lang="scss" scoped>
.overflow-initial {
  overflow: initial;
}
.fixed-top {
  background: white;
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
</style>
