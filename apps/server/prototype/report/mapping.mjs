// Flatten the published sRGB constants on explicitly named opaque backdrops.
import{writeFileSync}from'node:fs';import{dirname,join}from'node:path';import{fileURLToPath}from'node:url';
const composite=(rgba,bg)=>{const fg=rgba.slice(1,7).match(/../g).map(x=>parseInt(x,16)),back=bg.slice(1).match(/../g).map(x=>parseInt(x,16)),a=rgba.length===9?parseInt(rgba.slice(7),16)/255:1;return '#'+fg.map((x,i)=>Math.round(x*a+back[i]*(1-a)).toString(16).padStart(2,'0')).join('');};
const transparent={border:'#1d28421c','border-strong':'#1d284230','accent-tint':'#2456d314','correction-delete-bg':'#262e3d0f','correction-insert-bg':'#3567de21'};
const mapping={source:'design/193-tokens, as amended by #195',backdrops:{'paper-and-mail-surface':'#ffffff','mail-canvas':'#f5f8fd'},opaque:{text:'#0e1626','text-secondary':'#374053','text-muted':'#535b6c',accent:'#2456d3','on-accent':'#ffffff'},composited:Object.fromEntries(Object.entries(transparent).map(([role,source])=>[role,{source,onPaper:composite(source,'#ffffff'),onMailCanvas:composite(source,'#f5f8fd')}]))};
writeFileSync(join(dirname(fileURLToPath(import.meta.url)),'mapping.json'),JSON.stringify(mapping,null,2)+'\n');
