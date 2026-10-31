// SPDX-License-Identifier: AGPL-3.0-or-later
// Source-only client test composition, without the unrelated website artifact host.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: Number(process.env.SOURCE_TASTER_TEST_WEB_PORT ?? 5371),
    strictPort: true,
    proxy: {
      "/v1": `http://127.0.0.1:${process.env.SOURCE_TASTER_TEST_API_PORT ?? 4701}`,
      "/v2": `http://127.0.0.1:${process.env.SOURCE_TASTER_TEST_API_PORT ?? 4701}`,
    },
  },
});
