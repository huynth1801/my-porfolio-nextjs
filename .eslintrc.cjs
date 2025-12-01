module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended", // Integrates Prettier
  ],
  plugins: ["@typescript-eslint", "react", "prettier"],
  rules: {
    // Example cleanup rules: adjust to taste
    "prettier/prettier": ["error"],
    "react/react-in-jsx-scope": "off", // Next.js doesn't require React in scope
  },
};