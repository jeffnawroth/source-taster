/* PROTOTYPE (#194) — throwaway. In-memory simulation of one Check, shared by every variant so the variants
   differ only in structure. No persistence, no network. Variants read ST.state and call ST.act.*;
   ST.on(fn) re-renders on every change (fn receives the action name).

   Stages: intake → structuring → counted (count + Quota shown; auto-start, or the partial-Check offer)
           → running → done.  `view` is the nav place: check | history | account. */
window.ST = window.ST || {};
(() => {
  const qs = new URLSearchParams(location.search);
  const subs = new Set();
  const emit = (a) => subs.forEach((fn) => fn(a));
  ST.on = (fn) => { subs.add(fn); return () => subs.delete(fn); };

  const fresh = () => ST.REFS.map((r) => ({
    ...r, status: 'idle', step: 0, verdict: null, sysVerdict: r.verdict, override: null, hist: null,
    fields: r.rows ? Object.fromEntries(r.rows.map(([k, y]) => [k, y])) : null, draft: null, exportPick: false, accepted: false, revision: 1
  }));

  const s = ST.state = {
    view: 'check',
    stage: 'intake',
    intakeSource: 'paste',           // paste | file | selection
    input: '',
    regions: ST.DOCUMENT.regions.map((r) => ({ ...r, selected: true })),
    rejected: ST.DOCUMENT.rejected.map((r, i) => ({ id: 'x' + i, text: r, adopted: false })),
    refs: fresh(),
    filter: null,                    // null | verdict key | 'status'
    selected: null,                  // ref id
    scrollMemo: 0,
    connection: 'online',            // online | reconnecting
    account: qs.get('acct') || 'guest',      // guest | free
    historyOn: qs.get('hist') === '1',
    quota: { granted: 50, remaining: 47, reserved: 0 },
    quotaMode: qs.get('quota') || 'enough',  // enough | short (only 6 left)
    corrModel: qs.get('corr') || 'export',   // export | draft | apply
    startedAt: 0, finishedAt: 0, toast: null, dialog: null, cmdOpen: false
  };
  ST.N = () => s.refs.length;
  ST.available = () => (s.quotaMode === 'short' ? 6 : s.quota.remaining);
  ST.effective = (r) => r.override ? r.override.verdict : r.verdict;
  ST.counts = () => {
    const c = { correct: 0, deviations: 0, mixed: 0, 'doi-conflict': 0, 'not-found': 0, 'not-verifiable': 0 };
    const st = { running: 0, queued: 0, cancelled: 0, failed: 0, 'not-checked': 0 };
    for (const r of s.refs) {
      if (r.status === 'done' && ST.effective(r)) c[ST.effective(r)]++;
      else if (r.status === 'rechecking') st.running++;
      else if (st[r.status] != null) st[r.status]++;
    }
    return { verdicts: c, statuses: st, done: s.refs.filter((r) => r.status === 'done' || r.status === 'failed' || r.status === 'cancelled' || r.status === 'not-checked').length };
  };
  ST.visible = () => s.refs.filter((r) => !s.filter || (s.filter === 'status' ? r.status !== 'done' : (r.status === 'done' && ST.effective(r) === s.filter)));
  ST.ref = (id) => s.refs.find((r) => r.id === id);
  ST.isBusy = () => s.stage === 'running' || s.refs.some((r) => r.status === 'rechecking' || r.status === 'running' || r.status === 'queued');
  /* the field-by-field rows for the current revision: draft > committed fields */
  ST.rows = (r) => r.rows ? r.rows.map(([k, y, b, dev, by]) => { const v = r.fields[k]; return { key: k, label: ST.L(ST.FIELDS[k]), yours: v, best: b, deviates: v !== b, by }; }) : null;

  const timers = new Set();
  const later = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ST.calm() ? 0 : ms); timers.add(id); return id; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };
  ST.calm = () => qs.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  function runRef(r, delay, after) {
    later(delay, () => {
      r.status = 'running'; r.step = 0; emit('ref');
      const steps = r.trail.length;
      const tick = () => {
        if (r.status !== 'running') return;
        if (r.step < steps) { r.step++; emit('ref'); later(260, tick); return; }
        if (r.techFail) { r.status = 'failed'; }
        else { r.status = 'done'; r.verdict = r.sysVerdict; if (r.id === 7) r.override = { ...r.overrideFixture }; }
        emit('verdict'); after && after();
      };
      later(300, tick);
    });
  }
  ST.REFS.forEach((r) => { const live = s.refs.find((x) => x.id === r.id); live.overrideFixture = r.override; live.override = null; });

  ST.act = {
    nav(view) { s.view = view; emit('nav'); },
    setInput(text) { s.input = text; emit('input'); },
    example() { s.input = ST.INPUT_TEXT; s.intakeSource = 'paste'; emit('input'); },
    useFile() { s.intakeSource = 'file'; s.input = ''; emit('input'); },
    useSelection() { s.intakeSource = 'selection'; s.input = ST.INPUT_TEXT.split('\n\n').slice(0, ST.SELECTION.count).join('\n\n'); emit('input'); },
    toggleRegion(id) { const r = s.regions.find((x) => x.id === id); r.selected = !r.selected; emit('input'); },
    adoptRejected(id) { const r = s.rejected.find((x) => x.id === id); r.adopted = true; emit('input'); },
    canStart() { return s.intakeSource === 'file' ? s.regions.some((r) => r.selected) : s.input.trim().length > 0; },
    /* the single initial Check action */
    start() {
      if (!ST.act.canStart()) return;
      s.stage = 'structuring'; s.refs = fresh(); ST.REFS.forEach((r) => { s.refs.find((x) => x.id === r.id).overrideFixture = r.override; });
      emit('stage');
      later(900, () => {
        s.stage = 'counted'; emit('stage');
        if (ST.available() >= ST.N()) later(1400, () => ST.act.run(ST.N()));
      });
    },
    /* partial Check: the first n slots in list order */
    run(n) {
      s.stage = 'running'; s.startedAt = Date.now(); s.quota.reserved = n;
      s.refs.forEach((r, i) => { r.status = i < n ? 'queued' : 'not-checked'; });
      emit('stage');
      const todo = s.refs.filter((r) => r.status === 'queued');
      let left = todo.length;
      todo.forEach((r, i) => runRef(r, 250 + i * 650, () => {
        s.quota.reserved--; if (r.status === 'done') s.quota.remaining--;
        if (--left === 0) { s.stage = 'done'; s.finishedAt = Date.now(); emit('stage'); }
      }));
    },
    stop() {
      clearTimers();
      s.refs.forEach((r) => { if (r.status === 'queued' || r.status === 'running') { r.status = 'cancelled'; } });
      s.quota.reserved = 0; s.stage = 'done'; emit('stage'); ST.act.toast(ST.t('stopDone'));
    },
    reset() { clearTimers(); s.stage = 'intake'; s.input = ''; s.intakeSource = 'paste'; s.refs = fresh(); s.filter = null; s.selected = null; s.quota.reserved = 0; emit('stage'); },
    setFilter(v) { s.filter = s.filter === v ? null : v; emit('filter'); },
    select(id) { s.selected = id; emit('select'); },
    back() { s.selected = null; emit('select'); },
    step(dir) { const vis = ST.visible(); const i = vis.findIndex((r) => r.id === s.selected); const n = vis[(i + dir + vis.length) % vis.length]; if (n) { s.selected = n.id; emit('select'); } },
    /* ADR-0016 field editing: draft → Save and re-check (same slot, no new charge for a billed slot) */
    editFields(id, prefill) { const r = ST.ref(id); if (r.status === 'rechecking') return; r.draft = { ...(r.fields || { title: r.title }) }; if (prefill === 'suggestion' && r.rows) r.rows.forEach(([k, , b]) => { r.draft[k] = b; }); emit('draft'); },
    setDraft(id, key, value) { ST.ref(id).draft[key] = value; emit('draft-input'); },
    discardDraft(id) { ST.ref(id).draft = null; emit('draft'); },
    saveRecheck(id) {
      const r = ST.ref(id); if (!r.draft) return;
      r.hist = { verdict: ST.effective(r), override: r.override, revision: r.revision };
      if (r.fields) r.fields = { ...r.draft }; r.draft = null; r.revision++; r.override = null; r.status = 'rechecking'; r.step = 0; emit('recheck');
      later(2200, () => {
        r.status = 'done';
        if (r.recheck) { r.verdict = r.recheck.verdict; r.reason = r.recheck.reason; r.title = r.recheck.value; }
        else if (r.rows) { r.verdict = r.rows.every(([k, , b]) => r.fields[k] === b) ? 'correct' : r.sysVerdict; }
        emit('verdict');
      });
    },
    retry(id) { const r = ST.ref(id); r.techFail = false; r.sysVerdict = 'correct'; r.reason = ['Die Referenz existiert und ist korrekt zitiert.', 'The Reference exists and is cited correctly.']; r.status = 'queued'; emit('ref'); runRef(r, 200); },
    override(id, verdict) { const r = ST.ref(id); r.override = { verdict, note: null }; emit('override'); },
    clearOverride(id) { ST.ref(id).override = null; emit('override'); },
    pickExport(id) { const r = ST.ref(id); r.exportPick = !r.exportPick; emit('export'); },
    accept(id) { const r = ST.ref(id); r.accepted = !r.accepted; emit('accept'); },
    toast(text) { s.toast = text; emit('toast'); later(3200, () => { if (s.toast === text) { s.toast = null; emit('toast'); } }); },
    dialog(name) { s.dialog = name; emit('dialog'); },
    cmd(open) { s.cmdOpen = open ?? !s.cmdOpen; emit('cmd'); },
    setConnection(c) { s.connection = c; emit('connection'); },
    setAccount(a) { s.account = a; emit('account'); },
    setHistory(on) { s.historyOn = on; emit('account'); },
    setQuotaMode(m) { s.quotaMode = m; emit('quota'); },
    setCorrModel(m) { s.corrModel = m; emit('corr'); },
    /* jump straight to a stage for review (dev bar / URL ?stage=) */
    jump(stage) {
      clearTimers(); s.refs = fresh(); ST.REFS.forEach((r) => { s.refs.find((x) => x.id === r.id).overrideFixture = r.override; });
      s.selected = null; s.filter = null;
      if (stage === 'intake') { s.stage = 'intake'; s.input = ''; }
      if (stage === 'counted') { s.input = ST.INPUT_TEXT; s.stage = 'counted'; }
      if (stage === 'running') {
        s.input = ST.INPUT_TEXT; s.stage = 'running'; s.quota.reserved = 6;
        s.refs.forEach((r, i) => { if (i < 4) { r.status = r.techFail ? 'failed' : 'done'; r.verdict = r.sysVerdict; r.step = r.trail.length; } else if (i === 4) { r.status = 'running'; r.step = 2; } else r.status = 'queued'; });
      }
      if (stage === 'done' || stage === 'detail') {
        s.input = ST.INPUT_TEXT; s.stage = 'done';
        s.refs.forEach((r) => { r.step = r.trail.length; if (r.techFail) r.status = 'failed'; else { r.status = 'done'; r.verdict = r.sysVerdict; if (r.overrideFixture) r.override = { ...r.overrideFixture }; } });
        if (stage === 'detail') s.selected = +(qs.get('ref') || 3);
      }
      emit('stage');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (qs.get('view')) s.view = qs.get('view');
    const st = qs.get('stage'); if (st) setTimeout(() => ST.act.jump(st), 0);
  });
})();
