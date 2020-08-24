<template>
  <div class="card" :class="{'bg-lightgray': snippet.discard && !editing}">
    <div class="card-body">
      <div class="row">
        <div class="col">
          <template v-if="shortcutInsteadOfSnippetName && !editing">
            <div class="d-flex flex-row align-items-center">
              <img v-if="snippet.shortcut.image" :src="snippet.shortcut.image" class="mr-2 img">
              <label for="name" class="sr-only">{{ lang.shortcutName }}</label>
              <span id="name" class="card-title font-weight-bold">{{ snippet.shortcut.name }}</span>
            </div>
          </template>
          <template v-else>
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
          </template>
          <div class="card-text">
            <div v-if="!editing">
              {{ snippet.isClipboard ? lang.clipboardItem : lang.snippet }}
            </div>
            <template v-else>
              <div class="custom-control custom-radio">
                <input
                  id="isClipboard"
                  v-model="isClipboard"
                  type="radio"
                  class="custom-control-input"
                  name="isClipboard"
                  :value="true"
                >
                <label for="isClipboard" class="custom-control-label">{{ lang.clipboardItem }}</label>
              </div>
              <div class="custom-control custom-radio">
                <input
                  id="isSnippet"
                  v-model="isClipboard"
                  type="radio"
                  class="custom-control-input"
                  name="isClipboard"
                  :value="false"
                >
                <label for="isSnippet" class="custom-control-label">{{ lang.snippet }}</label>
              </div>
            </template>
            {{
              (snippet.numberOfActions === 1 ? lang.actions.singular : lang.actions.plural)
                .replace(/\$number/g, snippet.numberOfActions)
            }}
            <tempalte v-if="snippet.newShortcut">
              <br>
              {{ lang.newShortcut.replace(/\$name/g, snippet.newShortcut) }}
            </tempalte>
            <div v-if="checkOverrides" class="custom-control custom-checkbox text-danger discard-exclude">
              <input
                :id="'discard_' + id"
                v-model="snippet.discard"
                type="checkbox"
                class="custom-control-input"
              >
              <label :for="'discard_' + id" class="custom-control-label">{{ lang.discard }}</label>
            </div>
          </div>
        </div>
        <div v-if="canEdit" class="col-auto d-flex align-items-center justify-content-center">
          <button class="btn btn-outline-dark" @click="startEdit">
            <FontAwesomeIcon icon="pencil-alt" />
            <span class="sr-only">{{ lang.edit }}</span>
          </button>
        </div>
      </div>
      <button class="btn btn-primary btn-block mt-2 discard-exclude" @click="showActions">
        {{ lang.showActions }}
      </button>
      <ButtonBar v-if="editing" :buttons="buttons" size="normal" class="mt-2" />
      <template v-if="overrides">
        <span class="text-orange">
          <FontAwesomeIcon icon="exclamation-triangle" />
          {{
            lang.overrides
              [snippet.discard ? "subjunctive" : "normal"]
              [snippet.isClipboard ? "clipboard" : "snippet"]
          }}
        </span>
        <SnippetListItem :snippet="overrides" />
      </template>
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
    },
    shortcutInsteadOfSnippetName: {
      type: Boolean,
      default: false
    },
    checkOverrides: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      name: "",
      isClipboard: true,
      editing: false,
      buttons: [],
      id: (Math.random() * Number.MAX_SAFE_INTEGER).toFixed(0)
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
    },
    /** @returns {object} */
    overrides() {
      if (!this.checkOverrides) return null;
      const o = this.snippet.isClipboard
        ? this.$store.state.clipboard
        : this.$store.state.snippets;
      return o[this.snippet.name];
    }
  },
  watch: {
    editing(value) {
      if (value) {
        this.name = this.hasNoName ? "" : this.snippet.name;
        this.isClipboard = this.snippet.isClipboard;
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
      this.snippet.name =
        (this.name || "").trim() || this.globals.noSnippetName;
      this.snippet.isClipboard = this.isClipboard;
      this.cancelEdit();
    },
    showActions() {
      this.$store.commit("snippetActions", {
        title: this.snippet.name,
        bplist: this.snippet.actions
      });
      this.$root.$emit("navigate", "SnippetActions");
    }
  }
};
</script>

<style lang="scss" scoped>
.img {
  width: 30px;
  height: 30px;
}
.bg-lightgray {
  background: lightgray;
}
.text-orange {
  color: var(--orange);
}
</style>
