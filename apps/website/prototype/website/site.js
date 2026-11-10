/* THROWAWAY #198. Public content only; all interaction state stays in memory. */
const qs = new URLSearchParams(location.search);
const state = {
  variant: ['S','A','B','C'].includes(qs.get('variant')) ? qs.get('variant') : 'S',
  page: qs.get('page') || 'home', lang: qs.get('lang') === 'en' ? 'en' : 'de',
  theme: qs.get('theme') === 'dark' ? 'dark' : 'light', frame: qs.get('frame') === '360' ? '360' : 'web',
  searchMode: 'ready', menu: false, query: '', searchStatus: 'prompt', matches: []
};
const names = { S:['Auswahl A + C','Selected A + C'], A:['Produkt zuerst','Product first'], B:['Lesefassung','Reading edition'], C:['Fragen zuerst','Questions first'] };
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const L = (de,en) => state.lang === 'de' ? de : en;
const c = (key) => CONTENT.copy[state.lang][key];
// The selected voice uses Befund. Legal versioned documents are never transformed.
const voice = s => s.replaceAll('ein Urteil','einen Befund').replaceAll('Ein Urteil','Ein Befund').replaceAll('kein Urteil','keinen Befund').replaceAll('Urteile','Befunde').replaceAll('Urteil','Befund');
const allPages = () => CONTENT.pages[state.lang].map(p=>({...p,title:voice(p.title),summary:voice(p.summary),paragraphs:p.paragraphs.map(voice)}));
const docs = () => allPages().filter(p=>p.section === 'docs' && p.id !== 'index');
const find = id => allPages().find(p=>p.id === id) || CONTENT.legal[state.lang].find(p=>p.id === id);
const pageHref = (id, overrides={}) => {
  const p = new URLSearchParams({variant:state.variant,page:id,lang:state.lang,theme:state.theme,frame:state.frame,...overrides});
  return '?' + p;
};
const link = (id,label,cls='') => `<a class="${cls}" href="${pageHref(id)}" data-page="${id}" ${state.page===id?'aria-current="page"':''}>${label}</a>`;
const icon = id => ST.ico(id);
const btn = (action,label,cls='') => `<button type="button" class="btn ${cls}" data-action="${action}">${label}</button>`;
const shortTitles = () => [L('Einstieg','Overview'),c('how'),L('Referenzen strukturieren','Structuring References'),c('preferences'),c('retry'),c('limitations')];
const chapters = () => ['index',...docs().map(p=>p.id)];
function chapterNav() { return `<nav class="chapter-nav" aria-label="${L('Kapitel','Chapters')}">${chapters().map((id,i)=>link(id,esc(shortTitles()[i]))).join('')}</nav>`; }
function guide(id,num,question) {
  const p=find(id);
  return link(id,`<span class="number">${num}</span><span><h3>${esc(question||p.title)}</h3><small>${esc(p.summary)}</small></span>${icon('i-arrow')}`,'guide');
}
function header() {
  return `<a href="#main" class="skip">${c('skip')}</a><header class="site-header"><div class="wrap"><div class="header-row">${link('home',ST.mark(32)+'<span>Source Taster</span>','brand')}<nav class="desktop-nav" aria-label="${c('nav')}">${link('index',c('docs'))}${link('faq',c('faq'))}${link('contact',c('contact'))}</nav><div class="utilities">${btn('search',icon('i-search'),'icon')}<a class="btn ghost" href="${pageHref(state.page,{lang:state.lang==='de'?'en':'de'})}" data-action="language" lang="${state.lang==='de'?'en':'de'}" aria-label="${L('Diese Seite auf Englisch','This page in German')}">${L('EN','DE')}</a>${btn('theme',icon(state.theme==='dark'?'i-swatch':'i-moon'),'icon')}<button class="btn icon mobile-menu" data-action="menu" aria-expanded="${state.menu}" aria-controls="mobile-nav" aria-label="${L('Menü','Menu')}">${icon('i-list')}</button></div></div>${state.menu?`<nav id="mobile-nav" class="mobile-nav" aria-label="${c('nav')}">${link('index',c('docs'))}${link('faq',c('faq'))}${link('contact',c('contact'))}${link('app-demo',L('App-Entwurf ansehen','View app design'))}</nav>`:''}</div></header>`;
}
function footer() {
  return `<footer class="wrap site-footer"><div class="footer-top"><div><strong>Source Taster</strong><br><span class="subtle">${L('Belege prüfen. Bewusst entscheiden.','Examine evidence. Make informed decisions.')}</span></div><div class="footer-links">${link('index',c('docs'))}${link('faq',c('faq'))}${link('contact',c('contact'))}</div></div><nav class="footer-links" aria-label="${c('legal')}">${link('legal-notice',c('notice'))}${link('terms',c('terms'))}${link('privacy',c('privacy'))}${link('withdrawal',c('withdrawal'))}${link('accessibility',c('accessibility'))}${link('cancellation',c('cancellation'))}${link('source-access',c('searchLicenses'))}</nav><p>${c('draft')}. ${L('Keine Anmeldung erforderlich.','No sign-in required.')}</p></footer>`;
}
function example() {
  return `<div class="example"><div class="example-top">${ST.mark(24)}<div class="command">${icon('i-search')}<span>${L('Referenzen einfügen …','Paste References …')}</span></div>${icon('i-user')}</div><div class="example-label">${L('DESIGNBEISPIEL · KEIN ECHTES PRÜFERGEBNIS','DESIGN EXAMPLE · NOT A REAL CHECK RESULT')}</div><div class="strip"><div class="strip-head"><strong>${L('Beispielprüfung','Sample Check')}</strong><span class="subtle">3 ${L('Referenzen','References')}</span></div><div class="counts"><span class="count correct">${ST.gly('correct')}1 ${L('Korrekt','Correct')}</span><span class="count deviations">${ST.gly('deviations')}1 ${L('Mit Abweichungen','With deviations')}</span><span class="count not-verifiable">${ST.gly('not-verifiable')}1 ${L('Nicht verifizierbar','Not verifiable')}</span></div></div><div class="reference"><div class="ref-label deviations">${ST.gly('deviations')}${L('Existiert, mit Abweichungen','Exists, with deviations')}</div><strong>Attention is all you need</strong><div class="subtle">Vaswani et al. · 2017</div><div class="meta">${L('Jahr stimmt überein · Titel weicht ab','Year matches · Title differs')}</div></div><div class="example-bottom"><span class="subtle">${L('Befund + Felder + Belege','Verdict + fields + evidence')}</span>${link('app-demo',L('App-Entwurf öffnen','Open app design'),'link')}</div></div>`;
}
function home() {
  const p=find('home');
  const heroCopy=`<div class="stack"><div><div class="eyebrow">${L('Wissenschaftliche Referenzen','Academic References')}</div><h1>${p.title}</h1></div><p class="lead">${p.summary}</p><div class="actions">${link('how-the-check-works',c('how')+' '+icon('i-arrow'),'btn primary')}${link('availability',c('limitations'),'link')}</div></div>`;
  const note=`<p class="hero-note">${p.paragraphs[0]}</p>`;
  if(state.variant==='A'||state.variant==='S') return `<main id="main" class="wrap" tabindex="-1"><section class="hero-A"><div>${heroCopy}${note}</div>${example()}</section><section class="section"><h2 class="section-title">${L('Verstehen, bevor Sie entscheiden','Understand before you decide')}</h2><div class="three">${['how-the-check-works','structuring','availability'].map((id,i)=>`<div class="stack"><div><span class="number">0${i+1}</span><h3>${find(id).title}</h3></div><p class="subtle">${find(id).summary}</p>${link(id,L('Weiterlesen','Read more')+' '+icon('i-arrow'),'link')}</div>`).join('')}</div></section><section class="section"><div class="stack"><h2>${L('Die Grenzen gehören dazu','The limits are part of the picture')}</h2><p>${p.paragraphs[1]}</p>${link('index',L('Zur Dokumentation','Read the documentation'),'link')}</div></section></main>`;
  if(state.variant==='B') return `<main id="main" class="wrap" tabindex="-1"><section class="hero-B">${heroCopy}${note}</section><div class="editorial-example">${example()}</div><section class="hero-B" style="padding-top:0">${['structuring','how-the-check-works','availability'].map((id,i)=>`<div class="editorial-row"><span class="eyebrow">0${i+1}</span><div class="stack"><h2>${find(id).title}</h2><p>${find(id).summary}</p>${link(id,L('Weiterlesen','Read more')+' '+icon('i-arrow'),'link')}</div></div>`).join('')}<p class="hero-note">${p.paragraphs[1]}</p></section></main>`;
  return `<main id="main" class="wrap" tabindex="-1"><section class="hero-C"><div>${heroCopy}${note}</div><div class="portal">${guide('how-the-check-works','01',L('Was sagt ein Befund aus?','What does a Verdict tell me?'))}${guide('structuring','02',L('Wie beginne ich mit Referenzen?','How do I start with References?'))}${guide('availability','03',L('Was kann ich bereits nutzen?','What can I use today?'))}${guide('errors-and-retry','04',L('Wie komme ich bei Fehlern weiter?','How do I recover from errors?'))}</div></section><section class="section"><div class="hero-C" style="padding:0"><div class="stack"><h2>${L('Ein Blick in den Arbeitsbereich','A look inside the workspace')}</h2><p>${p.paragraphs[1]}</p>${link('index',L('Alle Anleitungen','All guides'),'link')}</div>${example()}</div></section></main>`;
}
function articleHeadings(id) {
  const map={
    'how-the-check-works':[['Der aktuelle Prüfpfad','The current checking path'],['Status und Befund','Status and Verdict'],['Menschliche Beurteilung','Human judgment']],
    structuring:[['Eingabe und Felder','Input and fields'],['Strukturieren ist keine Prüfung','Structuring is separate from checking'],['Umfang und Grenzen','Scope and limits']],
    preferences:[['Im Arbeitsbereich','In the workspace'],['Bestehende Prüfungen','Existing Checks'],['Auf dieser Website','On this website']],
    'errors-and-retry':[['Verbindung prüfen','Check your connection'],['Verbindung wiederherstellen','Reconnecting'],['Erneut versuchen','Trying again']],
    availability:[['Prüfung und Erweiterung','Checking and extension'],['Account und Käufe','Account and purchases'],['Verlauf und Speicherung','History and storage']]
  };
  return (map[id]||[]).map(x=>L(...x));
}
function searchBox(modal=false) {
  return `<section class="${modal?'':'searchbox'}"><form class="search-form" role="search"><label for="${modal?'modal':'inline'}-query" class="sr-only">${c('search')}</label><input id="${modal?'modal':'inline'}-query" name="query" type="search" autocomplete="off" maxlength="200" placeholder="${L('z. B. DOI, Sprache, Fehler','e.g. DOI, language, errors')}" value="${esc(state.query)}"><button class="btn primary" type="submit">${c('submit')}</button></form><p class="search-help">${c('searchPrivacy')}</p><div class="search-output" aria-live="polite">${searchOutput()}</div></section>`;
}
function searchOutput() {
  if(state.searchStatus==='loading')return `<div role="status">${c('loading')}</div>`;
  if(state.searchStatus==='failure')return `<div role="status">${c('failure')}</div>${btn('retry-search',L('Erneut versuchen','Try again'))}`;
  if(state.searchStatus==='empty')return `<div role="status">${c('empty')}</div>${link('index',L('Alle Anleitungen ansehen','Browse all guides'),'link')}`;
  if(state.searchStatus==='results')return `<h3>${c('results')} (${state.matches.length})</h3>${state.matches.map(id=>{const p=find(id);return link(id,`<strong>${p.title}</strong><small>${p.summary}</small>`,'search-result');}).join('')}`;
  return `<p class="search-help">${c('prompt')}</p>`;
}
function docsIndex() {
  const p=find('index');
  return `<header class="intro stack"><div><div class="eyebrow">${L('Hilfe ohne Anmeldung','Help without sign-in')}</div><h1>${p.title}</h1></div><p class="lead">${p.summary}</p><p>${p.paragraphs[0]}</p></header>${state.variant==='B'?searchBox():btn('search',icon('i-search')+' '+c('search'))}<div class="${['C','S'].includes(state.variant)?'topic-grid':'guide-list'}">${docs().map((p,i)=>guide(p.id,'0'+(i+1),['C','S'].includes(state.variant)?[L('Was bedeuten die Befunde?','What do the Verdicts mean?'),L('Wie strukturiere ich Referenzen?','How do I structure References?'),L('Wie ändere ich Sprache und Stil?','How do I change language and style?'),L('Was tun bei Verbindungsfehlern?','What if my connection fails?'),L('Was ist bereits verfügbar?','What is available today?')][i]:null)).join('')}</div><div class="note" style="margin-top:28px">${p.paragraphs[1]}</div>`;
}
function documentation() {
  if(state.page==='index')return `<main id="main" tabindex="-1" class="wrap"><div class="${state.variant==='B'?'docs-B':['C','S'].includes(state.variant)?'docs-C':''}">${docsIndex()}</div></main>`;
  const p=find(state.page),heads=articleHeadings(p.id),idx=chapters().indexOf(p.id);
  const toc=`<aside class="toc"><strong>${L('Auf dieser Seite','On this page')}</strong>${heads.map((t,i)=>`<a href="#section-${i+1}">${t}</a>`).join('')}</aside>`;
  const crumb=`<nav class="breadcrumbs" aria-label="${L('Brotkrumennavigation','Breadcrumb')}">${link('home',c('home'))}<span>/</span>${link('index',c('docs'))}<span>/</span><span>${p.title}</span></nav>`;
  const article=`<article class="article">${crumb}<div class="eyebrow">${L('Anleitung','Guide')} · 0${idx} / 05</div><h1>${p.title}</h1><p class="lead">${p.summary}</p><div class="note">${L('Entwicklungsstand · Diese Anleitung beschreibt die lokale Version.','Development preview · This guide describes the local version.')}</div>${state.variant==='C'?toc:''}${p.paragraphs.map((txt,i)=>`<section id="section-${i+1}" class="article-section"><h2 tabindex="-1">${heads[i]||L('Hinweise','Notes')}</h2><p>${txt}</p></section>`).join('')}<nav class="pager" aria-label="${L('Weitere Kapitel','More chapters')}">${link(chapters()[idx-1],'← '+(idx===1?L('Einstieg','Overview'):find(chapters()[idx-1]).title))}${idx<chapters().length-1?link(chapters()[idx+1],find(chapters()[idx+1]).title+' →'):link('index',L('Alle Anleitungen','All guides')+' →')}</nav></article>`;
  if(state.variant==='A'||state.variant==='S')return `<main id="main" tabindex="-1" class="wrap"><div class="docs-A">${chapterNav()}<details class="chapter-disclosure mobile-chapters"><summary>${L('Kapitel wählen','Choose a chapter')}</summary>${chapterNav()}</details>${article}${toc}</div></main>`;
  if(state.variant==='B')return `<main id="main" tabindex="-1" class="wrap"><div class="docs-B"><details class="chapter-disclosure"><summary>${L('Anleitung wechseln','Change guide')} · ${p.title}</summary>${chapterNav()}</details>${searchBox()}${article}</div></main>`;
  return `<main id="main" tabindex="-1" class="wrap"><div class="docs-C">${article}<section class="section"><h2>${L('Wobei können wir noch helfen?','What else can we help with?')}</h2><div class="topic-grid">${docs().filter(x=>x.id!==p.id).slice(0,2).map((x,i)=>guide(x.id,'0'+(i+1))).join('')}</div>${link('index',L('Zur Themenübersicht','Back to all topics'),'link')}</section></div></main>`;
}
function simplePage() {
  let p=find(state.page);
  if(state.page==='source-access')return `<main id="main" tabindex="-1" class="wrap simple stack"><h1>${c('searchLicenses')}</h1><p>${L('Diese Designvorschau verwendet eine kleine Suche über die eingebundenen öffentlichen Texte. Sie enthält keine Pagefind-Suchmaschine.','This design preview uses a small search over the bundled public text. It does not contain the Pagefind search engine.')}</p><p>${L('Die bestehende Website verwendet lokal gebündeltes Pagefind. Ihre Lizenz- und Quellcodeauslieferung bleibt ein eigener Bestandteil des Website-Builds.','The existing website uses locally bundled Pagefind. Its license and source delivery remain a separate part of the website build.')}</p>${link('index',c('docs'),'link')}</main>`;
  if(state.page==='cancellation')return `<main id="main" tabindex="-1" class="wrap simple stack"><h1>${c('cancellation')}</h1><p class="lead">${L('Der Kündigungsdienst ist in dieser Vorschau nicht angeschlossen.','The cancellation service is not connected in this preview.')}</p><p>${L('Die öffentliche Kündigungsseite bleibt ohne Anmeldung erreichbar. Hier fehlt noch die konfigurierte Service-Adresse; es wird keine Kündigung entgegengenommen.','The public cancellation page remains accessible without sign-in. The configured service address is still missing here; this preview does not accept a cancellation.')}</p>${link('availability',c('limitations'),'link')}</main>`;
  if(!p)p={title:L('Seite nicht gefunden','Page not found'),summary:L('Wählen Sie eine öffentliche Anleitung.','Choose a public guide.'),paragraphs:[]};
  const legal=p.status==='draft';
  return `<main id="main" tabindex="-1" class="wrap simple"><nav class="breadcrumbs">${link('home',c('home'))}<span>/</span><span>${p.title}</span></nav><h1>${p.title}</h1>${legal?`<div class="note" style="margin-bottom:24px"><strong>${c('pending')}</strong><br>${c('version')}: <span class="mono">${p.version}</span></div>`:''}<p class="lead">${p.summary}</p>${p.id==='faq'?`<div class="faq">${p.paragraphs.map(txt=>{const end=txt.indexOf('?');return `<details><summary>${txt.slice(0,end+1)}</summary><p>${txt.slice(end+1).trim()}</p></details>`;}).join('')}</div>`:`<div class="stack">${p.paragraphs.map(txt=>`<p>${txt}</p>`).join('')}</div>`}<div class="actions" style="margin-top:32px">${link('index',c('docs'),'btn')}${link('availability',c('limitations'),'link')}</div></main>`;
}
function review() {
  $('#review').innerHTML=`<strong>${L('Website + Dokumentation','Website + documentation')} <span style="font-weight:400">· #198 · ${L('Entwurf','Draft')}</span></strong><label>${L('Ansicht','View')} <select aria-label="${L('Seite wählen','Choose page')}" data-review="page">${[...allPages().map(p=>p.id),...CONTENT.legal[state.lang].map(p=>p.id),'app-demo'].map(id=>`<option value="${id}" ${state.page===id?'selected':''}>${id==='app-demo'?L('App-Entwurf','App design'):find(id).title}</option>`).join('')}</select></label><label><select data-review="frame" aria-label="${L('Breite','Width')}"><option value="web" ${state.frame==='web'?'selected':''}>Web</option><option value="360" ${state.frame==='360'?'selected':''}>360 px</option></select></label><details><summary>${L('Vergleich und Suchzustände','Comparison and search states')}</summary><div class="tools">${['S','A','B','C'].map(v=>`<button data-variant="${v}" aria-pressed="${state.variant===v}">${v} · ${L(...names[v])}</button>`).join('')}<label>${L('Suche','Search')} <select data-review="searchMode"><option value="ready" ${state.searchMode==='ready'?'selected':''}>${L('Bereit','Ready')}</option><option value="loading" ${state.searchMode==='loading'?'selected':''}>${L('Laden','Loading')}</option><option value="failure" ${state.searchMode==='failure'?'selected':''}>${L('Fehler','Failure')}</option></select></label></div><p>${L('Akzeptiert: A mit der Fragenübersicht aus C als Dokumentationseinstieg. Originale zum Vergleich: A: Produkt + Kapitelnavigation. B: Lesefluss + schmale Navigation. C: Fragen + Themenportal.','Accepted: A with C’s question-led documentation index. Originals for comparison: A: product + chapter navigation. B: reading flow + light navigation. C: questions + topic portal.')}</p><p>${L('Suchbegriffe und Interaktionen bleiben im Arbeitsspeicher. Die App ist ein Designbeispiel, kein öffentlicher Dienst.','Search queries and interactions stay in memory. The app is a design example, not a public service.')}</p></details>`;
  $('#switcher').innerHTML=`<button data-action="previous" aria-label="${L('Vorherige Variante','Previous variant')}">←</button><span><b>${state.variant} · ${L(...names[state.variant])}</b><small>${L('Entwurfsvergleich','Design comparison')} · ${state.lang.toUpperCase()} · ${state.theme} · ${state.frame==='360'?'360 px':'Web'}</small></span><button data-action="next" aria-label="${L('Nächste Variante','Next variant')}">→</button>`;
}
function sync() {
  if(location.protocol==='about:')return;
  try { history.replaceState(null,'',pageHref(state.page)+location.hash); } catch { /* Sandboxed review may disallow history; in-memory controls remain available. */ }
}
function render(focus=false) {
  document.documentElement.lang=state.lang;
  document.title=`Source Taster · ${state.variant} ${L(...names[state.variant])} · ${find(state.page)?.title||L('App-Entwurf','App design')}`;
  const viewport=$('#viewport');viewport.className=state.frame==='360'?'phone':'';
  const demo=state.page==='app-demo';
  viewport.innerHTML=`<div class="site" data-variant="${state.variant}" data-theme="${state.theme}">${demo?`<main id="main" tabindex="-1"><div class="demo-head">${link('home','← '+c('home'),'btn')}<span class="badge">${L('App-Entwurf D · Beispieldaten · kein Prüfdienst','App design D · sample data · not a checking service')}</span></div><iframe class="app-demo" title="${L('Gewählter Prüfungsentwurf D','Selected checking design D')}" sandbox="allow-scripts"></iframe></main>`:header()+(state.page==='home'?home():find(state.page)?.section==='docs'?documentation():simplePage())+footer()}</div>`;
  if(demo){let src=CHECKING.replace('lang="de" data-theme="light"',`lang="${state.lang}" data-theme="${state.theme}"`).replace("lang: qs.get('lang') === 'en' ? 'en' : 'de'",`lang: '${state.lang}'`).replace("theme: qs.get('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')",`theme: '${state.theme}'`);$('.app-demo').srcdoc=src;}
  review();sync();
  for(const b of document.querySelectorAll('[data-action=search]'))b.setAttribute('aria-label',c('search'));
  for(const b of document.querySelectorAll('[data-action=theme]'))b.setAttribute('aria-label',L('Farbschema wechseln','Switch color scheme'));
  if(focus)$('#main').focus({preventScroll:true});
}
let returnFocus=null, searchTimer=null;
function openSearch() {
  if(state.variant==='B'&&find(state.page)?.section==='docs'){
    $('#inline-query').focus();$('#inline-query').scrollIntoView({block:'center'});return;
  }
  returnFocus=document.activeElement;
  const dialog=$('#search-dialog');dialog.dataset.theme=state.theme;
  dialog.innerHTML=`<div class="dialog-head"><h2 id="search-title">${c('search')}</h2>${btn('close-search',icon('i-close'),'icon')}</div>${searchBox(true)}`;
  dialog.querySelector('[data-action=close-search]').innerHTML='×';
  dialog.querySelector('[data-action=close-search]').setAttribute('aria-label',L('Suche schließen','Close search'));
  dialog.showModal();$('#modal-query').focus();
}
function patchSearch(){document.querySelectorAll('.search-output').forEach(el=>el.innerHTML=searchOutput());}
function runSearch(query,retry=false) {
  clearTimeout(searchTimer);state.query=query.trim().slice(0,200);
  if(!state.query){state.searchStatus='prompt';patchSearch();return;}
  state.searchStatus='loading';patchSearch();
  if(state.searchMode==='loading'&&!retry)return;
  searchTimer=setTimeout(()=>{
    if(state.searchMode==='failure'&&!retry){state.searchStatus='failure';patchSearch();return;}
    const words=state.query.toLocaleLowerCase(state.lang).split(/\s+/);
    state.matches=allPages().filter(p=>p.section==='docs'&&words.every(w=>(p.title+' '+p.summary+' '+p.paragraphs.join(' ')).toLocaleLowerCase(state.lang).includes(w))).map(p=>p.id);
    state.searchStatus=state.matches.length?'results':'empty';patchSearch();
  },180);
}
function navigate(id){
  if($('#search-dialog').open)$('#search-dialog').close();
  clearTimeout(searchTimer);state.page=id;state.menu=false;state.query='';state.searchStatus='prompt';
  if(location.hash)history.replaceState(null,'',pageHref(id));
  render(true);window.scrollTo({top:0,behavior:'instant'});
}
function cycle(d){const variants=['S','A','B','C'];state.variant=variants[(variants.indexOf(state.variant)+d+variants.length)%variants.length];state.menu=false;render();}
document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-page]');
  if(nav&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey){event.preventDefault();navigate(nav.dataset.page);return;}
  const variant=event.target.closest('[data-variant]');if(variant?.tagName==='BUTTON'){state.variant=variant.dataset.variant;render();return;}
  const el=event.target.closest('[data-action]');if(!el)return;
  const action=el.dataset.action;
  if(action==='search')return openSearch();
  if(action==='close-search')return $('#search-dialog').close();
  if(action==='retry-search')return runSearch(state.query,true);
  if(action==='next')return cycle(1);if(action==='previous')return cycle(-1);
  if(action==='language'){event.preventDefault();clearTimeout(searchTimer);state.lang=state.lang==='de'?'en':'de';state.query='';state.searchStatus='prompt';render();}
  if(action==='theme'){state.theme=state.theme==='dark'?'light':'dark';render();}
  if(action==='menu'){state.menu=!state.menu;render();document.querySelector('[data-action=menu]')?.focus();}
});
document.addEventListener('submit',e=>{if(!e.target.matches('.search-form'))return;e.preventDefault();runSearch(new FormData(e.target).get('query'));});
document.addEventListener('change',e=>{const key=e.target.dataset.review;if(!key)return;if(key==='page')navigate(e.target.value);else{state[key]=e.target.value;render();}});
document.addEventListener('keydown',e=>{
  if($('#search-dialog').open)return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();return;}
  if(e.key==='Escape'&&state.menu){state.menu=false;render();$('[data-action=menu]')?.focus();return;}
  if(e.target.closest('input,textarea,select,[contenteditable],summary')||e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();cycle(e.key==='ArrowLeft'?-1:1);}
});
$('#search-dialog').addEventListener('close',()=>{clearTimeout(searchTimer);if(state.searchStatus==='loading')state.searchStatus='prompt';returnFocus?.isConnected&&returnFocus.focus();});
$('#search-dialog').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();$('#search-dialog').close();}});
document.addEventListener('DOMContentLoaded',()=>render());
