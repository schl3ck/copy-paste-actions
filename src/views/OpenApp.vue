<template>
  <div>
    <div class="fixed-top fixed-bottom d-flex flex-column justify-content-center align-items-center">
      <transition name="fade">
        <div v-if="done" class="position-absolute w-100 d-flex flex-column align-items-center" key="doneBlock">
          <FontAwesomeIcon icon="check" class="text-success fa-3x text-center"></FontAwesomeIcon>
          <button v class="btn btn-success btn-lg" @click="$emit('open-app')">{{ lang.openApp }}</button>
        </div>
        <div v-else class="w-100 d-flex flex-column align-items-center" key="processingBlock">
          <div class="w-75 margin text-center status-icon">
            <transition name="fade">
              <div v-if="percent === null" key="spinner" class="position-absolute spinner-container">
                <span class="spinner-border text-primary position-relative" role="status"></span>
              </div>
              <div v-else key="progress" class="position-absolute w-75">
                <div class="progress position-relative">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{'width': percent + '%'}"
                    :aria-valuenow="percent"
                    aria-valuemin="0"
                    aria-valuemax="100"></div>
                </div>
              </div>
            </transition>
          </div>
          <span class="status-label">{{ status }}</span>
        </div>
      </transition>
      <!-- FIXME: when closing the page, give the user some time to click this button and abort the closing -->
    </div>
    <div class="fixed-bottom">
      <button class="btn btn-outline-primary btn-block" @click="$root.$emit('navigate', 'MainMenu')">
        <FontAwesomeIcon icon="chevron-left"></FontAwesomeIcon> {{ lang.toMainMenu }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "OpenApp",
  data() {
    return {
      status: "",
      percent: null,
      done: false
    };
  },
  created() {
    this.$store.commit("showMainTitle", false);
    this.status = this.lang.buildingUrl;
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.openApp;
    },
    /** @returns {object} */
    preferences() {
      return this.$store.state.preferences;
    }
  }
};
</script>

<style lang="scss" scoped>
.spinner-container {
  left: 50%;
  transform: translateX(-50%);
}
.spinner-border {
  animation-duration: 1s;
  top: 0.7rem;
}
.progress {
  top: 1.7rem;
}
.progress-bar {
  transition-duration: 0.2s;
}

.margin {
  margin-bottom: 0.25rem;
}
.status-icon {
  height: 2.7rem;
}
.status-label {
  padding-bottom: 1.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.fade-enter {
  transform: translateX(50vw);
}
.fade-leave-to {
  transform: translateX(-50vw);
}
</style>
