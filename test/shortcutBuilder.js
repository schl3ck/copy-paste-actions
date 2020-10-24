const _ = require("lodash");
const bplist = require("../src/utils/bplist");
const { v4: uuid } = require("uuid");

class ShortcutBuilder {
  constructor() {
    this.actions = [];
  }

  /**
   * Adds an action
   * @param {Actions} action The action to add
   * @param {object} [params] Some options to specify
   * @param {string} [params.WFCommentActionText] Text in a comment action
   * @param {string} [params.GroupingIdentifier] UUID that connects actions
   *    into groups
   * (for actions if, repeat/choose from menu)
   */
  addAction(action, params) {
    const a = ShortcutBuilder.actionToShortcutAction(action, params);

    this.actions.push(a);
  }

  /**
   * Adds a comment to the actions
   * @param {string} text The text in the comment
   */
  addComment(text) {
    this.addAction(ShortcutBuilder.actions.Comment, {
      WFCommentActionText: text,
    });
  }

  /**
   * Removes actions at a specific index and returns them
   * @param {number} index At which position to remove the actions
   * @param {number} length Number of actions to remove
   */
  removeAction(index, length = 1) {
    return this.actions.splice(index, length);
  }

  /**
   * @typedef {ReturnType<typeof ShortcutBuilder.actionToShortcutAction>} Action
   */

  /**
   * Adds the actions from another shortcut
   * @param {ShortcutBuilder} shortcut The other shortcut containing the
   *    actions to add
   * @param {number} position The index of an action after which the actions
   *    should be inserted.
   * Defaults to the end. 0-based
   * @param {(action: Action, index: number, array: Action[]) => Action} reviver
   */
  addShortcut(shortcut, position = this.actions.length - 1, reviver = null) {
    let actions = shortcut.actions.map(_.cloneDeep);
    if (reviver) actions = actions.map(reviver);
    this.actions.splice(position + 1, 0, ...actions);
  }

  /**
   * Builds the shortcut as bplist and returns its buffer or base64 encoded
   * @param {boolean} base64 Wether or not the buffer should be base64 encoded
   * @returns {Buffer|string}
   */
  build(base64) {
    let buf = bplist.create({ WFWorkflowActions: this.actions });
    buf = base64 ? buf.toString("base64") : buf;
    return buf;
  }

  /**
   * Retrieves the actions from the shortcut, optionally filtered by a function.
   * The resulting array has either length of `length` or less, if the end of
   *    the shortcut was reached earlier
   * If arrays of length 2 are passed, then the first index is the start
   *    position and the second the length.
   * With that you can extract from multiple indices at once
   *
   * @param {number|[number, number]} from The start index. If it is < 0,
   *    it is counted from the end of the actions
   * @param {number|[number, number]} length The number of actions to extract
   * @param {[number, number][]} args Any number of number arrays of length 2
   * @returns {object[]}
   */
  getActions(from, length, ...args) {
    if (Array.isArray(from) && from.length === 2) {
      // array mode - save everything to args
      args = Array.prototype.slice.call(arguments);
    } else {
      args = [[from, length]];
    }

    const result = [];

    args.forEach((range, i) => {
      from = range[0];
      length = range[1];

      if (from < 0) from += this.actions.length;
      if (from < 0 || from >= this.actions.length) {
        throw new RangeError(
          `The parameter "from" of range ${i} is outside of the range of actions`,
        );
      }

      if (length < 0) {
        throw new RangeError(
          `The parameter "length" of range ${i} can't be smaller than 0`,
        );
      }
      if (length === 0) return;

      if (!from && !length) {
        result.push(...this.actions);
        return;
      }
      if (!length) length = this.actions.length;

      result.push(
        ...this.actions.slice(
          from,
          Math.min(from + length, this.actions.length),
        ),
      );
    });

    return result.map((a) => {
      a.WFWorkflowActionParameters = a.WFWorkflowActionParameters || {};
      return a;
    });
  }

  static genUUID() {
    return uuid();
  }

  static actionToShortcutAction(action, params) {
    if (!action) throw new TypeError('Parameter "action" is needed');
    if (params && typeof params !== "object") {
      throw new TypeError('Parameter "params" has to be an object');
    }

    const a = {
      /** @type {string} */
      WFWorkflowActionIdentifier: action.id || "" + action,
      WFWorkflowActionParameters: {},
    };
    if (action.params) {
      Object.keys(action.params).forEach((p) => {
        a.WFWorkflowActionParameters[p] = action.params[p];
      });
    }
    if (params) {
      Object.keys(params).forEach((p) => {
        a.WFWorkflowActionParameters[p] = params[p];
      });
    }
    return a;
  }
}

/**
 * The enum for `ShortcutBuilder.addAction()`
 * @typedef Actions
 * @readonly
 * @enum {object}
 */
ShortcutBuilder.actions = {
  Comment: {
    id: "is.workflow.actions.comment",
  },
  Dummy: {
    id: "dummy.action",
  },
  If: {
    id: "is.workflow.actions.conditional",
    params: {
      WFControlFlowMode: 0,
    },
  },
  Otherwise: {
    id: "is.workflow.actions.conditional",
    params: {
      WFControlFlowMode: 1,
    },
  },
  EndIf: {
    id: "is.workflow.actions.conditional",
    params: {
      WFControlFlowMode: 2,
    },
  },
  Repeat: {
    id: "is.workflow.actions.repeat.count",
    params: {
      WFControlFlowMode: 0,
    },
  },
  EndRepeat: {
    id: "is.workflow.actions.repeat.count",
    params: {
      WFControlFlowMode: 2,
    },
  },
  RepeatEach: {
    id: "is.workflow.actions.repeat.each",
    params: {
      WFControlFlowMode: 0,
    },
  },
  EndRepeatEach: {
    id: "is.workflow.actions.repeat.each",
    params: {
      WFControlFlowMode: 2,
    },
  },
  ChooseMenu: {
    id: "is.workflow.actions.choosefrommenu",
    params: {
      WFControlFlowMode: 0,
    },
  },
  ChooseMenuItem: {
    id: "is.workflow.actions.choosefrommenu",
    params: {
      WFControlFlowMode: 1,
    },
  },
  EndChooseMenu: {
    id: "is.workflow.actions.choosefrommenu",
    params: {
      WFControlFlowMode: 2,
    },
  },
};

module.exports = ShortcutBuilder;
