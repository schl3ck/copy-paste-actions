<template>
  <div>
    <h2 class="mt-1">
      {{ lang.title }}
    </h2>

    <div class="alert alert-info">
      {{ lang.note }}
    </div>
    <div ref="list" class="list-group list-group-custom-flush">
      <button
        v-for="shortcut in urls"
        :key="shortcut.url"
        :class="
          'list-group-item list-group-item-action custom-list-group-item ' +
            'd-flex align-items-center cursor-pointer text-left'
        "
        @click.prevent="openUrl(shortcut)"
      >
        <img
          v-show="shortcut.image"
          :src="shortcut.image"
          class="mr-2 icon"
          alt="icon"
        >
        <div>
          <span>{{ shortcut.name }}</span>
          <span class="sr-only">.</span>
          <br>
          <span
            class="small text-secondary"
          >{{ lang.date }} {{ shortcut.date.toLocaleString() }}</span>
        </div>
        <div class="btn-group ml-auto">
          <button
            class="btn btn-outline-dark"
            @click.stop.prevent="copyUrl(shortcut)"
          >
            <BIcon icon="clipboard-plus" />
            <span class="sr-only">{{ lang.copy }}.</span>
          </button>
          <button
            class="btn btn-danger"
            @click.stop.prevent="askDeletion = shortcut"
          >
            <BIcon icon="trash" />
            <span class="sr-only">{{ lang.delete }}.</span>
          </button>
        </div>
      </button>
    </div>

    <NavigationToolbar :buttons="buttons" contentRefName="list" />

    <transition name="fade">
      <div
        v-if="askDeletion !== null"
        class="backdrop"
        @click.prevent="askDeletion = null"
      />
    </transition>

    <transition name="slide-down-and-up">
      <div
        v-if="copySuccessfull !== null"
        class="fixed-top text-center overlay-message alert"
        :class="{
          'alert-success': copySuccessfull,
          'alert-danger': !copySuccessfull,
        }"
      >
        <BIcon
          :icon="copySuccessfull ? 'check' : 'exclamation-triangle-fill'"
          :scale="copySuccessfull ? 2 : 1.2"
        />
        {{ copySuccessfull ? lang.copySuccess : lang.copyFailed }}
        <template v-if="copySuccessfull === false">
          <br><input
            ref="urlToCopy"
            class="form-control"
            type="text"
            :value="urlToCopy"
            @blur="copySuccessfull = null"
          >
        </template>
      </div>
    </transition>

    <transition name="slide-down-and-up">
      <div
        v-if="askDeletion !== null"
        :class="
          'fixed-top text-center overlay-message alert alert-danger ' +
            'd-flex flex-column'
        "
      >
        <div
          :class="
            'card mb-2 text-body py-2 px-3 d-flex align-items-center ' +
              'flex-row'
          "
        >
          <img :src="askDeletion.image" class="icon mr-2" alt="icon">
          <div>
            <span>{{ askDeletion.name }}</span>
            <span class="sr-only">.</span>
            <br>
            <span class="small text-secondary">
              {{ lang.date }} {{ askDeletion.date.toLocaleString() }}
            </span>
          </div>
        </div>
        <span v-html="lang.deleteNote" />
        <ButtonBar :buttons="confirmDeleteButtons" size="normal" />
      </div>
    </transition>
  </div>
</template>

<script>
import Vue from "vue";
import ButtonBar from "@/components/ButtonBar.vue";
import NavigationToolbar from "@/components/NavigationToolbar.vue";
import { copyTextToClipboard } from "@/utils/utils";
import { navigateAndBuildZip } from "@/utils/openApp";

export default {
  name: "ListiCloudUrls",
  components: {
    ButtonBar,
    NavigationToolbar,
  },
  data() {
    return {
      copySuccessfull: null,
      urlToCopy: "",
      /** @type {Store.ICloudShortcut | null} */
      askDeletion: null,
    };
  },
  computed: {
    /** @returns {object} */
    lang() {
      return this.$store.state.language.listiCloudUrls;
    },
    /** @returns {Store.ICloudShortcut[]} */
    urls() {
      return this.$store.getters.icloudUrls;
    },
    /** @returns {ButtonBar.Button[]} */
    confirmDeleteButtons() {
      return [
        {
          text: this.lang.delete,
          class: "btn-danger",
          icon: "trash",
          click: () => {
            this.deleteUrl(this.askDeletion);
            this.askDeletion = null;
          },
        },
        {
          text: this.lang.cancel,
          class: "btn-secondary",
          icon: "x",
          iconOptions: {
            scale: 1.5,
          },
          click: () => {
            this.askDeletion = null;
          },
        },
      ];
    },
    /** @returns {boolean} */
    hasUnsavedChanges() {
      return this.$store.state.icloudUrlsChanged;
    },
    /** @returns {ButtonBar.Button[]} */
    buttons() {
      return this.hasUnsavedChanges
        ? [
          {
            text: this.lang.save,
            class: "btn-success",
            icon: { component: "IconSave" },
            click: () => {
              // let the function add all necessary data from the store
              navigateAndBuildZip({
                actions: ["Build.toSafari"],
                toMainMenu: true,
                closePage: false,
              });
            },
          },
        ]
        : [];
    },
  },
  watch: {
    copySuccessfull(val) {
      if (val === true) {
        // hide after 2 s
        setTimeout(() => {
          this.copySuccessfull = null;
        }, 2000);
      } else if (val === null) {
        this.urlToCopy = "";
      }
    },
  },
  activated() {
    this.$store.commit("showMainTitle", false);
  },
  methods: {
    /** @param {Store.ICloudShortcut} shortcut */
    openUrl(shortcut) {
      const url = shortcut.url.replace(
        /^https:\/\/(www\.)?icloud\.com\//,
        "shortcuts://",
      );
      window.location.href = url;
    },
    /** @param {Store.ICloudShortcut} shortcut */
    async copyUrl(shortcut) {
      let res = copyTextToClipboard(shortcut.url);
      if (res instanceof Promise) {
        res = await res;
      }
      this.copySuccessfull = res;
      if (!res) {
        this.urlToCopy = shortcut.url;
        Vue.nextTick(() => {
          this.$refs.urlToCopy.select();
        });
      }
    },
    /** @param {Store.ICloudShortcut} shortcut */
    deleteUrl(shortcut) {
      this.$store.commit("removeiCloudUrl", shortcut.url);
    },
  },
};
</script>

<style lang="scss" scoped>
.icon {
  width: 30px;
  height: 30px;
}
</style>
