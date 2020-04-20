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
  constructActionsToRemove
} = require("./utils");
/* eslint-enable no-unused-vars */

module.exports = function() {
  describe("Warnings", function() {
    it("Incomplete CPA comment", function() {
      const params = allPossibleScriptParams[0];
      const sct = new ShortcutBuilder();
      sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:" });
      sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

      const dict = getParamForScript(sct);
      _.assign(dict, params);
      const res = script(dict);

      expectReturnObject(res, {
        requires: { clipboard: false, snippets: false },
        savesTo: { clipboard: false, snippets: false },
        nItems: 0,
        warnings: [
          "Found incomplete CopyPaste Actions comment"
        ],
        shortcuts: [
          {
            name: getParamForScript(sct).shortcuts.name,
            requires: { clipboard: false, snippets: false },
            savesTo: { clipboard: false, snippets: false },
            actionsToRemove: [],
            uuids: extractUUIDs(sct.getActions()),
            inserts: [],
            snippets: []
          }
        ]
      });
    });

    it("Wrong function name", function() {
      const params = allPossibleScriptParams[0];
      const sct = new ShortcutBuilder();
      sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsvdnkl" });
      sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

      const dict = getParamForScript(sct);
      _.assign(dict, params);
      const res = script(dict);

      expectReturnObject(res, {
        requires: { clipboard: false, snippets: false },
        savesTo: { clipboard: false, snippets: false },
        nItems: 0,
        warnings: [
          "Wrong function name. Expected one of cut [n], copy [n], save [remove|replace] [n], " +
          "end [paste|insert], pause [n], resume [n], paste [replace [n]], insert [replace [n]], " +
          "but got \"svdnkl\" instead"
        ],
        shortcuts: [
          {
            name: getParamForScript(sct).shortcuts.name,
            requires: { clipboard: false, snippets: false },
            savesTo: { clipboard: false, snippets: false },
            actionsToRemove: [],
            uuids: extractUUIDs(sct.getActions()),
            inserts: [],
            snippets: []
          }
        ]
      });
    });

    describe("No pause/resume in insert range", function() {
      it("Pause", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nresume" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: false },
          nItems: 0,
          warnings: [
            "Found \"pause\" in a paste replace range, which is not supported",
            "Found \"resume\" without any start. Maybe you specified a number after the start function e.g. " +
            "\"copy 5\" to copy only the next 5 actions and forgot to remove this comment, or there was an error " +
            "with the start comment, or you forgot to specify \"end paste\" or \"end insert\" to end a paste/an " +
            "insert range."
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
      it("Resume", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ninsert replace" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nresume" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: false },
          nItems: 0,
          warnings: [
            "Found \"resume\" in an insert replace range, which is not supported",
            "Found \"pause\" without any start. Maybe you specified a number after the start function e.g. " +
            "\"copy 5\" to copy only the next 5 actions and forgot to remove this comment, or there was an error " +
            "with the start comment, or you forgot to specify \"end paste\" or \"end insert\" to end a paste/an " +
            "insert range."
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
    });

    describe("Snippet function without start", function() {
      allPossibleScriptParams.forEach(function(params) {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nresume" });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          const actions = sct.getActions.apply(sct, params.excludeAllCPAComments ? [2, 1] : [1]);

          expectReturnObject(res, {
            requires: { clipboard: false, snippets: false },
            savesTo: { clipboard: true, snippets: false },
            nItems: 1,
            warnings: [
              "Found \"pause\" without any start. Maybe you specified a number after the start function e.g. " +
              "\"copy 5\" to copy only the next 5 actions and forgot to remove this comment, or there was an error " +
              "with the start comment, or you forgot to specify \"end paste\" or \"end insert\" to end a paste/an " +
              "insert range.",
              "Found \"resume\" without any start. Maybe you specified a number after the start function e.g. " +
              "\"copy 5\" to copy only the next 5 actions and forgot to remove this comment, or there was an error " +
              "with the start comment, or you forgot to specify \"end paste\" or \"end insert\" to end a paste/an " +
              "insert range.",
              "Found \"end\" without any start. Maybe you specified a number after the start function e.g. " +
              "\"copy 5\" to copy only the next 5 actions and forgot to remove this comment, or there was an error " +
              "with the start comment, or you forgot to specify \"end paste\" or \"end insert\" to end a paste/an " +
              "insert range."
            ],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                requires: { clipboard: false, snippets: false },
                savesTo: { clipboard: true, snippets: false },
                actionsToRemove: constructActionsToRemove(params.cleanUp === 2 ? [0] : []),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: "asdf",
                    isClipboard: true,
                    newShortcut: "",
                    numberOfActions: actions.length,
                    uuids: extractUUIDs(actions),
                    actions: actions
                  }
                ]
              }
            ]
          });
        });
      });
    });

    describe("Reached end before function", function() {
      allPossibleScriptParams.forEach(function(params) {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy 1" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave 1" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            requires: { clipboard: false, snippets: false },
            savesTo: { clipboard: false, snippets: false },
            nItems: 0,
            warnings: [
              "Found \"end\" after the clipboard selection has already finished. Maybe you've specified a count on " +
              "the start function (e.g. \"copy 5\") that finished before reaching the current function.",
              "Found \"end\" after the snippet has already finished. Maybe you've specified a count on the start " +
              "function (e.g. \"copy 5\") that finished before reaching the current function."
            ],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                requires: { clipboard: false, snippets: false },
                savesTo: { clipboard: false, snippets: false },
                actionsToRemove: constructActionsToRemove([]),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: []
              }
            ]
          });
        });
      });
    });

    it("Paste/Insert function without start", function() {
      const params = allPossibleScriptParams[0];
      const sct = new ShortcutBuilder();
      sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
      sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
      sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend insert" });

      const dict = getParamForScript(sct);
      _.assign(dict, params);
      const res = script(dict);

      expectReturnObject(res, {
        requires: { clipboard: false, snippets: false },
        savesTo: { clipboard: false, snippets: false },
        nItems: 0,
        warnings: [
          "Found the end of a paste replace section without any start",
          "Found the end of an insert replace section without any start"
        ],
        shortcuts: [
          {
            name: getParamForScript(sct).shortcuts.name,
            requires: { clipboard: false, snippets: false },
            savesTo: { clipboard: false, snippets: false },
            actionsToRemove: [],
            uuids: extractUUIDs(sct.getActions()),
            inserts: [],
            snippets: []
          }
        ]
      });
    });

    describe("Paste/insert replace -> end !isClipboard", function() {
      it("clipboard -> !clipboard", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend insert" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: false },
          nItems: 0,
          warnings: [
            "Found the end of an insert replace section without any start. Maybe you meant \"end paste\"?",
            "Found the end of a paste replace section without any start"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
      it("!clipboard -> clipboard", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ninsert replace" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend insert" });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: false },
          nItems: 0,
          warnings: [
            "Found the end of a paste replace section without any start. Maybe you meant \"end insert\"?",
            "Found the end of an insert replace section without any start"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
    });

    describe("Duplicate selection/snippet name", function() {
      it("clipboard selection, no name, no end", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: true, snippets: false },
          nItems: 1,
          warnings: [
            "There is already a clipboard selection without a name"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: true, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: " ",
                  isClipboard: true,
                  numberOfActions: 2,
                  uuids: extractUUIDs(sct.getActions(1, 3)),
                  actions: sct.getActions([1, 1], [3, 1])
                }
              ]
            }
          ]
        });
      });
      it("clipboard selection, some name, no end", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: true, snippets: false },
          nItems: 1,
          warnings: [
            "There is already a clipboard selection with the name \"asdf\""
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: true, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: "asdf",
                  isClipboard: true,
                  numberOfActions: 2,
                  uuids: extractUUIDs(sct.getActions(1, 3)),
                  actions: sct.getActions([1, 1], [3, 1])
                }
              ]
            }
          ]
        });
      });
      it("clipboard selection, no name, with end", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: true, snippets: false },
          nItems: 1,
          warnings: [
            "There is already a clipboard selection without a name"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: true, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: " ",
                  isClipboard: true,
                  numberOfActions: 1,
                  uuids: extractUUIDs(sct.getActions(1, 1)),
                  actions: sct.getActions(1, 1)
                }
              ]
            }
          ]
        });
      });
      it("clipboard selection, some name, with end", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: true, snippets: false },
          nItems: 1,
          warnings: [
            "There is already a clipboard selection with the name \"asdf\""
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: true, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: "asdf",
                  isClipboard: true,
                  numberOfActions: 1,
                  uuids: extractUUIDs(sct.getActions(1, 1)),
                  actions: sct.getActions(1, 1)
                }
              ]
            }
          ]
        });
      });
      it("snippet, no name", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: true },
          nItems: 1,
          warnings: [
            "There is already a snippet without a name"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: true },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: " ",
                  isClipboard: false,
                  numberOfActions: 2,
                  uuids: extractUUIDs(sct.getActions(1, 3)),
                  actions: sct.getActions([1, 1], [3, 1])
                }
              ]
            }
          ]
        });
      });
      it("snippet, some name", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: true },
          nItems: 1,
          warnings: [
            "There is already a snippet with the name \"asdf\""
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: true },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: "asdf",
                  isClipboard: false,
                  numberOfActions: 2,
                  uuids: extractUUIDs(sct.getActions(1, 3)),
                  actions: sct.getActions([1, 1], [3, 1])
                }
              ]
            }
          ]
        });
      });
      it("snippet, no name, with end", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: true },
          nItems: 1,
          warnings: [
            "There is already a snippet without a name"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: true },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: " ",
                  isClipboard: false,
                  numberOfActions: 1,
                  uuids: extractUUIDs(sct.getActions(1, 1)),
                  actions: sct.getActions(1, 1)
                }
              ]
            }
          ]
        });
      });
      it("snippet, some name, with end", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave\nasdf" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: true },
          nItems: 1,
          warnings: [
            "There is already a snippet with the name \"asdf\""
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: true },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: "asdf",
                  isClipboard: false,
                  numberOfActions: 1,
                  uuids: extractUUIDs(sct.getActions(1, 1)),
                  actions: sct.getActions(1, 1)
                }
              ]
            }
          ]
        });
      });
    });

    describe("\"resume\" on wrong place", function() {
      it("clipboard", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nresume" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nresume" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: false },
          nItems: 0,
          warnings: [
            "Found function \"resume\" while current clipboard selection is already continuing"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
      it("snippets", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nresume" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nresume" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: false },
          nItems: 0,
          warnings: [
            "Found function \"resume\" while current snippet is already continuing"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
    });
    describe("\"pause\" on wrong place", function() {
      it("clipboard", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: false },
          nItems: 0,
          warnings: [
            "Found function \"pause\" while current clipboard selection is already paused"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
      it("snippets", function() {
        const params = allPossibleScriptParams[0];
        const sct = new ShortcutBuilder();
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npause" });
        sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave" });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        _.assign(dict, params);
        const res = script(dict);

        expectReturnObject(res, {
          requires: { clipboard: false, snippets: false },
          savesTo: { clipboard: false, snippets: false },
          nItems: 0,
          warnings: [
            "Found function \"pause\" while current snippet is already paused"
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              requires: { clipboard: false, snippets: false },
              savesTo: { clipboard: false, snippets: false },
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
    });
  });
};
