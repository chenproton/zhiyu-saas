import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "backend"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
})
