// THROWAWAY #199. Capture the bundled public D snapshot; no real accounts or uploads.
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.SOURCE_TASTER_PLAYWRIGHT_MODULE||'@playwright/test');
const browser=await chromium.launch(),page=await browser.newPage({deviceScaleFactor:2});
const root=new URL('./',import.meta.url),shots=[];
for(const lang of ['de','en'])for(const theme of ['light','dark'])for(const [name,stage,width,height] of [['fields','detail',1100,690],['feed','done',1100,690],['detail','detail',1100,690],['panel','done',360,680]]){
  await page.setViewportSize({width,height});
  await page.goto(new URL(`assets/checking-snapshot.html?stage=${stage}&lang=${lang}&theme=${theme}&still=1&ref=3`,root).href);
  await page.locator('.v-D').waitFor();await page.waitForTimeout(100);await page.evaluate(()=>document.fonts.ready);
  if(name==='fields')await page.locator('.v-D .dscroll').evaluate(el=>el.scrollTop=300);
  await page.screenshot({path:new URL(`shots/${name}-${lang}-${theme}.png`,root).pathname});
  shots.push({name,lang,theme,width,height,deviceScaleFactor:2,pixelWidth:width*2,pixelHeight:height*2});
}
await browser.close();
await writeFile(new URL('shots/capture.json',root),JSON.stringify({source:'Public #194 D via accepted #198 offline adaptation, b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022',adaptations:'Neutral evidence marks per #195; ordinary German author label; mapped sRGB logo; no changed Check logic.',fixture:'Synthetic public prototype examples, not release evidence',shots},null,2)+'\n');
console.log(`Captured ${shots.length} public prototype images.`);
