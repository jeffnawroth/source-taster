import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://sourcetaster.app',
  output: 'static',
  server: { port: 4321 },
})
