<template>
  <div class="card" @click="$emit('click')">
    <div class="card-body">
      <div class="d-flex align-items-center">
        <div class="mr-3">
          <FontAwesomeIcon
            :icon="icon"
            :class="`card-img fa-3x ${iconColorClass}`"
            :style="iconColorStyle">
          </FontAwesomeIcon>
        </div>
        <div>
          <h5 class="card-title">{{ title }}</h5>
          <div class="card-text">{{ description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MenuItem",
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    iconColor: String
  },
  computed: {
    /** @returns {string} */
    iconColorClass() {
      return [
        "success",
        "warning",
        "danger",
        "info",
        "primary",
        "secondary",
        "dark",
        "muted"
      ].includes(this.iconColor)
        ? "text-" + this.iconColor
        : "";
    },
    /** @returns {string} */
    iconColorStyle() {
      return this.iconColorClass ? "" : "color: " + this.iconColor;
    }
  }
};
</script>
