import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'istanbul',
      all: true,
      include: ['src/**/*.js'],
      exclude: ['node_modules', 'tests'],
      reporter: ['text', 'lcov'],
    },
    testTimeout: 20000,
  },
})