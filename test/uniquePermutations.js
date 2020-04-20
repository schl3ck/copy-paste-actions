class UniqueElement {
  constructor(value, occurrences) {
    this.value = value;
    this.occurrences = occurrences;
  }
}

/**
 * @param {T[]} elements
 * @returns {Generator<T[], T[], T[]>}
 */
function uniquePermutations(elements) {
  const set = new Set(elements);
  const listunique = Array.from(set).map((i) => new UniqueElement(i, elements.filter((el) => el === i).length));
  const u = elements.length;
  return uniquePermutationsHelper(listunique, "0".repeat(u).split("").map((i) => parseInt(i)), u - 1);
}
function * uniquePermutationsHelper(listunique, resultList, d) {
  if (d < 0) {
    yield [...resultList];
  } else {
    for (const i of listunique) {
      if (i.occurrences > 0) {
        resultList[d] = i.value;
        i.occurrences--;
        for (const g of uniquePermutationsHelper(listunique, resultList, d - 1)) yield g;
        i.occurrences++;
      }
    }
  }
}

/**
 * @param {T[]} elements
 * @returns {Generator<T[], T[], T[]>}
 */
function uniquePermutationPatterns(elements) {
  const len = elements.length;
  const unique = new Map(elements.map(el => [el, { value: el, occurrences: 0 }]));
  let max = 0;
  for (const el of elements) {
    const o = unique.get(el);
    max = Math.max(max, ++o.occurrences);
  }
  const byOccurrences = Array.from({ length: max + 1 }, () => ({ elements: [], used: 0 }));
  for (const o of unique.values()) {
    byOccurrences[o.occurrences].elements.push(o);
  }

  function * generate(list, depth) {
    if (depth === len) {
      yield list.slice();
    } else {
      for (const options of byOccurrences) {
        options.used++;
        for (const option of options.elements.slice(0, options.used)) {
          if (option.occurrences === 0) continue;
          option.occurrences--;
          list[depth] = option.value;
          yield * generate(list, depth + 1);
          option.occurrences++;
        }
        options.used--;
      }
    }
  }
  return generate([], 0);
}

/**
 * Combined permutations from `uniquePermutations` and `uniquePermutationPatterns`
 * @param {object} elements The elements that should be permuted
 * @param {T[]} elements.pattern The elements that should be permuted, but patterns are respected
 * @param {T[]} elements.unique The elements that should be permuted, without respecting patterns
 * @returns {Generator<T[], T[], T[]>}
 */
function * combinedPermutations(elements) {
  const placeholder = {};
  const placeholderArray = Array.from({ length: elements.pattern.length }, () => placeholder);
  const cache = [];
  let cacheFull = false;
  for (const pattern of uniquePermutationPatterns(elements.pattern)) {
    const f = cacheFull ? cache : uniquePermutations([...elements.unique, ...placeholderArray]);
    for (const unique of f) {
      let index = 0;
      !cacheFull && cache.push(unique);
      yield unique.map((i) => i === placeholder ? pattern[index++] : i);
    }
    cacheFull = true;
  }
}

module.exports = {
  uniquePermutations,
  uniquePermutationPatterns,
  combinedPermutations
};
