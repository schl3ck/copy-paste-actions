<template>
  <div class="card mb-2">
    <label
      :for="pref"
      :class="[
        'card-header',
        'font-weight-bold',
        'd-flex',
        'flex-row',
        'justify-content-between',
        'align-items-center',
      ]"
      @click="$emit('click', $event)"
    >
      <div class="mr-5" v-html="title" />
      <slot name="header" />
    </label>
    <ul v-if="$scopedSlots.section" class="list-group list-group-flush">
      <li class="list-group-item">
        <slot name="section" />
      </li>
    </ul>
    <div class="card-body py-2">
      <div class="d-flex flex-row justify-content-between">
        <div class="text-muted small mr-3">
          <p class="mb-1" v-html="description" />
          <p class="mb-0">
            <b>{{ lang.default }} </b>
            <span v-html="defaultValue" />
          </p>
        </div>
        <div class="mw-content align-self-center">
          <button
            type="button"
            class="btn btn-outline-danger btn-sm"
            @click="$emit('reset', pref)"
          >
            <BIcon icon="arrow-counterclockwise" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PrefItem",
  props: {
    pref: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: String,
      required: true,
    },
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.preferences;
    },
  },
};
</script>
