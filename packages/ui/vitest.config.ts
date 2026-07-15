import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@/lib/utils': path.resolve(__dirname, './src/lib/utils.ts'),
    },
  },
})
