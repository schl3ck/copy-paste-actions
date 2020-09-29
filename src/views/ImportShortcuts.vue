<template>
  <div>
    <h3 class="mt-2">{{ lang.importing }}</h3>
    <div class="alert alert-warning">
      {{ lang.note.replace(/\$n/g, toImport.length) }}
    </div>
    <div class="list-group">
      <button
        v-for="shortcut in toImport"
        :key="shortcut.name"
        class="list-group-item list-group-item-action px-2-5"
        @click="open(shortcut)"
      >
        <div class="d-flex w-100 justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img v-if="shortcut.image" :src="shortcut.image" class="image mr-2">
            {{ shortcut.name }}
          </div>
          <FontAwesomeIcon
            icon="check"
            class="text-success ml-3 icon"
            :class="{'invisible': !shortcut.done}"
          />
        </div>
      </button>
    </div>

    <div ref="toolbar" class="fixed-bottom container">
      <ButtonBar :buttons="buttons" />
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";
import { openURLAndCloseSelf } from "@/utils/openApp";

/** @typedef { {name: string, url: string, image?: string, done: boolean} } Shortcut */

export default {
  name: "ImportShortcuts",
  components: {
    ButtonBar
  },
  data() {
    /** @type {Shortcut[]} */
    return {
      toImport: []
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
            this.toImport.filter((s) => s.done).length ===
            this.toImport.length - 1
              ? this.lang.importLast
              : this.lang.import,
          class: "btn-success",
          icon: "download",
          click: function() {
            this.open(this.toImport.find((s) => !s.done));
          }.bind(this)
        },
        {
          text: this.$store.getters.langToMainMenu,
          class: "btn-outline-primary",
          icon: "chevron-left",
          click: () => this.$root.$emit("navigate", "MainMenu")
        }
      ];
    }
  },
  mounted() {
    this.$root.$once("loadShortcutsFinished", this.init);
  },
  activated() {
    this.$store.commit("showMainTitle", false);
    this.$store.commit("showBackButton", false);
  },
  methods: {
    init() {
      const shortcuts = this.$store.state.shortcuts;
      const toImport = this.$store.state.importURLs;
      this.toImport = toImport.shortcuts.map((shortcut, index) => {
        return {
          name: shortcut,
          url: toImport.urls[index],
          image: shortcuts.find((s) => s.name === shortcut).image,
          done: false
        };
      });
    },
    /** @param {Shortcut} shortcut */
    open(shortcut) {
      shortcut.done = true;
      if (this.toImport.every((s) => s.done)) {
        openURLAndCloseSelf(shortcut.url);
      } else {
        location.href = shortcut.url;
      }
    }
  }
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

.icon {
  font-size: 1.5rem;
}
</style>