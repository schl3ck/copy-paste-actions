module.exports = {
  lintOnSave: "default",
  productionSourceMap: false,
  css: {
    extract: false
  },
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    bonjour: true,
    disableHostCheck: true
  },
  chainWebpack(config) {
    if (process.env.BUILD_MODE === "targz") {
      config.entry("app").clear().add("./src/targz-entry.js");
    }

    config.plugins.delete("preload");
    config.plugins.delete("prefetch");

    config.module.rule("text")
      .test(/\.txt$/i)
      .use("raw-loader")
      .loader("raw-loader");

    config.module.rule("worker")
      .test(/\.worker\.js$/i)
      .use("worker-loader")
      .loader("worker-loader")
      .tap(options => {
        options = options || {};
        options.inline = "no-fallback";
        return options;
      })
      .end()
      .use("babel-loader")
      .loader("babel-loader");
    config.module.rule("js")
      .exclude.add(/\.worker\.js/);

    config.module.rule("url")
      .test(/\.(png|jpg|ico|gif)$/i)
      .use("url-loader")
      .loader("url-loader")
      .tap(options => {
        options = options || {};
        options.limit = 1024 * 1024 * 10; // 10 MB
        return options;
      });

    if (config.plugins.has("copy")) {
      config.plugin("copy")
        .tap(args => {
          const options = args[0][0] || {};
          options.ignore = options.ignore || [];
          options.ignore.push("favicon.png");
          return args;
        });
    }

    if (process.env.NODE_ENV === "production") {
      config.plugin("html")
        .tap(args => {
          const options = args[0] = args[0] || {};
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
  }
};
