<template>
  <div>
    <div ref="content">
      <h2 class="mb-4">
        {{ preferences.Version }}
        <BIcon icon="arrow-right" class="" />
        {{ updateData.version }}
      </h2>
      <h4>{{ lang.changelog }}</h4>
      <p v-if="updateData.notesHtml" v-html="updateData.notesHtml" />
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <p v-else class="update-notes">{{ updateData.notes }}</p>
      <b class="mr-2">{{ lang.releaseDate }}</b>
      {{ updateData.release.toLocaleDateString() }}
      <template v-if="ignoredUpdate">
        <br>{{ lang.ignored }}
      </template>
    </div>

    <NavigationToolbar :buttons="buttons" contentRefName="content" />
  </div>
</template>

<script>
import RoutineHubIcon from "@/icons/routinehub.png";
import NavigationToolbar from "@/components/NavigationToolbar.vue";

export default {
  name: "ConfirmNewUpdate",
  components: {
    NavigationToolbar,
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.confirmNewUpdate;
    },
    /** @returns {Store.AppSettings} */
    preferences() {
      return this.$store.state.preferences;
    },
    /** @returns {Store.UpdateData} */
    updateData() {
      return this.$store.state.updateAvailable;
    },
    /** @returns {boolean} */
    ignoredUpdate() {
      return (
        this.preferences.Preferences.ignoreVersion === this.updateData.version
      );
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      /** @type {ButtonBar.Button[]} */
      const res = [
        {
          text: this.lang.update,
          class: "btn-success",
          icon: "download",
          click: () => {
            location.href = this.updateData.url;
          },
        },
        {
          text: this.lang.viewWebsite,
          class: "btn-info",
          icon: RoutineHubIcon,
          click: () => {
            window.open(
              `https://www.routinehub.co/shortcut/${this.preferences["RoutineHub ID"]}/`,
              "_blank",
            );
          },
        },
      ];
      if (!this.ignoredUpdate) {
        res.push({
          text: this.lang.ignore,
          class: "btn-warning",
          icon: "eye-slash",
          click: () => {
            this.$store.commit("userPreferences", {
              ignoreVersion: this.updateData.version,
            });
            this.$router.back();
          },
        });
      }
      return res;
    },
  },
  activated() {
    this.$store.commit("showMainTitle", true);
    this.$store.commit("hideUpdateBanner");
  },
};
</script>

<style lang="scss" scoped>
.update-notes {
  white-space: pre-wrap;
}
</style>
