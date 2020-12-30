<template>
  <div>
    <h3 class="mt-2">
      {{ lang.title }}
    </h3>
    <div
      class="alert alert-warning"
      v-html="lang.note.replace(/\$n/g, toImport.length)"
    />
    <div ref="list" class="list-group">
      <button
        v-for="shortcut in toImport"
        :key="shortcut.name"
        class="list-group-item list-group-item-action px-2-5"
        @click="open(shortcut)"
      >
        <div class="d-flex w-100 justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img
              v-if="shortcut.image"
              :src="shortcut.image"
              class="image mr-2"
            >
            {{ shortcut.name }}
          </div>
          <BIcon
            icon="check"
            scale="3"
            class="text-success ml-3"
            :class="{ invisible: !shortcut.done }"
          />
        </div>
      </button>
    </div>

    <NavigationToolbar :buttons="buttons" contentRefName="list" />
  </div>
</template>

<script>
import NavigationToolbar from "@/components/NavigationToolbar.vue";
import { openURLAndCloseSelf } from "@/utils/openApp";

export default {
  name: "ImportShortcuts",
  components: {
    NavigationToolbar,
  },
  data() {
    return {
      /** @type {Store.ShortcutToImport[]} */
      toImport: [],
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.importShortcuts;
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      return [
        {
          text:
            this.toImport.filter((s) => s.done).length
            === this.toImport.length - 1
              ? this.lang.importLast
              : this.lang.import,
          class: "btn-success",
          icon: "download",
          click: () => {
            this.open(this.toImport.find((s) => !s.done));
          },
        },
      ];
    },
  },
  mounted() {
    this.$root.$once("loadShortcutsFinished", this.init);
  },
  activated() {
    this.$store.commit("showMainTitle", false);
  },
  methods: {
    init() {
      this.toImport = this.$store.getters.shortcutsToImport;
    },
    /** @param {Shortcut} shortcut */
    open(shortcut) {
      shortcut.done = true;
      if (this.toImport.every((s) => s.done)) {
        this.$store.commit("probablyOutdated", true);
        openURLAndCloseSelf(shortcut.url);
      } else {
        location.href = shortcut.url;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.image {
  width: 30px;
  height: 30px;
}

.px-2-5 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
</style>
