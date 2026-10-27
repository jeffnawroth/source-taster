// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { checkPublication, digest } from "./scripts/publication.ts";
import { assertPreviewAllowed } from "./src/metadata.ts";
const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".gz": "application/gzip",
};
/**
 * ADR-0020: the bare apex negotiates from Accept-Language on the server, so
 * readers without scripts land on their language and nothing is stored.
 * German wins only when the reader prefers it over English; otherwise English.
 */
function negotiateLanguage(header: string | null): "de" | "en" {
  let best: { language: "de" | "en"; q: number } = { language: "en", q: 0 };
  for (const range of (header ?? "").split(",")) {
    const [tag = "", ...parameters] = range.split(";");
    const language = tag.trim().toLowerCase().split("-")[0];
    if (language !== "de" && language !== "en") continue;
    const weight = parameters
      .map((parameter) => parameter.trim().toLowerCase())
      .find((parameter) => parameter.startsWith("q="));
    const q = weight === undefined ? 1 : Number(weight.slice(2));
    if (Number.isFinite(q) && q > best.q && q <= 1) best = { language, q };
  }
  return best.language;
}
/** Static-file boundary, shared by the verification web process and loopback preview. */
export async function openWebsite(
  directory: string,
  mode: "preview" | "publication",
) {
  // The gate runs before anything is read, so a missing or stale artifact
  // never hides which publication inputs are still missing.
  const review =
    mode === "publication"
      ? await checkPublication(resolve(directory, ".."))
      : undefined;
  const root = await realpath(directory);
  const artifact = JSON.parse(
    await readFile(resolve(root, "website-artifact.json"), "utf8"),
  ) as { mode: string; contentSha256?: string; files: Record<string, string> };
  if (artifact.mode !== mode)
    throw new Error(
      "Publication gate: draft artifact cannot be served in production",
    );
  assertPreviewAllowed(mode);
  if (review) {
    if (
      review.contentSha256 !== artifact.contentSha256 ||
      !Object.keys(artifact.files).length
    )
      throw new Error("Publication gate: stale or empty artifact");
    for (const [path, sha256] of Object.entries(artifact.files)) {
      if (
        path.startsWith("/") ||
        path.includes("..") ||
        digest(await readFile(resolve(root, path))) !== sha256
      )
        throw new Error("Publication gate: artifact changed");
    }
  }
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const headers = new Headers({
      "Cache-Control": "no-store",
      ...(mode === "preview" ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; connect-src 'self'; img-src 'self'; font-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    });
    if (!["GET", "HEAD"].includes(request.method))
      return new Response(null, { status: 405, headers });
    if (url.pathname === "/") {
      // The query never travels to the language page.
      headers.set(
        "Location",
        `/${negotiateLanguage(request.headers.get("accept-language"))}/`,
      );
      headers.set("Vary", "Accept-Language");
      return new Response(null, { status: 302, headers });
    }
    let path: string;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      return new Response(null, { status: 400, headers });
    }
    if (path.includes("..") || path.includes("\\") || path.includes("\0"))
      return new Response(null, { status: 404, headers });
    if (
      !Object.hasOwn(artifact.files, path.slice(1)) &&
      /\.[a-z0-9]+$/i.test(path)
    )
      return new Response(null, { status: 404, headers });
    let file = resolve(root, `.${path}`);
    try {
      if ((await stat(file)).isDirectory()) {
        if (!path.endsWith("/")) {
          headers.set("Location", `${path}/`);
          return new Response(null, { status: 308, headers });
        }
        file = resolve(file, "index.html");
      }
      file = await realpath(file);
      if (!file.startsWith(root + sep))
        return new Response(null, { status: 404, headers });
      const relative = file.slice(root.length + 1);
      if (!Object.hasOwn(artifact.files, relative))
        return new Response(null, { status: 404, headers });
      const body = await readFile(file);
      headers.set(
        "Content-Type",
        mime[extname(file)] ?? "application/octet-stream",
      );
      return new Response(request.method === "HEAD" ? null : body, { headers });
    } catch {
      headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>404 · Source Taster</title><main><h1>Page not found / <span lang="de">Seite nicht gefunden</span></h1><p><a href="/en/">English</a> · <a href="/de/" lang="de">Deutsch</a></p></main></html>',
        { status: 404, headers },
      );
    }
  };
}
