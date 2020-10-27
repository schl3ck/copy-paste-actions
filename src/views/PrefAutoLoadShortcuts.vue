<script>
export default {
  name: "PrefAutoLoadShortcuts",
  props: {
    /** @type {import("vue").PropOptions<Preferences.PrefWithLang>} */
    pref: {
      type: Object,
      required: true,
    },
    save: {
      type: Function,
      required: true,
    },
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.prefAutoLoadShortcuts;
    },
    /** @returns {true} */
    historyReplaceState() {
      return true;
    },
    /** @returns {Store.Shortcut[]} */
    shortcuts() {
      return this.$store.state.shortcuts;
    },
  },
  activated() {
    // redirect to SelectShortcuts so we don't need to implement the same
    // functionality again
    const selectedShortcuts = this.shortcuts.filter(s => s.selected);
    const normalSelectedShortcuts = selectedShortcuts;
    for (const shortcut of selectedShortcuts) {
      shortcut.selected = false;
    }
    for (const shortcut of this.pref.value) {
      const s = this.shortcuts.find(s => s.name === shortcut);
      s && (s.selected = true);
    }
    this.$root.$emit("navigate", "SelectShortcuts", {
      message: this.lang.note,
      messageVariant: "alert-info",
      acceptNoSelection: true,
      continueLabel: this.lang.done,
      continueIcon: "check",
      continue: () => {
        const selectedShortcuts = this.shortcuts.filter(s => s.selected);
        this.save(selectedShortcuts.map(s => s.name));
        for (const shortcut of selectedShortcuts) {
          shortcut.selected = false;
        }
        for (const shortcut of normalSelectedShortcuts) {
          shortcut.selected = true;
        }
        history.back();
      },
    });
  },
  render() {
    return "";
  },
};
</script>
