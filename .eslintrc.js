module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    "plugin:vue/essential",
    "@vue/standard"
  ],
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "quotes": [
      "error",
      "double",
      {
        avoidEscape: true
      }
    ],
    "indent": [
      "error",
      2,
      {
        SwitchCase: 1,
        CallExpression: {
          arguments: "off"
        },
        ArrayExpression: 1
      }
    ],
    "array-bracket-spacing": [
      "error",
      "never"
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "space-in-parens": [
      "error",
      "never"
    ],
    "no-empty": [
      "off"
    ],
    "linebreak-style": [
      "off",
      "windows"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-unused-vars": "warn",
    "space-before-function-paren":[
      "error",
      "never"
    ]
  }
}
