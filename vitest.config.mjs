/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // برای رندر React لازم
    globals: true,
    setupFiles: "./src/setupTests.js"
  }
});
