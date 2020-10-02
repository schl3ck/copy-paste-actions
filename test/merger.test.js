/* eslint-disable no-console */
const { expect } = require("chai");
const bplist = require("../src/utils/bplist");
const ShortcutBuilder = require("./shortcutBuilder");
const genUUID = ShortcutBuilder.genUUID;
const { constructActionsToRemove, extractUUIDs } = require("./utils");

const script = require("../src/utils/merger.worker");

/**
 *
 * @param {ReturnType<typeof script>} res
 * @param { {name: string, shortcut: string}[] } shortcuts
 */
function expectResult(res, shortcuts) {
  expect(res, "result").to.be.an("object").and.have.property("shortcuts");
  expect(res.shortcuts, "result.shortcuts").to.be.instanceOf(Array);
  expect(res.shortcuts, "result.shortcuts").to.have.length(shortcuts.length);
  if (shortcuts.length > 0) {
    for (const [i, o] of res.shortcuts.entries()) {
      expect(o, `result.shortcuts[${i}]`).to.have.property("name", shortcuts[i].name);
      o.shortcut = bplist.parse(Buffer.from(o.shortcut, "base64"))[0];
      shortcuts[i].shortcut = bplist.parse(Buffer.from(shortcuts[i].shortcut, "base64"))[0];

      /**
       * @typedef {object} Action
       * @property {string} WFWorkflowActionIdentifier
       * @property {object} WFWorkflowActionParameters
       * @property {string} [WFWorkflowActionParameters.UUID]
       * @property {string} [WFWorkflowActionParameters.GroupingIdentifier]
       */
      /** @type {Action[]} */
      const shouldActions = shortcuts[i].shortcut.WFWorkflowActions;
      expect(o.shortcut, `result.shortcuts[${i}].shortcut`).to.have.property("WFWorkflowActions");

      /** @type {Action[]} */
      const oActions = o.shortcut.WFWorkflowActions;
      expect(oActions, `result.shortcuts[${i}].shortcut.actions`).to.be.instanceOf(Array);
      expect(oActions, `result.shortcuts[${i}].shortcut.actions`).to.have.length(shouldActions.length);

      for (const [j, oAction] of oActions.entries()) {
        if (shouldActions[j].WFWorkflowActionParameters.UUID === "*") {
          let a;
          shouldActions[j].WFWorkflowActionParameters.UUID = (
            (a = oAction) && (a = a.WFWorkflowActionParameters) && a.UUID
          );
        }
        if (shouldActions[j].WFWorkflowActionParameters.GroupingIdentifier === "*") {
          let a;
          shouldActions[j].WFWorkflowActionParameters.GroupingIdentifier = (
            (a = oAction) && (a = a.WFWorkflowActionParameters) && a.GroupingIdentifier
          );
        }
        expect(oAction, `result.shortcuts[${i}].shortcut.actions[${j}]`).to.deep.equal(shouldActions[j]);
      }
    }
  }
}

describe("Merger", function() {
  it("does nothing", function() {
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [],
          actionsToRemove: [],
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    const res = script(dict);
    expectResult(res, []);
  });

  it("ignore the insert, because its position is outside the range", function() {
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    const insert = new ShortcutBuilder();
    insert.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [
            {
              id: 0,
              position: 3,
              actions: insert.actions,
              uuids: extractUUIDs(insert.getActions())
            }
          ],
          actionsToRemove: [],
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    const res = script(dict);
    expectResult(res, []);
  });

  it("append an action", function() {
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    const insert = new ShortcutBuilder();
    insert.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [
            {
              id: 0,
              position: 2,
              actions: insert.actions,
              uuids: extractUUIDs(insert.getActions())
            }
          ],
          actionsToRemove: [],
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    sct.addShortcut(insert);

    const res = script(dict);
    expectResult(res, [
      {
        name: "asdf",
        shortcut: sct.build()
      }
    ]);
  });

  // it should ever only add actions after the comment action, therfore it shouldn't be possible to insert them
  // as the start (only with deleting the comment action)
  it("insert an action at 0 = after the first", function() {
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    const insert = new ShortcutBuilder();
    insert.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [
            {
              id: 0,
              position: 0,
              actions: insert.actions,
              uuids: extractUUIDs(insert.getActions())
            }
          ],
          actionsToRemove: [],
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    sct.addShortcut(insert, 0);

    const res = script(dict);
    expectResult(res, [
      {
        name: "asdf",
        shortcut: sct.build()
      }
    ]);
  });

  it("change the UUID of the cloned action", function() {
    const uuid = genUUID();
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: uuid });

    const insert = new ShortcutBuilder();
    insert.addAction(ShortcutBuilder.actions.Dummy, { UUID: uuid });

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [
            {
              id: 0,
              position: 2,
              actions: insert.actions,
              uuids: extractUUIDs(insert.getActions())
            }
          ],
          actionsToRemove: [],
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: "*" });

    const res = script(dict);
    expectResult(res, [
      {
        name: "asdf",
        shortcut: sct.build()
      }
    ]);
  });

  it("change the GroupUUID of the cloned action", function() {
    const groupID = genUUID(); const uuid = genUUID();
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.If, { GroupingIdentifier: groupID });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Otherwise, { GroupingIdentifier: groupID });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.EndIf, { GroupingIdentifier: groupID, UUID: uuid });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    const insert = new ShortcutBuilder();
    insert.addAction(ShortcutBuilder.actions.If, { GroupingIdentifier: groupID });
    insert.addAction(ShortcutBuilder.actions.Otherwise, { GroupingIdentifier: groupID });
    insert.addAction(ShortcutBuilder.actions.EndIf, { GroupingIdentifier: groupID, UUID: uuid });

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [
            {
              id: 0,
              position: 3,
              actions: insert.actions,
              uuids: extractUUIDs(insert.getActions())
            }
          ],
          actionsToRemove: [],
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    sct.addShortcut(insert, 3, (action) => {
      action.WFWorkflowActionParameters.GroupingIdentifier = "*";
      if (action.WFWorkflowActionParameters.UUID) {
        action.WFWorkflowActionParameters.UUID = "*";
      }
      return action;
    });

    const res = script(dict);
    expectResult(res, [
      {
        name: "asdf",
        shortcut: sct.build()
      }
    ]);
  });

  it("remove the very first action due to snippet", function() {
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [],
          actionsToRemove: constructActionsToRemove([0]),
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    sct.removeAction(0);

    const res = script(dict);
    expectResult(res, [
      {
        name: "asdf",
        shortcut: sct.build()
      }
    ]);
  });

  it("remove the very first action due to insert", function() {
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    const insert = new ShortcutBuilder();

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [
            {
              id: 0,
              position: 0,
              actions: insert.actions,
              uuids: extractUUIDs(insert.getActions())
            }
          ],
          actionsToRemove: constructActionsToRemove(null, [0]),
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    sct.removeAction(0);

    const res = script(dict);
    expectResult(res, [
      {
        name: "asdf",
        shortcut: sct.build()
      }
    ]);
  });

  it("remove no action due to missing insert", function() {
    const sct = new ShortcutBuilder();
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });
    sct.addAction(ShortcutBuilder.actions.Dummy, { UUID: genUUID() });

    const insert = new ShortcutBuilder();

    /** @type {Parameters<typeof script>[0]} */
    const dict = {
      shortcuts: [
        {
          name: "asdf",
          inserts: [],
          actionsToRemove: constructActionsToRemove(null, [0]),
          uuids: extractUUIDs(sct.getActions()),
          shortcut: sct.build()
        }
      ]
    };

    const res = script(dict);
    expectResult(res, []);
  });
});
