// use CommonJS import for the tests
// Buffer is globally available
const bplist = require("./bplist");

/*
TODO: modify function "paste"/"insert" to allow inserting multiple copies at once
TODO: new function "insert shortcut/workflow" to simply insert a whole shortcut
TODO: new function "merge" to simply replace all non recursive "Run Shortcut" actions with their referenced shortcut
      (with option to exclude some)
TODO: new function "ignore" to ignore this comment completely (to have comments that aren't going to be copied)
*/

/**
   * Holds two boundaries that form a range
   * @constructor
   * @param {number} start
   * @param {number} end
   */
function ActionRange(start, end) {
  this.start = start;
  this.end = end;
}
/**
 * Wheter or not a start was defined
 */
ActionRange.prototype.hasStart = function() {
  return this.start != null;
};
/**
 * Wheter or not an end was defined
 */
ActionRange.prototype.hasEnd = function() {
  return this.end != null;
};
/**
 * Wheter or not a start and an end was defined
 */
ActionRange.prototype.isComplete = function() {
  return this.hasStart() && this.hasEnd();
};
/**
 * Wheter or not this Range includes `value`
 * @param {number} value
 */
/* istanbul ignore next reason: no need to test this */
ActionRange.prototype.includes = function(value) {
  return this.isComplete() ? this.start <= value && value <= this.end : null;
};
/**
 * True, if this Range is complete and start is smaller than end
 */
ActionRange.prototype.isValid = function() {
  return this.isComplete() && this.start <= this.end;
};

/** @typedef {object} InputDict
 * @property {object[]} shortcuts
 * @property {string} shortcuts[].name Name of Shortcut
 * @property {Buffer} shortcuts[].shortcut
 * @property {boolean} excludeAllCPAComments wheter or not to include cpa comments in other snippets/selections
 *
 * `true`: do not include
 *
 * default: `true`
 * @property {0 | 1 | 2} cleanUp
 * `0`: no clean up, all comments are left in
 *
 * `1` (default): the functions "pause", "resume" and "end" are removed, if the selection is edited
 *              (by the functions "cut", "save remove", "paste replace" and "insert replace")
 *
 * `2`: all comments are removed, except for the ones that threw a warning
 * @property {string} commentMarker with what should the comment start so that it is recognized as a function
 * @property {string} noSnippetName name of new snippet, when no one was provided
 * @property {string} defaultNewShortcutName default: "Untitled Shortcut"
 */

/**
 * @param {InputDict} dict
 */
function analyse(dict) {
  /*
  comment format:

    {commentMarker}
    function: cut [n],
              copy [n],
              end [paste, insert],
              pause [n],
              resume [n],
              paste [replace [n]],
              save [remove, replace] [n],
              insert [replace [n]]
    name: snippet name
    new: [new] [shortcut name]

  Things in square brackets "[ ]" like "[replace]" are optionally, but don't need the square brackets when specified.
  If you include the brackets, it won't work.

  Things separated by commas "," like "this, that" denote options. In this example it would be either "this" or "that"

  Line "function" is mandatory

  Line "name" is optional. It is only used if you copy multiple selections at once, oherwise you can only copy one
  selection at once and it helps when saving and restoring snippets.

  Line "new" is optional and only used for the functions "cut", "copy" and "save".

  function: speciefies what to do
    cut [n], copy [n]: marks the start of a new selection. Copies the selection into the internal clipboard, cut also
                       removes it from their current position
    end [paste, insert]: marks the end of a selection. specify "paste" or "insert" if it ends a paste or insert
                         selection
    pause [n]: pauses the inclusion of actions
    unpause [n]: resumes the inclusion of actions
    paste [replace [n]]: paste the actions from the internal clipboard
    save [remove, replace] [n]: saves the selection as a snippet
    insert [replace [n]]: insert from saved snippets

    if "replace" or "remove" is specified, the insertion replaces the following actions until the function "end" is
      encountered
    if "n" is specified, only the next "n" actions are affected. The selection will end if either "n" actions were
      included or the "end" function was found. If the function "pause" is found, after "n" was specified for a start
      function (cut, copy, save), then the remaining number of actions is also paused until either

  name: specifies the name of the snippet. You will be asked, when saving a snippet, if you want to change it.

  new: if given, pastes the action range in a new shortcut, optionally with the given name, otherwise with the name
       "Untitled Shortcut"

  The line headings are optional, meaning "function: cut" is the same as "cut".

  Blocks (If, Repeat (with Each) and Choose from Menu) are included in the selection when at least one action of the
    block is inside the selection and will only be removed, if all actions of the block are inside the selection

  Examples:

  Comment
    :cpa:
    copy
    new copy result

  Action 1
  action 2
  Comment
    :cpa:
    pause 1

  Action 3
  action 4
  comment
    :cpa:
    end

  This copies the actions 1, 2 and 4 into the new shortcut called "copy result" and stores it in the private clipboard
  (if you have enabled either iCloud or Dropbox) or in the system clipboard

  Another example:

  Comment
    :cpa:

  */

  // definitions =========================================
  const regex = {
    isStartFunc: /^(cut|copy|save)/,
    isClipboard: /^(cut|copy|paste|end paste)/,
    isEditingFunc: /^(cut|paste|insert)/,
    isSelectionModifierFunc: /^(pause|resume|end)/,
    validateFunc: /^(?:(cut|copy|save(\s+(remove|replace))?|pause|resume)(\s+\d+)?|end(\s+(paste|insert))?|(paste|insert)(\s+replace(\s+\d+)?)?)$/,
    getFunc: /^(cut|copy|save(\s+(remove|replace))?|pause|resume|(paste|insert)(\s+replace)?|end(\s+(paste|insert))?)/
  };

  const blockActionIds = [
    "is.workflow.actions.choosefrommenu",
    "is.workflow.actions.repeat.count",
    "is.workflow.actions.repeat.each",
    "is.workflow.actions.conditional"
  ];

  function removeFromArray(array, obj, fromIndex) {
    /* istanbul ignore if reason: no need to test */
    if (array == null) { throw new TypeError("\"array\" is null or undefined. Can't operate on null or undefined"); }
    const i = array.indexOf(obj, fromIndex);
    /* istanbul ignore else reason: no need to test this */
    if (i < 0) return;
    /* istanbul ignore next reason: coupled with else above */
    return array.splice(i, 1);
  }

  // sanitising input
  if (!dict.shortcuts) dict.shortcuts = [];
  if (!Array.isArray(dict.shortcuts)) { dict.shortcuts = [dict.shortcuts]; }
  if (typeof dict.cleanUp !== "number" || dict.cleanUp < 0 || dict.cleanUp > 2) { dict.cleanUp = 1; }
  if (dict.excludeAllCPAComments !== false) { dict.excludeAllCPAComments = true; }
  if (!dict.commentMarker) dict.commentMarker = ":cpa:";
  if (!dict.noSnippetName) dict.noSnippetName = " ";
  if (!dict.defaultNewShortcutName) dict.defaultNewShortcutName = "Untitled Shortcut";

  dict.commentMarker = dict.commentMarker.toLowerCase();
  const allUsedNewShortcutNames = [];

  /**
   * @typedef {object} Action
   * @property {number} index Index in the shortcut
   * @property {number} modifiedIndex Index if a snippet/insert is currently processed. The comments of this
   *    snippet/insert are ignored
   * @property {string} WFWorkflowActionIdentifier
   * @property {object} WFWorkflowActionParameters
   * @property {string} WFWorkflowActionParameters.UUID
   */
  /**
   * @typedef {object} CommentAction
   * @property {number} index Index in the shortcut
   * @property {number} modifiedIndex Index if a snippet/insert is currently processed. The comments of this
   *    snippet/insert are ignored
   * @property {string} name Name from parsed CPA function
   * @property {"is.workflow.actions.comment"} WFWorkflowActionIdentifier
   * @property {object} WFWorkflowActionParameters
   * @property {string} WFWorkflowActionParameters.WFCommentActionText
   */
  /**
   * @typedef {object} BlockAction
   * @property {number} index Index in the shortcut
   * @property {number} modifiedIndex Index if a snippet/insert is currently processed. The comments of this
   *    snippet/insert are ignored
   * @property {"is.workflow.actions.choosefrommenu" |
   *    "is.workflow.actions.repeat.count" |
   *    "is.workflow.actions.repeat.each" |
   *    "is.workflow.actions.conditional"} WFWorkflowActionIdentifier
   * @property {object} WFWorkflowActionParameters
   * @property {string} WFWorkflowActionParameters.UUID
   * @property {string} WFWorkflowActionParameters.GroupingIdentifier
   */
  /**
   * @typedef {object} CPAComment
   * @property {string} function
   * @property {number} funcN
   * @property {boolean} endsInsert
   * @property {string} name
   * @property {string} newShortut
   * @property {boolean} isClipboard
   * @property {boolean} removes
   * @property {string[]} text
   * @property {string} textForWarning
   * @property {CommentAction} action
   */
  /**
   * @typedef {object} Leftover
   * @property {number} pause Pause after this number of actions
   * @property {number} resume Resume after this number of actions
   * @property {number} end End after this number of actions
   */
  /**
   * @typedef {object} uuidCollection
   * @property {Set} groups
   * @property {Set} vars
   */
  /**
   * @typedef {object} Snippet
   * @property {string} name
   * @property {boolean} isClipboard
   * @property {boolean} removes
   * @property {ActionRange[]} ranges
   * @property {Leftover} leftover
   * @property {string} newShortcut
   * @property {boolean} finished
   * @property {object} functionPositions
   * @property {number} functionPositions.start
   * @property {number[]} functionPositions.pauseResume
   * @property {number} functionPositions.end
   * @property {Action[]} actions
   * @property {uuidCollection} uuids
   */
  /**
   * @typedef {object} Insert
   * @property {string} name
   * @property {boolean} isClipboard
   * @property {boolean} removes
   * @property {number} id
   * @property {ActionRange[]} ranges
   * @property {Leftover} leftover
   * @property {object} functionPositions
   * @property {number} functionPositions.start
   * @property {number} functionPositions.end
   */
  /**
   * @typedef {object} ActionToRemove
   * @property {number} action The 0-based index of the action
   * @property {number[]} excludedBy The id of the insert that removed this action or -1 if it is removed by a snippet
   */
  /**
   * @typedef {object} Warning
   * @property {string} shortcut Name of shortcut
   * @property {number} action Index position of comment action
   * @property {string} commentText Whole text from comment action
   * @property {"incomplete" |
   * "wrongFunction" |
   * "pauseResumeInPaste" | "pauseResumeInInsert" |
   * "duplicateClipboardNoName" | "duplicateClipboardWithName" | "duplicateSnippetNoName" | "duplicateSnippetWithName" |
   * "pasteEndNoStart" | "insertEndNoStart" | "pasteEndInsertStart" | "insertEndPasteStart" |
   * "funcNoStart" |
   * "funcClipboardFinished" | "funcSnippetFinished" |
   * "pauseWhilePauseClipboard" | "pauseWhilePauseSnippet" |
   * "resumeWhileResumeClipboard" | "resumeWhileResumeSnippet"} type Error type
   * @property {object} [payload] Some additional info to insert into the error message
   */

  const result = [];
  let insertIdMax = -1;
  /** @type {Warning[]} */
  const warnings = [];

  const percentPerShortcut = 100 / dict.shortcuts.length;

  dict.shortcuts.forEach((shortcut, shortcutIndex) => {
    const basePercentage = percentPerShortcut * shortcutIndex;
    updatePercentage(basePercentage);

    const buf = Buffer.from(shortcut.shortcut);
    const shortcutName = shortcut.name;

    shortcut = bplist.parse(buf)[0];

    const uuids = {
      groups: new Set(),
      vars: new Set()
    };

    /**
     * @type {Action[]}
     */
    const actions = shortcut.WFWorkflowActions
      .map(
        /**
         * @param {Action | BlockAction} a
         * @param {number} i
         */
        (a, i) => {
          a.index = a.modifiedIndex = i;
          if (a.WFWorkflowActionParameters) {
            if (a.WFWorkflowActionParameters.UUID) {
              uuids.vars.add(a.WFWorkflowActionParameters.UUID);
            }
            if (a.WFWorkflowActionParameters.GroupingIdentifier) {
              uuids.groups.add(a.WFWorkflowActionParameters.GroupingIdentifier);
            }
          } else {
            a.WFWorkflowActionParameters = {};
          }
          return a;
        });
    /**
     * @type {Action[]}
     */
    let modifiedActions = [];
    /**
     * @type {CommentAction[]}
     */
    let comments;
    // reindex actions to ignore CPA comments (if dict.excludeAllCPAComments == true)
    (function() {
      let index = 0;
      comments = actions
        .filter(
          /**
           * @param {CommentAction | Action} a
           */
          (a) => {
            const isCPAComment = a.WFWorkflowActionIdentifier === "is.workflow.actions.comment" &&
              new RegExp(`^\\s*${dict.commentMarker}\\s*?\\n?`, "i").test(
                a.WFWorkflowActionParameters.WFCommentActionText
              );
            if (dict.excludeAllCPAComments) {
              a.modifiedIndex = index;
              if (!isCPAComment) {
                index++;
                modifiedActions.push(a);
              }
            }
            return isCPAComment;
          });
    })();
    /**
     * @type {BlockAction[]}
     */
    const blocks = actions.filter((action) => blockActionIds.includes(action.WFWorkflowActionIdentifier));

    /**
     * @type {Map<string, CPAComment[]>}
     */
    const names = new Map();

    /**
     * @type {Snippet[]}
     */
    const snippets = [];
    /**
     * @type {Insert[]}
     */
    const inserts = [];

    /**
     * @type {ActionToRemove[]}
     */
    const actionsToRemove = [];

    updatePercentage(basePercentage + percentPerShortcut * 0.1);

    // sort after names & if it's complete & if it has a valid function
    comments.forEach((action) => {
      const textForWarning = action.WFWorkflowActionParameters.WFCommentActionText.trim();
      const text = textForWarning.split("\n");
      // we've already tested if it starts with the commentMarker

      if (text.length < 2) {
        warnings.push({
          action: action.index,
          commentText: textForWarning,
          shortcut: shortcutName,
          type: "incomplete"
        });
        return;
      }

      let func = text[1].trim().toLowerCase();
      let name = (text[2] || "").trim();
      let newShortcut = (text[3] || "").trim();

      if (/^new:?\s*/i.test(name)) {
        newShortcut = name;
        name = "";
      }

      // strip optional line titles
      func = func.replace(/^\s*function:?\s*/i, "").trim();
      name = name.replace(/^\s*name:?\s*/i, "").trim() || dict.noSnippetName;
      newShortcut = newShortcut.replace(/^\s*new:?\s*/i, "new").trim();

      if (!regex.validateFunc.test(func)) {
        warnings.push({
          action: action.index,
          commentText: textForWarning,
          shortcut: shortcutName,
          type: "wrongFunction",
          payload: {
            function: func
          }
        });
        return;
      }

      if (newShortcut) {
        if (newShortcut.startsWith("new")) {
          newShortcut = newShortcut.replace(/^new\s*/, "").trim();
        }
        newShortcut = newShortcut || dict.defaultNewShortcutName;
        allUsedNewShortcutNames.push(newShortcut);
      }

      const isClipboard = regex.isClipboard.test(func);

      let funcN = func.match(/\d+/);
      funcN = parseInt(funcN || "");
      funcN = isNaN(funcN) ? null : funcN;
      func = func.match(regex.getFunc)[0];

      const remove = /remove|replace|^cut$/.test(func);
      func = func.replace(/\s+(replace|remove)/, "");
      func = func === "cut" ? "copy" : func;

      const endsInsert = /^end (paste|insert)$/.test(func);
      func = func.replace(/^end (paste|insert)$/, "end");

      /**
       * @type {CPAComment[]}
       */
      let o;
      if (!names.has(name)) {
        o = [];
        names.set(name, o);
      } else {
        o = names.get(name);
      }
      o.push({
        function: func,
        funcN: funcN,
        endsInsert: endsInsert,
        name: name,
        newShortut: newShortcut,
        isClipboard: isClipboard,
        removes: remove,
        textForWarning: textForWarning,
        action: action,
        newShortcut: newShortcut
      });
    }); // end comments.forEach()

    /** amount of percent each name has */
    const percentagePerName = percentPerShortcut * 0.7 / names.size;
    names.forEach((comments, nameIndex) => {
      // update percentage from 20 up to 90, but 90 won't be reached here because nameIndex will never be equal to
      // names.size
      /** the starting percentage of the current iteration */
      const basePercentageNames = basePercentage + percentPerShortcut * 0.2 + percentagePerName * nameIndex;
      updatePercentage(basePercentageNames);

      // reindex actions to ignore current function comments, only when not already all were excluded
      if (!dict.excludeAllCPAComments) {
        (function() {
          modifiedActions = [];
          let index = 0;
          const commentIndices = comments.map((c) => c.action.index);
          actions.forEach(
            /**
             * @param {Action | CommentAction} action
             */
            (action) => {
              action.modifiedIndex = index;
              if (
                action.WFWorkflowActionIdentifier !== "is.workflow.actions.comment" ||
                !commentIndices.includes(action.index)
              ) {
                index++;
                modifiedActions.push(action);
              }
            });
        })();
      }

      const current = {
        /**
         * @type {Snippet} Could also be `true` if there was an error to suppress the errors from upcoming functions
         */
        snippet: null,
        insert: {
          /**
           * @type {Insert}
           */
          clipboard: null,
          /**
           * @type {Insert}
           */
          snippet: null
        },
        hasInsert: function() {
          return Boolean(this.insert.clipboard || this.insert.snippet);
        },
        /**
         * @type {Insert[]}
         */
        inserts: []
      };
      let ignoreErrorsForSnippet = false;

      comments.forEach((comment) => {
        if (current.hasInsert() && !current.snippet && /^(pause|resume)/.test(comment.function)) {
          warnings.push({
            action: comment.action.index,
            commentText: comment.textForWarning,
            shortcut: shortcutName,
            type: current.insert.clipboard ? "pauseResumeInPaste" : "pauseResumeInInsert",
            payload: {
              function: comment.function
            }
          });
          if (current.insert.clipboard) { removeFromArray(current.inserts, current.insert.clipboard); }
          if (current.insert.snippet) { removeFromArray(current.inserts, current.insert.snippet); }
          current.insert.clipboard = current.insert.snippet = undefined;
          return;
        }

        if (regex.isStartFunc.test(comment.function) && current.snippet) {
          if (!ignoreErrorsForSnippet) {
            const payload = comment.name === dict.noSnippetName ? {} : {
              payload: {
                name: comment.name
              }
            };
            warnings.push({
              action: comment.action.index,
              commentText: comment.textForWarning,
              shortcut: shortcutName,
              type: `duplicate${current.snippet.isClipboard ? "Clipboard" : "Snippet"}${
                comment.name === dict.noSnippetName ? "NoName" : "WithName"}`,
              ...payload
            });
          }
          return;
        }

        if (comment.function === "end" && comment.endsInsert) {
          if (!current.hasInsert()) {
            warnings.push({
              action: comment.action.index,
              commentText: comment.textForWarning,
              shortcut: shortcutName,
              type: (comment.isClipboard ? "paste" : "insert") + "EndNoStart"
            });
            return;
          } else if (comment.isClipboard && !current.insert.clipboard) {
            warnings.push({
              action: comment.action.index,
              commentText: comment.textForWarning,
              shortcut: shortcutName,
              type: "pasteEndInsertStart"
            });
            current.insert.snippet = undefined;
            return;
          } else if (!comment.isClipboard && !current.insert.snippet) {
            warnings.push({
              action: comment.action.index,
              commentText: comment.textForWarning,
              shortcut: shortcutName,
              type: "insertEndPasteStart"
            });
            current.insert.clipboard = undefined;
            return;
          }
        }

        // gedankenstütze:
        // 0 0 1 2 2 3 4 5 5 6
        // C A A C A A A C A A

        // evaluate previous leftover
        if (current.snippet !== true && evaluateLeftovers(current.snippet, comment.action.modifiedIndex)) {
          current.snippet.finished = true;
        }
        if (evaluateLeftovers(current.insert.clipboard, comment.action.modifiedIndex)) {
          current.inserts.push(current.insert.clipboard);
          current.insert.clipboard = null;
        }
        if (evaluateLeftovers(current.insert.snippet, comment.action.modifiedIndex)) {
          current.inserts.push(current.insert.snippet);
          current.insert.snippet = null;
        }

        if (/^(pause|resume|end)/.test(comment.function) && !comment.endsInsert) {
          if (!current.snippet) {
            // TODO: move to FAQ
            warnings.push({
              action: comment.action.index,
              commentText: comment.textForWarning,
              shortcut: shortcutName,
              type: "funcNoStart",
              payload: {
                function: comment.function
              }
            });
            return;
          } else if (current.snippet === true) {
            // when there was an error in a previous comment and the current comment would concern the snippet,
            // ignore it
            return;
          } else if (current.snippet.finished) {
            warnings.push({
              action: comment.action.index,
              commentText: comment.textForWarning,
              shortcut: shortcutName,
              type: current.snippet.isClipboard ? "funcClipboardFinished" : "funcSnippetFinished",
              payload: {
                function: comment.function
              }
            });
            // there seems to be a misconfiguration => don't process it
            current.snippet = null;
            return;
          }
        }

        // ignore dict.excludeCPAComments because we've reindexed the actions to ignore current functions and
        // if it were false, then the other comments can be treated like regular actions
        const startsRange = comment.action.modifiedIndex;
        // subtract 1 because we want to mark the previous action
        const endsRange = comment.action.modifiedIndex - 1;
        // don't add 1 to the end because we want to select only 1 action if we specify "1" and the end is inclusive
        const leftover = comment.funcN;

        switch (comment.function) {
          case "copy":
          case "save":
            current.snippet = {
              name: comment.name,
              isClipboard: comment.isClipboard,
              removes: comment.removes,
              newShortcut: comment.newShortut,
              ranges: [
                new ActionRange(startsRange, null)
              ],
              leftover: {
                pause: null,
                resume: null,
                end: leftover
              },
              finished: false,
              functionPositions: {
                // save shortcut index for removal
                start: comment.action.index,
                pauseResume: [],
                end: null
              },
              actions: [],
              uuids: {
                groups: new Set(),
                vars: new Set()
              }
            };
            break;
          case "paste":
          case "insert":
            (function() {
              let i = current.insert[comment.isClipboard ? "clipboard" : "snippet"] = {
                name: comment.name,
                id: ++insertIdMax,
                removes: comment.removes,
                ranges: [],
                isClipboard: comment.isClipboard,
                leftover: {
                  pause: null,
                  resume: null,
                  end: leftover
                },
                functionPositions: {
                  start: comment.action.index,
                  end: null
                }
              };
              if (comment.removes) {
                i.ranges.push(new ActionRange(startsRange, null));
              } else {
                current.inserts.push(i);
                current.insert[comment.isClipboard ? "clipboard" : "snippet"] = i = null;
              }
            })();
            break;
          case "pause":
            (function casePause() {
              /* istanbul ignore if reason: we can't test this */
              if (current.snippet === true) {
                // we have a bug above. we should never get here
                throw new Error("Bug in detection of function === pause and current.snippet === true");
              }

              // current.snippet exists; already handled before the switch
              // current.snippet.ranges has at least one element from the start function
              const lastRange = current.snippet.ranges[current.snippet.ranges.length - 1];

              if (!lastRange.isComplete()) {
                // it doesn't have an end, add it (it will have a beginning in every case)
                lastRange.end = endsRange;
                if (!lastRange.isValid()) {
                  // end < start => doesn't contain any actions => isn't needed anymore, but leave it in there for
                  // possible leftovers
                  // current.snippet.ranges.pop();
                }

                // save leftover, overwriting possible old value
                if (leftover) { current.snippet.leftover.resume = leftover; }
              } else {
                // it has an end, so the snippet is already paused => error
                warnings.push({
                  action: comment.action.index,
                  commentText: comment.textForWarning,
                  shortcut: shortcutName,
                  type: current.snippet.isClipboard ? "pauseWhilePauseClipboard" : "pauseWhilePauseSnippet"
                });
                // set snippet to true to save that we had a snippet to still catch further errors but suppress them
                ignoreErrorsForSnippet = current.snippet = true;
                return;
              }

              current.snippet.functionPositions.pauseResume.push(comment.action.index);
            })();
            break;
          case "resume":
            (function caseResume() {
              /* istanbul ignore if reason: we can't test this */
              if (current.snippet === true) {
                // we have a bug above. we should never get here
                throw new Error("Bug in detection of function === resume and current.snippet === true");
              }

              // current.snippet exists; already handled before the switch
              // current.snippet.ranges has at least one element from the start function
              const lastRange = current.snippet.ranges[current.snippet.ranges.length - 1];

              if (lastRange.isComplete()) {
                current.snippet.ranges.push(new ActionRange(startsRange, null));

                // save leftover, overwriting possible old value
                if (leftover) { current.snippet.leftover.pause = leftover; }
              } else {
                warnings.push({
                  action: comment.action.index,
                  commentText: comment.textForWarning,
                  shortcut: shortcutName,
                  type: current.snippet.isClipboard ? "resumeWhileResumeClipboard" : "resumeWhileResumeSnippet"
                });
                // set snippet to true to save that we had a snippet to still catch further errors but suppress them
                ignoreErrorsForSnippet = current.snippet = true;
                return;
              }

              current.snippet.functionPositions.pauseResume.push(comment.action.index);
            })();
            break;
          case "end":
            (function() {
              if (comment.endsInsert) {
                const what = comment.isClipboard ? "clipboard" : "snippet";
                current.insert[what].ranges[0].end = endsRange;
                current.insert[what].functionPositions.end = comment.action.index;
                current.inserts.push(current.insert[what]);
                current.insert[what] = null;
              } else {
                /* istanbul ignore if reason: we can't test this */
                if (current.snippet === true) {
                  // we have a bug above. we should never get here
                  throw new Error("Bug in detection of function === end and current.snippet === true");
                }

                const lastRange = current.snippet.ranges[current.snippet.ranges.length - 1];
                if (!lastRange.isComplete()) {
                  // we are continued
                  lastRange.end = endsRange;
                } else {
                  // we are paused
                  // do not warn, just end it
                }
                current.snippet.finished = true;
                current.snippet.functionPositions.end = comment.action.index;
              }
            })();
            break;
        }
      }); // end comments.forEach()

      updatePercentage(basePercentageNames + percentagePerName * 0.5);

      if (current.snippet === true) current.snippet = null;
      if (current.snippet && !current.snippet.finished) {
        current.snippet.finished = evaluateLeftovers(current.snippet, modifiedActions.length - 1);
        if (!current.snippet.finished && !current.snippet.ranges[current.snippet.ranges.length - 1].isComplete()) {
          current.snippet.ranges[current.snippet.ranges.length - 1].end = modifiedActions.length - 1;
        }
      }
      if (current.insert.clipboard) {
        if (!evaluateLeftovers(current.insert.clipboard, modifiedActions.length - 1)) {
          current.insert.clipboard.ranges[0].end = modifiedActions.length - 1;
        }
        current.inserts.push(current.insert.clipboard);
        current.insert.clipboard = null;
      }
      if (current.insert.snippet) {
        if (!evaluateLeftovers(current.insert.snippet, modifiedActions.length - 1)) {
          current.insert.snippet.ranges[0].end = modifiedActions.length - 1;
        }
        current.inserts.push(current.insert.snippet);
        current.insert.snippet = null;
      }

      if (current.snippet) {
        const functionPositions = [current.snippet.functionPositions.start]
          .concat(current.snippet.functionPositions.pauseResume, [current.snippet.functionPositions.end]);

        /**
         * @type { {[key: string]: number[]} }
         */
        const blockUUIDS = {};

        // add all actions to the snippet and save not-block-actions for removal
        for (let i = 0; i < current.snippet.ranges.length; i++) {
          const range = current.snippet.ranges[i];
          if (range.isValid()) {
            for (let j = range.start; j <= range.end; j++) {
              const gi = modifiedActions[j].WFWorkflowActionParameters.GroupingIdentifier;
              // already save included blocks
              if (blockActionIds.includes(modifiedActions[j].WFWorkflowActionIdentifier)) {
                blockUUIDS[gi] = blockUUIDS[gi] || [];
                blockUUIDS[gi].push(modifiedActions[j].index);
              } else if (current.snippet.removes) {
                // is not a block action, save for removal
                addToActionsToRemove(actionsToRemove, modifiedActions[j].index);
              }
              current.snippet.actions.push(modifiedActions[j]);
              current.snippet.uuids.vars.add(modifiedActions[j].WFWorkflowActionParameters.UUID);
              current.snippet.uuids.groups.add(modifiedActions[j].WFWorkflowActionParameters.GroupingIdentifier);
            }
          } else {
            // just ignore the range
            // throw new Error("The range is not valid: " + JSON.stringify(range));
          }
        }

        // add missing block actions and save only the fully contained blocks for removal by removing all others
        const blocksToRemove = new Set(Object.keys(blockUUIDS));
        Object.keys(blockUUIDS).forEach((gi) => {
          const indices = blockUUIDS[gi];
          for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (block.WFWorkflowActionParameters.GroupingIdentifier === gi && !indices.includes(block.index)) {
              current.snippet.actions.push(block);
              // we do not need to add the grouping identifier again, becaus we've already included it
              current.snippet.uuids.vars.add(block.WFWorkflowActionParameters.UUID);
              if (current.snippet.removes) { blocksToRemove.delete(gi); }
            }
          }
        });
        current.snippet.actions.sort((a, b) => a.index - b.index);

        if (current.snippet.removes) {
          // add blocks for removal to actionsToRemove
          blocksToRemove.forEach((gi) => {
            blocks.forEach(
              /**
               * @param {BlockAction} a
               */
              (a) => {
                if (a.WFWorkflowActionParameters.GroupingIdentifier === gi) {
                  addToActionsToRemove(actionsToRemove, a.index);
                }
              });
          });
        }

        // add functionPositions to actionsToRemove depending on dict.cleanUp
        switch (dict.cleanUp) {
          case 0:
            // remove nothing
            break;
          case 1:
            // remove everything except the start, if the snippet removes actions
            if (current.snippet.removes) {
              current.snippet.functionPositions.pauseResume.forEach((a) => addToActionsToRemove(actionsToRemove, a));
              addToActionsToRemove(actionsToRemove, current.snippet.functionPositions.end);
            }
            break;
          case 2:
            // remove everything
            functionPositions.forEach((a) => addToActionsToRemove(actionsToRemove, a));
            break;
        }

        current.snippet.uuids = uuidsToPlainObject(current.snippet.uuids);
        current.snippet.numberOfActions = current.snippet.actions.length;

        snippets.push(current.snippet);
      }

      current.inserts.forEach((insert) => {
        if (insert.removes) {
          /**
           * @type { {[key: string]: number[]} }
           */
          const blockUUIDS = {};

          insert.ranges.forEach((range) => {
            if (range.isValid()) {
              for (let j = range.start; j <= range.end; j++) {
                const gi = modifiedActions[j].WFWorkflowActionParameters.GroupingIdentifier;
                // already save included blocks
                if (blockActionIds.includes(modifiedActions[j].WFWorkflowActionIdentifier)) {
                  blockUUIDS[gi] = blockUUIDS[gi] || [];
                  blockUUIDS[gi].push(modifiedActions[j].index);
                } else {
                  // is not a block action, save for removal
                  addToActionsToRemove(actionsToRemove, modifiedActions[j].index, insert.id);
                }
              }
            } else {
              // just ignore the range
              // throw new Error("The range is not valid: " + JSON.stringify(range));
            }
          });

          // add missing block actions and save only the fully contained blocks for removal by removing all others
          const blocksToRemove = new Set(Object.keys(blockUUIDS));
          Object.keys(blockUUIDS).forEach((gi) => {
            const indices = blockUUIDS[gi];
            for (let i = 0; i < blocks.length; i++) {
              const block = blocks[i];
              if (block.WFWorkflowActionParameters.GroupingIdentifier === gi && !indices.includes(block.index)) {
                blocksToRemove.delete(gi);
              }
            }
          });

          // add blocks for removal to actionsToRemove
          blocksToRemove.forEach((gi) => {
            blocks.forEach(
              /**
               * @param {BlockAction} a
               */
              (a) => {
                if (a.WFWorkflowActionParameters.GroupingIdentifier === gi) {
                  addToActionsToRemove(actionsToRemove, a.index, insert.id);
                }
              });
          });
        }

        switch (dict.cleanUp) {
          case 0:
            // do nothing
            break;
          case 1:
            if (insert.removes) { addToActionsToRemove(actionsToRemove, insert.functionPositions.end, insert.id); }
            break;
          case 2:
            addToActionsToRemove(actionsToRemove, insert.functionPositions.start, insert.id);
            addToActionsToRemove(actionsToRemove, insert.functionPositions.end, insert.id);
            break;
        }

        inserts.push(insert);
      }); // end current.inserts.forEach()
    }); // end names.forEach()

    updatePercentage(basePercentage + percentPerShortcut * 0.9);

    // clean actions again from their indices
    actions.forEach((a) => {
      delete a.index;
      delete a.modifiedIndex;
    });

    // convert actions to bplist
    snippets.forEach((snippet) => {
      snippet.actions = bplist.create({ WFWorkflowActions: snippet.actions }).toString("base64");
      delete snippet.finished;
      delete snippet.functionPositions;
      delete snippet.leftover;
      delete snippet.removes;
      delete snippet.ranges;
    });

    inserts.forEach((insert) => {
      insert.position = insert.functionPositions.start;
      delete insert.functionPositions;
      delete insert.leftover;
      delete insert.ranges;
      delete insert.removes;
    });

    actionsToRemove.sort((a, b) => a.action - b.action);

    result.push({
      snippets: snippets,
      inserts: inserts,
      uuids: uuidsToPlainObject(uuids),
      actionsToRemove: actionsToRemove,
      name: shortcutName
    });
  }); // end shortcuts.forEach()

  const map = new Map(allUsedNewShortcutNames.map((i) => { return [i, { name: i, used: 0 }]; }));
  result.forEach((shortcut) => {
    shortcut.snippets && Object.values(shortcut.snippets).forEach((snippet) => {
      if (!snippet.newShortcut) return;
      const num = map.get(snippet.newShortcut).used++;
      if (num > 0) {
        snippet.newShortcut += " " + num;
      }
    });
  });

  return {
    shortcuts: result,
    warnings: warnings,
    nItems: result.reduce((acc, val) => acc + Object.keys(val.snippets).length + Object.keys(val.inserts).length, 0)
  };
};

/**
 * @param {uuidCollection} o
 */
function uuidsToPlainObject(o) {
  o.groups.delete(undefined);
  o.groups.delete(null);
  o.groups.delete(NaN);
  o.vars.delete(undefined);
  o.vars.delete(null);
  o.vars.delete(NaN);
  return {
    groups: Array.from(o.groups),
    vars: Array.from(o.vars)
  };
}

/**
 *
 * @param {ActionToRemove[]} actionsToRemove
 * @param {number} index
 * @param {number} id
 */
function addToActionsToRemove(actionsToRemove, index, id) {
  if (typeof index !== "number") return;
  let atr = actionsToRemove.find((a) => a.action === index);
  if (!atr) {
    actionsToRemove.push(atr = { action: index, excludedBy: [] });
  }
  atr.excludedBy.push(typeof id === "number" ? id : -1);
  atr.excludedBy.sort();
}

/**
 *
 * @param {Snippet | Insert} snippetOrInsert Snippet or Insert to process
 * @param {number} modifiedIndex Current modifiedIndex
 * @returns True, if the current snippet/insert has reached its end
 */
function evaluateLeftovers(snippetOrInsert, modifiedIndex) {
  // gedankenstütze:
  // 0 0 1 2 2 3 4 5 5 6
  // C A A C A A A C A A
  // 0  0 1 1 2  2 3
  // S3 A P A R1 A A  (S = start, P = pause, r = resume)

  if (!snippetOrInsert) { return false; }

  const inFuture = {
    resume: false,
    pause: false,
    end: false
  };
  let doneSomething = true;
  const leftover = snippetOrInsert.leftover;
  // loop as long as there is a leftover and it doesn't end in the future (= was processed) and something was done
  while (
    ((leftover.end != null && !inFuture.end) ||
      (leftover.pause != null && !inFuture.pause) ||
      (leftover.resume != null && !inFuture.resume)) &&
    doneSomething
  ) {
    doneSomething = false;
    const lastRange = snippetOrInsert.ranges[snippetOrInsert.ranges.length - 1];
    if (lastRange.isComplete()) {
      // we are paused
      if (leftover.resume != null && !inFuture.resume) {
        doneSomething = true;
        // add 1 because we want to start a new range and the range end was inclusive
        const newStart = lastRange.end + leftover.resume + 1;
        if (newStart > modifiedIndex) {
          // we've not resumed => save remaining leftover. No need to add anything because the range start is
          // inclusive
          leftover.resume = newStart - modifiedIndex;
          inFuture.resume = true;
        } else {
          // two possibilities:
          //     we've just resumed, but not added any action => add new range (newStart == modifiedIndex)
          //     we've already resumed earlier => add new Range at that point (newStart < modifiedIndex)
          snippetOrInsert.ranges.push(new ActionRange(newStart, null));
          leftover.resume = null;
        }
      }
    } else {
      // we are continued
      if (leftover.pause != null && !inFuture.pause) {
        doneSomething = true;
        // subtract 1 because the range end is inclusive
        const newPause = lastRange.start + leftover.pause - 1;
        if (newPause >= modifiedIndex) {
          // two possibilities:
          //     it hasn't paused yet => save remaining leftover
          //     we've just paused at the current action
          //      (meaning the next shortcut action should be included, but not this current comment,
          //      as they have the same index)
          //      => do not pause yet
          // add 1 because if they equal we still have to include one action (that is also true for more)
          leftover.end = newPause - modifiedIndex + 1;
          inFuture.pause = true;
        } else {
          // we've already paused earlier => finish lastRange
          lastRange.end = newPause;
          leftover.pause = null;
        }
      }
      // still evaluate the end leftover if we already evaluated the pause leftover to count down the end correctly
      if (leftover.end != null && !inFuture.end) {
        doneSomething = true;
        // subtract 1 because the range end is inclusive
        const newEnd = lastRange.start + leftover.end - 1;
        if (lastRange.isComplete()) {
          // we are paused again since at least one action
          // if they equal then it ended at the same position
          if (newEnd > lastRange.end) {
            // there is still at least one action left
            // dont add one, because
            leftover.end = newEnd - lastRange.end;
          } else {
            // we've ended earlier than the pause began => adjust range
            lastRange.end = newEnd;
            leftover.end = null;
            return true;
          }
        } else if (newEnd >= modifiedIndex) {
          // two possibilities:
          //     it hasn't ended yet => save remaining leftover
          //     we've just ended at the current action
          //      (meaning the next shortcut action should be included, but not this current comment,
          //      as they have the same index)
          //      => do not end yet
          // add 1 because if they equal we still have to include one action (that is also true for more)
          leftover.end = newEnd - modifiedIndex + 1;
          inFuture.end = true;
        } else {
          // we've already ended earlier => finish lastRange
          lastRange.end = newEnd;
          leftover.end = null;
          return true;
        }
      }
    }
  }

  return false;
}

/* istanbul ignore next reason: don't test this wrapper for Web Workers */
try {
  self.addEventListener("message", (event) => {
    const result = analyse(event.data);
    self.postMessage({ finished: true, data: result });
  });
} catch (err) {
  module.exports = analyse;
}

/**
 * Notifies the parent of this Web Worker of a percentage update
 * @param {number} percent Number between 0 and 100
 */
/* istanbul ignore next reason: don't test communication with Web Worker parent */
function updatePercentage(percent) {
  try {
    self.postMessage(percent);
  } catch (err) {
    // nothing
  }
}
