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

  let totalPercentage = 0;
  const worker = new Promise((resolve, reject) => {
    const w = new (WorkerClasses[script])();
    w.addEventListener("message", (event) => {
      if (event.data && !event.data.finished) {
        totalPercentage = event.data;
        callUpdate();
      } else {
        w.terminate();
        totalPercentage = 100;
        callUpdate();
        resolve(event.data.data);
      }
    });
    w.addEventListener("error", (error) => {
      reject(error);
      w.terminate();
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
