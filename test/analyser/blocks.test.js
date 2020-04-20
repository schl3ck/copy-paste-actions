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

/*

remove blocks when:
ignored = left in shortcut

block start        keep
func start
block middle/end    keep
func end

func start
block start        removed
block middle/end    removed
func end

func start
block start        keep
func end
block middle/end    keep

func start
block start        keep
func end
other action
block middle/end    keep

*/

module.exports = function() {
  describe("Blocks", function() {
    /**
     *
     * @param {number[]} perm
     * @param {object} options
     * @param {string} options.block
     * @param {string} options.startFunc
     */
    function permutationToAction(perm, options) {
      const map = new Map(perm.map((i) => [i, { value: i, occurrence: 0, actions: [] }]));
      perm.forEach((i) => map.get(i).occurrence++);
      map.forEach((i) => {
        i.actions = (
          i.value === 0 ? permutationToAction.getFuncs : permutationToAction.getBlock
        )(i.occurrence, options);
      });
      const res = [];
      perm.forEach((p) => {
        let o = map.get(p).actions.shift();
        res.push(o);
        if (o.id === "ChooseMenu") {
          o = map.get(p).actions.shift();
          res.push(o);
        }
      });
      return res;
    }
    permutationToAction.getFuncs = function(length, options) {
      return [
        options.startFunc,
        ...("pause|resume|".repeat(length / 2 - 1).replace(/\|$/, "").split("|")),
        ("end" + options.startFunc.replace(/^(paste|insert) replace$|^.+$/, " $1")).trim()
      ]
        .filter((i) => i.length);
    };
    permutationToAction.getBlock = function(length, options) {
      const groupUUID = genUUID();
      const varUUID = genUUID();
      const ctor = (id) => {
        const o = {
          id,
          params: {
            GroupingIdentifier: groupUUID
          }
        };
        id.startsWith("End") && (o.params.UUID = varUUID);
        return o;
      };
      const repeat = (str, times) => {
        const ar = [];
        for (let i = 0; i < times; i++) {
          ar.push(str);
        }
        return ar;
      };
      return {
        Repeat: ["Repeat", "EndRepeat"].map(ctor),
        RepeatEach: ["RepeatEach", "EndRepeatEach"].map(ctor),
        If: ["If", length === 3 ? "Otherwise" : "", "EndIf"].filter((i) => i.length).map(ctor),
        ChooseMenu: [
          "ChooseMenu",
          ...repeat("ChooseMenuItem", length - 1),
          "EndChooseMenu"
        ]
          .filter((i) => i.length)
          .map(ctor)
      }[options.block];
    };

    function test(funcProps, actions) {
      for (const params of allPossibleScriptParams) {
        it(JSON.stringify(params), function() {
          // nTotal++;
          // return;
          const sct = new ShortcutBuilder();

          let insideFunc = false;
          let isStartFunc = true;
          let snippet = {
            name: " ",
            isClipboard: funcProps.isClipboard,
            newShortcut: "",
            numberOfActions: 0,
            uuids: extractUUIDs([]),
            actions: []
          };
          let insert = {
            id: 0,
            name: " ",
            position: 0,
            isClipboard: funcProps.isClipboard
          };
          if (funcProps.inserts) {
            snippet = undefined;
          } else {
            insert = undefined;
          }
          const actionsToRemove = [];
          const insideBlocks = {};

          const addLastActionToRemove = () => {
            actionsToRemove.push(sct.actions.length - 1);
          };

          for (const [actionIndex, action] of actions.entries()) {
            if (typeof action === "string") {
              sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\n" + action });
              if (isStartFunc) {
                isStartFunc = false;
                // * 2 because we add a dummy action after each generated action
                if (insert) insert.position = actionIndex * 2;
              }
              insideFunc = !insideFunc;
              if (params.cleanUp === 2) addLastActionToRemove();
              else if (params.cleanUp === 1 && funcProps.removes && /^(resume|pause|end)/.test(action)) addLastActionToRemove();
            } else {
              // add block
              sct.addAction(ShortcutBuilder.actions[action.id], action.params);
              // get values for current block
              let o = insideBlocks[action.params.GroupingIdentifier];
              // or set them
              if (!o) {
                o = insideBlocks[action.params.GroupingIdentifier] = {
                  removeBlock: insideFunc && funcProps.removes,
                  include: insideFunc,
                  positions: []
                };
              }
              // save each position if we need to add it later
              o.positions.push(sct.actions.length - 1);

              // if at least one part of the block is outside of the snippet, don't remove the whole block
              o.removeBlock = o.removeBlock && insideFunc;
              // if this is currently the last action of the block, add all to actionsToRemove
              if (o.removeBlock && action.id.startsWith("End")) {
                actionsToRemove.push(...o.positions);
                // and remove it from insideBlocks
                delete insideBlocks[action.params.GroupingIdentifier];
              }

              // if at least one action of the block was inside the snippet, add everything of it to the snippet
              if (o.include) {
                snippet && snippet.actions.push(sct.actions.length - 1);
              } else {
                o.include = insideFunc;
                if (o.include) {
                  // if the start or more of the block was outside, add it to the beginning
                  snippet && snippet.actions.push(...o.positions);
                }
              }
            }
            // add dummy
            sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
            if (insideFunc && funcProps.removes) addLastActionToRemove();
            if (insideFunc && snippet) snippet.actions.push(sct.actions.length - 1);
          }

          // eslint-disable-next-line max-len
          // if (startFunc === "paste replace" && nFuncs === 2 && perm.join("") === "11100" && params.excludeAllCPAComments === false && params.cleanUp === 1)
          //   (function() { })();

          if (snippet) {
            snippet.actions.sort((a, b) => a - b);
            snippet.actions = snippet.actions.map((i) => sct.getActions(i, 1)[0]);
            snippet.numberOfActions = snippet.actions.length;
            snippet.uuids = extractUUIDs(snippet.actions);
          }

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          expectReturnObject(res, {
            requires: {
              clipboard: funcProps.isClipboard && funcProps.inserts,
              snippets: !funcProps.isClipboard && funcProps.inserts
            },
            savesTo: {
              clipboard: funcProps.isClipboard && !funcProps.inserts,
              snippets: !funcProps.isClipboard && !funcProps.inserts
            },
            nItems: 1,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                requires: {
                  clipboard: funcProps.isClipboard && funcProps.inserts,
                  snippets: !funcProps.isClipboard && funcProps.inserts
                },
                savesTo: {
                  clipboard: funcProps.isClipboard && !funcProps.inserts,
                  snippets: !funcProps.isClipboard && !funcProps.inserts
                },
                actionsToRemove: constructActionsToRemove(
                  !funcProps.inserts && actionsToRemove,
                  funcProps.inserts && actionsToRemove
                ),
                uuids: extractUUIDs(sct.getActions()),
                inserts: insert ? [insert] : [],
                snippets: snippet ? [snippet] : []
              }
            ]
          });
        });
      }
    }

    describe("1 Block", function() {
      // at first generate all permutations with if and all funcs
      describe("All permutations with block If", function() {
        for (const startFunc of ["copy", "cut", "save", "save remove", "paste replace", "insert replace"]) {
          const funcProps = {
            isClipboard: /copy|cut|paste/.test(startFunc),
            removes: /cut|remove|replace/.test(startFunc),
            inserts: /paste|insert/.test(startFunc)
          };
          describe(startFunc, function() {
            // if it is an insert function, the only possible length is 2
            for (let nFuncs = 2; nFuncs <= (funcProps.inserts ? 2 : 6); nFuncs += 2) {
              describe("nFuncs = " + nFuncs, function() {
                for (const perm of uniquePermutations.generate([...Array.from({ length: nFuncs }, () => 0), 1, 1, 1])) {
                  const actions = permutationToAction(perm, { startFunc: startFunc, block: "If" });

                  describe("perm = " + perm.join(""), function() {
                    test(funcProps, actions);
                  });
                }
              });
            }
          });
        }
      });

      describe("All blocks", function() {
        for (const block of [
          { name: "Repeat", perms: ["1010"] },
          { name: "RepeatEach", perms: ["1010"] },
          { name: "If", perms: ["1010", "11010"] },
          { name: "ChooseMenu", perms: ["1010", "11010", "110101", "1101011"] }
        ]) {
          block.perms = block.perms.map((perm) => perm.split("").map((i) => parseInt(i)));
          describe(block.name, function() {
            for (const perm of block.perms) {
              describe("perm = " + perm, function() {
                for (const startFunc of ["copy", "cut", "save", "save remove", "paste replace", "insert replace"]) {
                  const funcProps = {
                    isClipboard: /copy|cut|paste/.test(startFunc),
                    removes: /cut|remove|replace/.test(startFunc),
                    inserts: /paste|insert/.test(startFunc)
                  };
                  const actions = permutationToAction(perm, { startFunc: startFunc, block: block.name });
                  describe(startFunc, function() {
                    test(funcProps, actions);
                  });
                }
              });
            }
          });
        }
      });
    });

    describe("2 Ifs", function() {
      for (const startFunc of ["copy", "cut", "save", "save remove", "paste replace", "insert replace"]) {
        const funcProps = {
          isClipboard: /copy|cut|paste/.test(startFunc),
          removes: /cut|remove|replace/.test(startFunc),
          inserts: /paste|insert/.test(startFunc)
        };
        describe(startFunc, function() {
          // if it is an insert function, the only possible length is 2
          for (let nFuncs = 2; nFuncs <= (funcProps.inserts ? 2 : 6); nFuncs += 2) {
            describe("nFuncs = " + nFuncs, function() {
              // to only test it once, when all occurrences of an If are at the start or end
              let firstFront = true; let firstBack = true;
              for (const perm of uniquePermutations.generate(
                [...Array.from({ length: nFuncs }, () => 0), 1, 1, 1, 2, 2, 2]
              )) {
                const permStr = perm.join("");
                // skip any permutation that starts or ends with all occurrences of the functions
                if (permStr.startsWith("0".repeat(nFuncs)) || permStr.endsWith("0".repeat(nFuncs))) continue;
                // skip any permutation that starts or ends with all occurrences of an If, except the first one
                // (already covered by describe("1 Block") )
                if (/^(111|222)/.test(permStr)) {
                  if (firstFront) firstFront = false;
                  else continue;
                }
                if (/(111|222)$/.test(permStr)) {
                  if (firstBack) firstBack = false;
                  else continue;
                }
                // skip any permutation where the Ifs are interlaced (that's not possible in Shortcuts)
                if (/1.*2.*1|2.*1.*2/.test(permStr)) continue;

                const actions = permutationToAction(perm, { startFunc: startFunc, block: "If" });

                describe("perm = " + permStr, function() {
                  test(funcProps, actions);
                });
              }
            });
          }
        });
      }
    });

    describe("paste, if, otherwise, copy, end if, end paste, end copy", function() {
      for (const params of allPossibleScriptParams) {
        it(JSON.stringify(params), function() {
          const sct = new ShortcutBuilder();
          const groupID = genUUID();
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\npaste replace" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.If, { GroupingIdentifier: groupID });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Otherwise, { GroupingIdentifier: groupID });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\ncopy" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.EndIf, { GroupingIdentifier: groupID, UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend paste" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
          sct.addAction(ShortcutBuilder.actions.Comment, { WFCommentActionText: ":cpa:\nend" });
          sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

          const dict = getParamForScript(sct);
          _.assign(dict, params);
          const res = script(dict);

          const actionsToRemove = {
            insert: [],
            snippet: []
          };
          switch (params.cleanUp) {
            case 0:
              actionsToRemove.insert = [1, 2, 3, 4, 5, 7, 8, 9];
              break;
            case 1:
              actionsToRemove.insert = [1, 2, 3, 4, 5, 7, 8, 9, 10];
              break;
            case 2:
              actionsToRemove.insert = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10];
              actionsToRemove.snippet = [6, 12];
              break;
          }

          expectReturnObject(res, {
            requires: { clipboard: true, snippets: false },
            savesTo: { clipboard: true, snippets: false },
            nItems: 2,
            warnings: [],
            shortcuts: [
              {
                name: getParamForScript(sct).shortcuts.name,
                requires: { clipboard: true, snippets: false },
                savesTo: { clipboard: true, snippets: false },
                actionsToRemove: constructActionsToRemove(actionsToRemove.snippet, actionsToRemove.insert),
                uuids: extractUUIDs(sct.getActions()),
                inserts: [
                  {
                    id: 0,
                    name: " ",
                    position: 0,
                    isClipboard: true
                  }
                ],
                snippets: [
                  {
                    name: " ",
                    isClipboard: true,
                    newShortcut: "",
                    numberOfActions: 6,
                    uuids: extractUUIDs(sct.getActions(7, 5)),
                    actions: sct.getActions([2, 1], [4, 1], [7, 5])
                      .filter(a => a.WFWorkflowActionIdentifier !== ShortcutBuilder.actions.Comment.id)
                  }
                ]
              }
            ]
          });
        });
      }
    });
  });
};
