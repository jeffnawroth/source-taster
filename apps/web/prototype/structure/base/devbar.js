/* PROTOTYPE (#194) — throwaway. Variant switcher (bottom centre) and review dev bar (bottom left).
   Not part of any design being judged. Variants register with ST.variant({ key, name, css, mount }) where
   mount(root, ctx) returns an unmount function; ctx = { surface: 'web' | 'panel' }. Switching variants keeps
   the simulated Check state, so the same moment can be compared across structures. */
window.ST = window.ST || {};
(() => {
  const qs = new URLSearchParams(location.search);
  const html = document.documentElement;
  const V = ST.VARIANTS = [];
  ST.variant = (def) => V.push(def);
  const cfg = ST.cfg = {
    variant: qs.get('variant') || 'A', theme: qs.get('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    w: qs.get('w') === '360' ? '360' : 'web', lang: qs.get('lang') === 'en' ? 'en' : 'de', grey: qs.has('grey'), open: qs.has('dev')
  };
  const sync = () => {
    const p = new URLSearchParams(location.search);
    p.set('variant', cfg.variant); cfg.w === '360' ? p.set('w', '360') : p.delete('w'); p.set('theme', cfg.theme); p.set('lang', cfg.lang);
    cfg.grey ? p.set('grey', '1') : p.delete('grey');
    for (const [k, v] of [['acct', ST.state.account], ['quota', ST.state.quotaMode], ['corr', ST.state.corrModel]]) p.set(k, v);
    ST.state.historyOn ? p.set('hist', '1') : p.delete('hist');
    history.replaceState(null, '', '?' + p.toString());
  };
  const apply = () => {
    html.dataset.theme = cfg.theme; html.lang = cfg.lang;
    cfg.grey ? html.setAttribute('data-grey', '') : html.removeAttribute('data-grey');
    if (qs.has('still')) html.setAttribute('data-still', '');
    document.getElementById('stage').dataset.w = cfg.w;
  };
  let unmount = null;
  function mount() {
    unmount && unmount();
    const def = V.find((v) => v.key === cfg.variant) || V[0]; cfg.variant = def.key;
    const app = document.getElementById('app');
    app.innerHTML = ''; const root = document.createElement('div'); root.className = 'variant-root v-' + def.key; app.appendChild(root);
    let style = null; if (def.css) { style = document.createElement('style'); style.textContent = def.css; document.head.appendChild(style); }
    document.title = `#194 · ${def.key} ${def.name}`;
    const un = def.mount(root, { surface: cfg.w === '360' ? 'panel' : 'web' });
    unmount = () => { un && un(); style && style.remove(); };
    renderBar(); sync();
  }
  const rerender = () => { apply(); mount(); };
  ST.rerenderVariant = rerender;

  const btn = (act, label, on) => `<button type="button" data-dev="${act}" ${on ? 'aria-pressed="true"' : ''}>${label}</button>`;
  function renderBar() {
    const def = V.find((v) => v.key === cfg.variant);
    const s = ST.state;
    document.getElementById('switcher').innerHTML = `
      <button type="button" data-dev="prev" aria-label="Previous variant">‹</button>
      <span><b>${def.key}</b> ${ST.esc(def.name)} <small>${V.indexOf(def) + 1}/${V.length} · ⇧←/⇧→</small></span>
      <button type="button" data-dev="next" aria-label="Next variant">›</button>`;
    document.getElementById('devbar').innerHTML = `
      <button type="button" data-dev="toggle" class="dev-handle" aria-expanded="${cfg.open}">⚙︎ Review</button>
      ${cfg.open ? `<div class="dev-body">
        <div><span>View</span>${btn('theme:light', 'Light', cfg.theme === 'light')}${btn('theme:dark', 'Dark', cfg.theme === 'dark')}${btn('w:web', 'Web', cfg.w === 'web')}${btn('w:360', 'Panel 360', cfg.w === '360')}${btn('lang:de', 'DE', cfg.lang === 'de')}${btn('lang:en', 'EN', cfg.lang === 'en')}${btn('grey', 'Greyscale', cfg.grey)}</div>
        <div><span>Jump</span>${btn('jump:intake', 'Intake')}${btn('jump:counted', 'Counted')}${btn('jump:running', 'Running')}${btn('jump:done', 'Done')}${btn('jump:detail', 'Detail #3')}</div>
        <div><span>Account</span>${btn('acct:guest', 'Guest', s.account === 'guest')}${btn('acct:free', 'Signed in', s.account === 'free')}${btn('hist', 'History on', s.historyOn)}</div>
        <div><span>Quota</span>${btn('quota:enough', 'Enough', s.quotaMode === 'enough')}${btn('quota:short', 'Only 6 left', s.quotaMode === 'short')}${btn('conn', 'Connection lost', s.connection !== 'online')}</div>
        <div><span>Correction</span>${btn('corr:export', 'a · Use for export', s.corrModel === 'export')}${btn('corr:draft', 'b · Apply to fields', s.corrModel === 'draft')}${btn('corr:apply', 'c · Accept (amend)', s.corrModel === 'apply')}</div>
      </div>` : ''}`;
  }
  const cycle = (d) => { const i = V.findIndex((v) => v.key === cfg.variant); cfg.variant = V[(i + d + V.length) % V.length].key; rerender(); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-dev]'); if (!b) return;
    const [k, v] = b.dataset.dev.split(':');
    if (k === 'prev') return cycle(-1); if (k === 'next') return cycle(1);
    if (k === 'toggle') { cfg.open = !cfg.open; return renderBar(); }
    if (k === 'theme') cfg.theme = v;
    if (k === 'lang') { cfg.lang = v; apply(); return mount(); } if (k === 'grey') cfg.grey = !cfg.grey;
    if (k === 'w') { cfg.w = v; apply(); return mount(); }
    if (k === 'jump') ST.act.jump(v);
    if (k === 'acct') ST.act.setAccount(v); if (k === 'hist') ST.act.setHistory(!ST.state.historyOn);
    if (k === 'quota') ST.act.setQuotaMode(v); if (k === 'corr') ST.act.setCorrModel(v);
    if (k === 'conn') ST.act.setConnection(ST.state.connection === 'online' ? 'reconnecting' : 'online');
    apply(); renderBar(); sync();
  });
  document.addEventListener('keydown', (e) => {
    if (!e.shiftKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    e.preventDefault(); cycle(e.key === 'ArrowLeft' ? -1 : 1);
  });
  ST.on(() => renderBar());
  document.addEventListener('DOMContentLoaded', () => { apply(); mount(); });
})();
