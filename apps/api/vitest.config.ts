import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    env: {
      DATABASE_URL: 'postgres://sourcetaster:sourcetaster_pg@localhost:5432/sourcetaster',
    },
  },
})
