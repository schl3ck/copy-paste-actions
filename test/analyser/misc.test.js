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
  describe("Misc", function() {
    describe("Modified Params", function() {
      it("commentMarker = Asdf, case-insensitive", function() {
        const sct = new ShortcutBuilder();
        sct.addComment("aSdF\ncopy");
        sct.addComment(":cpa:\ncopy");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        // for coverage an action without parameters
        const action = ShortcutBuilder.actionToShortcutAction(
          ShortcutBuilder.actions.Dummy,
        );
        delete action.WFWorkflowActionParameters;
        sct.actions.push(action);

        const dict = getParamForScript(sct);
        dict.commentMarker = "Asdf";
        const res = script(dict);

        expectReturnObject(res, {
          nItems: 1,
          warnings: [],
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
                  numberOfActions: 3,
                  uuids: extractUUIDs(sct.getActions(1, 3)),
                  actions: sct.getActions(1, 3),
                },
              ],
            },
          ],
        });
      });
      it("noSnippetName = NBSP", function() {
        const sct = new ShortcutBuilder();
        sct.addComment(":cpa:\ncopy");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        dict.noSnippetName = "\u00a0";
        const res = script(dict);

        expectReturnObject(res, {
          nItems: 1,
          warnings: [],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: "\u00a0",
                  isClipboard: true,
                  numberOfActions: 1,
                  uuids: extractUUIDs(sct.getActions(1, 1)),
                  actions: sct.getActions(1, 1),
                },
              ],
            },
          ],
        });
      });
      it.skip("defaultNewShortcutName", function() {
        const sct = new ShortcutBuilder();
        sct.addComment(":cpa:\ncopy\nname\nnew");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        dict.defaultNewShortcutName = "Untitled Workflow";
        const res = script(dict);

        expectReturnObject(res, {
          nItems: 1,
          warnings: [],
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
                  newShortcut: "Untitled Workflow",
                  numberOfActions: 1,
                  uuids: extractUUIDs(sct.getActions(1, 1)),
                  actions: sct.getActions(1, 1),
                },
              ],
            },
          ],
        });
      });
    });

    describe("Missing Params", function() {
      it("cleanUp", function() {
        const sct = new ShortcutBuilder();
        sct.addComment(":cpa:\ncut");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addComment(":cpa:\npause 1");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        // default of dict.cleanUp should be 1
        delete dict.cleanUp;
        const res = script(dict);

        expectReturnObject(res, {
          nItems: 1,
          warnings: [],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              actionsToRemove: constructActionsToRemove([1, 2, 4]),
              uuids: extractUUIDs(sct.getActions()),
              inserts: [],
              snippets: [
                {
                  name: " ",
                  isClipboard: true,
                  numberOfActions: 2,
                  uuids: extractUUIDs(sct.getActions([1, 1], [4, 1])),
                  actions: sct.getActions([1, 1], [4, 1]),
                },
              ],
            },
          ],
        });
      });
      it("excludeAllCPAComments", function() {
        const sct = new ShortcutBuilder();
        sct.addComment(":cpa:\ncopy");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
        sct.addComment(":cpa:\npaste");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        delete dict.excludeAllCPAComments;
        const res = script(dict);

        expectReturnObject(res, {
          nItems: 2,
          warnings: [],
          shortcuts: [
            {
              name: getParamForScript(sct).shortcuts.name,
              actionsToRemove: [],
              uuids: extractUUIDs(sct.getActions()),
              inserts: [
                {
                  id: 0,
                  name: " ",
                  position: 2,
                  replacesNActions: 0,
                  isClipboard: true,
                },
              ],
              snippets: [
                {
                  name: " ",
                  isClipboard: true,
                  numberOfActions: 2,
                  uuids: extractUUIDs(sct.getActions(1, 3)),
                  actions: sct.getActions([1, 1], [3, 1]),
                },
              ],
            },
          ],
        });
      });
      it("shortcuts", function() {
        const dict = getParamForScript();

        const res = script(dict);

        expectReturnObject(res, {
          nItems: 0,
          warnings: [],
          shortcuts: [],
        });
      });
      it("commentMarker", function() {
        const sct = new ShortcutBuilder();
        sct.addComment(":cpa:\ncopy");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        delete dict.commentMarker;
        const res = script(dict);

        expectReturnObject(res, {
          nItems: 1,
          warnings: [],
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
                  actions: sct.getActions(1, 1),
                },
              ],
            },
          ],
        });
      });
      it("noSnippetName", function() {
        const sct = new ShortcutBuilder();
        sct.addComment(":cpa:\ncopy");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        delete dict.noSnippetName;
        const res = script(dict);

        expectReturnObject(res, {
          nItems: 1,
          warnings: [],
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
                  actions: sct.getActions(1, 1),
                },
              ],
            },
          ],
        });
      });
      it.skip("defaultNewShortcutName", function() {
        const sct = new ShortcutBuilder();
        sct.addComment(":cpa:\ncopy\nname\nnew");
        sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

        const dict = getParamForScript(sct);
        delete dict.defaultNewShortcutName;
        const res = script(dict);

        expectReturnObject(res, {
          nItems: 1,
          warnings: [],
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
                  newShortcut: getParamForScript(sct).defaultNewShortcutName,
                  numberOfActions: 1,
                  uuids: extractUUIDs(sct.getActions(1, 1)),
                  actions: sct.getActions(1, 1),
                },
              ],
            },
          ],
        });
      });
    });

    describe("Line titles", function() {
      describe("function", function() {
        [
          {
            title: "function: label case-insensitive",
            text: "functioN: copy",
          },
          {
            title: "function label case-insensitive",
            text: "funCtion copy",
          },
          {
            title: "whitespace around function",
            text: "  \t copy  \t",
          },
          {
            title: "function: & whitespace",
            text: "  function: \t  copy  \t    ",
          },
          {
            title: "function word case-insensitive",
            text: "cOpY",
          },
        ].forEach((params) => {
          it(params.title, function() {
            const sct = new ShortcutBuilder();
            sct.addComment(":cpa:\n" + params.text);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            const res = script(dict);

            expectReturnObject(res, {
              nItems: 1,
              warnings: [],
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
                      actions: sct.getActions(1, 1),
                    },
                  ],
                },
              ],
            });
          });
        });

        it("function label without function should warn", function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\nfunction");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 0,
            warnings: [
              {
                shortcut: getParamForScript(sct).shortcuts.name,
                action: 0,
                commentText: sct.getActions(0, 1)[0].WFWorkflowActionParameters
                  .WFCommentActionText,
                type: "wrongFunction",
                payload: {
                  function: "",
                },
              },
            ],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: [],
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [],
              },
            ],
          });
        });
      });

      describe("name", function() {
        [
          {
            title: "name: label case-insensitive",
            text: "namE: asdf",
          },
          {
            title: "name label case-insensitive",
            text: "nAme asdf",
          },
          {
            title: "whitespace around name",
            text: "   \t asdf    ",
          },
          {
            title: "name: & whitespace around name",
            text: "  name:   \t asdf    ",
          },
        ].forEach((params) => {
          it(params.title, function() {
            const sct = new ShortcutBuilder();
            sct.addComment(":cpa:\ncopy\n" + params.text);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            const res = script(dict);

            expectReturnObject(res, {
              nItems: 1,
              warnings: [],
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
                      actions: sct.getActions(1, 1),
                    },
                  ],
                },
              ],
            });
          });
        });

        it("name: new", function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\ncopy\nname: new");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                actionsToRemove: [],
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: "new",
                    isClipboard: true,
                    numberOfActions: 1,
                    uuids: extractUUIDs(sct.getActions(1, 1)),
                    actions: sct.getActions(1, 1),
                  },
                ],
              },
            ],
          });
        });

        it("name label without name should use noSnippetName name", function() {
          const sct = new ShortcutBuilder();
          sct.addComment(":cpa:\ncopy\nname:");
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          const res = script(dict);

          expectReturnObject(res, {
            nItems: 1,
            warnings: [],
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
                    actions: sct.getActions(1, 1),
                  },
                ],
              },
            ],
          });
        });
      });

      describe.skip("new", function() {
        [
          {
            title: "name & new",
            text: "asdf\nnew",
            name: "asdf",
          },
          {
            title: "name & (new) asdF",
            text: "asdf\nasdF",
            name: "asdf",
            newShortcut: "asdF",
          },
          {
            title: "name & new: asdF, case-insensitive",
            text: "asdf\nNeW: asdF",
            name: "asdf",
            newShortcut: "asdF",
          },
          {
            title: "name & new asdF, ci",
            text: "asdf\nnEw asdF",
            name: "asdf",
            newShortcut: "asdF",
          },
          {
            title: "no name (= line empty) & new, ci",
            text: "\nneW",
          },
          {
            title: "no name & new, ci",
            text: "nEw",
          },
          {
            title: "no name & new:, ci",
            text: "neW:",
          },
          {
            title: "no name & new asdF, ci",
            text: "New asdF",
            newShortcut: "asdF",
          },
          {
            title: "no name & new:asdF, ci",
            text: "new:asdF",
            newShortcut: "asdF",
          },
        ].forEach((params) => {
          it(params.title, function() {
            const sct = new ShortcutBuilder();
            sct.addComment(":cpa:\ncopy\n" + params.text);
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

            const dict = getParamForScript(sct);
            const res = script(dict);

            expectReturnObject(res, {
              nItems: 1,
              warnings: [],
              shortcuts: [
                {
                  name: getParamForScript(sct).shortcuts.name,
                  actionsToRemove: [],
                  uuids: extractUUIDs(sct.getActions()),
                  inserts: [],
                  snippets: [
                    {
                      name: params.name || " ",
                      isClipboard: true,
                      newShortcut:
                        params.newShortcut
                        || getParamForScript(sct).defaultNewShortcutName,
                      numberOfActions: 1,
                      uuids: extractUUIDs(sct.getActions(1, 1)),
                      actions: sct.getActions(1, 1),
                    },
                  ],
                },
              ],
            });
          });
        });
      });
    });

    describe.skip("Mutliple new shortcuts", function() {
      describe("Same name", function() {
        for (let i = 2; i <= 5; i++) {
          it(`${i} new shortcuts`, function() {
            const snippets = [];
            const sct = new ShortcutBuilder();
            for (let j = 0; j < i; j++) {
              sct.addComment(`:cpa:\ncopy 1\n${j}\nnew`);
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              snippets.push({
                name: j + "",
                isClipboard: true,
                newShortcut: `${getParamForScript(sct).defaultNewShortcutName}${
                  j > 0 ? " " + j : ""
                }`,
                numberOfActions: 1,
                uuids: extractUUIDs(sct.getActions().slice(-1)),
                actions: sct.getActions().slice(-1),
              });
            }

            const dict = getParamForScript(sct);
            const res = script(dict);

            expectReturnObject(res, {
              nItems: i,
              warnings: [],
              shortcuts: [
                {
                  name: getParamForScript(sct).shortcuts.name,
                  actionsToRemove: [],
                  uuids: extractUUIDs(sct.getActions()),
                  inserts: [],
                  snippets: snippets,
                },
              ],
            });
          });
        }
      });
      describe("Different name", function() {
        for (let i = 2; i <= 5; i++) {
          it(`${i} new shortcuts`, function() {
            const snippets = [];
            const sct = new ShortcutBuilder();
            for (let j = 0; j < i; j++) {
              sct.addComment(`:cpa:\ncopy 1\n${j}\n${j}`);
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              snippets.push({
                name: j + "",
                isClipboard: true,
                newShortcut: j + "",
                numberOfActions: 1,
                uuids: extractUUIDs(sct.getActions().slice(-1)),
                actions: sct.getActions().slice(-1),
              });
            }

            const dict = getParamForScript(sct);
            const res = script(dict);

            expectReturnObject(res, {
              nItems: i,
              warnings: [],
              shortcuts: [
                {
                  name: getParamForScript(sct).shortcuts.name,
                  actionsToRemove: [],
                  uuids: extractUUIDs(sct.getActions()),
                  inserts: [],
                  snippets: snippets,
                },
              ],
            });
          });
        }
      });
    });
  });
};
