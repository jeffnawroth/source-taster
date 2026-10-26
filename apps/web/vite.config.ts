// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/v1": {
        target: process.env.SOURCE_TASTER_API_URL ?? "http://127.0.0.1:3100",
        changeOrigin: true,
      },
    },
  },
});
