const fs = require("fs");
const path = require("path");

const result = {
  available: {},
};
const srcDir = "src/lang";
const distDir = "dist";

for (const file of fs.readdirSync(path.resolve(srcDir), {
  withFileTypes: true,
})) {
  if (file.isFile() && file.name.endsWith(".json")) {
    const content = JSON.parse(
      fs.readFileSync(path.resolve(srcDir, file.name), "utf-8"),
    );
    const langCode = file.name.replace(/\.json$/, "");
    result.available[content.language] = langCode;
    result[langCode] = content;
  }
}

if (!fs.existsSync(path.resolve(distDir))) {
  fs.mkdirSync(path.resolve(distDir));
}
fs.writeFileSync(
  path.resolve(distDir, "language.json"),
  JSON.stringify(result, null, 2),
);

console.log("\x1b[42;30m DONE \x1b[0m\n");
