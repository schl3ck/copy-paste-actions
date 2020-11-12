/**
 * Returns the total height of an element including its padding, border and
 * margin
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
  const len = Math.min(...arrays.map((a) => a.length));
  for (let i = 0; i < len; i++) {
    yield arrays.map((a) => a[i]);
  }
}

const htmlEscapeMap = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
};
/**
 * HTML escapes the text
 * @param {string} text
 */
export function escapeHTML(text) {
  return text.replace(/[<>"&]/g, (match) => htmlEscapeMap[match]);
}
/**
 * HTML escapes the text and converts every `\n` to `<br>`
 * @param {string} text
 */
export function nl2br(text) {
  return escapeHTML(text).replace(/\n/g, "<br>");
}

/**
 * source: https://stackoverflow.com/a/30810322/10362619, adapted
 * @param {string} text
 */
export function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let successful = false;
  try {
    successful = document.execCommand("copy");
  } catch (err) {}

  document.body.removeChild(textArea);
  return successful;
}

/**
 * source: https://stackoverflow.com/a/30810322/10362619
 * @param {string} text
 */
export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    return fallbackCopyTextToClipboard(text);
  }
  return navigator.clipboard.writeText(text).then(
    function() {
      return true;
    },
    function() {
      return false;
    },
  );
}

/**
 * Joins an array in a human readable format like "1, 2, 3 and 4"
 * @param {any[]} array
 * @param {string} separator
 * @param {string} separatorLast
 */
export function joinReadable(array, separator, separatorLast) {
  if (array.length < 3) {
    return array.join(separatorLast);
  } else {
    const ar = Array.from(array);
    const last = ar.pop();

    return [ar.join(separator), last].join(separatorLast);
  }
}
