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
        nItems: 0,
        warnings: [
          {
            shortcut: getParamForScript(sct).shortcuts.name,
            action: 0,
            commentText: sct.getActions(0, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
            type: "incomplete"
          }
        ],
        shortcuts: [
          {
            name: getParamForScript(sct).shortcuts.name,
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
        nItems: 0,
        warnings: [
          {
            shortcut: getParamForScript(sct).shortcuts.name,
            action: 0,
            commentText: sct.getActions(0, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
            type: "wrongFunction",
            payload: {
              function: "svdnkl"
            }
          }
        ],
        shortcuts: [
          {
            name: getParamForScript(sct).shortcuts.name,
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
          nItems: 0,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "pauseResumeInPaste",
              payload: {
                function: "pause"
              }
            },
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 5,
              commentText: sct.getActions(5, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "funcNoStart",
              payload: {
                function: "resume"
              }
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 0,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "pauseResumeInInsert",
              payload: {
                function: "resume"
              }
            },
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 5,
              commentText: sct.getActions(5, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "funcNoStart",
              payload: {
                function: "pause"
              }
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
            nItems: 1,
            warnings: [
              {
                shortcut: getParamForScript(sct).shortcuts.name,
                action: 1,
                commentText: sct.getActions(1, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
                type: "funcNoStart",
                payload: {
                  function: "pause"
                }
              },
              {
                shortcut: getParamForScript(sct).shortcuts.name,
                action: 3,
                commentText: sct.getActions(3, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
                type: "funcNoStart",
                payload: {
                  function: "resume"
                }
              },
              {
                shortcut: getParamForScript(sct).shortcuts.name,
                action: 4,
                commentText: sct.getActions(4, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
                type: "funcNoStart",
                payload: {
                  function: "end"
                }
              }
            ],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
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
            nItems: 0,
            warnings: [
              {
                shortcut: getParamForScript(sct).shortcuts.name,
                action: 3,
                commentText: sct.getActions(3, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
                type: "funcClipboardFinished",
                payload: {
                  function: "end"
                }
              },
              {
                shortcut: getParamForScript(sct).shortcuts.name,
                action: 8,
                commentText: sct.getActions(8, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
                type: "funcSnippetFinished",
                payload: {
                  function: "end"
                }
              }
            ],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
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
        nItems: 0,
        warnings: [
          {
            shortcut: getParamForScript(sct).shortcuts.name,
            action: 1,
            commentText: sct.getActions(1, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
            type: "pasteEndNoStart"
          },
          {
            shortcut: getParamForScript(sct).shortcuts.name,
            action: 2,
            commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
            type: "insertEndNoStart"
          }
        ],
        shortcuts: [
          {
            name: getParamForScript(sct).shortcuts.name,
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
          nItems: 0,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "insertEndPasteStart"
            },
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 4,
              commentText: sct.getActions(4, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "pasteEndNoStart"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 0,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "pasteEndInsertStart"
            },
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 4,
              commentText: sct.getActions(4, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "insertEndNoStart"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: []
            }
          ]
        });
      });
    });

    describe("Duplicate clipboard item/snippet name", function() {
      it("clipboard item, no name, no end", function() {
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
          nItems: 1,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "duplicateClipboardNoName"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
      it("clipboard item, some name, no end", function() {
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
          nItems: 1,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "duplicateClipboardWithName",
              payload: {
                name: "asdf"
              }
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
      it("clipboard item, no name, with end", function() {
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
          nItems: 1,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 3,
              commentText: sct.getActions(3, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "duplicateClipboardNoName"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
      it("clipboard item, some name, with end", function() {
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
          nItems: 1,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 3,
              commentText: sct.getActions(3, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "duplicateClipboardWithName",
              payload: {
                name: "asdf"
              }
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 1,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "duplicateSnippetNoName"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 1,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "duplicateSnippetWithName",
              payload: {
                name: "asdf"
              }
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 1,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 3,
              commentText: sct.getActions(3, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "duplicateSnippetNoName"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 1,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 3,
              commentText: sct.getActions(3, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "duplicateSnippetWithName",
              payload: {
                name: "asdf"
              }
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 0,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "resumeWhileResumeClipboard"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 0,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 2,
              commentText: sct.getActions(2, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "resumeWhileResumeSnippet"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 0,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 3,
              commentText: sct.getActions(3, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "pauseWhilePauseClipboard"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
          nItems: 0,
          warnings: [
            {
              shortcut: getParamForScript(sct).shortcuts.name,
              action: 3,
              commentText: sct.getActions(3, 1)[0].WFWorkflowActionParameters.WFCommentActionText,
              type: "pauseWhilePauseSnippet"
            }
          ],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
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
