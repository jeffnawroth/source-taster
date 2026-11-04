// SPDX-License-Identifier: AGPL-3.0-or-later
// Client-only #98 witness: serve the actual web entry point without building
// the unrelated website. Only the external private HTTP service is a fixture.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  root: new URL("../web", import.meta.url).pathname,
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.VITE_SOURCE_TASTER_MODE": JSON.stringify("hosted"),
    "import.meta.env.VITE_SOURCE_TASTER_SERVICE_URL": JSON.stringify(
      `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT ?? "4602"}`,
    ),
  },
  server: {
    host: "127.0.0.1",
    port: Number(process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? 5361),
    strictPort: true,
    proxy: {
      "/v2": `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_API_PORT ?? "4601"}`,
    },
  },
});
