<template>
  <div>
    <h2 class="pt-1">
      {{ lang.title }}
    </h2>

    <div class="alert alert-warning">
      {{ lang.message }}
    </div>

    <div class="list-group list-group-custom-flush">
      <button
        v-for="[language, langCode] of availableLanguages"
        :key="langCode"
        :class="[
          'list-group-item',
          'list-group-item-action',
          'custom-list-group-item',
          'cursor-pointer',
          'd-flex',
          'flex-row',
          'align-items-center',
        ]"
        @click="saveLang(language)"
      >
        <span class="fs-2x mr-2 my-n3">{{ getEmojiFlag(langCode) }}</span>
        {{ language }}
        <b-icon
          v-if="language === pref.value"
          icon="check"
          class="ml-auto text-success fs-3x my-n3 mr-n2"
        />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PrefLanguage",
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
      return this.$store.state.language.prefLanguage;
    },
    /** @returns {[string, string][]} */
    availableLanguages() {
      const res = Object.entries(
        this.$store.state.preferences.availableLanguages,
      );
      res.sort((a, b) => a[0].localeCompare(b[0]));
      return res;
    },
  },
  methods: {
    /** @param {string} langCode
     * @returns {string}
     */
    getEmojiFlag(langCode) {
      const lookup = {
        en: navigator.language === "en-GB" ? "gb" : "us",
        uk: "gb",
      };
      if (langCode in lookup) {
        langCode = lookup[langCode];
      }
      const asciiOffset = 0x41;
      const flagOffset = 0x1f1e6;
      const lang = langCode.toUpperCase();

      return String.fromCodePoint(
        lang.charCodeAt(0) - asciiOffset + flagOffset,
        lang.charCodeAt(1) - asciiOffset + flagOffset,
      );
    },
    saveLang(language) {
      this.save(language);
      history.back();
    },
  },
};
</script>

<style lang="scss" scoped></style>
