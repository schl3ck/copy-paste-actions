import smoothscroll from "smoothscroll-polyfill";
import Vue from "vue";
import VueRouter from "vue-router";
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
  BIconKeyboard,
  BIconBook,
  BIconBug,
  BIconEmojiFrown,
  BIconHouseFill,
  BIconListOl,
} from "bootstrap-vue";

import store from "./store/index";
import router from "@/router";
import App from "./App.vue";
import IconSearchMinus from "@/icons/IconSearchMinus.vue";
import IconSearchPlus from "@/icons/IconSearchPlus.vue";
import IconSave from "@/icons/IconSave.vue";
import IconCloudLink from "@/icons/IconCloudLink.vue";
import { checkForUpdate } from "@/utils/checkForUpdate";
import setupKeyboardNavigation from "@/utils/keyboardNavigation";
import setupTouchNavigation from "@/utils/touchNavigation";

// make buffer globally available
import { Buffer } from "buffer";
window.Buffer = Buffer;

smoothscroll.polyfill();

Vue.use(VueRouter);

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
Vue.component("BIconKeyboard", BIconKeyboard);
Vue.component("BIconBook", BIconBook);
Vue.component("BIconBug", BIconBug);
Vue.component("BIconEmojiFrown", BIconEmojiFrown);
Vue.component("BIconHouseFill", BIconHouseFill);
Vue.component("BIconListOl", BIconListOl);
Vue.component("IconSearchMinus", IconSearchMinus);
Vue.component("IconSearchPlus", IconSearchPlus);
Vue.component("IconSave", IconSave);
Vue.component("IconCloudLink", IconCloudLink);

Vue.config.productionTip = false;
Vue.config.performace = process.env.NODE_ENV === "development";

Vue.mixin({
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      store.commit("activeRouterView", vm);
    });
  },
});

setupKeyboardNavigation();
setupTouchNavigation();

let root;

// load data from HTML file
const loadShortcuts = store.dispatch("loadShortcuts");
store.dispatch("loadLanguage");
store.dispatch("loadPreferences").then(() => {
  root = new Vue({
    store,
    router,
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
