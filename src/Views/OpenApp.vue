<template>
  <div class="fixed-top fixed-bottom d-flex flex-column justify-content-center align-items-center">
    <div class="w-75 margin text-center status-icon">
      <transition name="fade">
        <div v-if="percent === null" key="spinner" class="position-absolute spinner-container">
          <span class="spinner-border text-primary position-relative" role="status"></span>
        </div>
        <div v-else-if="!done" key="progress" class="position-absolute w-75">
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
        <FontAwesomeIcon v-else icon="check" class="text-success fa-3x"></FontAwesomeIcon>
      </transition>
    </div>
    <span>{{ status }}</span>
  </div>
</template>

<script>
export default {
  name: "OpenApp",
  data() {
    return {
      status: "Building URL",
      percent: null,
      done: false
    };
  },
  created() {
    this.$store.commit("showMainTitle", false);
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
  top: 1rem;
}
.progress {
  top: 2rem;
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
