// SPDX-License-Identifier: AGPL-3.0-or-later
// The app's own Vite config minus the local information-site preview, which
// needs a Pagefind-built website unrelated to #102. Same plugins and proxy.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  root: new URL("..", import.meta.url).pathname,
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    proxy: {
      "/v2": { target: process.env.SOURCE_TASTER_API_URL, changeOrigin: true },
      "/v1": { target: process.env.SOURCE_TASTER_API_URL, changeOrigin: true },
    },
  },
});
