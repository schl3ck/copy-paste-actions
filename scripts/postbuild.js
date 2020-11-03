const fs = require("fs");
const { resolve } = require("path");
const glob = require("glob");

// split index.html
for (const file of ["index", "targz"]) {
  if (!fs.existsSync(resolve(`dist/${file}.html`))) continue;
  const parts = fs
    .readFileSync(resolve(`dist/${file}.html`), { encoding: "utf-8" })
    .split("<!-- split here -->", 2);

  fs.writeFileSync(resolve(`dist/${file}.header.txt`), parts[0]);
  fs.writeFileSync(resolve(`dist/${file}.app.txt`), parts[1]);
}
// remove generated js, because it was inlined
for (const file of glob.sync(resolve("dist/**/*.{js,map}"))) {
  fs.unlinkSync(file);
}
try {
  fs.rmdirSync(resolve("dist/js"), { recursive: true });
} catch (err) {}

console.log("\x1b[42;30m DONE \x1b[0m Deleted all unnecessary files");
