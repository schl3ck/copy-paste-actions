<template>
  <div class="w-100 d-flex flex-column-reverse flex-sm-row">
    <div
      v-for="(button, index) in buttons"
      :key="button.text"
      class="col px-0 pt-1 pr-sm-1 pt-sm-0"
      :class="{'pt-1 pr-sm-1 pt-sm-0': first(index),
               'py-1 px-sm-1 py-sm-0': middle(index),
               'pb-1 pl-sm-1 pb-sm-0': last(index)}"
    >
      <button
        class="btn btn-lg w-100"
        :class="button.class"
        :disabled="!button.click || button.disabled"
        @click="button.click"
      >
        <FontAwesomeIcon :icon="button.icon" class="mr-2" />{{ button.text }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ButtonBar",
  props: {
    /** @type { {text: string, class: string, icon: string, disabled?: boolean, click?: Function}[] } */
    buttons: Array
  },
  methods: {
    first(index) {
      return index === 0 && this.buttons.length > 1;
    },
    middle(index) {
      return index > 0 && index < this.buttons.length - 1;
    },
    last(index) {
      return index === this.buttons.length - 1 && this.buttons.length > 1;
    }
  }
};
</script>
