const https = require("https");
const fs = require("fs");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
});

const url = "https://www.routinehub.co/api/v1/shortcuts/7742/versions/latest";

https.get(url, (res) => {
  res.setEncoding("utf8");
  let body = "";
  res.on("data", (data) => {
    body += data;
  });
  res.on("end", () => {
    const json = JSON.parse(body, (key, value) => {
      if (typeof value === "string") {
        return value.replace(/\r\n|\r/g, "\n");
      } else {
        return value;
      }
    });

    json.NotesHTML = md.render(fs.readFileSync("futureChangelog.md", "utf-8"));
    fs.writeFileSync("version.json", JSON.stringify(json, null, 2) + "\n", {
      encoding: "utf-8",
    });

    const version = json.Version;
    for (const file of [
      "package.json",
      "package-lock.json",
      "src/assets/preferences.json",
    ]) {
      const pack = JSON.parse(fs.readFileSync(file, "utf-8"));
      if (file.includes("preferences.json")) {
        pack.Version = version;
      } else {
        pack.version = version;
      }
      fs.writeFileSync(file, JSON.stringify(pack, null, 2) + "\n", {
        encoding: "utf-8",
      });
    }

    console.log("Updated to version " + version);
  });
});
