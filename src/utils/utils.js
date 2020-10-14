/**
 * Returns the total height of an element including its padding, border and margin
 * @param {HTMLElement} element
 * @returns {number}
 */
export function getFullHeight(element) {
  let height = element.getBoundingClientRect().height;
  const style = window.getComputedStyle(element);

  // height: element height + vertical padding & borders
  // now we just need to add vertical margins
  height = ["top", "bottom"]
    .map(function(side) {
      return parseInt(style["margin-" + side], 10);
    })
    .reduce(function(total, side) {
      return total + side;
    }, height);

  return height;
}

/**
 * Zips multiple arrays for iteration
 * @param  {...Array} arrays
 */
export function * zip(...arrays) {
  const len = Math.min(...arrays.map(a => a.length));
  for (let i = 0; i < len; i++) {
    yield arrays.map(a => a[i]);
  }
}

const htmlEscapeMap = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;"
};
/**
 * HTML escapes the text and converts every `\n` to `<br>`
 * @param {string} text
 */
export function nl2br(text) {
  return text
    .replace(/[<>"&]/g, (match) => htmlEscapeMap[match])
    .replace(/\n/g, "<br>");
}
