module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parser: "babel-eslint",
  extends: ["eslint:recommended", "plugin:import/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        groups: [
          ["builtin", "external"],
          ["parent", "sibling", "index"],
        ],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ["src/**/*.spec.js", "src/testUtils/**", "src/**/__mocks__/*"],
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
    },
  ],
};
