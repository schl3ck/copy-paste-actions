import VueRouter from "vue-router";
import store from "@/store/index";

import AnalyserWarnings from "@/views/AnalyserWarnings.vue";
import ConfirmAutoAnalyser from "@/views/ConfirmAutoAnalyser.vue";
import ConfirmNewUpdate from "@/views/ConfirmNewUpdate.vue";
import ConfirmSelectedShortcuts from "@/views/ConfirmSelectedShortcuts.vue";
import FoundInserts from "@/views/FoundInserts.vue";
import FoundSnippets from "@/views/FoundSnippets.vue";
import HelpBugReport from "@/views/HelpBugReport.vue";
import HelpDocumentation from "@/views/HelpDocumentation.vue";
import HelpFAQ from "@/views/HelpFAQ.vue";
import HelpGetStarted from "@/views/HelpGetStarted.vue";
import HelpKeyboardShortcuts from "@/views/HelpKeyboardShortcuts.vue";
import HelpMenu from "@/views/HelpMenu.vue";
import ImportShortcuts from "@/views/ImportShortcuts.vue";
import ListiCloudUrls from "@/views/ListiCloudUrls.vue";
import ListSnippets from "@/views/ListSnippets.vue";
import MainMenu from "@/views/MainMenu.vue";
import MergeSnippetsIntoShortcut from "@/views/MergeSnippetsIntoShortcut.vue";
import OpenApp from "@/views/OpenApp.vue";
import PrefAutoLoadShortcuts from "@/views/PrefAutoLoadShortcuts.vue";
import Preferences from "@/views/Preferences.vue";
import PrefLanguage from "@/views/PrefLanguage.vue";
import ProcessShortcuts from "@/views/ProcessShortcuts.vue";
import SelectShortcuts from "@/views/SelectShortcuts.vue";
import SnippetActions from "@/views/SnippetActions.vue";

/** @type { import("vue").ComponentOptions[] } */
const comps = [
  AnalyserWarnings,
  ConfirmAutoAnalyser,
  ConfirmNewUpdate,
  ConfirmSelectedShortcuts,
  FoundInserts,
  FoundSnippets,
  HelpBugReport,
  HelpDocumentation,
  HelpFAQ,
  HelpGetStarted,
  HelpKeyboardShortcuts,
  HelpMenu,
  ImportShortcuts,
  ListiCloudUrls,
  ListSnippets,
  MainMenu,
  MergeSnippetsIntoShortcut,
  OpenApp,
  PrefAutoLoadShortcuts,
  Preferences,
  PrefLanguage,
  ProcessShortcuts,
  SelectShortcuts,
  SnippetActions,
];
const compNames = comps.map((c) => c.name);

const router = new VueRouter({
  routes: comps.map((comp) => {
    const name = comp.name;
    return {
      path: name === "MainMenu" ? "/" : "/" + name,
      name: name,
      component: comp,
      props: true,
    };
  }),
  fallback: false,
  mode: "abstract",
});

/** @type {Map<string, {scrollPos: {x: number, y: number}}>} */
const compSettings = new Map();

// ========= intercept navigation ==========
let historyNavigation = false;
/**
 * @param {Function} callback
 */
function historyHandler(callback) {
  return function(...args) {
    historyNavigation = true;
    callback(...args);
  };
}

const go = router.go.bind(router);

router.go = historyHandler(go);
// ===== /intercept navigation ======

router.beforeEach((to, from, next) => {
  if (compNames.includes(from.name)) {
    compSettings.set(from.name, {
      scrollPos: {
        x: window.scrollX,
        y: window.scrollY,
      },
    });
  }
  next();
});

/**
 * @param {import("vue-router").Route} to
 * @param {import("vue-router").Route} from
 */
function scrollBehavior(to, from) {
  let position = {
    x: 0,
    y: 0,
  };
  if (historyNavigation && compSettings.has(to.name)) {
    position = compSettings.get(to.name).scrollPos;
  }
  return position;
}

/** @param {import("vue-router").Route} route */
export function routeToTitle(route) {
  const compLang =
    store.state.language[route.name[0].toLowerCase() + route.name.substr(1)];
  return compLang && compLang.title;
}

export const titlePrefix = "CopyPaste Actions - ";

router.afterEach((to, from) => {
  document.title = titlePrefix + (routeToTitle(to) || to.name);

  const pos = scrollBehavior(to, from);
  if (pos) {
    setTimeout(
      () => window.scrollTo({ left: pos.x, top: pos.y, behavior: "auto" }),
      0,
    );
  }
});

export default router;
