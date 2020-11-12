const exec = require("child_process").execSync;

let staged = exec("git diff --staged --name-only", {
  stdio: "pipe",
  encoding: "utf-8",
});
if (staged.length > 0) {
  staged = staged.replace(/\n/g, " ");
  exec(`./node_modules/.bin/prettier-eslint --write ${staged}`, {
    stdio: "inherit",
  });
  exec(`git add ${staged}`, { stdio: "inherit" });
}
