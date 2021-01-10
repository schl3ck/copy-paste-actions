const https = require("https");
const fs = require("fs");

const url = "https://www.routinehub.co/api/v1/shortcuts/7742/versions/latest";

https.get(url, (res) => {
  res.setEncoding("utf8");
  let body = "";
  res.on("data", (data) => {
    body += data;
  });
  res.on("end", () => {
    body = JSON.parse(body, (key, value) => {
      if (typeof value === "string") {
        return value.replace(/\r\n|\r/g, "\n");
      } else {
        return value;
      }
    });
    const version = body.Version;
    fs.writeFileSync("version.json", JSON.stringify(body, null, 2) + "\n", {
      encoding: "utf-8",
    });
    let pack = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    pack.version = version;
    fs.writeFileSync("package.json", JSON.stringify(pack, null, 2) + "\n", {
      encoding: "utf-8",
    });
    pack = JSON.parse(fs.readFileSync("package-lock.json", "utf-8"));
    pack.version = version;
    fs.writeFileSync(
      "package-lock.json",
      JSON.stringify(pack, null, 2) + "\n",
      {
        encoding: "utf-8",
      },
    );
    const prefs = JSON.parse(
      fs.readFileSync("src/assets/preferences.json", "utf-8"),
    );
    prefs.Version = version;
    fs.writeFileSync(
      "src/assets/preferences.json",
      JSON.stringify(prefs, null, 2) + "\n",
      { encoding: "utf-8" },
    );

    console.log("Updated to version " + version);
  });
});