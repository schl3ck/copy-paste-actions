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
  [
    {
      isClipboard: true,
      functionName: "copy",
      removesActions: false,
    },
    {
      isClipboard: true,
      functionName: "cut",
      removesActions: true,
    },
    {
      isClipboard: false,
      functionName: "save",
      removesActions: false,
    },
    {
      isClipboard: false,
      functionName: "save remove",
      removesActions: true,
    },
  ].forEach((mode) => {
    describe(`${mode.functionName} & pause`, function() {
      describe(`dummy, ${mode.functionName}, dummy 3, pause, dummy 2, resume, dummy, end, dummy`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(`:cpa:\n${mode.functionName}`);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\nresume");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\nend");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [2, 3, 4, 9] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions
                  ? [2, 3, 4, 9, 5, 8, 10]
                  : [];
                break;
              case 2:
                actionsToRemove = mode.removesActions
                  ? [1, 2, 3, 4, 9, 5, 8, 10]
                  : [1, 5, 8, 10];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 4,
                      uuids: extractUUIDs(sct.getActions([2, 3], [9, 1])),
                      actions: sct.getActions([2, 3], [9, 1]),
                    },
                  ],
                },
              ],
            });
          });
        });
      });

      describe(`${mode.functionName}, pause, dummy, end, dummy`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addComment(`:cpa:\n${mode.functionName}`);
            sct.addComment(":cpa:\npause");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\nend");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions ? [1, 3] : [];
                break;
              case 2:
                actionsToRemove = [0, 1, 3];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 0,
                      uuids: extractUUIDs([]),
                      actions: [],
                    },
                  ],
                },
              ],
            });
          });
        });
      });

      describe(`${mode.functionName}, dummy, pause 2, dummy 4`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addComment(`:cpa:\n${mode.functionName}`);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause 2");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [1, 5, 6] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions ? [1, 5, 6, 2] : [];
                break;
              case 2:
                actionsToRemove = mode.removesActions
                  ? [0, 1, 5, 6, 2]
                  : [0, 2];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 3,
                      uuids: extractUUIDs(sct.getActions([1, 1], [5, 2])),
                      actions: sct.getActions([1, 1], [5, 2]),
                    },
                  ],
                },
              ],
            });
          });
        });
      });

      describe(`${mode.functionName}, dummy, pause 4, dummy 2, resume, dummy 2`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addComment(`:cpa:\n${mode.functionName}`);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause 4");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\nresume");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [1, 6, 7] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions ? [1, 6, 7, 2, 5] : [];
                break;
              case 2:
                actionsToRemove = mode.removesActions
                  ? [0, 1, 6, 7, 2, 5]
                  : [0, 2, 5];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 3,
                      uuids: extractUUIDs(sct.getActions([1, 1], [6, 2])),
                      actions: sct.getActions([1, 1], [6, 2]),
                    },
                  ],
                },
              ],
            });
          });
        });
      });

      describe(`${mode.functionName} 3, dummy, pause, dummy 3, resume, dummy 3`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addComment(`:cpa:\n${mode.functionName} 3`);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\nresume");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [1, 7, 8] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions ? [1, 7, 8, 2, 6] : [];
                break;
              case 2:
                actionsToRemove = mode.removesActions
                  ? [0, 1, 7, 8, 2, 6]
                  : [0, 2, 6];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 3,
                      uuids: extractUUIDs(sct.getActions([1, 1], [7, 2])),
                      actions: sct.getActions([1, 1], [7, 2]),
                    },
                  ],
                },
              ],
            });
          });
        });
      });

      describe(`${mode.functionName} 3, dummy, pause 3, dummy 6`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addComment(`:cpa:\n${mode.functionName} 3`);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause 3");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [1, 6, 7] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions ? [1, 6, 7, 2] : [];
                break;
              case 2:
                actionsToRemove = mode.removesActions
                  ? [0, 1, 6, 7, 2]
                  : [0, 2];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 3,
                      uuids: extractUUIDs(sct.getActions([1, 1], [6, 2])),
                      actions: sct.getActions([1, 1], [6, 2]),
                    },
                  ],
                },
              ],
            });
          });
        });
      });

      describe(`${mode.functionName} 3, dummy, pause, dummy 2, resume 1, dummy 3, resume, dummy 2`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addComment(`:cpa:\n${mode.functionName} 3`);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\nresume 1");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\nresume");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [1, 6, 10] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions
                  ? [1, 6, 10, 2, 5, 9]
                  : [];
                break;
              case 2:
                actionsToRemove = mode.removesActions
                  ? [0, 1, 6, 10, 2, 5, 9]
                  : [0, 2, 5, 9];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 3,
                      uuids: extractUUIDs(
                        sct.getActions([1, 1], [6, 1], [10, 1]),
                      ),
                      actions: sct.getActions([1, 1], [6, 1], [10, 1]),
                    },
                  ],
                },
              ],
            });
          });
        });
      });

      describe(`${mode.functionName}, dummy, pause, dummy 2, resume 3, dummy, pause, dummy 2`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addComment(`:cpa:\n${mode.functionName}`);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\nresume 3");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [1, 6] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions ? [1, 6, 2, 5, 7] : [];
                break;
              case 2:
                actionsToRemove = mode.removesActions
                  ? [0, 1, 6, 2, 5, 7]
                  : [0, 2, 5, 7];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 2,
                      uuids: extractUUIDs(sct.getActions([1, 1], [6, 1])),
                      actions: sct.getActions([1, 1], [6, 1]),
                    },
                  ],
                },
              ],
            });
          });
        });
      });

      describe(`${mode.functionName} 3, dummy, pause, resume 3, dummy 4`, function() {
        allPossibleScriptParams.forEach((params) => {
          it(JSON.stringify(params), function() {
            const sct = new ShortcutBuilder();
            sct.addComment(`:cpa:\n${mode.functionName} 3`);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addComment(":cpa:\npause");
            sct.addComment(":cpa:\nresume 3");
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            _.assign(dict, params);
            const res = script(dict);

            let actionsToRemove;
            switch (params.cleanUp) {
              case 0:
                actionsToRemove = mode.removesActions ? [1, 4, 5] : [];
                break;
              case 1:
                actionsToRemove = mode.removesActions ? [1, 4, 5, 2, 3] : [];
                break;
              case 2:
                actionsToRemove = mode.removesActions
                  ? [0, 1, 4, 5, 2, 3]
                  : [0, 2, 3];
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
                      isClipboard: mode.isClipboard,
                      numberOfActions: 3,
                      uuids: extractUUIDs(sct.getActions([1, 1], [4, 2])),
                      actions: sct.getActions([1, 1], [4, 2]),
                    },
                  ],
                },
              ],
            });
          });
        });
      });
    });
  });
};
