// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { checkPublication, digest } from "./scripts/publication.ts";
const mime: Record<string,string> = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.json':'application/json', '.svg':'image/svg+xml' };
/** Static-file boundary, shared by the verification web process and loopback preview. */
export async function openWebsite(directory: string, mode: "preview" | "publication") {
  const root = await realpath(directory);
  const artifact = JSON.parse(await readFile(resolve(root, "website-artifact.json"), "utf8")) as { mode: string; contentSha256?: string; files: Record<string,string> };
  if (artifact.mode !== mode) throw new Error("Publication gate: draft artifact cannot be served in production");
  if (mode === 'preview' && process.env.NODE_ENV === 'production') throw new Error('Draft preview is local-only');
  if (mode === 'publication') {
    const review = await checkPublication(resolve(root,'..'));
    if (review.contentSha256 !== artifact.contentSha256 || !Object.keys(artifact.files).length) throw new Error('Publication gate: stale or empty artifact');
    for (const [path,sha256] of Object.entries(artifact.files)) {
      if (path.startsWith('/') || path.includes('..') || digest(await readFile(resolve(root,path))) !== sha256) throw new Error('Publication gate: artifact changed');
    }
  }
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const headers = new Headers({
      'Cache-Control':'no-store', ...(mode === 'preview' ? {'X-Robots-Tag':'noindex, nofollow'} : {}),
      'Referrer-Policy':'no-referrer', 'X-Content-Type-Options':'nosniff',
      'Content-Security-Policy': "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; connect-src 'self'; img-src 'self'; font-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    });
    if (!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers});
    let path: string;
    try { path = decodeURIComponent(url.pathname); } catch { return new Response(null,{status:400,headers}); }
    if (path.includes('..') || path.includes('\\') || path.includes('\0')) return new Response(null,{status:404,headers});
    if (!Object.hasOwn(artifact.files, path.slice(1)) && /\.[a-z0-9]+$/i.test(path)) return new Response(null,{status:404,headers});
    let file = resolve(root, `.${path}`);
    try {
      if ((await stat(file)).isDirectory()) {
        if (!path.endsWith('/')) { headers.set('Location', `${path}/`); return new Response(null,{status:308,headers}); }
        file = resolve(file, 'index.html');
      }
      file = await realpath(file);
      if (!file.startsWith(root + sep)) return new Response(null,{status:404,headers});
      const relative = file.slice(root.length+1);
      if (!Object.hasOwn(artifact.files,relative)) return new Response(null,{status:404,headers});
      const body = await readFile(file);
      headers.set('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
      return new Response(request.method === 'HEAD' ? null : body, {headers});
    } catch { headers.set('Content-Type','text/html; charset=utf-8'); return new Response('<!doctype html><html lang="en"><title>404</title><h1>Page not found / Seite nicht gefunden</h1><a href="/en/">English</a> · <a href="/de/">Deutsch</a></html>',{status:404,headers}); }
  };
}
