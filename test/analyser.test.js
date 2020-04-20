/* eslint-disable no-console */

/* eslint-disable no-unused-vars */
const _ = require("lodash");
const {
  script,
  genUUID,
  extractUUIDs,
  ShortcutBuilder,
  getParamForScript,
  expectReturnObject,
  uniquePermutations,
  allPossibleScriptParams,
  constructActionsToRemove
} = require("./analyser/utils");
/* eslint-enable no-unused-vars */

require("./analyser/simple.test")();
require("./analyser/pause.test")();
require("./analyser/names, permutations.test")({ maxPermutations: 10 });
require("./analyser/warnings.test")();
require("./analyser/misc.test")();
require("./analyser/blocks.test")();

// return;
