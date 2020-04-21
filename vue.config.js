module.exports = {
  lintOnSave: "default",
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
        options.inline = true;
        return options;
      });

    if (process.env.NODE_ENV === "production") {
      config.plugin("html")
        .tap((args) => {
          return {
            ...args,
            inlineSource: "\\..+$" // inline everything
          };
        });
      config.plugin("inline-source")
        .use(require.resolve("html-webpack-inline-source-plugin"))
        .after("html");

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
