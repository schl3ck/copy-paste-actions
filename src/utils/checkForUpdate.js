import store from "@/store/index";
import { zip } from "@/utils/utils";

export function checkForUpdate() {
  const req = new XMLHttpRequest();
  req.open(
    "GET",
    "https://api.github.com/repos/schl3ck/copy-paste-actions/contents/version.json",
    true,
  );
  req.setRequestHeader("Accept", "application/vnd.github.v3+json");
  req.responseType = "json";
  req.onreadystatechange = function() {
    if (req.readyState === XMLHttpRequest.DONE) {
      if (req.status === 0 || (req.status >= 200 && req.status < 400)) {
        const res = req.response;
        let file = res.content;
        if (res.encoding === "base64") {
          file = atob(file);
        } else {
          // eslint-disable-next-line no-console
          console.error("unknown encoding:", res.encoding);
        }
        file = JSON.parse(file);
        const curVersion = store.state.preferences.Version.split(".");
        const newVersion = file.Version.split(".");

        if (curVersion.length !== newVersion.length) {
          if (curVersion.length > newVersion.length) {
            newVersion.push(
              ..."0".repeat(curVersion.length - newVersion.length).split(""),
            );
          } else {
            curVersion.push(
              ..."0".repeat(newVersion.length - curVersion.length).split(""),
            );
          }
        }

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
            url: file.URL,
            notes: file.Notes,
            release: new Date(file.Release),
          });
        }
      } else {
        // request failed. Do nothing?
        // eslint-disable-next-line no-console
        console.log(
          `check for update failed: ${req.statusText} (${req.status})`,
          req,
        );
      }
    }
  };
  req.send();
}
