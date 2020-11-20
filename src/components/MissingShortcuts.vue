<template>
  <div v-if="missingShortcuts.length" class="card bg-info-light mb-3">
    <div class="card-header font-weight-bold">
      {{ lang.title }}
    </div>
    <div class="card-body">
      <p>
        {{ lang.message }}
      </p>
      <div class="list-group text-body mb-3">
        <div
          v-for="shortcut in missingShortcuts"
          :key="typeof shortcut === 'string' ? shortcut : shortcut.name"
          :class="[
            'list-group-item',
            'd-flex',
            'align-items-center',
            'text-left',
          ]"
        >
          <img
            v-if="typeof shortcut === 'object' && shortcut.image"
            :src="shortcut.image"
            class="mr-2 icon"
            alt="icon"
          >
          <span>{{ typeof shortcut === "string" ? shortcut : shortcut.name
          }}<span class="sr-only">.</span></span>
        </div>
      </div>
      <ButtonBar :buttons="toPrefsButton" size="normal" />
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";

export default {
  name: "MissingShortcuts",
  components: {
    ButtonBar,
  },
  props: {
    skipMainMenu: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.missingShortcuts;
    },
    /** @returns {(Store.Shortcut | string)[]} */
    missingShortcuts() {
      return this.$store.state.preferences.Preferences.autoLoadShortcuts
        .map((name) => ({
          name,
          /** @type {Store.Shortcut} */
          shortcut: this.$store.getters.loadedShortcuts.find(
            (s) => s.name === name,
          ),
        }))
        .filter((s) => !s.shortcut?.data)
        .map((s) => s.shortcut || s.name);
    },
    /** @returns {ButtonBar.Button[]} */
    toPrefsButton() {
      return [
        {
          text: this.lang.toPreference,
          class: "btn-primary",
          icon: "gear-wide-connected",
          click: () => {
            const root = this.$root;
            const toPref = () => {
              root.$emit("navigate", "Preferences", {
                scrollToPref: "autoLoadShortcuts",
              });
            };
            if (this.skipMainMenu) {
              toPref();
            } else {
              root.$once("navigated.MainMenu", toPref);
              root.$emit("navigate", "MainMenu");
            }
          },
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.bg-info-light {
  background-color: #7acedb;
}
</style>
