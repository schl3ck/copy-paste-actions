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

function permutationToCPAFunction(perm) {
  const map = new Map(perm.map((i) => [i, { value: i, occurrence: 0, funcs: [] }]));
  perm.forEach((i) => map.get(i).occurrence++);
  map.forEach((i) => {
    i.funcs = ["copy", ...("pause|resume|".repeat(i.occurrence / 2 - 1).split("|").filter((i) => i.length)), "end"];
  });
  return perm.map((p) => {
    return {
      func: map.get(p).funcs.shift(),
      itemNumber: p
    };
  });
}

/**
 * @param {object} [options] Some options
 * @param {number} [options.maxPermutations] The maximum number of permutations to generate for each set
 */
module.exports = function(options) {
  options = options || {};

  describe("Names", function() {
    describe("1 item", function() {
      [
        {
          title: "normal name",
          name: "simple name",
          expectedName: "simple name"
        },
        {
          title: "trim whitespace",
          name: " asdf  \t",
          expectedName: "asdf"
        },
        {
          title: "only whitespace",
          name: "   \t",
          expectedName: " "
        },
        {
          title: "emoji",
          name: "😭",
          expectedName: "😭"
        }
      ].forEach((mode) => {
        it(mode.title, function() {
          const params = allPossibleScriptParams[0];
          const sct = new ShortcutBuilder();
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: `:cpa:\ncopy\n${mode.name}` });
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
                actionsToRemove: [],
                uuids: extractUUIDs(sct.getActions()),
                inserts: [],
                snippets: [
                  {
                    name: mode.expectedName,
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
      });
    });

    // change to start = 2
    for (let nItems = 2; nItems <= 3; nItems++) {
      describe(`${nItems} items`, function() {
        const items = new Array(nItems);
        items.fill(2);
        for (let i = -1; i < nItems; i++) {
          if (i >= 0) items[i] += 2;

          describe(`Length: ${items.join(", ")}`, function() {
            const firstPerm = items.map((l, i) => i.toString().repeat(l)).join("").split("").map((j) => parseInt(j));

            let nPerms = 0;
            for (const perm of uniquePermutations.generatePatterns(firstPerm)) {
              const o = permutationToCPAFunction(perm);

              if (options.maxPermutations && ++nPerms >= options.maxPermutations) return;

              describe("Permutation " + perm.join("").replace(/\d\d(?!$)/g, "$& "), function() {
                allPossibleScriptParams.forEach((params) => {
                  it(JSON.stringify(params), function() {
                    const actionsToRemove = [];
                    let snippets = [...(function * () {
                      for (let i = 0; i < nItems; i++) {
                        yield {
                          result: {
                            name: (i + 1).toString(),
                            isClipboard: true,
                            numberOfActions: 0,
                            uuids: [],
                            actions: []
                          },
                          recording: false
                        };
                      }
                    })()];

                    const sct = new ShortcutBuilder();
                    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                    o.forEach((o, i) => {
                      sct.addAction(
                        ShortcutBuilder.actions.Comment,
                        { WFCommentActionText: `:cpa:\n${o.func}\n${o.itemNumber + 1}` }
                      );
                      sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                      actionsToRemove.push(i * 2 + 1);

                      const snippet = snippets[o.itemNumber];
                      switch (o.func) {
                        case "copy":
                        case "resume":
                          snippet.recording = true;
                          break;
                        case "pause":
                        case "end":
                          snippet.recording = false;
                          break;
                      }

                      snippets.forEach((snip, i) => {
                        if (snip.recording) {
                          let toAdd = -1;
                          if (i !== o.itemNumber && !params.excludeAllCPAComments) {
                            toAdd = -2;
                          }
                          snip.result.actions.push(...sct.getActions(toAdd));
                        }
                      });
                    });

                    snippets = snippets.map((snip) => {
                      // snip = snip.result;
                      snip.result.numberOfActions = snip.result.actions.length;
                      snip.result.uuids = extractUUIDs(snip.result.actions);
                      return snip.result;
                    });

                    const dict = getParamForScript(sct);
                    _.assign(dict, params);
                    const res = script(dict);

                    expectReturnObject(res, {
                      nItems: nItems,
                      warnings: [],
                      shortcuts: [
                        {
                          name: getParamForScript(sct).shortcuts.name,
                          actionsToRemove: constructActionsToRemove(params.cleanUp === 2 ? actionsToRemove : []),
                          uuids: extractUUIDs(sct.getActions()),
                          inserts: [],
                          snippets: snippets
                        }
                      ]
                    });
                  });
                });
              });
            }
          });
        }
      });
    }

    describe("Snippet & Insert nested", function() {
      describe("Sequencial, no replace", function() {
        describe("Same name", function() {
          allPossibleScriptParams.forEach(function(params) {
            it(JSON.stringify(params), function() {
              const sct = new ShortcutBuilder();
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy 1" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

              const dict = getParamForScript(sct);
              _.assign(dict, params);
              const res = script(dict);

              expectReturnObject(res, {
                nItems: 2,
                warnings: [],
                shortcuts: [
                  {
                    name: getParamForScript(sct).shortcuts.name,
                    actionsToRemove: constructActionsToRemove(
                      params.cleanUp === 2 ? [0] : [],
                      params.cleanUp === 2 ? [2] : []
                    ),
                    uuids: extractUUIDs(sct.getActions()),
                    inserts: [
                      {
                        id: 0,
                        name: " ",
                        position: 2,
                        replacesNActions: 0,
                        isClipboard: true
                      }
                    ],
                    snippets: [
                      {
                        name: " ",
                        isClipboard: true,
                        newShortcut: "",
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
        });
        describe("Different name", function() {
          allPossibleScriptParams.forEach(function(params) {
            it(JSON.stringify(params), function() {
              const sct = new ShortcutBuilder();
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy 1\nasdf" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

              const dict = getParamForScript(sct);
              _.assign(dict, params);
              const res = script(dict);

              expectReturnObject(res, {
                nItems: 2,
                warnings: [],
                shortcuts: [
                  {
                    name: getParamForScript(sct).shortcuts.name,
                    actionsToRemove: constructActionsToRemove(
                      params.cleanUp === 2 ? [0] : [],
                      params.cleanUp === 2 ? [2] : []
                    ),
                    uuids: extractUUIDs(sct.getActions()),
                    inserts: [
                      {
                        id: 0,
                        name: " ",
                        position: 2,
                        replacesNActions: 0,
                        isClipboard: true
                      }
                    ],
                    snippets: [
                      {
                        name: "asdf",
                        isClipboard: true,
                        newShortcut: "",
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
        });
      });
      describe("Sequencial, replace", function() {
        describe("Same name", function() {
          allPossibleScriptParams.forEach(function(params) {
            it(JSON.stringify(params), function() {
              const sct = new ShortcutBuilder();
              // use snippet and insert before save for better coverage
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ninsert replace 1" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nsave 1" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

              const dict = getParamForScript(sct);
              _.assign(dict, params);
              const res = script(dict);

              expectReturnObject(res, {
                nItems: 2,
                warnings: [],
                shortcuts: [
                  {
                    name: getParamForScript(sct).shortcuts.name,
                    actionsToRemove: constructActionsToRemove(
                      params.cleanUp === 2 ? [2] : [],
                      params.cleanUp === 2 ? [0, 1] : [1]
                    ),
                    uuids: extractUUIDs(sct.getActions()),
                    inserts: [
                      {
                        id: 0,
                        name: " ",
                        position: 0,
                        replacesNActions: 1,
                        isClipboard: false
                      }
                    ],
                    snippets: [
                      {
                        name: " ",
                        isClipboard: false,
                        newShortcut: "",
                        numberOfActions: 1,
                        uuids: extractUUIDs(sct.getActions(3, 1)),
                        actions: sct.getActions(3, 1)
                      }
                    ]
                  }
                ]
              });
            });
          });
        });
        describe("Different name", function() {
          allPossibleScriptParams.forEach(function(params) {
            it(JSON.stringify(params), function() {
              const sct = new ShortcutBuilder();
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy 1\nasdf" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace 1" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

              const dict = getParamForScript(sct);
              _.assign(dict, params);
              const res = script(dict);

              expectReturnObject(res, {
                nItems: 2,
                warnings: [],
                shortcuts: [
                  {
                    name: getParamForScript(sct).shortcuts.name,
                    actionsToRemove: constructActionsToRemove(
                      params.cleanUp === 2 ? [0] : [],
                      params.cleanUp === 2 ? [2, 3] : [3]
                    ),
                    uuids: extractUUIDs(sct.getActions()),
                    inserts: [
                      {
                        id: 0,
                        name: " ",
                        position: 2,
                        replacesNActions: 1,
                        isClipboard: true
                      }
                    ],
                    snippets: [
                      {
                        name: "asdf",
                        isClipboard: true,
                        newShortcut: "",
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
        });
      });
      describe("Nested, no replace", function() {
        describe("Same name", function() {
          allPossibleScriptParams.forEach(function(params) {
            it(JSON.stringify(params), function() {
              const sct = new ShortcutBuilder();
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

              const dict = getParamForScript(sct);
              _.assign(dict, params);
              const res = script(dict);

              expectReturnObject(res, {
                nItems: 2,
                warnings: [],
                shortcuts: [
                  {
                    name: getParamForScript(sct).shortcuts.name,
                    actionsToRemove: constructActionsToRemove(
                      params.cleanUp === 2 ? [0, 4] : [],
                      params.cleanUp === 2 ? [2] : []
                    ),
                    uuids: extractUUIDs(sct.getActions()),
                    inserts: [
                      {
                        id: 0,
                        name: " ",
                        position: 2,
                        replacesNActions: 0,
                        isClipboard: true
                      }
                    ],
                    snippets: [
                      {
                        name: " ",
                        isClipboard: true,
                        newShortcut: "",
                        numberOfActions: 2,
                        uuids: extractUUIDs(sct.getActions([1, 1], [3, 1])),
                        actions: sct.getActions([1, 1], [3, 1])
                      }
                    ]
                  }
                ]
              });
            });
          });
        });
        describe("Different name", function() {
          allPossibleScriptParams.forEach(function(params) {
            it(JSON.stringify(params), function() {
              const sct = new ShortcutBuilder();
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend\nasdf" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

              const dict = getParamForScript(sct);
              _.assign(dict, params);
              const res = script(dict);

              const actions = sct.getActions.apply(sct, params.excludeAllCPAComments ? [[1, 1], [3, 1]] : [1, 3]);

              expectReturnObject(res, {
                nItems: 2,
                warnings: [],
                shortcuts: [
                  {
                    name: getParamForScript(sct).shortcuts.name,
                    actionsToRemove: constructActionsToRemove(
                      params.cleanUp === 2 ? [0, 4] : [],
                      params.cleanUp === 2 ? [2] : []
                    ),
                    uuids: extractUUIDs(sct.getActions()),
                    inserts: [
                      {
                        id: 0,
                        name: " ",
                        position: 2,
                        replacesNActions: 0,
                        isClipboard: true
                      }
                    ],
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
      });
      describe("Nested, replace", function() {
        describe("Same name", function() {
          allPossibleScriptParams.forEach(function(params) {
            it(JSON.stringify(params), function() {
              const sct = new ShortcutBuilder();
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace 1" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

              const dict = getParamForScript(sct);
              _.assign(dict, params);
              const res = script(dict);

              expectReturnObject(res, {
                nItems: 2,
                warnings: [],
                shortcuts: [
                  {
                    name: getParamForScript(sct).shortcuts.name,
                    actionsToRemove: constructActionsToRemove(
                      params.cleanUp === 2 ? [0, 4] : [],
                      params.cleanUp === 2 ? [2, 3] : [3]
                    ),
                    uuids: extractUUIDs(sct.getActions()),
                    inserts: [
                      {
                        id: 0,
                        name: " ",
                        position: 2,
                        replacesNActions: 1,
                        isClipboard: true
                      }
                    ],
                    snippets: [
                      {
                        name: " ",
                        isClipboard: true,
                        newShortcut: "",
                        numberOfActions: 2,
                        uuids: extractUUIDs(sct.getActions([1, 1], [3, 1])),
                        actions: sct.getActions([1, 1], [3, 1])
                      }
                    ]
                  }
                ]
              });
            });
          });
        });
        describe("Different name", function() {
          allPossibleScriptParams.forEach(function(params) {
            it(JSON.stringify(params), function() {
              const sct = new ShortcutBuilder();
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace 1" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend\nasdf" });
              sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

              const dict = getParamForScript(sct);
              _.assign(dict, params);
              const res = script(dict);

              const actions = sct.getActions.apply(sct, params.excludeAllCPAComments ? [[1, 1], [3, 1]] : [1, 3]);

              expectReturnObject(res, {
                nItems: 2,
                warnings: [],
                shortcuts: [
                  {
                    name: getParamForScript(sct).shortcuts.name,
                    actionsToRemove: constructActionsToRemove(
                      params.cleanUp === 2 ? [0, 4] : [],
                      params.cleanUp === 2 ? [2, 3] : [3]
                    ),
                    uuids: extractUUIDs(sct.getActions()),
                    inserts: [
                      {
                        id: 0,
                        name: " ",
                        position: 2,
                        replacesNActions: 1,
                        isClipboard: true
                      }
                    ],
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
      });
      // don't need to test pause & resume as they should be handled the same
      describe("Overlapping, replace", function() {
        describe("start", function() {
          describe("Same name", function() {
            allPossibleScriptParams.forEach(function(params) {
              it(JSON.stringify(params), function() {
                const sct = new ShortcutBuilder();
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

                const dict = getParamForScript(sct);
                _.assign(dict, params);
                const res = script(dict);

                const actionsToRemove = [1, 3];
                if (params.cleanUp > 0) actionsToRemove.push(4);
                if (params.cleanUp === 2) actionsToRemove.push(0);

                expectReturnObject(res, {
                  nItems: 2,
                  warnings: [],
                  shortcuts: [
                    {
                      name: getParamForScript(sct).shortcuts.name,
                      actionsToRemove: constructActionsToRemove(params.cleanUp === 2 ? [2, 6] : [], actionsToRemove),
                      uuids: extractUUIDs(sct.getActions()),
                      inserts: [
                        {
                          id: 0,
                          name: " ",
                          position: 0,
                          replacesNActions: 2,
                          isClipboard: true
                        }
                      ],
                      snippets: [
                        {
                          name: " ",
                          isClipboard: true,
                          newShortcut: "",
                          numberOfActions: 2,
                          uuids: extractUUIDs(sct.getActions([3, 1], [5, 1])),
                          actions: sct.getActions([3, 1], [5, 1])
                        }
                      ]
                    }
                  ]
                });
              });
            });
          });
          describe("Different name", function() {
            allPossibleScriptParams.forEach(function(params) {
              it(JSON.stringify(params), function() {
                const sct = new ShortcutBuilder();
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend\nasdf" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

                const dict = getParamForScript(sct);
                _.assign(dict, params);
                const res = script(dict);

                const actions = sct.getActions.apply(sct, params.excludeAllCPAComments ? [[3, 1], [5, 1]] : [3, 3]);
                const actionsToRemove = [1, 3];
                if (!params.excludeAllCPAComments) actionsToRemove.push(2);
                if (params.cleanUp > 0) actionsToRemove.push(4);
                if (params.cleanUp === 2) actionsToRemove.push(0);

                expectReturnObject(res, {
                  nItems: 2,
                  warnings: [],
                  shortcuts: [
                    {
                      name: getParamForScript(sct).shortcuts.name,
                      actionsToRemove: constructActionsToRemove(params.cleanUp === 2 ? [2, 6] : [], actionsToRemove),
                      uuids: extractUUIDs(sct.getActions()),
                      inserts: [
                        {
                          id: 0,
                          name: " ",
                          position: 0,
                          replacesNActions: params.excludeAllCPAComments ? 2 : 3,
                          isClipboard: true
                        }
                      ],
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
        });
        describe("end", function() {
          describe("Same name", function() {
            allPossibleScriptParams.forEach(function(params) {
              it(JSON.stringify(params), function() {
                const sct = new ShortcutBuilder();
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

                const dict = getParamForScript(sct);
                _.assign(dict, params);
                const res = script(dict);

                const actionsToRemove = [3, 5];
                if (params.cleanUp > 0) actionsToRemove.push(6);
                if (params.cleanUp === 2) actionsToRemove.push(2);

                expectReturnObject(res, {
                  nItems: 2,
                  warnings: [],
                  shortcuts: [
                    {
                      name: getParamForScript(sct).shortcuts.name,
                      actionsToRemove: constructActionsToRemove(params.cleanUp === 2 ? [0, 4] : [], actionsToRemove),
                      uuids: extractUUIDs(sct.getActions()),
                      inserts: [
                        {
                          id: 0,
                          name: " ",
                          position: 2,
                          replacesNActions: 2,
                          isClipboard: true
                        }
                      ],
                      snippets: [
                        {
                          name: " ",
                          isClipboard: true,
                          newShortcut: "",
                          numberOfActions: 2,
                          uuids: extractUUIDs(sct.getActions([1, 1], [3, 1])),
                          actions: sct.getActions([1, 1], [3, 1])
                        }
                      ]
                    }
                  ]
                });
              });
            });
          });
          describe("Different name", function() {
            allPossibleScriptParams.forEach(function(params) {
              it(JSON.stringify(params), function() {
                const sct = new ShortcutBuilder();
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend\nasdf" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

                const dict = getParamForScript(sct);
                _.assign(dict, params);
                const res = script(dict);

                const actions = sct.getActions.apply(sct, params.excludeAllCPAComments ? [[1, 1], [3, 1]] : [1, 3]);
                const actionsToRemove = [3, 5];
                if (!params.excludeAllCPAComments) actionsToRemove.push(4);
                if (params.cleanUp > 0) actionsToRemove.push(6);
                if (params.cleanUp === 2) actionsToRemove.push(2);

                expectReturnObject(res, {
                  nItems: 2,
                  warnings: [],
                  shortcuts: [
                    {
                      name: getParamForScript(sct).shortcuts.name,
                      actionsToRemove: constructActionsToRemove(params.cleanUp === 2 ? [0, 4] : [], actionsToRemove),
                      uuids: extractUUIDs(sct.getActions()),
                      inserts: [
                        {
                          id: 0,
                          name: " ",
                          position: 2,
                          replacesNActions: params.excludeAllCPAComments ? 2 : 3,
                          isClipboard: true
                        }
                      ],
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
        });
        describe("whole", function() {
          describe("Same name", function() {
            allPossibleScriptParams.forEach(function(params) {
              it(JSON.stringify(params), function() {
                const sct = new ShortcutBuilder();
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

                const dict = getParamForScript(sct);
                _.assign(dict, params);
                const res = script(dict);

                const actionsToRemove = [1, 3, 5];
                if (params.cleanUp > 0) actionsToRemove.push(6);
                if (params.cleanUp === 2) actionsToRemove.push(0);

                expectReturnObject(res, {
                  nItems: 2,
                  warnings: [],
                  shortcuts: [
                    {
                      name: getParamForScript(sct).shortcuts.name,
                      actionsToRemove: constructActionsToRemove(params.cleanUp === 2 ? [2, 4] : [], actionsToRemove),
                      uuids: extractUUIDs(sct.getActions()),
                      inserts: [
                        {
                          id: 0,
                          name: " ",
                          position: 0,
                          replacesNActions: 3,
                          isClipboard: true
                        }
                      ],
                      snippets: [
                        {
                          name: " ",
                          isClipboard: true,
                          newShortcut: "",
                          numberOfActions: 1,
                          uuids: extractUUIDs(sct.getActions(3, 1)),
                          actions: sct.getActions(3, 1)
                        }
                      ]
                    }
                  ]
                });
              });
            });
          });
          describe("Different name", function() {
            allPossibleScriptParams.forEach(function(params) {
              it(JSON.stringify(params), function() {
                const sct = new ShortcutBuilder();
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy\nasdf" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend\nasdf" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
                sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
                sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

                const dict = getParamForScript(sct);
                _.assign(dict, params);
                const res = script(dict);

                const actions = sct.getActions(3, 1);
                const actionsToRemove = [1, 3, 5];
                if (!params.excludeAllCPAComments) actionsToRemove.push(2, 4);
                if (params.cleanUp > 0) actionsToRemove.push(6);
                if (params.cleanUp === 2) actionsToRemove.push(0);

                expectReturnObject(res, {
                  nItems: 2,
                  warnings: [],
                  shortcuts: [
                    {
                      name: getParamForScript(sct).shortcuts.name,
                      actionsToRemove: constructActionsToRemove(params.cleanUp === 2 ? [2, 4] : [], actionsToRemove),
                      uuids: extractUUIDs(sct.getActions()),
                      inserts: [
                        {
                          id: 0,
                          name: " ",
                          position: 0,
                          replacesNActions: params.excludeAllCPAComments ? 3 : 5,
                          isClipboard: true
                        }
                      ],
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
        });
      });
    });
  });
};
