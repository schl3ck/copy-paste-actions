import _ from "lodash";
import Analyser from "./analyser.worker";
import Merger from "./merger.worker";

const WorkerClasses = {
  analyser: Analyser,
  merger: Merger
};

/**
 * Calls the specified script multiple times
 * @param {"analyser" | "merger"} script The script to call
 * @param {Parameters<typeof Analyser>[0] | Parameters<typeof Merger>[0]} dict The dict argument of the script
 * @param {(number) => void} [update] Will be called with updates to the total percentage from 0 to 100
 */
export default function(script, dict, update) {
  if (!(script in WorkerClasses)) {
    throw new TypeError('Argument script must be either "analyser" or "merger"');
  }

  const newDict = _.cloneDeep(_.omit(dict, "shortcuts"));
  const workers = [];
  const totalPercentage = [];
  for (const [i, shortcut] of dict.shortcuts.entries()) {
    totalPercentage.push(0);
    workers.push(new Promise((resolve, reject) => {
      const d = _.cloneDeep(newDict);
      d.shortcuts = [shortcut];

      const w = new (WorkerClasses[script])();
      w.addEventListener("message", (event) => {
        if (event.data && !event.data.finished) {
          totalPercentage[i] = event.data;
          callUpdate();
        } else {
          callUpdate();
          resolve(event.data.data);
        }
      });
      w.addEventListener("error", (error) => {
        reject(error);
      });
      w.postMessage(d);
    }));
  }

  return Promise.all(workers);

  function callUpdate() {
    try {
      // call update with total percentage
      update && update(totalPercentage.reduce((acc, cur) => acc + cur, 0) / totalPercentage.length);
    } catch (err) {
      // nothing
    }
  }
}
