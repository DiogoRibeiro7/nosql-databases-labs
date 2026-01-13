const js = require("@eslint/js");
const globals = require("globals");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "data/**",
      ".github/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".nyc_output/**",
      "venv/**",
      "__pycache__/**",
      "*.pyc",
      "*.json",
      "*.csv",
      "mongodb-faker-generator/python/**",
      "mongodb-faker-generator/tests/**"
    ]
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
    files: [
      "labs/lab01_intro/*.js",
      "labs/lab02_modeling/*_mongosh.js",
      "labs/**/*mongosh*.js",
      "labs/**/solutions.js",
      "labs/**/test_*_mongosh.js",
      "scripts/**/*mongosh*.js",
      "scripts/docker-init/**/*.js",
      "labs/**/replica_set_setup.js",
      "labs/**/import_ndjson.js",
      "labs/**/sales_analytics.js"
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        db: "writable",
        print: "readonly",
        printjson: "readonly",
        quit: "readonly",
        use: "readonly",
        load: "readonly",
        Mongo: "readonly",
        rs: "readonly",
        sleep: "readonly",
        NumberLong: "readonly",
        ObjectId: "readonly",
        ISODate: "readonly",
        waitFor: "readonly"
      }
    }
  }
];
