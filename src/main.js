import Vue from "vue";
import App from "./App.vue";
import "bootstrap.css";
import "bootstrap.reboot";
// import "jquery";
// import "bootstrap.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faHammer,
  faPencilAlt,
  faCogs,
  faQuestion,
  faClipboard,
  faCheck,
  faChevronLeft,
  faBars
} from "@fortawesome/free-solid-svg-icons";

import store from "./store/index";

// make buffer globally available
import { Buffer } from "buffer";
window.Buffer = Buffer;

library.add(
  faHammer,
  faPencilAlt,
  faCogs,
  faQuestion,
  faClipboard,
  faCheck,
  faChevronLeft,
  faBars
);

Vue.component("FontAwesomeIcon", FontAwesomeIcon);

Vue.config.productionTip = false;
Vue.config.performace = process.env.NODE_ENV === "development";

// load data from HTML file
const loadShortcuts = store.dispatch("loadShortcuts");
store.dispatch("loadPreferences");
store.dispatch("loadLanguage");

const root = new Vue({
  store,
  render: h => h(App)
}).$mount("#app");

loadShortcuts.then(() => {
  root.$emit("loadShortcutsFinished");
}).catch((err) => {
  /* eslint-disable-next-line no-console */
  console.error(err);
});
