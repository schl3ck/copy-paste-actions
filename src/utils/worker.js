import Analyser from "./analyser.worker";
import Merger from "./merger.worker";

const WorkerClasses = {
  analyser: Analyser,
  merger: Merger
};

const WorkerCache = {
  analyser: null,
  merger: null
};
const allWorkers = [];

window.clearCache = function() {
  allWorkers.forEach(w => w.terminate());
  WorkerCache.analyser = WorkerCache.merger = null;
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

  let totalPercentage = 0;
  const worker = new Promise((resolve, reject) => {
    let w;
    if (WorkerCache[script]) {
      w = WorkerCache[script];
    } else {
      const Worker = WorkerClasses[script];
      w = WorkerCache[script] = Worker();
      allWorkers.push(w);
    }

    w.addEventListener("message", (event) => {
      if ((event.data || event.data === 0) && !event.data.finished) {
        totalPercentage = event.data;
        callUpdate();
      } else {
        totalPercentage = 100;
        callUpdate();
        resolve(event.data.data);
      }
    });
    w.addEventListener("error", (error) => {
      // eslint-disable-next-line no-console
      console.error("Error in worker:", error);
      reject(error);
    });
    w.postMessage(dict);
  });

  return worker;

  function callUpdate() {
    try {
      // call update with total percentage
      update && update(totalPercentage);
    } catch (err) {
      // nothing
    }
  }
}
