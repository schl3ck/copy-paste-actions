/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const Mocha = require("mocha");
const inquirer = require("inquirer");

const args = process.argv.slice(2);
const dir = "test";

const all = args[0] === "--all" || args[0] === "-a";
// remove all elements
if (all) args.splice(0, args.length);

let files = fs.readdirSync(dir).filter((f) => /\.test\.js$/.test(f));
if (args && args.length) { files = files.filter((f) => f.trim().startsWith(args[0])); }

let prom;
if (files.length > 1 && !all) {
  console.log(`
Usage:
npm test [-- [<filename> | -a | --all]]

No arguments  presents this prompt
--all, -a     run all test files
<filename>    run only the test files that start with this
`);
  prom = inquirer
    .prompt([
      {
        type: "list",
        name: "file",
        message: "Choose the file to test",
        choices: files
      }
    ]);
} else if (all) {
  console.log("\nExecuting all tests:\n\t" + files.join("\n\t"));
  prom = Promise.resolve({ files });
} else {
  console.log("\nFound only one file. Executing: " + files[0] + "\n");
  prom = Promise.resolve({ file: files[0] });
}
prom
  .then((answer) => {
    const mocha = new Mocha({
      bail: true,
      reporter: "progress",
      timeout: 60000
    });
    if (answer.file) {
      mocha.addFile(path.join(dir, answer.file));
    } else if (answer.files) {
      for (const file of answer.files) {
        mocha.addFile(path.join(dir, file));
      }
    } else {
      console.error("\nERROR: no files given to test!");
      process.exit(1);
    }
    mocha.run(function(failiures) {
      process.exitCode = failiures ? 1 : 0;
    });
  });
