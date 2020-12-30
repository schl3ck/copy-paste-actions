<template>
  <div>
    <h2>{{ lang.title }}</h2>
    <div ref="list">
      <div v-for="shortcut in warnings" :key="shortcut.name">
        <div class="sticky">
          <div class="d-flex flex-row align-items-center pt-2">
            <img v-if="shortcut.image" :src="shortcut.image" class="mr-2 img">
            <h5>{{ shortcut.name }}</h5>
          </div>
          <hr class="my-2 ml-3">
        </div>
        <div
          v-for="(warning, index) in shortcut.warnings"
          :key="index"
          class="card ml-3"
        >
          <div class="card-body">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p class="card-text mb-2 markdown" v-html="printWarning(warning)" />
            <p class="card-text mb-1">
              {{ atAction(warning.action) }}
            </p>
            <pre
              class="code rounded p-2 mb-0"
            ><code>{{ warning.commentText }}</code></pre>
          </div>
        </div>
      </div>
      <h4 v-if="!hasItems" class="text-center mt-3">
        {{ lang.noItemsFound }}
      </h4>
    </div>

    <NavigationToolbar :buttons="buttons" contentRefName="list" />
  </div>
</template>

<script>
import { groupBy, mapValues } from "lodash";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "AnalyserWarnings",
  components: {
    NavigationToolbar,
  },
  data() {
    return {
      /** @type {ButtonBar.Button[]} */
      buttons: [],
    };
  },
  computed: {
    /** @returns {object[]} */
    warnings() {
      return Object.values(
        mapValues(
          groupBy(this.$store.state.processResult.warnings, "shortcut"),
          (v, k) => {
            const img = (
              this.$store.state.shortcuts.find((s) => s.name === k) || {}
            ).image;
            const o = {
              name: k,
              warnings: v,
            };
            if (img) {
              o.image = img;
            }
            return o;
          },
        ),
      );
    },
    /** @returns {boolean} */
    hasItems() {
      return this.$store.state.processResult.nItems > 0;
    },
    /** @returns {object} */
    lang() {
      return this.$store.state.language.analyserWarnings;
    },
  },
  created() {
    this.buttons = [];
    if (this.hasItems) {
      this.buttons.push({
        class: "btn-warning",
        icon: "play-fill",
        iconOptions: {
          scale: 1.5,
        },
        text: this.lang.ignoreContinue,
        click: () => this.$router.push({ name: "FoundSnippets" }),
      });
    }
  },
  activated() {
    this.$store.commit("showMainTitle", false);
  },
  methods: {
    printWarning(warning) {
      let text = this.lang[warning.type].replace(
        /\$functionDefinition/g,
        this.$store.state.globals.functionDefinition,
      );
      for (const [k, v] of Object.entries(warning.payload)) {
        text = text.replace(new RegExp("\\$" + k + "\\b", "g"), v);
      }
      return text;
    },
    atAction(index) {
      return this.lang.atActionWithContent.replace(
        /\$action\b/g,
        "" + (index + 1),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.pre-line {
  margin-top: -0.4rem;
}
.sticky {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--background-color);
}
.img {
  width: 40px;
  height: 40px;
}
.markdown ::v-deep {
  p {
    margin-bottom: 0.5rem;
  }
}
</style>
