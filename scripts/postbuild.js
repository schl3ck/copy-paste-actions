const fs = require("fs");
const { resolve } = require("path");

// split index.html
const parts = fs.readFileSync(resolve("dist/index.html"), { encoding: "utf-8" }).split("<!-- split here -->", 2);

fs.writeFileSync(resolve("dist/index.header.html"), parts[0]);
fs.writeFileSync(resolve("dist/index.app.html"), parts[1]);

// remove generated js, because it was inlined
fs.rmdirSync(resolve("dist/js"), { recursive: true });
