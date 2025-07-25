import { defineConfig } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends("prettier"),

    plugins: {
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },

      ecmaVersion: 12,
      sourceType: "module",
    },

    rules: {
      "class-methods-use-this": "off",
      "no-param-reassign": "off",
      camelcase: "off",

      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "next",
        },
      ],
    },
  },
  {
    files: ["**/src/sequelize/migrations/*.js"],

    rules: {
      "no-unused-vars": "off",
    },
  },
]);
