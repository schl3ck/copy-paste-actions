<template>
  <div>
    <div ref="content">
      <h2>{{ lang.title }}</h2>

      <p>{{ lang.description }}</p>

      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">
              {{ lang.action }}
            </th>
            <th scope="col">
              {{ lang.shortcuts }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="binding in filteredBindings" :key="binding.action">
            <td class="vertical-middle">
              {{ lang[binding.action] }}
            </td>
            <td>
              <div
                v-for="key in binding.keys"
                :key="key"
                class="keybinding"
                v-html="key"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <NavigationToolbar contentRefName="content" />
  </div>
</template>

<script>
import { isiPadiPhoneMac } from "@/utils/utils";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "HelpKeyboardShortcuts",
  components: { NavigationToolbar },
  data() {
    return {
      /** @type { {action: string, win: string[], mac: string[]}[] } */
      keybindings: [],
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.helpKeyboardShortcuts;
    },
    /** @returns { {action: string, keys: string[]}[] } */
    filteredBindings() {
      return this.keybindings.map((i) => {
        return {
          action: i.action,
          keys: i[isiPadiPhoneMac ? "mac" : "win"].map(
            (key) =>
              `<kbd>${key
                .split(" + ")
                .map((part) => `<kbd>${part}</kbd>`)
                .join(" + ")}</kbd>`,
          ),
        };
      });
    },
  },
  created() {
    this.keybindings = [
      {
        action: "back",
        win: [`${this.lang.altKey} + ←`, `${this.lang.ctrlKey} + j`, "⌫"],
        mac: ["⌘ + ←", "⌘ + j", "⌫"],
      },
      {
        action: "forward",
        win: [`${this.lang.altKey} + →`, `${this.lang.ctrlKey} + k`],
        mac: ["⌘ + →", "⌘ + k"],
      },
      {
        action: "mainMenu",
        win: ["Ctrl + h"],
        mac: ["⌘ + h"],
      },
    ];
  },
  activated() {
    this.$store.commit("showMainTitle", true);
  },
};
</script>

<style lang="scss" scoped>
.help-container {
  z-index: 2000;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.help-box {
  display: flex;
  flex-direction: row;
  color: #fff;
  background-color: var(--darken-background-dark);
  border-radius: 1rem;
  padding: 0.75rem 1.25rem;
  max-width: 80vw;
}
.w-max-content {
  width: max-content;
}
.vertical-middle {
  vertical-align: middle;
}
.keybinding:not(:last-child) {
  margin-bottom: 0.2rem;
}
</style>
