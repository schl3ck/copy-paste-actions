/* eslint-env node */
const bplistParser = require("bplist-parser");
const bplistCreator = require("bplist-creator");

// Expose bplist parser
exports.maxObjectSize = bplistParser.maxObjectSize;
exports.parse = bplistParser.parseBuffer;

// Expose bplist creator
exports.create = bplistCreator;
