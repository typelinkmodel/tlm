module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    "jest/globals": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jest"],
  rules: {
    "@typescript-eslint/prefer-regexp-exec": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
  },
};
