<template>
  <div class="w-100 d-flex flex-column flex-sm-row-reverse">
    <div
      v-for="(button, index) in buttons"
      :key="button.text"
      class="col px-0 corner"
      :class="{
        'pt-sm-0': first(index),
        'px-sm-0': middle(index),
        'pb-1 pb-sm-0': last(index),
      }"
    >
      <button
        :class="[
          'btn w-100 h-100',
          'd-flex flex-row',
          'align-items-center justify-content-center',
          button.class,
          buttonSizeClass,
        ]"
        :disabled="!button.click || button.disabled"
        @click="button.click"
      >
        <span
          v-if="typeof button.icon === 'object' && 'component' in button.icon"
          class="mr-2"
        >
          <component :is="button.icon.component" />
        </span>
        <img
          v-else-if="
            typeof button.icon === 'string' &&
              button.icon.startsWith('data:image')
          "
          :src="button.icon"
          class="icon mr-2"
        >
        <BIcon
          v-else
          :icon="button.icon"
          v-bind="button.iconOptions"
          class="mr-2"
        />
        <span v-html="button.text" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ButtonBar",
  props: {
    /** @type {
       import("vue").PropOptions<ButtonBar.Button[]>
     * } */
    buttons: {
      type: Array,
      required: true,
    },
    size: {
      validator(value) {
        return ["small", "normal", "big"].includes(value);
      },
      default: "big",
    },
  },
  computed: {
    /** @returns {string} */
    buttonSizeClass() {
      switch (this.size) {
        case "small":
          return "btn-sm";
        case "big":
          return "btn-lg";
        default:
          return "";
      }
    },
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
    },
  },
};
</script>

<style lang="scss" scoped>
@media (max-width: 575.98px) {
  .corner {
    &:first-child:not(:last-child) > .btn {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:not(:first-child):not(:last-child) > .btn {
      border-radius: 0;
    }
    &:last-child:not(:first-child) > .btn {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}
@media (min-width: 576px) {
  .corner {
    &:first-child:not(:last-child) > .btn {
      // is actually last-child because of flexbox reverse rendering
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    &:not(:first-child):not(:last-child) > .btn {
      border-radius: 0;
    }
    &:last-child:not(:first-child) > .btn {
      // is actually first-child because of flexbox reverse rendering
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}

.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
</style>
