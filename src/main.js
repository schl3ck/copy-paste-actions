import Vue from "vue";
import App from "./App.vue";
import "bootstrap.css";
import "bootstrap.reboot";
import "jquery";
import "bootstrap.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHammer, faPencilAlt, faCogs, faQuestion, faClipboard, faCheck, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import store from "./store/index";

library.add(faHammer, faPencilAlt, faCogs, faQuestion, faClipboard, faCheck, faChevronLeft);

Vue.component("FontAwesomeIcon", FontAwesomeIcon);

Vue.config.productionTip = false;

// load data from HTML file
store.dispatch("loadShortcuts");
store.dispatch("loadPreferences");
store.dispatch("loadLanguage");

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
