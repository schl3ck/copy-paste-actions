/* eslint-env node */

module.exports = {
  root: true,
  globals: {
    process: "readonly",
    Buffer: "readonly",
  },
  env: {
    browser: true,
    es2020: true,
    worker: true,
    node: false,
  },
  extends: ["plugin:vue/recommended", "@vue/standard"],
  parserOptions: {
    parser: "babel-eslint",
  },
  rules: {
    "max-len": [
      "error",
      {
        code: 80,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreUrls: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],
    indent: [
      "error",
      2,
      {
        SwitchCase: 1,
        CallExpression: {
          arguments: "off",
        },
        ArrayExpression: 1,
      },
    ],
    "array-bracket-spacing": ["error", "never"],
    "object-curly-spacing": ["error", "always"],
    "space-in-parens": ["error", "never"],
    "no-empty": ["off"],
    "linebreak-style": ["off", "unix"],
    semi: ["error", "always"],
    "no-unused-vars": "warn",
    "space-before-function-paren": ["error", "never"],
    "comma-dangle": [
      "error",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "always-multiline",
      },
    ],
    "operator-linebreak": [
      "error",
      "before",
      {
        overrides: {
          "=": "after",
          "*=": "after",
          "**=": "after",
          "/=": "after",
          "%=": "after",
          "+=": "after",
          "-=": "after",
          "<<=": "after",
          ">>=": "after",
          ">>>=": "after",
          "&=": "after",
          "^=": "after",
          "|=": "after",
          "&&=": "after",
          "??=": "after",
        },
      },
    ],
    "no-trailing-spaces": [
      "error",
      {
        ignoreComments: true,
      },
    ],
    "vue/max-attributes-per-line": [
      "error",
      {
        singleline: 5,
        multiline: {
          max: 1,
          allowFirstLine: false,
        },
      },
    ],
    "vue/attribute-hyphenation": ["off"],
    "vue/no-mutating-props": "warn",
  },
};
