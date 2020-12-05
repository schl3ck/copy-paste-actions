import smoothscroll from "smoothscroll-polyfill";
import Vue from "vue";
import "bootstrap.css";
import "bootstrap.reboot";
import "@/styles/highlightjs.scss";

import "bootstrap-vue/dist/bootstrap-vue-icons.min.css";
import {
  BIcon,
  BIconstack,
  BIconHammer,
  BIconPencilFill,
  BIconGearWideConnected,
  BIconCheck,
  BIconChevronLeft,
  BIconListCheck,
  BIconFileEarmarkFill,
  BIconArrowCounterclockwise, // file import
  BIconPlayFill,
  BIconExclamationCircleFill,
  BIconSearch,
  BIconDash,
  BIconPlus,
  BIconExclamationTriangleFill,
  BIconDownload,
  BIconArrowRight,
  BIconX,
  BIconTrash,
  BIconEyeSlash,
  BIconCloud,
  BIconLink,
  BIconClipboardPlus,
  BIconInfoCircle,
  BIconQuestionCircle,
  BIconBook,
  BIconBug,
  BIconEmojiFrown,
} from "bootstrap-vue";

import store from "./store/index";
import App from "./App.vue";
import IconSearchMinus from "@/icons/IconSearchMinus.vue";
import IconSearchPlus from "@/icons/IconSearchPlus.vue";
import IconSave from "@/icons/IconSave.vue";
import IconCloudLink from "@/icons/IconCloudLink.vue";
import { checkForUpdate } from "@/utils/checkForUpdate";

// make buffer globally available
import { Buffer } from "buffer";
window.Buffer = Buffer;

smoothscroll.polyfill();

Vue.component("BIcon", BIcon);
Vue.component("BIconstack", BIconstack);
Vue.component("BIconHammer", BIconHammer);
Vue.component("BIconPencilFill", BIconPencilFill);
Vue.component("BIconGearWideConnected", BIconGearWideConnected);
Vue.component("BIconCheck", BIconCheck);
Vue.component("BIconChevronLeft", BIconChevronLeft);
Vue.component("BIconListCheck", BIconListCheck);
Vue.component("BIconFileEarmarkFill", BIconFileEarmarkFill);
Vue.component("BIconArrowCounterclockwise", BIconArrowCounterclockwise);
Vue.component("BIconPlayFill", BIconPlayFill);
Vue.component("BIconExclamationCircleFill", BIconExclamationCircleFill);
Vue.component("BIconSearch", BIconSearch);
Vue.component("BIconDash", BIconDash);
Vue.component("BIconPlus", BIconPlus);
Vue.component("BIconExclamationTriangleFill", BIconExclamationTriangleFill);
Vue.component("BIconDownload", BIconDownload);
Vue.component("BIconArrowRight", BIconArrowRight);
Vue.component("BIconX", BIconX);
Vue.component("BIconTrash", BIconTrash);
Vue.component("BIconEyeSlash", BIconEyeSlash);
Vue.component("BIconCloud", BIconCloud);
Vue.component("BIconLink", BIconLink);
Vue.component("BIconClipboardPlus", BIconClipboardPlus);
Vue.component("BIconInfoCircle", BIconInfoCircle);
Vue.component("BIconQuestionCircle", BIconQuestionCircle);
Vue.component("BIconBook", BIconBook);
Vue.component("BIconBug", BIconBug);
Vue.component("BIconEmojiFrown", BIconEmojiFrown);
Vue.component("IconSearchMinus", IconSearchMinus);
Vue.component("IconSearchPlus", IconSearchPlus);
Vue.component("IconSave", IconSave);
Vue.component("IconCloudLink", IconCloudLink);

Vue.config.productionTip = false;
Vue.config.performace = process.env.NODE_ENV === "development";

let root;

// load data from HTML file
const loadShortcuts = store.dispatch("loadShortcuts");
store.dispatch("loadLanguage");
store.dispatch("loadPreferences").then(() => {
  root = new Vue({
    store,
    render: (h) => h(App),
  }).$mount("#app");
  checkForUpdate();
});

loadShortcuts
  .then(() => {
    root.$emit("loadShortcutsFinished");
  })
  .catch((err) => {
    /* eslint-disable-next-line no-console */
    console.error(err);
  });
