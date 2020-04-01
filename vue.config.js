module.exports = {
  lintOnSave: false,
  css: {
    extract: false
  },
  chainWebpack(config) {
    config.plugins.delete("preload");
    config.plugins.delete("prefetch");

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
    }
  }
};
