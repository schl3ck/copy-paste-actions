const fs = require("fs");
const { resolve } = require("path");
const glob = require("glob");

// split index.html
const parts = fs.readFileSync(resolve("dist/index.html"), { encoding: "utf-8" }).split("<!-- split here -->", 2);

fs.writeFileSync(resolve("dist/index.header.txt"), parts[0]);
fs.writeFileSync(resolve("dist/index.app.txt"), parts[1]);

// remove generated js, because it was inlined
for (const file of glob.sync(resolve("dist/**/*.{js,map}"))) {
  fs.unlinkSync(file);
}
try {
  fs.rmdirSync(resolve("dist/js"), { recursive: true });
} catch (err) { }

console.log("\x1b[1;42;37m DONE \x1b[0m Deleted all unnecessary files");
