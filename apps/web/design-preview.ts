// SPDX-License-Identifier: AGPL-3.0-or-later
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { pins } from "./design-sources.ts";

const root = fileURLToPath(new URL("../..", import.meta.url));
const prototypes = {
  structure: pins.structure,
  website: pins.website,
  report: {
    commit: pins.report.commit,
    path: "apps/server/prototype/report/prototype-197-report.html",
  },
};
const types: Record<string, string> = {
  html: "text/html; charset=utf-8",
  json: "application/json",
  png: "image/png",
  pdf: "application/pdf",
};

/** Only named, generated public evidence files are addressable; never arbitrary repo paths. */
export function comparisonFile(path: string): string | undefined {
  const match =
    /^\/__design\/comparisons\/(standalone|hosted|extension)\/([A-Za-z0-9_.-]+\.(html|json|png|pdf))$/.exec(
      path,
    );
  if (!match) return undefined;
  if (match[1] === "extension")
    return join(root, "apps/extension/test-results/design-fidelity", match[2]!);
  return join(
    root,
    `apps/web/test-results/design-fidelity${match[1] === "hosted" ? "-hosted" : ""}`,
    match[2]!,
  );
}

/** Local development only: the accepted originals and native-size comparison sheets. */
export function designPreview(): Plugin {
  return {
    name: "local-design-evidence",
    apply: "serve",
    configureServer(server) {
      const cache = new Map<string, Buffer>();
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith("/__design/")) return next();
        try {
          const pathname = new URL(request.url, "http://127.0.0.1").pathname;
          const id =
            /^\/__design\/prototypes\/(structure|website|report)$/.exec(
              pathname,
            )?.[1] as keyof typeof prototypes | undefined;
          let bytes: Buffer | undefined;
          let type = "text/html; charset=utf-8";
          if (id) {
            bytes = cache.get(id);
            if (!bytes) {
              const source = prototypes[id];
              bytes = execFileSync(
                "git",
                ["show", `${source.commit}:${source.path}`],
                { cwd: root, maxBuffer: 64 * 1024 * 1024 },
              );
              cache.set(id, bytes);
            }
          } else {
            const file = comparisonFile(pathname);
            if (file) {
              bytes = readFileSync(file);
              type = types[file.split(".").at(-1)!]!;
            }
          }
          if (!bytes) {
            response.writeHead(404);
            response.end("Unknown design artifact");
            return;
          }
          response.writeHead(200, {
            "content-type": type,
            "cache-control": "no-store",
            "x-robots-tag": "noindex, nofollow",
          });
          response.end(bytes);
        } catch {
          response.writeHead(404);
          response.end("Design artifact is not available");
        }
      });
    },
  };
}
