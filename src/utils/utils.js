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
