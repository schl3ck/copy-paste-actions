const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");
let MarkdownItAnchor = require("markdown-it-anchor");
if (typeof MarkdownItAnchor !== "function" && "default" in MarkdownItAnchor) {
  MarkdownItAnchor = MarkdownItAnchor.default;
}
const md = new MarkdownIt({
  breaks: true,
  linkify: true,
})
  .use(MarkdownItAnchor, {
    level: 1,
    permalink: false,
  })
  .use(require("markdown-it-attrs"), {
    allowedAttributes: ["class", "data-page", "data-pref"],
  })
  .use(require("markdown-it-container"), "heads-up", {
    render: function(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<div class="alert alert-info">\n';
      } else {
        // closing tag
        return "</div>\n";
      }
    },
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
      function(key, value) {
        if (typeof value === "string") {
          return md.renderInline(value);
        } else {
          return value;
        }
      },
    );
    const langCode = file.name.replace(/\.json$/, "");
    result.available[content.language] = langCode;
    result[langCode] = content;
  }
}
/** @type {string[]} */
const folders = [];
for (const folder of fs.readdirSync(path.resolve(srcDir), {
  withFileTypes: true,
})) {
  if (folder.isDirectory()) {
    folders.push(folder.name);
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

// default to english if the markdown file doesn't exist
for (const [langCode, lang] of Object.entries(result)) {
  if (langCode === "available") continue;

  for (const folder of folders) {
    if (!(folder in lang)) {
      lang[folder] = result.en[folder];
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
  // eslint-disable-next-line no-console
  console.log("\x1b[42;30m DONE \x1b[0m\n");
}
