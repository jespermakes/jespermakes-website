import path from "node:path";
import { defineConfig } from "vitest/config";

// the "@/..." import alias from tsconfig, so tests can import modules that use it
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
