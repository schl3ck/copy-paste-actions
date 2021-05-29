/* eslint-env node */
const fs = require("fs");
const ExtraWatchWebpackPlugin = require("extra-watch-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = {
  lintOnSave: "default",
  productionSourceMap: false,
  css: {
    extract: false,
  },
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    bonjour: true,
    disableHostCheck: true,
  },
  chainWebpack(config) {
    if (process.env.BUILD_MODE === "targz") {
      config
        .entry("app")
        .clear()
        .add("./src/targz-entry.js");
    }

    config.plugins.delete("preload");
    config.plugins.delete("prefetch");

    config.plugin("extra-watch").use(ExtraWatchWebpackPlugin, [
      {
        dirs: ["src/lang/"],
      },
    ]);

    config.plugin("bundle-analyzer").use(BundleAnalyzerPlugin, [
      {
        analyzerMode: "static",
        openAnalyzer: false, // process.env.NODE_ENV === "production",
        generateStatsFile: false,
      },
    ]);

    config.module
      .rule("images")
      .use("url-loader")
      .tap((options) => {
        options.limit = undefined;
        return options;
      });

    config.module
      .rule("text")
      .test(/\.txt$/i)
      .use("raw-loader")
      .loader("raw-loader");

    config.module
      .rule("worker")
      .test(/\.worker\.js$/i)
      .use("worker-loader")
      .loader("worker-loader")
      .tap((options) => {
        options = options || {};
        options.inline = "no-fallback";
        return options;
      })
      .end()
      .use("babel-loader")
      .loader("babel-loader");
    config.module.rule("js").exclude.add(/\.worker\.js/);

    if (config.plugins.has("copy")) {
      config.plugin("copy").tap((args) => {
        const options = args[0][0] || {};
        options.ignore = options.ignore || [];
        options.ignore.push("favicon.png");
        return args;
      });
    }

    if (fs.existsSync("./remoteConsoleUrl.local")) {
      config.plugin("html").tap((args) => {
        const options = (args[0] = args[0] || {});
        options.REMOTE_CONSOLE_SCRIPT = fs
          .readFileSync("./src/remoteConsole.js", "utf-8")
          .replace(
            /\bREMOTE_CONSOLE_URL\b/g,
            fs.readFileSync("./remoteConsoleUrl.local", "utf-8").trim(),
          );
        return args;
      });
    }
    if (process.env.NODE_ENV === "production") {
      config.plugin("html").tap((args) => {
        const options = (args[0] = args[0] || {});
        options.inject = false;
        options.minify = options.minify || {};
        options.minify.collapseWhitespace = false;
        options.minify.removeComments = false;
        if (process.env.BUILD_MODE === "targz") {
          options.filename = "targz.html";
        }
        options.BUILD_MODE = process.env.BUILD_MODE;
        return args;
      });

      config.resolve.alias
        .set("bootstrap.css$", "bootstrap/dist/css/bootstrap.min.css")
        .set("bootstrap.reboot$", "bootstrap/dist/css/bootstrap-reboot.min.css")
        .set("bootstrap.js$", "bootstrap/dist/js/bootstrap.bundle.min.js");
    } else {
      config.resolve.alias
        .set("bootstrap.css$", "bootstrap/dist/css/bootstrap.css")
        .set("bootstrap.reboot$", "bootstrap/dist/css/bootstrap-reboot.css")
        .set("bootstrap.js$", "bootstrap/dist/js/bootstrap.bundle.js");
    }
  },
};
