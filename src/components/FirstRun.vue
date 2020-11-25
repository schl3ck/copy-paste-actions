<template>
  <div class="backdrop">
    <div class="container">
      <div class="card card-body position-relative">
        <h2>{{ lang.greeting }}</h2>
        <p v-html="lang.message" />

        <ButtonBar :buttons="buttons" />
        <button
          type="button"
          class="close"
          aria-label="Close"
          @click="buttons[1].click"
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
            this.$root.$emit("navigate", "HelpGetStarted");
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
.backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #00000080;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close {
  position: absolute;
  top: 0;
  right: 1rem;
}
</style>
