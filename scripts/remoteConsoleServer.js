"use strict";
const { networkInterfaces } = require("os");
const express = require("express");
const app = express();
const port = 8081;

const levelToColor = {
  debug: "\x1b[47;30m DEBUG \x1b[0m",
  info: "\x1b[104;30m INFO \x1b[0m",
  log: "\x1b[102;30m LOG \x1b[0m",
  warn: "\x1b[103;30m WARN \x1b[0m",
  error: "\x1b[41;30m ERROR \x1b[0m"
};

app.use(express.json());

function setCORS(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "OPTIONS, POST");
  res.header("Access-Control-Allow-Headers", "*");
}

app.options("/console", (req, res) => {
  setCORS(res);
  res.sendStatus(204);
});
app.post("/console", (req, res) => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const timestamp = `${now.getFullYear().toString().padStart(4, "0")
  }-${now.getMonth().toString().padStart(2, "0")
  }-${now.getDate().toString().padStart(2, "0")
  }T${now.getHours().toString().padStart(2, "0")
  }:${now.getMinutes().toString().padStart(2, "0")
  }:${now.getSeconds().toString().padStart(2, "0")
  }${(offset > 0 ? "-" : "+") +
    Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0") +
    (Math.abs(offset) % 60).toString().padStart(2, "0")
  }`;
  /** @type { {level: string, callee: string, params: any[]} } */
  const data = req.body;
  console[data.level](timestamp, levelToColor[data.level], ...data.params, "at " + data.callee);
  setCORS(res);
  res.sendStatus(204);
});

app.listen(port, () => {
  const ips = getIP();
  // you may need to change the ips.Ethernet[0] to something that exists on your system
  console.log(`Listening on\n    http://localhost:${port}/console\n    http://${ips.Ethernet[0]}:${port}/console\n`);
});

// source https://stackoverflow.com/a/8440736/10362619
function getIP() {
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }

        results[name].push(net.address);
      }
    }
  }
  return results;
}
