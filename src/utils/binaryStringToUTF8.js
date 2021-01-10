/* eslint-env node */
//* eslint-disable max-len */
/**
 * Converts a Uint8Array, which holds UTF-8 encoded text, into the correct
 * string
 *
 * Source: https://weblog.rogueamoeba.com/2017/02/27/javascript-correctly-converting-a-byte-array-to-a-utf-8-string/
 * modified
 * @param {Uint8Array | number[]} data The input to convert
 */
/* eslint-enable max-len */
exports.stringFromUTF8Array = function stringFromUTF8Array(data) {
  const extraByteMap = [1, 1, 1, 1, 2, 2, 3, 0];
  const count = data.length;
  let str = "";

  for (let index = 0; index < count;) {
    let ch = data[index++];
    if (ch & 0x80) {
      let extra = extraByteMap[(ch >> 3) & 0x07];
      if (!(ch & 0x40) || !extra || index + extra > count) {
        return null;
      }

      ch = ch & (0x3f >> extra);
      for (; extra > 0; extra -= 1) {
        const chx = data[index++];
        if ((chx & 0xc0) !== 0x80) {
          return null;
        }

        ch = (ch << 6) | (chx & 0x3f);
      }
    }

    str += String.fromCodePoint(ch);
  }

  return str;
};

/**
 * Converts a binary string to a string that was interpeted as UTF-8 text
 * @param {string} string
 */
exports.stringFromBinaryString = function stringFromBinaryString(string) {
  const data = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    data[i] = string.charCodeAt(i);
  }
  return exports.stringFromUTF8Array(data);
};
