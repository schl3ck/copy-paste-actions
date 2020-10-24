/**
 * @typedef {object} Action
 * @property {object} [WFWorkflowActionParameters]
 * @property {string} [WFWorkflowActionParameters.UUID]
 * @property {string} [WFWorkflowActionParameters.GroupingIdentifier]
 */

/**
 * @param {Action|Action[]} actions
 * @returns { {groups: string[], vars: string[]} }
 */
exports.extractUUIDs = function(actions) {
  if (!Array.isArray(actions)) actions = [actions];
  const uuids = {
    groups: new Set(),
    vars: new Set(),
  };
  actions.forEach((action) => {
    if (!action || !action.WFWorkflowActionParameters) {
      return;
    }
    const u = action.WFWorkflowActionParameters.UUID;
    const g = action.WFWorkflowActionParameters.GroupingIdentifier;
    if (u) uuids.vars.add(u);
    if (g) uuids.groups.add(g);
  });
  uuids.groups = Array.from(uuids.groups);
  uuids.vars = Array.from(uuids.vars);
  return uuids;
};

/**
 * @param {number[]|number[][]} snippets
 * @param {number[]|number[][]} inserts
 * @returns { {action: number, excludedBy: number[]}[] }
 */
exports.constructActionsToRemove = function(snippets, inserts) {
  const res = [];
  function addAction(index, id) {
    const i = res.find((r) => r.action === index);
    if (i) {
      i.excludedBy.push(id);
    } else {
      res.push({
        action: index,
        excludedBy: [id],
      });
    }
  }
  snippets
    && snippets.forEach((snippet) => {
      if (Array.isArray(snippet)) {
        snippet.forEach((s) => addAction(s, -1));
      } else {
        addAction(snippet, -1);
      }
    });
  inserts
    && inserts.forEach((insert, index) => {
      if (Array.isArray(insert)) {
        insert.forEach((i) => addAction(i, index));
      } else {
        addAction(insert, 0);
      }
    });
  res.sort((a, b) => a.action - b.action);
  return res;
};
