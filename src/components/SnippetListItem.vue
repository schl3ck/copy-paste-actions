<template>
  <div class="card ml-3">
    <div class="card-body">
      <div class="row">
        <div class="col">
          <label for="name" class="sr-only">{{ lang.name }}:</label>
          <input
            id="name"
            v-model="name"
            type="text"
            :readonly="!editing"
            class="card-title font-weight-bold"
            :class="{
              'font-italic': hasNoName,
              'form-control-plaintext': !editing,
              'form-control': editing,
              'm-0 p-0': !editing,
              'mb-1': editing
            }"
            :placeholder="lang.noSnippetName"
          >
          <div class="card-text">
            <div v-if="!editing">
              {{ snippet.isClipboard ? lang.clipboardSelection : lang.snippet }}
            </div>
            <template v-else>
              <div class="custom-control custom-radio">
                <input
                  id="isClipboard"
                  v-model="isClipboard"
                  type="radio"
                  class="custom-control-input"
                  name="isClipboard"
                  :checked="snippet.isClipboard"
                  :value="true"
                >
                <label for="isClipboard" class="custom-control-label">{{ lang.clipboardSelection }}</label>
              </div>
              <div class="custom-control custom-radio">
                <input
                  id="isSnippet"
                  v-model="isClipboard"
                  type="radio"
                  class="custom-control-input"
                  name="isClipboard"
                  :checked="!snippet.isClipboard"
                  :value="false"
                >
                <label for="isSnippet" class="custom-control-label">{{ lang.snippet }}</label>
              </div>
            </template>
            {{ lang.actions.replace(/\$number/g, snippet.numberOfActions) }}
            <tempalte v-if="snippet.newShortcut">
              <br>
              {{ lang.newShortcut.replace(/\$name/g, snippet.newShortcut) }}
            </tempalte>
          </div>
        </div>
        <div v-if="canEdit" class="col-auto d-flex align-items-center justify-content-center">
          <button class="btn btn-outline-dark" @click="startEdit">
            <FontAwesomeIcon icon="pencil-alt" />
            <span class="sr-only">{{ lang.edit }}</span>
          </button>
        </div>
      </div>
      <ButtonBar v-if="editing" :buttons="buttons" size="normal" class="mt-2" />
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";

export default {
  name: "SnippetListItem",
  components: {
    ButtonBar
  },
  props: {
    snippet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      name: "",
      isClipboard: true,
      editing: false,
      buttons: []
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.snippetListItem;
    },
    /** @returns {object} */
    globals() {
      return this.$store.state.globals;
    },
    /** @returns {boolean} */
    canEdit() {
      return !this.$store.state.snippetListItemEditing;
    },
    /** @returns {boolean} */
    hasNoName() {
      return this.snippet.name === this.globals.noSnippetName;
    }
  },
  watch: {
    editing(value) {
      if (value) {
        this.name = this.hasNoName ? "" : this.snippet.name;
      } else {
        this.name = this.hasNoName
          ? this.lang.noSnippetName
          : this.snippet.name;
      }
    }
  },
  created() {
    this.name = this.hasNoName ? this.lang.noSnippetName : this.snippet.name;
    this.isClipboard = this.snippet.isClipboard;
    this.buttons = [
      {
        text: this.lang.doneEdit,
        class: "btn-success",
        icon: ["far", "save"],
        click: this.saveEdit
      },
      {
        text: this.lang.cancelEdit,
        class: "btn-secondary",
        icon: "times",
        click: this.cancelEdit
      }
    ];
  },
  methods: {
    startEdit() {
      this.editing = true;
      this.$store.commit("snippetListItemEditing", true);
    },
    cancelEdit() {
      this.isClipboard = this.snippet.isClipboard;
      this.editing = false;
      this.$store.commit("snippetListItemEditing", false);
    },
    saveEdit() {
      this.snippet.name = this.name || this.globals.noSnippetName;
      this.snippet.isClipboard = this.isClipboard;
      this.cancelEdit();
    }
  }
};
</script>
