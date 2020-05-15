<template>
  <div>
    <h2>{{ lang.title }}</h2>
    <div v-for="shortcut in warnings" :key="shortcut.name">
      <div class="sticky">
        <div class="d-flex flex-row align-items-center pt-2">
          <img v-if="shortcut.image" :src="shortcut.image" class="mr-2">
          <h5>{{ shortcut.name }}</h5>
        </div>
        <hr class="my-2 ml-3">
      </div>
      <div v-for="(warning, index) in shortcut.warnings" :key="index" class="card ml-3">
        <div class="card-body">
          <p class="card-text pre-line" v-html="printWarning(warning)">
          </p>
          <p class="card-text">
            {{ atAction(warning.action) }}<br>
            <pre class="code rounded p-2 mb-0"><code>{{ warning.commentText }}</code></pre>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { groupBy, mapValues, escape } from "lodash";

export default {
  name: "AnalyserWarnings",
  computed: {
    /** @returns {object[]} */
    warnings() {
      return Object.values(
        mapValues(
          groupBy(this.$store.state.processResult.warnings, "shortcut"),
          (v, k) => {
            const img = (
              this.$store.state.shortcuts.find(s => s.name === k) || {}
            ).image;
            const o = {
              name: k,
              warnings: v
            };
            if (img) {
              o.image = img;
            }
            return o;
          }
        )
      );
    },
    /** @returns {object} */
    lang() {
      return this.$store.state.language.warnings;
    }
  },
  methods: {
    printWarning(warning) {
      let text = escape(this.lang[warning.type].replace(
        /\$functionDefinition/g,
        this.$store.state.globals.functionDefinition
      ));
      for (const [k, v] of Object.entries(warning.payload)) {
        text = text.replace(
          new RegExp("\\$" + k + "\\b", "g"),
          `<code>${v}</code>`
        );
      }
      return text;
    },
    atAction(index) {
      return this.lang.atActionWithContent.replace(
        /\$action\b/g,
        "" + (index + 1)
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.code {
  background: #eee;
}
.pre-line {
  margin-top: -0.4rem;
}
.sticky {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
}
</style>
