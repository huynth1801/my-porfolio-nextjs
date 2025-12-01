import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // Tắt các rule mặc định để tránh xung đột
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Rule 1: Import thừa -> Báo lỗi (Error) để ESLint tự động xóa được
      "unused-imports/no-unused-imports": "error",

      // Rule 2: Biến thừa -> Báo lỗi (Error) để chặn commit
      "unused-imports/no-unused-vars": [
        "error", // Đặt là 'error' thì khi commit sẽ bị chặn lại và báo đỏ
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;





