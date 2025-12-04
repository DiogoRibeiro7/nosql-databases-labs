const js = require("@eslint/js");
const globals = require("globals");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["node_modules/**", "data/**", ".github/**"]
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-console": "off"
    }
  },
  {
    files: ["labs/lab01_intro/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        db: "writable",
        print: "readonly",
        printjson: "readonly",
        quit: "readonly"
      }
    }
  }
];
