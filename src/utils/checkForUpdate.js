import store from "@/store/index";
import { zip } from "@/utils/utils";

export function checkForUpdate() {
  const req = new XMLHttpRequest();
  req.open("GET", `https://routinehub.co/api/v1/shortcuts/${store.preferences["RoutineHub ID"]}/versions/latest`, true);
  req.responseType = "json";
  req.onreadystatechange = function() {
    if (req.readyState === XMLHttpRequest.DONE) {
      if (req.status === 0 || (req.status >= 200 && status < 400)) {
        const res = req.response;
        if (res && res.result === "success") {
          const curVersion = store.state.preferences.Version.split(".");
          const newVersion = res.Version.split(".");

          let isNewer = false;
          for (const [c, n] of zip(curVersion, newVersion)) {
            if (parseInt(n) > parseInt(c)) {
              isNewer = true;
              break;
            }
          }
          if (isNewer) {
            store.commit("updateAvailable", {
              version: newVersion.join("."),
              url: res.URL,
              notes: res.Notes,
              release: new Date(res.Release)
            });
          }
        }
      } else {
        // request failed. Do nothing?
      }
    }
  };
  req.send();
}
