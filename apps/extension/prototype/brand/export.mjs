// THROWAWAY #199. Rasterize the review's exact SVG masters and HTML compositions.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {artCss,artMarkup} from './art.mjs';
const {chromium}=await import(process.env.SOURCE_TASTER_PLAYWRIGHT_MODULE||'@playwright/test');
const root=new URL('./',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const html=await read('prototype-199.html');
const data=JSON.parse(html.match(/const DATA=(.*?);<\/script>/s)[1]);
const jobs=JSON.parse(await read('export-jobs.json'));
await mkdir(new URL('exports/',root),{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage();
const errors=[],network=[],artifacts=[],layout=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
for(const job of jobs){
  const out=await page.evaluate(async({svg,size})=>{
    const img=new Image();img.src='data:image/svg+xml;base64,'+btoa(svg);await img.decode();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,size,size);
    const pix=ctx.getImageData(0,0,size,size).data;let minX=size,minY=size,maxX=-1,maxY=-1,minAlpha=255,maxAlpha=0;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const a=pix[(y*size+x)*4+3];minAlpha=Math.min(minAlpha,a);maxAlpha=Math.max(maxAlpha,a);if(a){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
    let essentialOutsideSafeCircle=0;
    if(svg.includes('scale(.55)'))for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4;if((pix[i]!==36||pix[i+1]!==86||pix[i+2]!==211)&&Math.hypot(x+.5-size/2,y+.5-size/2)>size*.4)essentialOutsideSafeCircle++;}
    return {png:canvas.toDataURL('image/png').split(',')[1],bbox:[minX,minY,maxX,maxY],minAlpha,maxAlpha,essentialOutsideSafeCircle};
  },job);
  await writeFile(new URL(`exports/${job.name}.png`,root),Buffer.from(out.png,'base64'));
  const {png,...checks}=out;artifacts.push({file:`exports/${job.name}.png`,width:job.size,height:job.size,group:job.group,...checks});
}
// Modern ICO container with the exact 16/32/48 PNG entries, not a renamed PNG.
const pngs=await Promise.all([16,32,48].map(n=>readFile(new URL(`exports/favicon-${n}.png`,root))));
const head=Buffer.alloc(6+16*pngs.length);head.writeUInt16LE(1,2);head.writeUInt16LE(pngs.length,4);let offset=head.length;
pngs.forEach((png,i)=>{const n=[16,32,48][i],at=6+i*16;head[at]=head[at+1]=n;head.writeUInt16LE(1,at+4);head.writeUInt16LE(32,at+6);head.writeUInt32LE(png.length,at+8);head.writeUInt32LE(offset,at+12);offset+=png.length;});
await writeFile(new URL('exports/favicon.ico',root),Buffer.concat([head,...pngs]));
artifacts.push({file:'exports/favicon.ico',entries:[16,32,48],format:'ICO with PNG entries'});
const imageJobs=[];
for(const v of ['A','B','C']){
  for(const lang of ['de','en'])for(const kind of ['screenshot','amo'])for(let slide=0;slide<3;slide++)imageJobs.push({v,lang,kind,slide,theme:'light',width:1280,height:kind==='amo'?960:800});
  for(const lang of ['de','en'])for(const kind of ['screenshot','amo'])imageJobs.push({v,lang,kind,slide:1,theme:'dark',width:1280,height:kind==='amo'?960:800});
  for(const lang of ['de','en'])for(const theme of ['light','dark'])imageJobs.push({v,lang,kind:'social',slide:2,theme,width:1200,height:630});
  for(const kind of ['promo','marquee'])imageJobs.push({v,lang:'en',kind,slide:2,theme:'light',width:kind==='promo'?440:1400,height:kind==='promo'?280:560});
}
for(const job of imageJobs){
  const markup=artMarkup(data,{...job,kind:job.kind==='amo'?'screenshot':job.kind});
  await page.setViewportSize({width:job.width,height:job.height});
  await page.setContent(`<!doctype html><html lang="${job.lang}"><head><meta charset="utf-8"><style>${artCss(data)}</style></head><body>${markup}</body></html>`);
  await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  const clipped=await page.evaluate(()=>[...document.querySelectorAll('.heading h1,.heading p,.headline,.byline,.demo,.brand')].filter(el=>{const r=el.getBoundingClientRect();return r.x<0||r.y<0||r.right>innerWidth+.5||r.bottom>innerHeight+.5;}).map(el=>el.textContent));
  if(clipped.length)layout.push({job,clipped});
  const file=`exports/${job.v}-${job.lang}-${job.theme}-${job.kind}-${job.slide+1}.png`;
  await page.screenshot({path:new URL(file,root).pathname});artifacts.push({file,...job});
}
await browser.close();
await writeFile(new URL('exports/manifest.json',root),JSON.stringify({issue:199,status:'Design candidates only; selection pending. Never upload these prototype captures as release evidence.',artifacts},null,2)+'\n');
await writeFile(new URL('export-checks.json',root),JSON.stringify({errors,network,layout,icons:jobs.length,compositions:imageJobs.length,icoEntries:[16,32,48]},null,2)+'\n');
if(errors.length||network.length||layout.length)throw new Error('Inspect export-checks.json');
console.log(`Exported ${jobs.length} PNG icons, an ICO, and ${imageJobs.length} opaque composition PNGs.`);
