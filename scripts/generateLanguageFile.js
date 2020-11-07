const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt({
  breaks: true,
}).use(require("markdown-it-anchor"), {
  level: 1,
  permalink: false,
});

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
for (const folder of fs.readdirSync(path.resolve(srcDir), {
  withFileTypes: true,
})) {
  if (folder.isDirectory()) {
    const basePath = path.join(srcDir, folder.name);
    for (const file of fs.readdirSync(path.resolve(basePath), {
      withFileTypes: true,
    })) {
      if (file.isFile() && file.name.endsWith(".md")) {
        const content = fs.readFileSync(
          path.resolve(basePath, file.name),
          "utf-8",
        );
        const langCode = file.name.replace(/\.md$/, "");
        result[langCode][folder.name] = {
          html: md.render(content),
        };
      }
    }
  }
}

if (process.env.NODE_ENV === "development") {
  module.exports = result.en;
} else {
  if (!fs.existsSync(path.resolve(distDir))) {
    fs.mkdirSync(path.resolve(distDir));
  }
  fs.writeFileSync(
    path.resolve(distDir, "language.json"),
    JSON.stringify(result, null, 2),
  );
  console.log("\x1b[42;30m DONE \x1b[0m\n");
}
