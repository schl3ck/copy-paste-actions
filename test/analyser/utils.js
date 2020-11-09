/*
import with
const _ = require("lodash");
/* eslint-disable no-unused-vars * /
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
} = require("./utils.test");
/* eslint-enable no-unused-vars * /

*/

const expect = require("chai").expect;
const bplist = require("../../src/utils/bplist");

const ShortcutBuilder = require("../shortcutBuilder");
const uniquePermutations = require("../uniquePermutations");
const { constructActionsToRemove, extractUUIDs } = require("../utils");

const script = require("../../src/utils/analyser.worker");

const possibleScriptParams = {
  excludeAllCPAComments: [false, true],
  cleanUp: [0, 1, 2],
};
/**
 * @typedef {
 *    Pick<Parameters<typeof script>[0], "excludeAllCPAComments" | "cleanUp">
 * } PossibleParams
 */
/** @type {PossibleParams[]} */
const allPossibleScriptParams = [];
(function() {
  const combinations = Object.values(possibleScriptParams).reduce(
    (acc, ar) => acc * ar.length,
    1,
  );
  const keys = Object.keys(possibleScriptParams);
  const indices = {};
  const max = {};
  keys.forEach((k) => {
    indices[k] = 0;
    max[k] = possibleScriptParams[k].length - 1;
  });
  for (let i = 0; i < combinations; i++) {
    const o = {};
    keys.forEach((k) => {
      o[k] = possibleScriptParams[k][indices[k]];
    });
    allPossibleScriptParams.push(o);
    let carryOver = true;
    keys.forEach((k) => {
      if (carryOver) {
        carryOver = ++indices[k] > max[k];
        if (carryOver) indices[k] = 0;
      }
    });
  }
})();

/**
 * Returns an object with all needed parameters for the script
 * @param {ShortcutBuilder|Array|Object} shortcut - The Shortcut to use in the
 *    parameter
 */
function getParamForScript(shortcut) {
  if (shortcut instanceof ShortcutBuilder) {
    shortcut = {
      name: "Test Shortcut",
      shortcut: shortcut.build(),
    };
  }

  return {
    shortcuts: shortcut,
    excludeAllCPAComments: false,
    cleanUp: 0,
    commentMarker: ":cpa:",
    noSnippetName: " ",
    defaultNewShortcutName: "New Shortcut",
  };
}

/**
 * @typedef {object} UUIDs
 * @property {string[]} groups
 * @property {string[]} vars
 */
/**
 * @typedef {object} Snippet
 * @property {string} name
 * @property {UUIDs} uuids
 * @property {boolean} isClipboard
 * @property {number} numberOfActions
 */
/**
 * Test the result of the Analyser Script
 * @param {object} obj - The object to test
 * @param {object} props - How the object should look like
 * @param {number} props.nItems
 * @param {string[]} props.warnings - An array of strings that should be
 * contained in `obj.warnings`
 * @param {object[]} props.shortcuts
 * @param {string} props.shortcuts[].name
 * @param {number[]} props.shortcuts[].actionsToRemove - An array of positions
 * of actions that should be removed.
 * 0-based.
 * @param {UUIDs} props.shortcuts[].uuids - See {@link UUIDs}
 * @param {object[]} props.shortcuts[].inserts
 * @param {number} props.shortcuts[].inserts[].id - The insert id
 * @param {string} props.shortcuts[].inserts[].name
 * @param {boolean} props.shortcuts[].inserts[].isClipboard
 * @param {number} props.shortcuts[].inserts[].position 0-based
 * @param {Snippet[]} props.shortcuts[].snippets - See {@link Snippet}
 */
function expectReturnObject(obj, props) {
  expect(obj, "obj").to.be.ok;
  expect(obj, "obj").to.be.an("object");

  expect(obj, "obj.nItems").to.have.property("nItems", props.nItems);

  expect(obj, "obj").to.have.property("warnings");
  expect(obj.warnings, "obj.warnings").to.be.instanceOf(Array);
  expect(obj.warnings.length, "obj.warnings.length").to.equal(
    props.warnings.length,
  );
  expect(obj.warnings, "obj.warnings").to.deep.equal(props.warnings);

  expect(obj, "obj").to.have.property("shortcuts");
  expect(obj.shortcuts, "obj.shortcuts").to.be.instanceOf(Array);
  expect(obj.shortcuts.length, "obj.shortcuts.length").to.equal(
    props.shortcuts.length,
  );

  // ============ all shortcuts ===============
  obj.shortcuts.forEach((obj, i) => {
    const messageStart = `obj.shortcuts[${i}]`;
    expect(obj, `${messageStart}.name`).to.have.property(
      "name",
      props.shortcuts[i].name,
    );

    expect(obj, messageStart).to.have.property("actionsToRemove");
    expect(
      obj.actionsToRemove,
      `${messageStart}.actionsToRemove`,
    ).to.be.instanceOf(Array);
    expect(
      obj.actionsToRemove,
      `${messageStart}.actionsToRemove`,
    ).to.have.deep.members(props.shortcuts[i].actionsToRemove);

    expect(obj, `${messageStart}`).to.have.property("uuids");
    expect(obj.uuids, `${messageStart}.uuids`).to.deep.equal(
      props.shortcuts[i].uuids,
    );

    // ============= all inserts ===============
    expect(obj, `${messageStart}`).to.have.property("inserts");
    expect(obj.inserts, `${messageStart}.inserts`).to.have.deep.members(
      props.shortcuts[i].inserts,
    );

    // =========== all snippets ============
    expect(obj, `${messageStart}`).to.have.property("snippets");
    expect(obj.snippets, `${messageStart}.snippets`).to.be.instanceOf(Object);
    expect(
      Object.keys(obj.snippets),
      `${messageStart}.snippets.keys`,
    ).to.have.length(props.shortcuts[i].snippets.length);

    props.shortcuts[i].snippets.forEach((snippet, j) => {
      expect(
        obj.snippets.map((s) => s.name),
        `obj.shortcuts[${i}].snippets.names`,
      )
        .to.be.an("array")
        .that.includes(snippet.name);

      let o = obj.snippets.find((s) => s.name === snippet.name);

      const messageStart = `obj.shortcuts[${i}].snippets[${j}]`;
      expect(o, messageStart).to.be.an("object").and.ok;

      expect(o, `${messageStart}.name`).to.have.property("name", snippet.name);

      expect(o, `${messageStart}.isClipboard`).to.have.property(
        "isClipboard",
        snippet.isClipboard,
      );

      // expect(o, `${messageStart}.newShortcut`).to.have.property(
      //   "newShortcut",
      //   snippet.newShortcut || "",
      // );

      expect(o, `${messageStart}.numberOfActions`).to.have.property(
        "numberOfActions",
        snippet.numberOfActions,
      );

      expect(o, `${messageStart}`).to.have.property("uuids");
      expect(o.uuids, `${messageStart}.uuids`).to.have.property("groups");
      expect(o.uuids.groups, `${messageStart}.uuids.groups`).to.have.members(
        snippet.uuids.groups,
      );
      expect(o.uuids, `${messageStart}.uuids`).to.have.property("vars");
      expect(o.uuids.vars, `${messageStart}.uuids.vars`).to.have.members(
        snippet.uuids.vars,
      );

      expect(o, `${messageStart}`).to.have.property("actions");
      o = o.actions;
      expect(o, `${messageStart}.actions`).to.be.instanceOf(Array);
      expect(o, `${messageStart}.actions`).to.deep.equal(snippet.actions);
    });
  });
}

// eslint-disable-next-line no-unused-vars
const contextForImports = {
  script,
  extractUUIDs,
  ShortcutBuilder,
  getParamForScript,
  expectReturnObject,
  uniquePermutations: {
    generate: uniquePermutations.uniquePermutations,
    generatePatterns: uniquePermutations.uniquePermutationPatterns,
    combined: uniquePermutations.combinedPermutations,
  },
  allPossibleScriptParams,
  constructActionsToRemove,
  genUUID: ShortcutBuilder.genUUID,
};

module.exports = contextForImports;
