<template>
  <div>
    <h2 class="mb-4">
      {{ preferences.Version }}
      <FontAwesomeIcon icon="long-arrow-alt-right" class="small" />
      {{ updateData.version }}
    </h2>
    <h4>{{ lang.changelog }}</h4>
    <p>{{ updateData.notes }}</p>
    <b class="mr-2">{{ lang.releaseDate }}</b>
    {{ updateData.release.toLocaleDateString() }}

    <div class="fixed-bottom container">
      <ButtonBar :buttons="buttons" />
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";
import RoutineHubIcon from "@/assets/routinehub.png";

export default {
  name: "ConfirmNewUpdate",
  components: {
    ButtonBar
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
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      return [
        {
          text: this.lang.update,
          class: "btn-success",
          icon: "download",
          click: () => {
            location.href = this.updateData.url;
          }
        },
        {
          text: this.lang.viewWebsite,
          class: "btn-info",
          icon: RoutineHubIcon,
          click: () => {
            window.open(
              `https://www.routinehub.co/shortcut/${this.preferences["RoutineHub ID"]}/`,
              "_blank"
            );
          }
        },
        {
          text: this.lang.ignore,
          class: "btn-warning",
          icon: ["far", "eye-slash"],
          click: () => {
            this.$store.commit("userPreferences", {
              ignoreVersion: this.updateData.version
            });
            window.history.back();
          }
        }
      ];
    }
  },
  activated() {
    this.$store.commit("showMainTitle", true);
    this.$store.commit("showBackbutton", false);
  }
};
</script>

<style lang="scss" scoped>
</style>
