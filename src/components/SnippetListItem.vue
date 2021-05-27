<template>
  <div
    class="card background-transition"
    :class="{
      'bg-transparent':
        !(checkOverrides && snippet.discard && !editing) && !highlight,
      'bg-lightgray': checkOverrides && snippet.discard && !editing,
      'alert-primary': highlight,
    }"
  >
    <div class="card-body">
      <div class="row">
        <div class="col">
          <div
            v-if="shortcutInsteadOfSnippetName && !editing"
            class="d-flex flex-row align-items-center"
          >
            <img
              v-if="snippet.shortcut.image"
              :src="snippet.shortcut.image"
              class="mr-2 img"
            >
            <label for="name" class="sr-only">{{ lang.shortcutName }}</label>
            <span id="name" class="font-weight-bold">{{
              snippet.shortcut.name
            }}</span>
          </div>
          <div v-else>
            <label for="name" class="sr-only">{{ lang.name }}</label>
            <input
              id="name"
              v-model="name"
              type="text"
              :readonly="!editing"
              class="card-title font-weight-bold bg-transparent"
              :class="{
                'font-italic': hasNoName,
                'form-control-plaintext': !editing,
                'form-control': editing,
                'm-0 p-0': !editing,
                'mb-1': editing,
              }"
              :placeholder="lang.noSnippetName"
              @keyup.enter="saveEdit"
              @keyup.esc="cancelEdit"
            >
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="card-text">
            <div v-if="!editing">
              {{ snippet.isClipboard ? lang.clipboardItem : lang.snippet }}
            </div>
            <div v-else>
              <div class="custom-control custom-radio">
                <input
                  id="isClipboard"
                  v-model="isClipboard"
                  type="radio"
                  class="custom-control-input"
                  name="isClipboard"
                  :value="true"
                >
                <label for="isClipboard" class="custom-control-label">
                  {{ lang.clipboardItem }}
                </label>
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
                <label for="isSnippet" class="custom-control-label">
                  {{ lang.snippet }}
                </label>
              </div>
            </div>
            <div>
              {{
                (snippet.numberOfActions === 1
                  ? lang.actions.singular
                  : lang.actions.plural
                ).replace(/\$number/g, snippet.numberOfActions)
              }}
            </div>
          </div>
        </div>

        <div
          v-if="canEdit"
          class="col-auto d-flex align-items-center justify-content-center"
        >
          <button class="btn btn-outline-dark" @click.prevent="startEdit">
            <BIcon icon="pencil-fill" />
            <span class="sr-only">{{ lang.edit }}</span>
          </button>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col">
          <div v-if="snippet.description && !editing">
            {{ lang.description }}<br>
            <div
              class="border-left pl-2 pb-1"
              v-html="formatDescription(snippet.description)"
            />
          </div>
          <div v-else-if="editing">
            <label for="description">{{ lang.description }}</label>
            <textarea
              id="description"
              v-model="description"
              class="form-control"
            />
          </div>
          <div
            v-if="checkOverrides"
            class="custom-control custom-checkbox text-danger discard-exclude"
          >
            <input
              :id="'discard_' + id"
              v-model="snippet.discard"
              type="checkbox"
              class="custom-control-input"
            >
            <label :for="'discard_' + id" class="custom-control-label">{{
              lang.discard
            }}</label>
          </div>
        </div>
      </div>

      <button
        class="btn btn-block mt-2 discard-exclude"
        :class="{
          'btn-primary': !showActionsBtnOutline,
          'btn-outline-primary': showActionsBtnOutline,
        }"
        @click.prevent="showActions"
      >
        {{ lang.showActions }}
      </button>
      <ButtonBar v-if="editing" :buttons="buttons" size="normal" class="mt-2" />
      <button
        v-if="onSelect && !askDeletion"
        class="btn btn-block mt-2 btn-success"
        @click.prevent="onSelect(snippet)"
      >
        <BIcon icon="check" scale="1.75" class="mr-1" />
        {{ lang.selectSnippet }}
      </button>

      <div v-if="askDeletion">
        <!-- eslint-disable-next-line vue/require-v-for-key -->
        <p v-for="msg in langDeleteMessage" class="mb-0 mt-2">
          {{ msg }}
        </p>
        <ButtonBar :buttons="deleteButtons" size="normal" class="mt-2" />
      </div>

      <template v-if="overrides">
        <span class="text-orange">
          <BIcon icon="exclamation-triangle-fill" />
          {{
            lang.overrides[snippet.discard ? "subjunctive" : "normal"][
              snippet.isClipboard ? "clipboard" : "snippet"
            ]
          }}
        </span>
        <SnippetListItem :snippet="overrides" />
      </template>
    </div>
  </div>
</template>

<script>
import ButtonBar from "@/components/ButtonBar.vue";
import { nl2br } from "@/utils/utils";

export default {
  name: "SnippetListItem",
  components: {
    ButtonBar,
  },
  props: {
    snippet: {
      type: Object,
      required: true,
    },
    shortcutInsteadOfSnippetName: {
      type: Boolean,
      default: false,
    },
    checkOverrides: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    showActionsBtnOutline: {
      type: Boolean,
      default: false,
    },
    /** @type {import("vue").PropOptions<(snippet: object) => void>} */
    onSelect: {
      type: Function,
      default: null,
    },
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      name: "",
      isClipboard: true,
      description: "",
      editing: false,
      /** @type {ButtonBar.Button[]} */
      buttons: [],
      id: (Math.random() * Number.MAX_SAFE_INTEGER).toFixed(0),
      askDeletion: false,
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
      return !this.$store.state.snippetListItemEditing && this.editable;
    },
    /** @returns {boolean} */
    hasNoName() {
      return this.snippet.name === this.globals.noSnippetName;
    },
    /** @returns {object} */
    overrides() {
      if (!this.checkOverrides) return null;
      return this.$store.state.snippets.find(
        (snippet) =>
          snippet.name === this.snippet.name
          && snippet.isClipboard === this.snippet.isClipboard
          && snippet !== this.snippet,
      );
    },
    /** @returns {ButtonBar.Button[]} */
    deleteButtons() {
      return [
        {
          text: this.lang.delete,
          class: "btn-danger",
          icon: "trash",
          click: this.delete,
        },
        {
          text: this.lang.cancelEdit,
          class: "btn-secondary",
          icon: "x",
          iconOptions: {
            scale: 1.5,
          },
          click: () => {
            this.askDeletion = false;
            this.editing = true;
          },
        },
      ];
    },
    /** @returns {string[]} */
    langDeleteMessage() {
      return this.lang.deleteMessage[
        this.snippet.isClipboard ? "clipboard" : "snippet"
      ].split("<br>");
    },
  },
  watch: {
    editing(value) {
      if (value) {
        this.name = this.hasNoName ? "" : this.snippet.name;
        this.isClipboard = this.snippet.isClipboard;
        this.description = this.snippet.description;
      } else {
        this.name = this.hasNoName
          ? this.lang.noSnippetName
          : this.snippet.name;
      }
    },
    snippet() {
      this.setData();
    },
  },
  created() {
    this.setData();
    this.buttons = [
      {
        text: this.lang.doneEdit,
        class: "btn-success",
        icon: { component: "IconSave" },
        click: this.saveEdit,
      },
      {
        text: this.lang.cancelEdit,
        class: "btn-secondary",
        icon: "x",
        iconOptions: {
          scale: 1.5,
        },
        click: this.cancelEdit,
      },
    ];
    if (!this.checkOverrides) {
      this.buttons.splice(1, 0, {
        text: this.lang.delete,
        class: "btn-danger",
        icon: "trash",
        click: () => {
          this.editing = false;
          this.askDeletion = true;
        },
      });
    }
  },
  activated() {
    this.setData();
  },
  deactivated() {
    this.$store.commit("snippetListItemEditing", false);
    this.editing = this.askDeletion = false;
  },
  methods: {
    setData() {
      this.name = this.hasNoName ? this.lang.noSnippetName : this.snippet.name;
      this.isClipboard = this.snippet.isClipboard;
      this.description = this.snippet.description;
    },
    startEdit() {
      this.editing = true;
      this.$store.commit("snippetListItemEditing", true);
      this.$root.$emit("snippetBeginEdit", this);
    },
    cancelEdit() {
      this.isClipboard = this.snippet.isClipboard;
      this.editing = false;
      this.$store.commit("snippetListItemEditing", false);
      this.$root.$emit("snippetFinishEdit", this);
    },
    saveEdit() {
      const props = {
        name: (this.name || "").trim() || this.globals.noSnippetName,
        isClipboard: this.isClipboard,
        description: this.description,
      };
      if (this.$store.state.snippets.find((s) => s === this.snippet)) {
        this.$store.commit("updateSnippet", {
          snippet: this.snippet,
          new: props,
        });
      } else {
        // snippet was not saved yet
        Object.assign(this.snippet, props);
      }
      this.cancelEdit();
    },
    showActions() {
      this.$router.push({
        name: "SnippetActions",
        params: {
          title: this.snippet.name,
          actions: this.snippet.actions,
        },
      });
    },
    formatDescription(desc) {
      return nl2br(desc);
    },
    delete() {
      this.$store.commit("removeSnippet", this.snippet);
      this.$store.commit("snippetListItemEditing", false);
    },
  },
};
</script>

<style lang="scss" scoped>
.img {
  width: 30px;
  height: 30px;
}
.background-transition {
  transition: background-color 0.2s ease;
}
.bg-lightgray {
  background-color: var(--darken-background) !important;
}
.text-orange {
  color: var(--orange);
}
</style>
