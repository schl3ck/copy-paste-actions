<template>
  <div>
    <div class="fixed-top fixed-bottom container d-flex flex-column align-items-center justify-content-center">
      <template v-if="loaded || large">
        <div class="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
          <BIcon
            :icon="loaded ? 'file-earmark-fill' : 'exclamation-circle-fill'"
            class="fs-5x text-warning mb-2"
          />
          <span class="text-center pre-line">{{ loaded ? lang.shortcutsLoaded : shortcutsSizeLarge }}</span>
        </div>
        <ButtonBar :buttons="buttons" />
      </template>
    </div>
  </div>
</template>

<script>
import { navigateAndBuildZip } from "@/utils/openApp";
import ButtonBar from "@/components/ButtonBar.vue";

export default {
  name: "ConfirmSelectedShortcuts",
  components: {
    ButtonBar
  },
  data() {
    return {
      loaded: false,
      large: null,
      /** @type {ButtonBar.Button[]} */
      buttons: []
    };
  },
  computed: {
    /** @returns {object[]} */
    selected() {
      return this.$store.state.shortcuts.filter(s => s.selected);
    },
    /** @returns {true} */
    historyReplaceState() {
      return true;
    },
    /** @returns {object} */
    lang() {
      return this.$store.state.language.confirmSelectedShortcuts;
    },
    /** @returns {string} */
    shortcutsSizeLarge() {
      return this.lang.shortcutsSizeLarge.replace(
        /\$size/g,
        this.large + " kB"
      );
    }
  },
  activated() {
    this.loaded = false;
    this.large = null;
    if (this.selected.every(s => s.data)) {
      // all shortcuts already loaded
      this.loaded = true;
      this.buttons = [
        {
          class: "btn-success",
          icon: "play-fill",
          iconOptions: {
            scale: 1.5
          },
          text: this.lang.continue,
          click: this.useCached.bind(this)
        },
        {
          class: "btn-warning",
          icon: "arrow-counterclockwise",
          text: this.lang.reload,
          click: this.load.bind(this)
        }
      ];
      return;
    }

    // if selected shortcuts are bigger than 3 MB
    let size = this.selected.reduce((acc, i) => acc + i.size, 0);
    if (size > 3 * 1024 * 1024) {
      size = Math.round((size / 1024) * 100) / 100;
      this.large = size;
      this.buttons = [
        {
          class: "btn-primary",
          icon: "chevron-left",
          text: this.lang.back,
          click: this.goBack.bind(this)
        },
        {
          class: "btn-warning",
          icon: "play-fill",
          text: this.lang.continue,
          click: this.load.bind(this)
        }
      ];
      return;
    }

    this.load();
  },
  methods: {
    load() {
      const names = this.selected.map(s => s.name);

      navigateAndBuildZip(this.$root, {
        closePage: process.env.NODE_ENV !== "development",
        actions: [
          "Preferences.get",
          "Shortcuts.getNames",
          "Shortcuts.getFiles",
          "Snippets.get",
          "Build.processShortcuts"
        ],
        data: [
          {
            name: "selectedShortcuts.json",
            content: JSON.stringify({ names })
          }
        ]
      });
    },
    useCached() {
      this.$root.$emit("navigate", "ProcessShortcuts");
    },
    goBack() {
      window.history.back();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
