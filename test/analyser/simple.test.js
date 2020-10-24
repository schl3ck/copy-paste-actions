const _ = require("lodash");
/* eslint-disable no-unused-vars */
const {
  script,
  genUUID,
  extractUUIDs,
  ShortcutBuilder,
  getParamForScript,
  expectReturnObject,
  uniquePermutations,
  allPossibleScriptParams,
  constructActionsToRemove,
} = require("./utils");
/* eslint-enable no-unused-vars */

module.exports = function() {
  describe("Simple Copy", () => {
    describe("comment, copy, dummy 2, end", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment("This is a test comment");
          sct.addComment(":cpa:\ncopy");
          sct.addAction(ShortcutBuilder.actions.Dummy);
          sct.addAction(ShortcutBuilder.actions.Dummy);
          sct.addComment(":cpa:\nend");

          const dict = getParamForScript(sct);

          _.assign(dict, params);

          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [1, 4] : [],
                ),
                uuids: { groups: [], vars: [] },
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 2,
                    uuids: { groups: [], vars: [] },
                    actions: sct.getActions(2, 2),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy, copy 1, dummy 2", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ncopy 1");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [1] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    newShortcut: "",
                    numberOfActions: 1,
                    uuids: extractUUIDs(sct.getActions(2, 1)),
                    actions: sct.getActions(2, 1),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy 3, copy 3, dummy 6", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ncopy 3");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);

          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [3] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 3,
                    uuids: extractUUIDs(sct.getActions(4, 3)),
                    actions: sct.getActions(4, 3),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy 3, copy 9, dummy 6", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ncopy 9");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [3] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 6,
                    uuids: extractUUIDs(sct.getActions(4, 9)),
                    actions: sct.getActions(4, 9),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("comment 3, copy 5, comment 2, dummy, end, comment 2", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment("This is a test comment");
          sct.addComment("This is a test comment 2");
          sct.addComment("This is a test comment 3");
          sct.addComment(":cpa:\ncopy 5");
          sct.addComment("This is a test comment 4");
          sct.addComment("This is a test comment 5");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\nend");
          sct.addComment("This is a test comment 6");
          sct.addComment("This is a test comment 7");

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [3, 7] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 3,
                    uuids: extractUUIDs(sct.getActions(4, 3)),
                    actions: sct.getActions(4, 3),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy, copy, dummy 5", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ncopy");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [1] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 5,
                    uuids: extractUUIDs(sct.getActions(2)),
                    actions: sct.getActions(2),
                  },
                ],
              },
            ],
          });
        });
      });
    });
  });

  describe("Simple Cut", () => {
    describe("comment, cut, dummy 2, end", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment("This is a test comment");
          sct.addComment(":cpa:\ncut");
          sct.addAction(ShortcutBuilder.actions.Dummy);
          sct.addAction(ShortcutBuilder.actions.Dummy);
          sct.addComment(":cpa:\nend");

          const dict = getParamForScript(sct);

          _.assign(dict, params);

          const res = script(dict);

          let actionsToRemove;
          switch (params.cleanUp) {
            case 0:
              actionsToRemove = [2, 3];
              break;
            case 1:
              actionsToRemove = [2, 3, 4];
              break;
            case 2:
              actionsToRemove = [1, 2, 3, 4];
              break;
          }

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(actionsToRemove),
                uuids: { groups: [], vars: [] },
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 2,
                    uuids: { groups: [], vars: [] },
                    actions: sct.getActions(2, 2),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy, cut 1, dummy 2", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ncut 1");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          let actionsToRemove;
          switch (params.cleanUp) {
            case 0:
              actionsToRemove = [2];
              break;
            case 1:
              actionsToRemove = [2];
              break;
            case 2:
              actionsToRemove = [1, 2];
              break;
          }

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(actionsToRemove),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    newShortcut: "",
                    numberOfActions: 1,
                    uuids: extractUUIDs(sct.getActions(2, 1)),
                    actions: sct.getActions(2, 1),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy 3, cut 3, dummy 6", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ncut 3");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);

          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [3, 4, 5, 6] : [4, 5, 6],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 3,
                    uuids: extractUUIDs(sct.getActions(4, 3)),
                    actions: sct.getActions(4, 3),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy 3, cut 9, dummy 6", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ncut 9");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2
                    ? [3, 4, 5, 6, 7, 8, 9]
                    : [4, 5, 6, 7, 8, 9],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 6,
                    uuids: extractUUIDs(sct.getActions(4, 9)),
                    actions: sct.getActions(4, 9),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("comment 3, cut 5, comment 2, dummy, end, comment 2", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment("This is a test comment");
          sct.addComment("This is a test comment 2");
          sct.addComment("This is a test comment 3");
          sct.addComment(":cpa:\ncut 5");
          sct.addComment("This is a test comment 4");
          sct.addComment("This is a test comment 5");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\nend");
          sct.addComment("This is a test comment 6");
          sct.addComment("This is a test comment 7");

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          let actionsToRemove;
          switch (params.cleanUp) {
            case 0:
              actionsToRemove = [4, 5, 6];
              break;
            case 1:
              actionsToRemove = [4, 5, 6, 7];
              break;
            case 2:
              actionsToRemove = [3, 4, 5, 6, 7];
              break;
          }

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(actionsToRemove),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 3,
                    uuids: extractUUIDs(sct.getActions(4, 3)),
                    actions: sct.getActions(4, 3),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy, cut, dummy 5", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ncut");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [1, 2, 3, 4, 5, 6] : [2, 3, 4, 5, 6],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    numberOfActions: 5,
                    uuids: extractUUIDs(sct.getActions(2)),
                    actions: sct.getActions(2),
                  },
                ],
              },
            ],
          });
        });
      });
    });
  });

  describe("Simple Save", function() {
    describe("comment, save, dummy 4, end, dummy", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment("bla bla bla\n:cpa:\ncopy");
          sct.addComment(":cpa:\nsave");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\nend");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [1, 6] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: false,
                    numberOfActions: 4,
                    uuids: extractUUIDs(sct.getActions(2, 4)),
                    actions: sct.getActions(2, 4),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy, save 1, dummy 2", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\nsave 1");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [1] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: false,
                    newShortcut: "",
                    numberOfActions: 1,
                    uuids: extractUUIDs(sct.getActions(2, 1)),
                    actions: sct.getActions(2, 1),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy 2, save 2, dummy 4", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\nsave 2");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [2] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: false,
                    numberOfActions: 2,
                    uuids: extractUUIDs(sct.getActions(3, 2)),
                    actions: sct.getActions(3, 2),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("save, dummy 3", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\nsave");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [0] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: false,
                    numberOfActions: 3,
                    uuids: extractUUIDs(sct.getActions(1, 3)),
                    actions: sct.getActions(1, 3),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("save 5, dummy 2", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\nsave 5");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  params.cleanUp === 2 ? [0] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: false,
                    numberOfActions: 2,
                    uuids: extractUUIDs(sct.getActions(1, 2)),
                    actions: sct.getActions(1, 2),
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe("dummy, save remove, dummy 7, end, comment", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\nsave remove");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\nend");
          sct.addComment("blablabla");

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          let actionsToRemove;
          switch (params.cleanUp) {
            case 0:
              actionsToRemove = [2, 3, 4, 5, 6, 7, 8];
              break;
            case 1:
              actionsToRemove = [2, 3, 4, 5, 6, 7, 8, 9];
              break;
            case 2:
              actionsToRemove = [1, 2, 3, 4, 5, 6, 7, 8, 9];
              break;
          }

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(actionsToRemove),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: " ",
                    isClipboard: false,
                    numberOfActions: 7,
                    uuids: extractUUIDs(sct.getActions(2, 7)),
                    actions: sct.getActions(2, 7),
                  },
                ],
              },
            ],
          });
        });
      });
    });
  });

  describe("Simple Paste", function() {
    describe("paste, dummy 2, paste, dummy 2, paste", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\npaste");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\npaste");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\npaste");

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 3,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2 ? [[0], [3], [6]] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 0,
                    isClipboard: true,
                  },
                  {
                    id: 1,
                    name: " ",
                    position: 3,
                    replacesNActions: 0,
                    isClipboard: true,
                  },
                  {
                    id: 2,
                    name: " ",
                    position: 6,
                    replacesNActions: 0,
                    isClipboard: true,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("dummy, paste replace, comment, dummy, comment, end, comment", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\npaste replace");
          sct.addComment("This is a test comment");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment("This is a test comment 2");
          sct.addComment(":cpa:\nend paste");
          sct.addComment("This is a test comment 3");

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          let actionsToRemove;
          switch (params.cleanUp) {
            case 0:
              actionsToRemove = [2, 3, 4];
              break;
            case 1:
              actionsToRemove = [2, 3, 4, 5];
              break;
            case 2:
              actionsToRemove = [1, 2, 3, 4, 5];
          }

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  actionsToRemove,
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    isClipboard: true,
                    replacesNActions: 3,
                    position: 1,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("paste replace 3, dummy 4", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\npaste replace 3");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2 ? [0, 1, 2, 3] : [1, 2, 3],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 3,
                    isClipboard: true,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("paste replace 7, dummy 3", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\npaste replace 7");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2 ? [0, 1, 2, 3] : [1, 2, 3],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 3,
                    isClipboard: true,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("paste replace, dummy 3", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\npaste replace");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2 ? [0, 1, 2, 3] : [1, 2, 3],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 3,
                    isClipboard: true,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("paste replace, end, dummy", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\npaste replace");
          sct.addComment(":cpa:\nend paste");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2
                    ? [0, 1]
                    : params.cleanUp === 1
                      ? [1]
                      : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 0,
                    isClipboard: true,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });
  });

  describe("Simple Insert", function() {
    describe("insert, dummy 2, insert, dummy 2, insert", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\ninsert");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ninsert");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ninsert");

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 3,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2 ? [[0], [3], [6]] : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 0,
                    isClipboard: false,
                  },
                  {
                    id: 1,
                    name: " ",
                    position: 3,
                    replacesNActions: 0,
                    isClipboard: false,
                  },
                  {
                    id: 2,
                    name: " ",
                    position: 6,
                    replacesNActions: 0,
                    isClipboard: false,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("dummy, insert replace, comment, dummy, comment, end, comment", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment(":cpa:\ninsert replace");
          sct.addComment("This is a test comment");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addComment("This is a test comment 2");
          sct.addComment(":cpa:\nend insert");
          sct.addComment("This is a test comment 3");

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          let actionsToRemove;
          switch (params.cleanUp) {
            case 0:
              actionsToRemove = [2, 3, 4];
              break;
            case 1:
              actionsToRemove = [2, 3, 4, 5];
              break;
            case 2:
              actionsToRemove = [1, 2, 3, 4, 5];
          }

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  actionsToRemove,
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    isClipboard: false,
                    replacesNActions: 3,
                    position: 1,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("insert replace 3, dummy 4", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\ninsert replace 3");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2 ? [0, 1, 2, 3] : [1, 2, 3],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 3,
                    isClipboard: false,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("insert replace 7, dummy 3", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\ninsert replace 7");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2 ? [0, 1, 2, 3] : [1, 2, 3],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 3,
                    isClipboard: false,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("insert replace, dummy 3", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\ninsert replace");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2 ? [0, 1, 2, 3] : [1, 2, 3],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 3,
                    isClipboard: false,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });

    describe("insert replace, end, dummy", function() {
      allPossibleScriptParams.forEach((params) => {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\ninsert replace");
          sct.addComment(":cpa:\nend insert");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: constructActionsToRemove(
                  null,
                  params.cleanUp === 2
                    ? [0, 1]
                    : params.cleanUp === 1
                      ? [1]
                      : [],
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    replacesNActions: 0,
                    isClipboard: false,
                  },
                ],
                snippets: [],
              },
            ],
          });
        });
      });
    });
  });

  describe(">= 0 shortcut", function() {
    const funcs = ["copy", "save", "paste", "insert"];
    for (let i = 0; i <= 10; i++) {
      it(`${i} shortcuts`, function() {
        const params = allPossibleScriptParams[0];
        const shortcuts = [];
        const dict = getParamForScript([]);
        let insertId = 0;

        for (let j = 0; j < i; j++) {
          const mode = j % funcs.length;
          const sct = new ShortcutBuilder();
          sct.addComment(`:cpa:\n${funcs[mode]}`);
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          dict.shortcuts.push({
            name: j,
            shortcut: sct.build(),
          });
          const ins = [];
          const snips = [];
          switch (mode) {
            case 0:
            case 1:
              snips.push({
                name: " ",
                isClipboard: mode === 0,
                numberOfActions: 1,
                uuids: extractUUIDs(sct.getActions(1, 1)),
                actions: sct.getActions(1, 1),
              });
              break;
            case 2:
            case 3:
              ins.push({
                id: insertId++,
                name: " ",
                position: 0,
                replacesNActions: 0,
                isClipboard: mode === 2,
              });
              break;
          }
          shortcuts.push({
            name: j,
            actionsToRemove: [],
            uuids: extractUUIDs(sct.getActions()),
            inserts: ins,
            snippets: snips,
          });
        }

        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          nItems: i,
          warnings: [],
          shortcuts: shortcuts,
        });
      });
    }
  });
};
