// THROWAWAY #199. Existing mark -> sRGB SVG masters and an offline review sheet.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const write=(p,s)=>writeFile(new URL(p,root),s);
const safe=x=>JSON.stringify(x).replaceAll('<','\\u003c');
const sprite=(await read('assets/glyphs.js')).match(/ST.SPRITE = `([\s\S]*?)`;/)[1];
const linear=([L,C,H])=>{
  const a=C*Math.cos(H*Math.PI/180),b=C*Math.sin(H*Math.PI/180);
  const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
  return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s];
};
const inGamut=v=>linear(v).every(c=>c>=0&&c<=1);
const mappings=[];
function map(value){
  const original=value.trim().split(/\s+/).map(Number);let [L,C,H]=original;
  if(!inGamut(original)){let lo=0,hi=C;for(let i=0;i<40;i++){const mid=(lo+hi)/2;inGamut([L,mid,H])?lo=mid:hi=mid;}C=Math.floor(lo*1000)/1000;}
  const mapped=[L,C,H],rgb=linear(mapped).map(v=>v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055);
  const hex='#'+rgb.map(v=>Math.round(Math.max(0,Math.min(1,v))*255).toString(16).padStart(2,'0')).join('');
  if(!mappings.some(x=>x.source.join(' ')===original.join(' ')))mappings.push({source:original,mapped,hex,chromaReduced:C!==original[1],linearSrgb:linear(mapped)});
  return hex;
}
const symbol=id=>sprite.match(new RegExp(`<symbol id="${id}"[^>]*>([\\s\\S]*?)</symbol>`))[1];
let defs=sprite.match(/<defs>([\s\S]*?)<symbol id="mark"/)[1];
defs=defs.replaceAll(/style="stop-color:oklch\(([^)]+)\)"/g,(_,v)=>`stop-color="${map(v)}"`);
const mark=symbol('mark'),small=symbol('mark-sm'),mono=symbol('mark-mono');
const svg=(content,size=32)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><defs>${defs}</defs>${content}</svg>`;
const tile=(size)=>svg(size<=32?small:mark,size);
const monochrome=(size,color)=>svg(`<g fill="${color}" color="${color}">${size<=32?mono.replace('stroke-width="1.55"','stroke-width="2"'):mono}</g>`,size);
const cropSquare=mark.replaceAll(/<rect\b[^>]*\/>/g,'').replaceAll(/^[ \t]+$/gm,'');
const touch=svg(`<rect width="32" height="32" fill="url(#mk-g)"/>${cropSquare}`,180);
const maskable=size=>svg(`<rect width="32" height="32" fill="#2456d3"/><g transform="translate(16 16) scale(.55) translate(-16 -16)" color="#fff">${mono}</g>`,size);
const padded=(size,inset)=>svg(`<g transform="translate(${32*inset/size} ${32*inset/size}) scale(${(size-2*inset)/size*32/31}) translate(-.5 -.5)">${mark}</g>`,size);
await mkdir(new URL('masters/',root),{recursive:true});
const jobs=[];
async function add(name,size,body,group){await write('masters/'+name+'.svg',body);jobs.push({name,size,group,svg:body});}
for(const n of [16,32,48,96])await add('favicon-'+n,n,tile(n),'website');
await write('masters/favicon.svg',tile(16));
await add('apple-touch-icon',180,touch,'website');
for(const n of [192,512]){await add('web-app-any-'+n,n,tile(n),'website-optional');await add('web-app-maskable-'+n,n,maskable(n),'website-optional');}
for(const n of [16,24,32,48,64,96])await add('extension-'+n,n,tile(n),'extension');
await add('extension-128',128,padded(128,16),'extension');
for(const n of [16,24,32,48,64]){
  await add('toolbar-default-'+n,n,tile(n),'toolbar');
  await add('toolbar-on-light-'+n,n,monochrome(n,'#0e1626'),'toolbar');
  await add('toolbar-on-dark-'+n,n,monochrome(n,'#f4f5f8'),'toolbar');
}
await add('store-cws-128',128,padded(128,16),'store');
await add('store-amo-128',128,padded(128,8),'store');
await add('store-edge-300',300,padded(300,20),'store-optional');
await write('masters/mark.svg',tile(128));
await write('masters/mark-optical.svg',tile(16));
await write('masters/mark-mono.svg',monochrome(128,'#000000'));
// Archived Safari pinned-tab convention: a single layer of black paths, no gradients/defs.
const drop=sprite.match(/<path id="drop" d="([^"]+)"/)[1];
await write('masters/safari-pinned-tab.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill="#000" transform="scale(.5)"><path d="${drop}" transform="translate(10.4 10.6) scale(1.18)"/><path d="${drop}" fill="none" stroke="#000" stroke-width="1.55" stroke-linejoin="round" transform="translate(22.6 10.6) scale(1.18)"/></g></svg>`);
const colorRecord={method:'Reduce chroma at fixed OKLCH lightness/hue until every linear-sRGB channel is in [0,1], then floor chroma to .001 and encode 8-bit sRGB. No channel clipping is used to fit out-of-gamut colors.',source:'Chosen #191 mark via public #194 sprite; #193 section 8 requires sRGB mapping.',mappings};
await write('gamut-mapping.json',JSON.stringify(colorRecord,null,2)+'\n');
await write('export-jobs.json',JSON.stringify(jobs,null,2)+'\n');
const fontCss=(await Promise.all([['Atkinson','Atkinson-Regular.ttf',400],['Atkinson','Atkinson-Bold.ttf',700],['Plex','PlexMono-Regular.ttf',400]].map(async([family,file,weight])=>`@font-face{font-family:${family};font-weight:${weight};src:url(data:font/ttf;base64,${(await readFile(new URL('assets/'+file,root))).toString('base64')}) format('truetype');font-display:swap}`))).join('');
const shots={};
for(const lang of ['de','en'])for(const theme of ['light','dark'])for(const type of ['fields','feed','detail','panel'])shots[`${type}-${lang}-${theme}`]='data:image/png;base64,'+(await readFile(new URL(`shots/${type}-${lang}-${theme}.png`,root))).toString('base64');
const data={fontCss,shots,icons:{full:tile(128),small:tile(16),monoLight:monochrome(16,'#0e1626'),monoDark:monochrome(16,'#f4f5f8'),store:padded(128,16),maskable:maskable(512)},jobs:jobs.map(({svg,...rest})=>rest),notices:{Atkinson:await read('assets/Atkinson-OFL.txt'),Plex:await read('assets/Plex-OFL.txt')}};
const art=(await read('art.mjs')).replaceAll('export ','');
await write('prototype-199.html',`<!doctype html><!-- THROWAWAY #199. Design examples, never submit or publish. --><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Source Taster · Brand assets #199</title><style>${fontCss}\n${await read('gallery.css')}</style></head><body><div id="review"></div><main id="sheet"></main><div id="switcher"></div><script>const DATA=${safe(data)};</script><script>${art}</script><script>${await read('gallery.js')}</script></body></html>`);
console.log(`Built offline #199 gallery and ${jobs.length} raster export masters. Gamut: ${mappings.filter(x=>x.chromaReduced).length}/${mappings.length} colors mapped.`);
