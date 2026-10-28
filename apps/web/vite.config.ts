// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vite";
import { openWebsite } from "@source-taster/website/hosting";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "local-information-preview",
      // Vite is the local development surface. Production uses the gated host.
      async configureServer(server) {
        const serveInformation = await openWebsite(
          fileURLToPath(new URL("../website/dist-preview", import.meta.url)),
          "preview",
        );
        server.middlewares.use((req, res, next) => {
          if (!/^\/(?:docs|de|en|pagefind|_astro)(?:\/|$)/.test(req.url ?? ""))
            return next();
          void serveInformation(
            new Request(`http://localhost${req.url}`, { method: req.method }),
          )
            .then(async (response) => {
              res.writeHead(
                response.status,
                Object.fromEntries(response.headers),
              );
              res.end(Buffer.from(await response.arrayBuffer()));
            })
            .catch(next);
        });
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    proxy: {
      "/v2": {
        target: process.env.SOURCE_TASTER_API_URL ?? "http://127.0.0.1:3100",
        changeOrigin: true,
      },
      "/v1": {
        target: process.env.SOURCE_TASTER_API_URL ?? "http://127.0.0.1:3100",
        changeOrigin: true,
      },
    },
  },
});
