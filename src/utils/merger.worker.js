// use CommonJS import for the tests
// Buffer is globally available
const { v4: genUUID } = require("uuid");
const bplist = require("./bplist");

/**
 * @typedef {object} InputDict
 * @property {object[]} shortcuts
 * @property {string} shortcuts[].name
 * @property {object[]} shortcuts[].inserts
 * @property {number} shortcuts[].inserts[].position
 * @property {number} shortcuts[].inserts[].id
 * @property {object[]} shortcuts[].inserts[].actions as parsed JSON
 * @property {object} shortcuts[].inserts[].uuids
 * @property {string[]} shortcuts[].inserts[].uuids.groups
 * @property {string[]} shortcuts[].inserts[].uuids.vars
 * @property {object} shortcuts[].uuids
 * @property {string[]} shortcuts[].uuids.groups
 * @property {string[]} shortcuts[].uuids.vars
 * @property {object[]} shortcuts[].actionsToRemove
 * @property {number} shortcuts[].actionsToRemove[].actions 0-based index of
 * action
 * @property {number[]} shortcuts[].actionsToRemove[].excludedBy array of ids
 * @property {Buffer} shortcuts[].shortcut base64 encoded bplist
 */

function castArray(obj) {
  /* istanbul ignore next reason: no need to test */
  return Array.isArray(obj) ? obj : [obj];
}

/**
 * @param {InputDict} dict
 * @returns { {shortcuts: {name: string, shortcut: string}[]} }
 */
function merge(dict) {
  const res = {};
  const finishedShortcuts = [];

  dict.shortcuts = castArray(dict.shortcuts);

  const percentagePerShortcut = 100 / dict.shortcuts.length;

  dict.shortcuts.forEach((shortcut, shortcutIndex) => {
    const basePercentage = percentagePerShortcut * shortcutIndex;
    updatePercentage(basePercentage);

    const idsToExclude = [];
    const insertIntoShortcut = [];

    shortcut.shortcut = bplist.parse(Buffer.from(shortcut.shortcut))[0];
    shortcut.inserts = castArray(shortcut.inserts);
    shortcut.uuids.groups = castArray(shortcut.uuids.groups);
    shortcut.uuids.vars = castArray(shortcut.uuids.vars);
    shortcut.actionsToRemove = castArray(shortcut.actionsToRemove);

    let allUUIDs = [];
    allUUIDs = allUUIDs.concat(shortcut.uuids.groups);
    allUUIDs = allUUIDs.concat(shortcut.uuids.vars);

    shortcut.inserts.forEach(function(insert) {
      insert.uuids.groups = castArray(insert.uuids.groups);
      insert.uuids.vars = castArray(insert.uuids.vars);

      let actions = JSON.stringify(insert.actions);
      let uuidsToReplace = insert.uuids.groups.filter((g) =>
        shortcut.uuids.groups.includes(g),
      );
      uuidsToReplace = uuidsToReplace.concat(
        insert.uuids.vars.filter((v) => shortcut.uuids.vars.includes(v)),
      );

      allUUIDs = allUUIDs.concat(insert.uuids.groups);
      allUUIDs = allUUIDs.concat(insert.uuids.vars);

      uuidsToReplace.forEach((uuid) => {
        let newUUID;
        do {
          newUUID = genUUID();
        } while (allUUIDs.includes(newUUID));
        allUUIDs.push(newUUID);
        actions = actions.replace(new RegExp(uuid, "g"), newUUID);
      });
      insertIntoShortcut[insert.position] = JSON.parse(actions);
      idsToExclude.push(insert.id);
    });

    updatePercentage(basePercentage + percentagePerShortcut * 0.5);

    let merged = [];
    let modified = false;
    shortcut.shortcut.WFWorkflowActions.forEach((action, i) => {
      const remove = shortcut.actionsToRemove.find((a) => a.action === i);
      if (
        !remove
        || (!remove.excludedBy.includes(-1)
          && idsToExclude.filter((id) => remove.excludedBy.includes(id)).length
            === 0)
      ) {
        merged.push(action);
      } else {
        modified = true;
      }

      if (insertIntoShortcut[i]) {
        merged = merged.concat(insertIntoShortcut[i]);
        modified = true;
      }
    });

    if (modified) {
      shortcut.shortcut.WFWorkflowActions = merged;
      finishedShortcuts.push({
        name: shortcut.name,
        shortcut: bplist.create(shortcut.shortcut).toString("base64"),
      });
    }
  });

  res.shortcuts = finishedShortcuts;

  return res;
}

/* istanbul ignore next reason: don't test this wrapper for Web Workers */
try {
  self.addEventListener("message", (event) => {
    const result = merge(event.data);
    self.postMessage({ finished: true, data: result });
  });
} catch (err) {
  module.exports = merge;
}

/**
 * Notifies the parent of this Web Worker of a percentage update
 * @param {number} percent Number between 0 and 100
 */
/* istanbul ignore next reason: don't test communication with Web Worker
  parent */
function updatePercentage(percent) {
  try {
    self.postMessage(percent);
  } catch (err) {
    // nothing
  }
}
