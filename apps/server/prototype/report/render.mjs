// THROWAWAY #197. Three layout candidates using the existing qualified PDFKit engine.
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {colors as C,keys,labels,references,statuses,names} from './fixture.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const dep=process.argv[2]||resolve(here,'../..');
const req=createRequire(join(dep,'package.json'));
const {default:PDFDocument}=await import(pathToFileURL(req.resolve('pdfkit')).href);
const out=join(here,'output/pdf');mkdirSync(out,{recursive:true});
const fontFiles={Regular:'Atkinson-Regular.ttf',Bold:'Atkinson-Bold.ttf',Italic:'Atkinson-Italic.ttf',Mono:'PlexMono-Regular.ttf',Fallback:'NotoSans-Regular.ttf',FallbackBold:'NotoSans-Bold.ttf'};

function glyph(doc,key,x,y,size=16){
 doc.markContent('Artifact',{type:'Layout'});doc.save().translate(x,y).scale(size/24);const i=keys.indexOf(key),color=C.marks[i];doc.lineJoin('round').lineCap('round');
 const path=(p,c,w=2)=>doc.path(p).lineWidth(w).stroke(c);
 if(i===0){doc.circle(12,12,10.3).fill(color);path('M7.3 12.4 L10.5 15.6 L16.7 8.8','#ffffff',2.3);}
 if(i===1){doc.path('M12 1.6 L22.4 12 L12 22.4 L1.6 12 Z').fill(color);path('M8 10.2 L16 10.2 M8 13.8 L16 13.8 M13.4 6.8 L10.6 17.2','#ffffff',1.8);}
 if(i===2){doc.path('M12 1.7 L20.9 6.8 L20.9 17.2 L12 22.3 L3.1 17.2 L3.1 6.8 Z').fill(color);doc.circle(9.6,12,3.3).lineWidth(1.7).stroke('#ffffff');doc.circle(14.4,12,3.3).stroke('#ffffff');}
 if(i===3){doc.roundedRect(2.4,2.4,19.2,19.2,5.2).fill(color);path('M6.4 12 L9.8 12 M14.2 12 L17.6 12 M11 15.6 L13 8.4','#ffffff');}
 if(i===4){doc.circle(10.2,10.2,7.6).lineWidth(2.5).stroke(color);path('M15.8 15.8 L21.4 21.4',color,3.2);path('M7.4 7.4 L13 13 M13 7.4 L7.4 13',color,1.9);}
 if(i===5){doc.circle(12,12,9.6).dash(3.4,{space:2.7}).lineWidth(2.1).stroke(color).undash();path('M9.5 9.6 C9.5 6 15 6 15 9.6 C15 11.9 12 11.7 12 13.8 M12 17 L12.01 17',color);}
 doc.restore();doc.endMarkedContent();
}

async function render(variant,lang){
 const en=lang==='en',at=en?1:0,L=(de,en)=>at?en:de;
 const doc=new PDFDocument({size:'A4',margins:{top:54,left:48,right:48,bottom:54},tagged:true,lang,displayTitle:true,bufferPages:true,pdfVersion:'1.7',info:{Title:L('Prüfbericht - Beispiel-Zwischenstand','Verification report - sample intermediate snapshot'),Creator:'Source Taster #197 design prototype'}});
 const chunks=[];const done=new Promise((ok,no)=>{doc.on('data',c=>chunks.push(c));doc.on('end',()=>ok(Buffer.concat(chunks)));doc.on('error',no);});
 for(const[k,f]of Object.entries(fontFiles))doc.registerFont(k,readFileSync(join(here,'assets',f)));
 const faces=Object.fromEntries(Object.keys(fontFiles).map(k=>[k,doc.font(k)._font.font]));
 const root=doc.struct('Document');doc.addStructure(root);const W=doc.page.width-96;let y=54;
 function artifact(draw){doc.markContent('Artifact',{type:'Layout'});draw();doc.endMarkedContent();}
 function rule(yy,x=48,w=W){artifact(()=>doc.moveTo(x,yy).lineTo(x+w,yy).lineWidth(.6).stroke(C.border));}
 function text(parent,role,value,{x=48,yy=y,width=W,size=10.7,font='Regular',color=C.text,language,link}={}){
  const opts=language?{lang:language}:{};
  parent.add(doc.struct(role,opts,()=>{
   const runs=[];for(const ch of value){const fallback=font==='Bold'?'FallbackBold':'Fallback';const f=faces[font].hasGlyphForCodePoint(ch.codePointAt(0))?font:faces[fallback].hasGlyphForCodePoint(ch.codePointAt(0))?fallback:null;if(!f)throw Error('Unsupported character: '+ch);if(runs.at(-1)?.f===f)runs.at(-1).v+=ch;else runs.push({f,v:ch});}
   runs.forEach((r,i)=>{doc.font(r.f).fontSize(size).fillColor(color);const o={width,lineGap:2,continued:i<runs.length-1,...(link?{link,underline:true}: {})};if(i===0)doc.text(r.v,x,yy,o);else doc.text(r.v,o);});
  }));y=doc.y+7;
 }
 const heading=(value,role='H2',size=16)=>text(root,role,value,{font:'Bold',size});
 // Links remain owned by a tagged Link element and have an annotation description.
 let linkLabel='';const originalLink=doc.link.bind(doc);doc.link=(x,y,w,h,url,o)=>originalLink(x,y,w,h,url,{...o,...(o?.structParent?{Contents:new String(linkLabel)}:{})});
 function source(parent,url,x,width){linkLabel=L('Datenquelle, Beispieldaten','Data source, example data');text(parent,'Link',url,{x,width,size:9.4,font:'Mono',color:C.accent,link:url});}
 function newPage(){doc.addPage();y=62;}
 // Shared identity, no glass or tinted Verdict boxes on paper.
 text(root,'P','Source Taster',{font:'Bold',size:13});
 y=108;heading(L('Prüfbericht','Verification report'),'H1',variant==='B'?32:28);
 text(root,'P',L('Literaturliste - Seminar Digitale Lehre','Reference list - Digital teaching seminar'),{size:13,font:'Bold'});
 text(root,'P',L('Aufnahme: 10. November 2026, 14:00 UTC','Captured: 10 November 2026, 14:00 UTC'),{size:10,font:'Mono',color:C.secondary});
 text(root,'P',L('Zwischenstand: Die Prüfung ist noch nicht abgeschlossen. Diese Datei zeigt den Zustand zum Aufnahmezeitpunkt.','Intermediate snapshot: the Check is not complete. This file shows its state at the capture time.'),{size:11});
 text(root,'P',L('Gestaltungsprototyp mit Beispieldaten. Keine echte Quellenprüfung.','Design prototype with fictional data. No real Source verification.'),{size:9.5,color:C.muted});
 y+=18;heading(L('Auf einen Blick','At a glance'), 'H2',18);
 text(root,'P',L('1 von 10 Referenzen ist als korrekt eingeordnet. Vier Referenzen haben noch keinen Befund.','1 of 10 References is classified as correct. Four References have no Verdict yet.'),{size:12,font:'Bold'});
 const start=y;
 for(let i=0;i<6;i++){
  const col=variant==='B'?0:i%2,row=variant==='B'?i:Math.floor(i/2),xx=48+col*(W/2),yy=start+row*27;
  glyph(doc,keys[i],xx,yy,16);text(root,'P',`${labels[lang][i]}: 1`,{x:xx+24,yy:yy-1,width:W/(variant==='B'?1:2)-30,size:10.5});
 }
 y=start+(variant==='B'?6:3)*27+15;rule(y);y+=16;
 heading(L('Status - getrennt von Befunden','Statuses - separate from Verdicts'),'H2',13);
 for(const key of ['running','not-checked','cancelled','failed'])text(root,'P',`${statuses[lang][key]}: 1`,{size:10.5,color:C.secondary});
 y+=7;text(root,'P',L('Manuell geändert: Referenz 1. Systembefund und Änderung bleiben nebeneinander erhalten.','Manually changed: Reference 1. The system Verdict and the change are both retained.'),{size:10.5});
 text(root,'P',L('Scoring-Regeln: Versionen 2026.10 und 2026.11. Die jeweilige Version steht an der Referenz.','Scoring rules: versions 2026.10 and 2026.11. Each Reference states its own version.'),{size:10.5});
 newPage();
 for(const [i,r]of references.entries()){
  const compact=variant==='C',indent=variant==='B'?25:variant==='A'?16:0,x=48+indent,width=W-indent-(variant==='A'?16:0);
  const height=(v,size=10.7,font='Regular')=>doc.font(font).fontSize(size).heightOfString(v,{width,lineGap:2});
  const reason=r.status?({running:L('Die Prüfung läuft. In diesem Zwischenstand liegt noch kein Befund vor.','The Check is running. This snapshot has no Verdict yet.'),'not-checked':L('Für diese Referenz wurde noch keine Prüfung gestartet.','No Check has started for this Reference.'),cancelled:L('Die Prüfung wurde abgebrochen. Es liegt kein Befund vor.','The Check was cancelled. There is no Verdict.'),failed:L('Die Prüfung ist technisch fehlgeschlagen. Es liegt kein Befund vor.','The Check failed technically. There is no Verdict.')}[r.status]):r.reason[at];
  const suggested=r.suggestion||L('Keine geeignete Korrekturvorlage vorhanden.','No eligible Correction suggestion.');
  const fields=r.status?2:3;
  const rowHeight=(label,value)=>Math.max(doc.font('Bold').fontSize(9.2).heightOfString(label,{width:100,lineGap:2}),doc.font('Regular').fontSize(10.7).heightOfString(value,{width:width-115,lineGap:2}))+9;
  const h=compact ? 60+height(r.title,14,'Bold')+rowHeight(L('Geprüfte Referenz','Checked Reference'),r.original)+(r.status?height(reason):rowHeight(L('Begründung','Explanation'),reason)+rowHeight(L('Korrekturvorlage - Vorschau, APA 7','Correction suggestion - preview, APA 7'),suggested)+30)+(r.manual?43:0) : r.status?38+height(r.title,14,'Bold')+height(r.original)+height(reason)+22:52+height(r.title,14,'Bold')+height(r.original)+height(reason)+height(suggested)+fields*22+(r.manual?43:0)+27+24;
  if((r.status && i===6 && y>70)||y+h>doc.page.height-64)newPage();
  const top=y;
  if(variant==='A')artifact(()=>doc.roundedRect(48,top-10,W,h,10).lineWidth(.65).stroke(C.border));
  if(variant==='B')artifact(()=>doc.moveTo(48,top).lineTo(48,top+h-12).lineWidth(1).stroke(C.strong));
  if(variant==='C'){rule(top-9);}
  const section=doc.struct('Sect');root.add(section);
  text(section,'H2',`${i+1}. ${r.title}`,{x,yy:top,width,size:14,font:'Bold',language:r.lang||'de'});
  const badgeY=y;
  if(r.key)glyph(doc,r.key,x,badgeY,15);
  text(section,'P',r.key?labels[lang][keys.indexOf(r.key)]:L('Status: ','Status: ')+statuses[lang][r.status],{x:x+(r.key?23:0),width:width-23,yy:badgeY,size:11,font:'Bold'});
  if(r.manual){text(section,'P',L('Manuell: Korrekt. Systembefund: Nicht verifizierbar.','Manual: Correct. System Verdict: Not verifiable.'),{x,width,size:9.8});text(section,'P',r.manual.at[at],{x,width,size:9.4,font:'Mono',color:C.muted});}
  const field=(label,value,{font='Regular',language}={})=>{if(compact){const top=y;text(section,'P',label,{x,yy:top,width:100,size:9.2,font:'Bold',color:C.secondary});const labelBottom=y;text(section,'P',value,{x:x+115,yy:top,width:width-115,size:10.7,font,language});y=Math.max(y,labelBottom)+2;}else{text(section,'P',label,{x,width,size:9.2,font:'Bold',color:C.secondary});y-=2;text(section,'P',value,{x,width,size:10.7,font,language});}};
  field(L('Geprüfte Referenz','Checked Reference'),r.original,{language:r.lang||'de'});
  if(r.status) text(section,'P',reason,{x,width,size:10.7}); else field(L('Begründung','Explanation'),reason);
  if(!r.status){field(L('Korrekturvorlage - Vorschau, APA 7','Correction suggestion - preview, APA 7'),suggested,{language:r.suggestion?'de':lang});text(section,'P',L('Scoring-Regeln: ','Scoring rules: ')+r.version,{x,width,size:9.3,font:'Mono',color:C.muted});source(section,r.source,x,width);}
  section.end();y=Math.max(y,top+h-8)+(compact?16:26);
 }
 root.end();
 const range=doc.bufferedPageRange();for(let i=0;i<range.count;i++){
  doc.switchToPage(i);const bottom=doc.page.margins.bottom;doc.page.margins.bottom=0;
  doc.markContent('Artifact',{type:'Pagination'});doc.font('Regular').fontSize(8.5).fillColor(C.muted).text(`Source Taster · ${L('Zwischenstand','Intermediate snapshot')} · ${L('Seite','Page')} ${i+1} / ${range.count}`,48,doc.page.height-32,{width:W,lineBreak:false});doc.endMarkedContent();doc.page.margins.bottom=bottom;
 }
 doc.end();const bytes=await done;const path=join(out,`report-${variant}-${lang}.pdf`);writeFileSync(path,bytes);console.log(`${variant} ${lang}: ${range.count} pages, ${bytes.length} bytes`);
}
for(const variant of ['A','B','C'])for(const lang of ['de','en'])await render(variant,lang);
