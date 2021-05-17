<template>
  <div class="backdrop d-flex align-items-center justify-content-center">
    <div class="container">
      <div class="card card-body position-relative">
        <h2>{{ lang.greeting }}</h2>
        <p v-html="lang.message" />

        <ButtonBar :buttons="buttons" />
        <button
          type="button"
          class="close"
          aria-label="Close"
          @click.prevent="buttons[1].click"
        >
          <span class="fs-2x text-secondary" aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";

export default {
  name: "FirstRun",
  components: {
    ButtonBar,
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.firstRun;
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      return [
        {
          text: this.lang.viewGetStarted,
          class: "btn-success",
          click: () => {
            this.$router.push({ name: "HelpGetStarted" });
            this.$store.commit("firstRun");
          },
        },
        {
          text: this.lang.close,
          class: "btn-secondary",
          click: () => {
            this.$store.commit("firstRun");
          },
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.close {
  position: absolute;
  top: 0;
  right: 1rem;
}
</style>
