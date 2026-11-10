// THROWAWAY #198. Compile the existing public content into an offline design review.
import { readFile, writeFile } from 'node:fs/promises';
import { pages, copy } from '../../src/content.ts';
import { sourceAccess } from '../../src/source-access.ts';
const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const safe = (x) => JSON.stringify(x).replaceAll('<', '\\u003c');
const fonts = (await Promise.all([['Atkinson', 'Atkinson-Regular.ttf',400], ['Atkinson','Atkinson-Bold.ttf',700], ['Plex','PlexMono-Regular.ttf',400]].map(async ([family,file,weight]) => `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/ttf;base64,${(await readFile(new URL('assets/'+file,import.meta.url))).toString('base64')}) format('truetype');font-display:swap}`))).join('');
const notices = {Atkinson: await read('assets/Atkinson-OFL.txt'), Plex: await read('assets/Plex-OFL.txt')};
const legal = {};
for (const lang of ['de','en']) {
  legal[lang] = await Promise.all(['legal-notice','terms','privacy','withdrawal'].map(async id => JSON.parse(await read(`../../content/legal/${lang}/${id}/draft-2026-10-26.1.json`))));
}
let app = await read('assets/checking-194.html');
app = app.replaceAll(/<link\b[^>]*>/g,'').replaceAll('Atkinson Hyperlegible Next','Atkinson').replaceAll('IBM Plex Mono','Plex')
  .replace("variant: qs.get('variant') || 'A'", "variant: 'D'")
  .replace("calm: qs.has('calm')", 'calm: true')
  .replace("strip: ['a', 'b'].includes(qs.get('strip')) ? qs.get('strip') : ''", "strip: 'a'")
  .replace("history.replaceState(null, '', '?' + p.toString());", '/* Parent owns the review URL; no srcdoc history mutation. */')
  .replace('</head>', `<style>${fonts}#switcher,#devbar{display:none!important}.v-D .scroll{padding-bottom:24px}</style></head>`);
const html = `<!doctype html>\n<!-- THROWAWAY #198. Three structures of the existing public website; never publish. -->\n<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Source Taster · Website design review #198</title><style>${fonts}\n${await read('style.css')}</style></head><body><script type="application/json" id="font-notices">${safe(notices)}</script><div id="review"></div><div id="viewport"></div><div id="switcher"></div><dialog id="search-dialog" aria-labelledby="search-title"></dialog><script>const CONTENT=${safe({pages,copy,legal,sourceAccess})};const CHECKING=${safe(app)};</script><script>${await read('assets/glyphs.js')}</script><script>${await read('site.js')}</script></body></html>`;
await writeFile(new URL('prototype-198.html',import.meta.url),html);
console.log('Built apps/website/prototype/website/prototype-198.html');
