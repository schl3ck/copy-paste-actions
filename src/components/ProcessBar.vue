<template functional>
  <div class="fixed-top fixed-bottom d-flex flex-column justify-content-center align-items-center">
    <transition :name="props.restoringState ? '' : 'fade'">
      <div
        v-if="props.done"
        class="position-absolute w-100 d-flex flex-column align-items-center"
        key="doneBlock">
        <FontAwesomeIcon icon="check" class="text-success fa-3x text-center"></FontAwesomeIcon>
        <button
          class="btn btn-success btn-lg"
          @click="listeners.doneButtonClick">
          {{ props.doneButtonLabel }}
        </button>
      </div>
      <div v-else class="w-100 d-flex flex-column align-items-center" key="processingBlock">
        <div class="w-75 margin text-center status-icon">
          <transition :name="props.restoringState ? '' : 'fade'">
            <div v-if="props.percent === null" key="spinner" class="position-absolute spinner-container">
              <span class="spinner-border text-primary position-relative" role="status"></span>
            </div>
            <div v-else key="progress" class="position-absolute w-75">
              <div class="progress position-relative">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{'width': props.percent + '%'}"
                  :aria-valuenow="props.percent"
                  aria-valuemin="0"
                  aria-valuemax="100"></div>
              </div>
            </div>
          </transition>
        </div>
        <span class="status-label">{{ props.statusLabel }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "ProcessBar",
  props: {
    restoringState: Boolean,
    done: Boolean,
    percent: Number,
    doneButtonLabel: String,
    statusLabel: String
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