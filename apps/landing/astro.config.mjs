import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://sourcetaster.com',
  output: 'static',
  server: { port: 4321 },
})
