<template>
  <div class="w-100 d-flex flex-column-reverse flex-sm-row">
    <div
      v-for="(button, index) in buttons"
      :key="button.text"
      class="col pt-1 pr-sm-1 pt-sm-0"
      :class="{'pt-1 pr-sm-1 pt-sm-0': first(index),
        'py-1 px-sm-1 py-sm-0': middle(index),
        'pb-1 pl-sm-1 pb-sm-0': last(index)}">
      <button class="btn btn-lg w-100" :class="button.class"
        @click="button.click" :disabled="!button.click">
        <FontAwesomeIcon :icon="button.icon" class="mr-2">
        </FontAwesomeIcon>{{ button.text }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ButtonBar",
  props: {
    buttons: []
  },
  methods: {
    first(index) {
      return index === 0;
    },
    middle(index) {
      return index > 0 && index < this.buttons.length - 1;
    },
    last(index) {
      return index === this.buttons.length - 1;
    }
  }
};
</script>
