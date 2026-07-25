const puppeteer = require('puppeteer')

const brand = {
  p: '#4e2e92', pl: '#6b4db8', pd: '#3a1f6e',
  t: '#1f6b7c', tl: '#45a3b5',
  g: '#2d7a31', gl: '#70c875',
  a: '#c9952e', al: '#e0b352',
  bg: '#0f0f1a', bg2: '#1a1a2e',
  text: '#e8e8f0', text2: '#9090a8',
  border: 'rgba(255,255,255,0.08)',
}

const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="${brand.p}"/><text x="64" y="80" font-family="system-ui" font-size="60" font-weight="800" fill="white" text-anchor="middle">S</text></svg>`

function html(content) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:#1e1e2e;display:flex;align-items:center;justify-content:center;
  min-height:800px;overflow:hidden}
.browser{width:1280px;height:780px;border-radius:12px;overflow:hidden;
  display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.5);position:relative}
.tab-bar{height:40px;background:#2a2a3e;display:flex;align-items:center;
  padding:0 12px;gap:10px;flex-shrink:0}
.tab-dot{width:12px;height:12px;border-radius:50%;background:#555}
.tab-url{flex:1;background:#1e1e2e;border-radius:4px;height:24px;display:flex;align-items:center;
  padding:0 10px;font-size:11px;color:#888;margin:0 8px}
.tab-url svg{width:14px;height:14px;margin-right:6px;fill:#888}
.body{display:flex;flex:1;overflow:hidden}
.page{flex:1;overflow-y:auto;background:#f8f8fc}
.panel{width:400px;background:${brand.bg};border-left:1px solid ${brand.border};
  display:flex;flex-direction:column;overflow-y:auto}
${content.styles||''}
</style></head><body>
<div class="browser">
  <div class="tab-bar">
    <div class="tab-dot"></div><div class="tab-dot"></div><div class="tab-dot"></div>
    <div class="tab-url"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>chatgpt.com</div>
  </div>
  <div class="body">
    <div class="page">${content.page||''}</div>
    <div class="panel">${content.panel}</div>
  </div>
</div></body></html>`
}

const s1 = html({
  styles: `
.ph{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.ph img{height:22px}
.ph span{font-size:13px;font-weight:700;color:${brand.text}}
.sum{display:flex;gap:16px;padding:12px 16px;border-bottom:1px solid ${brand.border}}
.s{text-align:center}
.sn{font-size:18px;font-weight:800}
.sn.g{color:${brand.gl}}
.sn.y{color:${brand.al}}
.sn.r{color:#ff6060}
.sl{font-size:10px;color:${brand.text2};margin-top:2px}
.tabs{display:flex;border-bottom:1px solid ${brand.border};padding:0 12px}
.tab{padding:8px 14px;font-size:12px;color:${brand.text2};cursor:pointer;border-bottom:2px solid transparent;font-weight:500}
.tab.act{color:${brand.tl};border-bottom-color:${brand.tl}}
.rl{padding:12px;display:flex;flex-direction:column;gap:8px}
.r{background:${brand.bg2};border-radius:8px;padding:12px 14px;border:1px solid ${brand.border}}
.rt{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.rtt{font-size:12px;font-weight:600;color:${brand.text};line-height:1.4;flex:1}
.rb{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap;margin-left:8px}
.rb.e{background:rgba(45,122,49,0.2);color:${brand.gl}}
.rb.s{background:rgba(45,122,49,0.15);color:${brand.gl}}
.rb.p{background:rgba(201,149,46,0.2);color:${brand.al}}
.rb.n{background:rgba(255,80,80,0.15);color:#ff6060}
.rm{font-size:11px;color:${brand.text2};line-height:1.5;margin-top:4px}
.rs{display:flex;align-items:center;gap:8px;margin-top:8px}
.sb{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,0.08)}
.sf{height:100%;border-radius:2px}
.lbl{font-size:10px;font-weight:600;min-width:30px;text-align:right}
.pc{padding:40px;background:#f8f8fc}
.pc h2{font-size:20px;color:#1a1a2e;margin-bottom:16px}
.pc p{font-size:14px;color:#555;line-height:1.6;margin-bottom:12px}
`,
  page: `<div class="pc"><h2>Literature Review: Attention Mechanisms</h2>
<p>... as demonstrated in recent studies (Vaswani et al., 2023; Devlin et al., 2019; Brown et al., 2024). The transformer architecture has become the de facto standard for NLP tasks (Smith & Johnson, 2022).</p>
<p>Alternative approaches have been proposed by various authors (Chen et al., 2023; Liu & Wang, 2024; Zhang et al., 2022). However, the scalability of these methods remains...</p></div>`,
  panel: `<div class="ph"><img src="data:image/svg+xml,${encodeURIComponent(logo)}" alt=""/><span>Source Taster</span></div>
<div class="sum"><div class="s"><div class="sn g">3</div><div class="sl">Verified</div></div>
<div class="s"><div class="sn y">1</div><div class="sl">Uncertain</div></div>
<div class="s"><div class="sn r">1</div><div class="sl">Fake</div></div>
<div class="s"><div class="sn" style="color:${brand.text}">5</div><div class="sl">Total</div></div></div>
<div class="tabs"><div class="tab act">All</div><div class="tab">Verified</div><div class="tab">Suspect</div><div class="tab">Settings</div></div>
<div class="rl">
<div class="r"><div class="rt"><div class="rtt">Vaswani, A. et al. (2023). Attention Is All You Need. Advances in NeurIPS.</div><div class="rb e">100%</div></div><div class="rm">DOI: 10.5555/3295222.3295349 · OpenAlex, Crossref, Semantic Scholar</div><div class="rs"><div class="sb"><div class="sf" style="width:100%;background:${brand.gl}"></div></div><div class="lbl" style="color:${brand.gl}">100%</div></div></div>
<div class="r" style="opacity:0.6"><div class="rt"><div class="rtt">Devlin, J. et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers.</div><div class="rb s">92%</div></div><div class="rm">DOI: 10.5555/3295222.3295349 · Crossref, Semantic Scholar</div><div class="rs"><div class="sb"><div class="sf" style="width:92%;background:${brand.gl}"></div></div><div class="lbl" style="color:${brand.gl}">92%</div></div></div>
<div class="r"><div class="rt"><div class="rtt">Chen, L. et al. (2023). Efficient Transformers. ACM Computing Surveys.</div><div class="rb p">67%</div></div><div class="rm">DOI: 10.1145/3560816 · Possible author mismatch</div><div class="rs"><div class="sb"><div class="sf" style="width:67%;background:${brand.al}"></div></div><div class="lbl" style="color:${brand.al}">67%</div></div></div>
<div class="r"><div class="rt"><div class="rtt">Martinez, R. & Kim, S. (2024). Quantum Attention. Unpublished.</div><div class="rb n">No Match</div></div><div class="rm">Not found in any of 5 databases — likely hallucinated</div><div class="rs"><div class="sb"><div class="sf" style="width:18%;background:#ff6060"></div></div><div class="lbl" style="color:#ff6060">18%</div></div></div>
</div>`
})

const s2 = html({
  styles: `
.ph{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.ph img{height:22px}
.ph span{font-size:13px;font-weight:700;color:${brand.text}}
.bk{font-size:11px;color:${brand.tl};padding:8px 16px 0;display:flex;align-items:center;gap:4px}
.dt{padding:16px}
.dtt{font-size:14px;font-weight:700;color:${brand.text};margin-bottom:4px;line-height:1.4}
.dtd{font-size:11px;color:${brand.tl};margin-bottom:12px}
.ov{text-align:center;padding:16px;background:${brand.bg2};border-radius:10px;margin-bottom:16px}
.ovn{font-size:36px;font-weight:800;color:${brand.gl}}
.ovl{font-size:11px;color:${brand.text2}}
.ovb{display:inline-block;font-size:10px;font-weight:600;padding:2px 10px;border-radius:4px;background:rgba(45,122,49,0.2);color:${brand.gl};margin-top:6px}
.fd{display:flex;flex-direction:column;gap:8px}
.fr{display:flex;align-items:center;gap:10px}
.fl{font-size:11px;color:${brand.text2};min-width:90px;text-align:right}
.fb{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,0.08)}
.ff{height:100%;border-radius:3px}
.fs{font-size:11px;font-weight:600;min-width:30px}
.si{padding:12px;background:${brand.bg2};border-radius:8px;margin-top:16px;font-size:11px;color:${brand.text2};line-height:1.6}
.si strong{color:${brand.text}}
.pc{padding:40px;background:#f8f8fc}
.cb{background:#e8e8f8;border-radius:12px 12px 12px 4px;padding:12px 16px;font-size:13px;color:#333;line-height:1.5;max-width:70%;margin-bottom:16px}
`,
  page: `<div class="pc"><div class="cb">Can you summarize the key findings from &ldquo;Vaswani et al. (2023) Attention Is All You Need&rdquo;?</div><div class="cb">Also check if &ldquo;Martinez &amp; Kim (2024)&rdquo; actually exists.</div></div>`,
  panel: `<div class="ph"><img src="data:image/svg+xml,${encodeURIComponent(logo)}" alt=""/><span>Source Taster</span></div>
<div class="bk">← Back to list</div>
<div class="dt">
<div class="dtt">Vaswani, A. et al. (2023). Attention Is All You Need.</div>
<div class="dtd">DOI: 10.5555/3295222.3295349</div>
<div class="ov"><div class="ovn">100%</div><div class="ovl">Overall match score</div><div class="ovb">✓ Exact Match</div></div>
<div class="fd">
<div class="fr"><div class="fl">Title</div><div class="fb"><div class="ff" style="width:100%;background:${brand.gl}"></div></div><div class="fs" style="color:${brand.gl}">100%</div></div>
<div class="fr"><div class="fl">Authors</div><div class="fb"><div class="ff" style="width:100%;background:${brand.gl}"></div></div><div class="fs" style="color:${brand.gl}">100%</div></div>
<div class="fr"><div class="fl">Year</div><div class="fb"><div class="ff" style="width:100%;background:${brand.gl}"></div></div><div class="fs" style="color:${brand.gl}">100%</div></div>
<div class="fr"><div class="fl">Journal</div><div class="fb"><div class="ff" style="width:100%;background:${brand.gl}"></div></div><div class="fs" style="color:${brand.gl}">100%</div></div>
<div class="fr"><div class="fl">DOI</div><div class="fb"><div class="ff" style="width:100%;background:${brand.gl}"></div></div><div class="fs" style="color:${brand.gl}">100%</div></div>
</div>
<div class="si"><strong>Sources:</strong> OpenAlex ✓ · Crossref ✓ · Semantic Scholar ✓<br><strong>Match in:</strong> OpenAlex (100%), Crossref (100%)<br><strong>Time:</strong> 0.8s</div>
</div>`
})

const s3 = html({
  styles: `
.ph{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.ph img{height:22px}
.ph span{font-size:13px;font-weight:700;color:${brand.text}}
.ia{padding:16px}
.il{font-size:11px;color:${brand.text2};margin-bottom:6px;font-weight:500}
.tf{width:100%;min-height:120px;background:${brand.bg2};border:1px solid ${brand.border};border-radius:8px;padding:12px;color:${brand.text};font-size:12px;font-family:inherit;resize:none;line-height:1.6}
.da{margin-top:8px;border:2px dashed ${brand.border};border-radius:8px;padding:16px;text-align:center;cursor:pointer}
.da svg{width:26px;height:26px;fill:${brand.text3};margin-bottom:6px}
.da p{font-size:11px;color:${brand.text2}}
.da p strong{color:${brand.tl}}
.iact{display:flex;gap:8px;margin-top:12px}
.ibtn{flex:1;padding:8px;border-radius:6px;border:none;font-size:11px;font-weight:600;cursor:pointer}
.ibtn.p{background:linear-gradient(135deg,${brand.p},${brand.t});color:#fff}
.ibtn.s{background:${brand.bg2};color:${brand.text};border:1px solid ${brand.border}}
.eo{padding:12px 16px;border-top:1px solid ${brand.border}}
.or{display:flex;justify-content:space-between;align-items:center;padding:6px 0}
.or label{font-size:11px;color:${brand.text2}}
.tg{width:32px;height:18px;border-radius:9px;background:${brand.border};position:relative;cursor:pointer;flex-shrink:0}
.tg.on{background:${brand.tl}}
.tg::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:2px;left:2px;transition:.15s}
.tg.on::after{left:16px}
.pc{padding:40px;background:#f8f8fc}
.pc p{font-size:14px;color:#555;line-height:1.6}
.pf{background:#eeeef5;border-radius:8px;padding:16px;margin-bottom:16px}
.pfn{font-size:12px;font-weight:600;color:#333;margin-bottom:2px}
.pfs{font-size:11px;color:#888}
`,
  page: `<div class="pc"><div class="pf"><div class="pfn">📄 manuscript_v3.pdf</div><div class="pfs">24 pages · 47 references detected</div></div><p>... as shown in previous work (Smith, 2024; Johnson et al., 2023; Brown et al., 2024). The transformer architecture has demonstrated remarkable capabilities across various natural language processing tasks. Recent advances in large language models have further pushed the boundaries of what is possible...</p></div>`,
  panel: `<div class="ph"><img src="data:image/svg+xml,${encodeURIComponent(logo)}" alt=""/><span>Source Taster</span></div>
<div class="ia">
<div class="il">Paste references or bibliography text</div>
<textarea class="tf" placeholder="Smith, J. (2024) Example Article. Journal, 12(3), 45-67.">Smith, J. (2024). Example Article. Journal, 12(3), 45-67.
https://doi.org/10.1000/example

Brown, T. et al. (2024). Language Models. NeurIPS.</textarea>
<div class="da"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg><p>Drag & drop a <strong>PDF</strong> to extract references</p></div>
<div class="iact"><button class="ibtn p">Extract & Verify</button><button class="ibtn s">AnyStyle</button></div>
</div>
<div class="eo">
<div class="or"><label>AI extraction (LLM)</label><div class="tg on"></div></div>
<div class="or"><label>Early termination at 90%</label><div class="tg on"></div></div>
<div class="or"><label>Search arXiv</label><div class="tg"></div></div>
</div>`
})

const s4 = html({
  styles: `
.ph{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.ph img{height:22px}
.ph span{font-size:13px;font-weight:700;color:${brand.text}}
.tabs{display:flex;border-bottom:1px solid ${brand.border};padding:0 12px}
.tab{padding:8px 14px;font-size:12px;color:${brand.text2};border-bottom:2px solid transparent;font-weight:500}
.tab.act{color:${brand.tl};border-bottom-color:${brand.tl}}
.st{padding:16px}
.stt{font-size:12px;font-weight:600;color:${brand.text};margin-bottom:10px;margin-top:16px}
.stt:first-child{margin-top:0}
.sr{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid ${brand.border}}
.sr:last-child{border-bottom:none}
.sl{font-size:11px;color:${brand.text2};display:flex;align-items:center;gap:8px}
.sl strong{color:${brand.text}}
.sv{font-size:11px;color:${brand.text};display:flex;align-items:center;gap:6px}
.tg{width:32px;height:18px;border-radius:9px;background:${brand.border};position:relative;cursor:pointer;flex-shrink:0}
.tg.on{background:${brand.tl}}
.tg::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:2px;left:2px;transition:.15s}
.tg.on::after{left:16px}
.bg{font-size:9px;padding:2px 6px;border-radius:3px;font-weight:600}
.bg.gr{background:rgba(45,122,49,0.2);color:${brand.gl}}
.dh{color:${brand.text3};cursor:grab;font-size:14px;margin-right:4px}
.pc{padding:40px;text-align:center;color:#888;font-size:13px;background:#f8f8fc}
`,
  page: `<div class="pc"><div style="font-size:48px;margin-bottom:16px">⚙️</div><p style="font-weight:600;color:#555;margin-bottom:4px">Extension Settings</p><p style="font-size:12px">Configure your verification pipeline</p></div>`,
  panel: `<div class="ph"><img src="data:image/svg+xml,${encodeURIComponent(logo)}" alt=""/><span>Source Taster</span></div>
<div class="tabs"><div class="tab">All</div><div class="tab">Verified</div><div class="tab">Suspect</div><div class="tab act">Settings</div></div>
<div class="st">
<div class="stt">🔍 Search Databases</div>
<div class="sr"><span class="dh">⠿</span><span class="sl"><strong>OpenAlex</strong></span><div class="tg on"></div></div>
<div class="sr"><span class="dh">⠿</span><span class="sl"><strong>Crossref</strong> <span class="bg gr">Recommended</span></span><div class="tg on"></div></div>
<div class="sr"><span class="dh">⠿</span><span class="sl"><strong>Semantic Scholar</strong></span><div class="tg on"></div></div>
<div class="sr"><span class="dh">⠿</span><span class="sl"><strong>Europe PMC</strong></span><div class="tg on"></div></div>
<div class="sr"><span class="dh">⠿</span><span class="sl"><strong>arXiv</strong></span><div class="tg"></div></div>
<div class="stt">⚡ Early Termination</div>
<div class="sr"><span class="sl">Stop after match ≥</span><span class="sv">90% <div class="tg on"></div></span></div>
<div class="stt">🔐 AI Provider</div>
<div class="sr"><span class="sl">Provider</span><span class="sv" style="color:${brand.tl}">OpenAI · GPT-5</span></div>
<div class="sr"><span class="sl">API Key</span><span class="sv">•••••••• <span style="color:${brand.gl};font-size:10px;font-weight:600">Saved</span></span></div>
</div>`
})

const s5 = html({
  styles: `
.ph{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.ph img{height:22px}
.ph span{font-size:13px;font-weight:700;color:${brand.text}}
.rp{padding:16px}
.rpt{font-size:14px;font-weight:700;color:${brand.text};margin-bottom:4px}
.rps{font-size:11px;color:${brand.text2};margin-bottom:16px}
.rc{display:flex;gap:12px;margin-bottom:16px}
.rcard{flex:1;background:${brand.bg2};border-radius:8px;padding:12px;text-align:center}
.rcn{font-size:22px;font-weight:800}
.rcl{font-size:10px;color:${brand.text2};margin-top:2px}
.stbl{width:100%;border-collapse:collapse;font-size:11px}
.stbl th{text-align:left;color:${brand.text2};font-weight:500;padding:6px 4px;border-bottom:1px solid ${brand.border}}
.stbl td{padding:6px 4px;border-bottom:1px solid ${brand.border};color:${brand.text}}
.st{font-size:10px;font-weight:600;padding:2px 6px;border-radius:3px}
.st.ok{background:rgba(45,122,49,0.2);color:${brand.gl}}
.st.wa{background:rgba(201,149,46,0.2);color:${brand.al}}
.st.bd{background:rgba(255,80,80,0.15);color:#ff6060}
.ebtn{display:block;width:100%;padding:10px;margin-top:16px;border-radius:6px;border:none;background:linear-gradient(135deg,${brand.p},${brand.t});color:#fff;font-size:12px;font-weight:600;cursor:pointer}
.pc{padding:40px;text-align:center;color:#888;font-size:13px;background:#f8f8fc}
`,
  page: `<div class="pc"><div style="font-size:48px;margin-bottom:16px">📊</div><p style="font-weight:600;color:#555;margin-bottom:4px">Batch verification complete</p><p style="font-size:12px">47 references checked across 5 databases</p></div>`,
  panel: `<div class="ph"><img src="data:image/svg+xml,${encodeURIComponent(logo)}" alt=""/><span>Source Taster</span></div>
<div class="rp">
<div class="rpt">Verification Report</div>
<div class="rps">manuscript_v3.pdf · 47 references · 2.4s total</div>
<div class="rc">
<div class="rcard"><div class="rcn" style="color:${brand.gl}">32</div><div class="rcl">Verified</div></div>
<div class="rcard"><div class="rcn" style="color:${brand.al}">11</div><div class="rcl">Uncertain</div></div>
<div class="rcard"><div class="rcn" style="color:#ff6060">4</div><div class="rcl">Fake</div></div>
</div>
<table class="stbl">
<tr><th>Reference</th><th>Score</th><th>Status</th></tr>
<tr><td>Vaswani et al. (2023)</td><td>100%</td><td><span class="st ok">Verified</span></td></tr>
<tr><td>Devlin et al. (2019)</td><td>92%</td><td><span class="st ok">Verified</span></td></tr>
<tr><td>Brown et al. (2024)</td><td>85%</td><td><span class="st ok">Verified</span></td></tr>
<tr><td>Chen et al. (2023)</td><td>67%</td><td><span class="st wa">Uncertain</span></td></tr>
<tr><td>Martinez & Kim (2024)</td><td>18%</td><td><span class="st bd">Not Found</span></td></tr>
<tr><td>Liu & Wang (2024)</td><td>12%</td><td><span class="st bd">Not Found</span></td></tr>
</table>
<button class="ebtn">📋 Copy Report</button>
</div>`
})

const screenshots = [
  { html: s1, name: '01-main-view.png' },
  { html: s2, name: '02-match-details.png' },
  { html: s3, name: '03-input-pdf.png' },
  { html: s4, name: '04-settings.png' },
  { html: s5, name: '05-report.png' },
]

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  for (const { html, name } of screenshots) {
    await page.setContent(html, { waitUntil: 'load' })
    await page.screenshot({ path: __dirname + '/' + name, fullPage: false })
    console.log('✓ ' + name)
  }
  await browser.close()
  console.log('\nDone.')
}

main().catch(e => { console.error(e); process.exit(1) })
