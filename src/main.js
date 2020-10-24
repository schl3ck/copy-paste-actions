import smoothscroll from "smoothscroll-polyfill";
import Vue from "vue";
import "bootstrap.css";
import "bootstrap.reboot";
import "highlight.js/styles/xcode.css";
// import "jquery";
// import "bootstrap.js";

import "bootstrap-vue/dist/bootstrap-vue-icons.min.css";
import {
  BIcon,
  BIconstack,
  BIconHammer,
  BIconPencilFill,
  BIconGearWideConnected,
  BIconQuestion,
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
} from "bootstrap-vue";

import store from "./store/index";
import App from "./App.vue";
import IconSearchMinus from "@/icons/IconSearchMinus.vue";
import IconSearchPlus from "@/icons/IconSearchPlus.vue";
import IconSave from "@/icons/IconSave.vue";
import IconCloudLink from "@/icons/IconCloudLink.vue";

// make buffer globally available
import { Buffer } from "buffer";
window.Buffer = Buffer;

smoothscroll.polyfill();

Vue.component("BIcon", BIcon);
Vue.component("BIconstack", BIconstack);
Vue.component("BIconHammer", BIconHammer);
Vue.component("BIconPencilFill", BIconPencilFill);
Vue.component("BIconGearWideConnected", BIconGearWideConnected);
Vue.component("BIconQuestion", BIconQuestion);
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
Vue.component("IconSearchMinus", IconSearchMinus);
Vue.component("IconSearchPlus", IconSearchPlus);
Vue.component("IconSave", IconSave);
Vue.component("IconCloudLink", IconCloudLink);

Vue.config.productionTip = false;
Vue.config.performace = process.env.NODE_ENV === "development";

// load data from HTML file
const loadShortcuts = store.dispatch("loadShortcuts");
store.dispatch("loadPreferences");
store.dispatch("loadLanguage");

const root = new Vue({
  store,
  render: (h) => h(App),
}).$mount("#app");

loadShortcuts
  .then(() => {
    root.$emit("loadShortcutsFinished");
  })
  .catch((err) => {
    /* eslint-disable-next-line no-console */
    console.error(err);
  });
