import puppeteer from 'puppeteer'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname)

const brand = {
  p: '#4e2e92',
  pl: '#6b4db8',
  pd: '#3a1f6e',
  t: '#1f6b7c',
  tl: '#45a3b5',
  g: '#2d7a31',
  gl: '#70c875',
  a: '#c9952e',
  al: '#e0b352',
  bg: '#0f0f1a',
  bg2: '#1a1a2e',
  text: '#e8e8f0',
  text2: '#9090a8',
  border: 'rgba(255,255,255,0.08)',
}

function frame(content, title) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:#1e1e2e;display:flex;align-items:center;justify-content:center;
  min-height:800px;overflow:hidden}
.browser{width:1280px;height:780px;border-radius:12px;overflow:hidden;
  display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.5);
  position:relative}
.tab-bar{height:40px;background:#2a2a3e;display:flex;align-items:center;
  padding:0 12px;gap:10px;flex-shrink:0}
.tab-dot{width:12px;height:12px;border-radius:50%;background:#555}
.tab-url{flex:1;background:#1e1e2e;border-radius:4px;height:24px;
  display:flex;align-items:center;padding:0 10px;font-size:11px;color:#888;margin:0 8px}
.tab-url svg{width:14px;height:14px;margin-right:6px;fill:#888}
.body{display:flex;flex:1;overflow:hidden}
.page{flex:1;background:#fff;display:flex;flex-direction:column;position:relative;overflow:hidden}
.panel{width:400px;background:${brand.bg};border-left:1px solid ${brand.border};
  display:flex;flex-direction:column;overflow-y:auto}
${content.styles || ''}
</style></head><body>
<div class="browser">
  <div class="tab-bar">
    <div class="tab-dot"></div><div class="tab-dot"></div><div class="tab-dot"></div>
    <div class="tab-url"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>chatgpt.com</div>
  </div>
  <div class="body">
    <div class="page">${content.page || ''}</div>
    <div class="panel">${content.panel}</div>
  </div>
</div>
</body></html>`
}

// Screenshot 1: Main — reference list with verification results
const s1 = frame({
  styles: `
.panel-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.panel-header img{height:22px}
.panel-header span{font-size:13px;font-weight:700;color:${brand.text}}
.panel-tabs{display:flex;border-bottom:1px solid ${brand.border};padding:0 12px}
.panel-tab{padding:8px 14px;font-size:12px;color:${brand.text2};cursor:pointer;border-bottom:2px solid transparent;font-weight:500}
.panel-tab.active{color:${brand.tl};border-bottom-color:${brand.tl}}
.ref-list{padding:12px;display:flex;flex-direction:column;gap:8px}
.ref{background:${brand.bg2};border-radius:8px;padding:12px 14px;border:1px solid ${brand.border}}
.ref-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.ref-title{font-size:12px;font-weight:600;color:${brand.text};line-height:1.4;flex:1}
.ref-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap;margin-left:8px}
.ref-badge.exact{background:rgba(45,122,49,0.2);color:${brand.gl}}
.ref-badge.strong{background:rgba(45,122,49,0.15);color:${brand.gl}}
.ref-badge.possible{background:rgba(201,149,46,0.2);color:${brand.al}}
.ref-badge.none{background:rgba(255,80,80,0.15);color:#ff6060}
.ref-meta{font-size:11px;color:${brand.text2};line-height:1.5}
.ref-score{display:flex;align-items:center;gap:8px;margin-top:8px}
.score-bar{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,0.08)}
.score-fill{height:100%;border-radius:2px}
.score-label{font-size:10px;font-weight:600;min-width:30px;text-align:right}
.status-summary{display:flex;gap:16px;padding:12px 16px;border-bottom:1px solid ${brand.border}}
.stat{text-align:center}
.stat-num{font-size:18px;font-weight:800}
.stat-num.g{color:${brand.gl}}
.stat-num.y{color:${brand.al}}
.stat-num.r{color:#ff6060}
.stat-lbl{font-size:10px;color:${brand.text2};margin-top:2px}
.page{background:#f8f8fc;display:flex;flex-direction:column}
.page-content{padding:40px;overflow-y:auto}
.page-content h2{font-size:20px;color:#1a1a2e;margin-bottom:16px}
.page-content p{font-size:14px;color:#555;line-height:1.6;margin-bottom:12px}
.page-content .paper-meta{font-size:12px;color:#888}
`,
  page: `
<div class="page-content">
  <h2>Literature Review: Attention Mechanisms</h2>
  <p>... as demonstrated in recent studies (Vaswani et al., 2023; Devlin et al., 2019; Brown et al., 2024). The transformer architecture has become the de facto standard for NLP tasks (Smith & Johnson, 2022).</p>
  <p>Alternative approaches have been proposed by various authors (Chen et al., 2023; Liu & Wang, 2024; Zhang et al., 2022). However, the scalability of these methods remains... </p>
</div>`,
  panel: `
<div class="panel-header">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='60' fill='%234e2e92'/%3E%3Ctext x='64' y='80' font-family='system-ui' font-size='60' font-weight='800' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="" />
  <span>Source Taster</span>
</div>
<div class="status-summary">
  <div class="stat"><div class="stat-num g">3</div><div class="stat-lbl">Verified</div></div>
  <div class="stat"><div class="stat-num y">1</div><div class="stat-lbl">Uncertain</div></div>
  <div class="stat"><div class="stat-num r">1</div><div class="stat-lbl">Fake</div></div>
  <div class="stat"><div class="stat-num" style="color:${brand.text}">5</div><div class="stat-lbl">Total</div></div>
</div>
<div class="panel-tabs">
  <div class="panel-tab active">All</div>
  <div class="panel-tab">Verified</div>
  <div class="panel-tab">Suspect</div>
  <div class="panel-tab">Settings</div>
</div>
<div class="ref-list">
  <div class="ref">
    <div class="ref-top">
      <div class="ref-title">Vaswani, A. et al. (2023). Attention Is All You Need. Advances in NeurIPS.</div>
      <div class="ref-badge exact">100%</div>
    </div>
    <div class="ref-meta">DOI: 10.5555/3295222.3295349 · OpenAlex, Crossref, Semantic Scholar</div>
    <div class="ref-score">
      <div class="score-bar"><div class="score-fill" style="width:100%;background:${brand.gl}"></div></div>
      <div class="score-label" style="color:${brand.gl}">100%</div>
    </div>
  </div>
  <div class="ref" style="opacity:0.7">
    <div class="ref-top">
      <div class="ref-title">Devlin, J. et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers.</div>
      <div class="ref-badge strong">92%</div>
    </div>
    <div class="ref-meta">DOI: 10.5555/3295222.3295349 · Crossref, Semantic Scholar</div>
    <div class="ref-score">
      <div class="score-bar"><div class="score-fill" style="width:92%;background:${brand.gl}"></div></div>
      <div class="score-label" style="color:${brand.gl}">92%</div>
    </div>
  </div>
  <div class="ref">
    <div class="ref-top">
      <div class="ref-title">Chen, L. et al. (2023). Efficient Transformers: A Survey. ACM Computing Surveys.</div>
      <div class="ref-badge possible">67%</div>
    </div>
    <div class="ref-meta">DOI: 10.1145/3560816 · Possible author mismatch</div>
    <div class="ref-score">
      <div class="score-bar"><div class="score-fill" style="width:67%;background:${brand.al}"></div></div>
      <div class="score-label" style="color:${brand.al}">67%</div>
    </div>
  </div>
  <div class="ref">
    <div class="ref-top">
      <div class="ref-title">Martinez, R. & Kim, S. (2024). Quantum Attention Mechanisms. Unpublished.</div>
      <div class="ref-badge none">No Match</div>
    </div>
    <div class="ref-meta">Not found in any of 5 databases — likely hallucinated</div>
    <div class="ref-score">
      <div class="score-bar"><div class="score-fill" style="width:18%;background:#ff6060"></div></div>
      <div class="score-label" style="color:#ff6060">18%</div>
    </div>
  </div>
</div>
`
})

// Screenshot 2: Match details
const s2 = frame({
  styles: `
.panel-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.panel-header img{height:22px}
.panel-header span{font-size:13px;font-weight:700;color:${brand.text}}
.back-btn{font-size:11px;color:${brand.tl};cursor:pointer;padding:4px 0;display:flex;align-items:center;gap:4px}
.detail{padding:16px}
.detail-title{font-size:14px;font-weight:700;color:${brand.text};margin-bottom:4px;line-height:1.4}
.detail-doi{font-size:11px;color:${brand.tl};margin-bottom:12px}
.overall{text-align:center;padding:16px;background:${brand.bg2};border-radius:10px;margin-bottom:16px}
.overall-num{font-size:36px;font-weight:800;color:${brand.gl}}
.overall-lbl{font-size:11px;color:${brand.text2};margin-top:2px}
.overall-badge{display:inline-block;font-size:10px;font-weight:600;padding:2px 10px;border-radius:4px;background:rgba(45,122,49,0.2);color:${brand.gl};margin-top:6px}
.fields{display:flex;flex-direction:column;gap:8px}
.field-row{display:flex;align-items:center;gap:10px}
.field-label{font-size:11px;color:${brand.text2};min-width:90px;text-align:right}
.field-bar{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,0.08)}
.field-fill{height:100%;border-radius:3px}
.field-score{font-size:11px;font-weight:600;min-width:30px}
.source-info{padding:12px;background:${brand.bg2};border-radius:8px;margin-top:16px;font-size:11px;color:${brand.text2};line-height:1.6}
.source-info strong{color:${brand.text}}
.page{background:#f8f8fc;overflow-y:auto}
.chat-bubble{margin:20px 24px;background:#e8e8f8;border-radius:12px 12px 12px 4px;padding:12px 16px;font-size:13px;color:#333;line-height:1.5;max-width:70%}
`,
  page: `
<div style="padding:40px">
  <div style="background:#e8e8f8;border-radius:12px 12px 12px 4px;padding:12px 16px;font-size:13px;color:#333;line-height:1.5;max-width:70%;margin-bottom:20px">
    Can you summarize the key findings from "Vaswani et al. (2023) Attention Is All You Need"?
  </div>
  <div style="background:#e8e8f8;border-radius:12px 12px 12px 4px;padding:12px 16px;font-size:13px;color:#333;line-height:1.5;max-width:70%">
    Also check if "Smith & Johnson (2022) Deep Learning Review" actually exists.
  </div>
</div>`,
  panel: `
<div class="panel-header">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='60' fill='%234e2e92'/%3E%3Ctext x='64' y='80' font-family='system-ui' font-size='60' font-weight='800' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="" />
  <span>Source Taster</span>
</div>
<div style="padding:8px 16px">
  <div class="back-btn">← Back to list</div>
</div>
<div class="detail">
  <div class="detail-title">Vaswani, A. et al. (2023). Attention Is All You Need.</div>
  <div class="detail-doi">DOI: 10.5555/3295222.3295349</div>
  <div class="overall">
    <div class="overall-num">100%</div>
    <div class="overall-lbl">Overall match score</div>
    <div class="overall-badge">✓ Exact Match</div>
  </div>
  <div class="fields">
    <div class="field-row">
      <div class="field-label">Title</div>
      <div class="field-bar"><div class="field-fill" style="width:100%;background:${brand.gl}"></div></div>
      <div class="field-score" style="color:${brand.gl}">100%</div>
    </div>
    <div class="field-row">
      <div class="field-label">Authors</div>
      <div class="field-bar"><div class="field-fill" style="width:100%;background:${brand.gl}"></div></div>
      <div class="field-score" style="color:${brand.gl}">100%</div>
    </div>
    <div class="field-row">
      <div class="field-label">Year</div>
      <div class="field-bar"><div class="field-fill" style="width:100%;background:${brand.gl}"></div></div>
      <div class="field-score" style="color:${brand.gl}">100%</div>
    </div>
    <div class="field-row">
      <div class="field-label">Journal</div>
      <div class="field-bar"><div class="field-fill" style="width:100%;background:${brand.gl}"></div></div>
      <div class="field-score" style="color:${brand.gl}">100%</div>
    </div>
    <div class="field-row">
      <div class="field-label">DOI</div>
      <div class="field-bar"><div class="field-fill" style="width:100%;background:${brand.gl}"></div></div>
      <div class="field-score" style="color:${brand.gl}">100%</div>
    </div>
  </div>
  <div class="source-info">
    <strong>Sources checked:</strong> OpenAlex ✓ · Crossref ✓ · Semantic Scholar ✓ · Europe PMC · arXiv<br>
    <strong>Match found in:</strong> OpenAlex (100%), Crossref (100%), Semantic Scholar (100%)<br>
    <strong>Verification time:</strong> 0.8s
  </div>
</div>
`
})

// Screenshot 3: Input/PDF import
const s3 = frame({
  styles: `
.panel-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.panel-header img{height:22px}
.panel-header span{font-size:13px;font-weight:700;color:${brand.text}}
.input-area{padding:16px}
.input-label{font-size:11px;color:${brand.text2};margin-bottom:6px;font-weight:500}
.input-field{width:100%;min-height:140px;background:${brand.bg2};border:1px solid ${brand.border};border-radius:8px;padding:12px;color:${brand.text};font-size:12px;font-family:inherit;resize:vertical;line-height:1.6}
.input-field::placeholder{color:${brand.text3}}
.drop-area{margin-top:8px;border:2px dashed ${brand.border};border-radius:8px;padding:20px;text-align:center;cursor:pointer}
.drop-area svg{width:28px;height:28px;fill:${brand.text3};margin-bottom:8px}
.drop-area p{font-size:11px;color:${brand.text2}}
.drop-area p strong{color:${brand.tl}}
.input-actions{display:flex;gap:8px;margin-top:12px}
.input-btn{flex:1;padding:8px;border-radius:6px;border:none;font-size:11px;font-weight:600;cursor:pointer}
.input-btn.primary{background:linear-gradient(135deg,${brand.p},${brand.t});color:#fff}
.input-btn.secondary{background:${brand.bg2};color:${brand.text};border:1px solid ${brand.border}}
.extraction-opt{padding:12px 16px;border-top:1px solid ${brand.border}}
.opt-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0}
.opt-row label{font-size:11px;color:${brand.text2}}
.toggle{width:32px;height:18px;border-radius:9px;background:${brand.border};position:relative;cursor:pointer}
.toggle.on{background:${brand.tl}}
.toggle::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:2px;left:2px;transition:.15s}
.toggle.on::after{left:16px}
`,
  panel: `
<div class="panel-header">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='60' fill='%234e2e92'/%3E%3Ctext x='64' y='80' font-family='system-ui' font-size='60' font-weight='800' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="" />
  <span>Source Taster</span>
</div>
<div class="input-area">
  <div class="input-label">Paste references or bibliography text</div>
  <textarea class="input-field" placeholder="Smith, J. (2024). Example Article. Journal, 12(3), 45-67.&#10;https://doi.org/10.1000/example&#10;&#10;Johnson, M. et al. (2023). Deep Learning. MIT Press.&#10;-- Paste multiple references --">Smith, J. (2024). Example Article. Journal, 12(3), 45-67.
https://doi.org/10.1000/example

Brown, T. et al. (2024). Language Models. NeurIPS.</textarea>
  <div class="drop-area">
    <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>
    <p>Drag & drop a <strong>PDF</strong> to extract references</p>
  </div>
  <div class="input-actions">
    <button class="input-btn primary">Extract & Verify</button>
    <button class="input-btn secondary">Parse with AnyStyle</button>
  </div>
</div>
<div class="extraction-opt">
  <div class="opt-row">
    <label>AI extraction (LLM)</label>
    <div class="toggle on"></div>
  </div>
  <div class="opt-row">
    <label>Early termination at 90%</label>
    <div class="toggle on"></div>
  </div>
  <div class="opt-row">
    <label>Search arXiv</label>
    <div class="toggle"></div>
  </div>
</div>
`,
  page: `
<div style="padding:40px">
  <div style="background:#f0f0f8;border-radius:8px;padding:20px;margin-bottom:16px">
    <div style="font-size:12px;color:#666;margin-bottom:4px">📄 manuscript_v3.pdf</div>
    <div style="font-size:11px;color:#888">24 pages · 47 references detected</div>
  </div>
  <p style="font-size:14px;color:#555;line-height:1.6">... as shown in previous work (Smith, 2024; Johnson et al., 2023; Brown et al., 2024). The transformer architecture has demonstrated remarkable capabilities across various natural language processing tasks. Recent advances in large language models have further pushed the boundaries of what is possible...</p>
</div>`
})

// Screenshot 4: Settings / Configuration
const s4 = frame({
  styles: `
.panel-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.panel-header img{height:22px}
.panel-header span{font-size:13px;font-weight:700;color:${brand.text}}
.panel-tabs{display:flex;border-bottom:1px solid ${brand.border};padding:0 12px}
.panel-tab{padding:8px 14px;font-size:12px;color:${brand.text2};cursor:pointer;border-bottom:2px solid transparent;font-weight:500}
.panel-tab.active{color:${brand.tl};border-bottom-color:${brand.tl}}
.settings{padding:16px}
.section-title{font-size:12px;font-weight:600;color:${brand.text};margin-bottom:10px;margin-top:16px}
.section-title:first-child{margin-top:0}
.setting-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid ${brand.border}}
.setting-row:last-child{border-bottom:none}
.setting-label{font-size:11px;color:${brand.text2}}
.setting-label strong{color:${brand.text}}
.setting-value{font-size:11px;color:${brand.text};display:flex;align-items:center;gap:6px}
.toggle{width:32px;height:18px;border-radius:9px;background:${brand.border};position:relative;cursor:pointer;flex-shrink:0}
.toggle.on{background:${brand.tl}}
.toggle::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:2px;left:2px;transition:.15s}
.toggle.on::after{left:16px}
.badge{font-size:9px;padding:2px 6px;border-radius:3px;font-weight:600}
.badge.green{background:rgba(45,122,49,0.2);color:${brand.gl}}
.drag-handle{color:${brand.text3};cursor:grab;font-size:14px}
.page{background:#f8f8fc;display:flex;flex-direction:column;align-items:center;justify-content:center}
`,
  panel: `
<div class="panel-header">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='60' fill='%234e2e92'/%3E%3Ctext x='64' y='80' font-family='system-ui' font-size='60' font-weight='800' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="" />
  <span>Source Taster</span>
</div>
<div class="panel-tabs">
  <div class="panel-tab">All</div>
  <div class="panel-tab">Verified</div>
  <div class="panel-tab">Suspect</div>
  <div class="panel-tab active">Settings</div>
</div>
<div class="settings">
  <div class="section-title">🔍 Search Databases</div>
  <div class="setting-row">
    <span class="drag-handle">⠿</span>
    <span class="setting-label"><strong>OpenAlex</strong></span>
    <div class="toggle on"></div>
  </div>
  <div class="setting-row">
    <span class="drag-handle">⠿</span>
    <span class="setting-label"><strong>Crossref</strong> <span class="badge green">Recommended</span></span>
    <div class="toggle on"></div>
  </div>
  <div class="setting-row">
    <span class="drag-handle">⠿</span>
    <span class="setting-label"><strong>Semantic Scholar</strong></span>
    <div class="toggle on"></div>
  </div>
  <div class="setting-row">
    <span class="drag-handle">⠿</span>
    <span class="setting-label"><strong>Europe PMC</strong></span>
    <div class="toggle on"></div>
  </div>
  <div class="setting-row">
    <span class="drag-handle">⠿</span>
    <span class="setting-label"><strong>arXiv</strong></span>
    <div class="toggle"></div>
  </div>

  <div class="section-title">⚡ Early Termination</div>
  <div class="setting-row">
    <span class="setting-label">Stop after match ≥</span>
    <span class="setting-value">90% <div class="toggle on"></div></span>
  </div>

  <div class="section-title">🔐 AI Provider</div>
  <div class="setting-row">
    <span class="setting-label">Provider</span>
    <span class="setting-value" style="color:${brand.tl}">OpenAI · GPT-5</span>
  </div>
  <div class="setting-row">
    <span class="setting-label">API Key</span>
    <span class="setting-value">•••••••• <span style="color:${brand.gl};font-size:10px">Saved</span></span>
  </div>
</div>
`,
  page: `
<div style="text-align:center;padding:40px;color:#888;font-size:13px">
  <div style="font-size:48px;margin-bottom:16px">⚙️</div>
  <p style="font-weight:600;color:#555;margin-bottom:4px">Extension Settings</p>
  <p style="font-size:12px">Configure your verification pipeline</p>
</div>`
})

// Screenshot 5: Verification Report
const s5 = frame({
  styles: `
.panel-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ${brand.border}}
.panel-header img{height:22px}
.panel-header span{font-size:13px;font-weight:700;color:${brand.text}}
.report{padding:16px}
.report-title{font-size:14px;font-weight:700;color:${brand.text};margin-bottom:4px}
.report-sub{font-size:11px;color:${brand.text2};margin-bottom:16px}
.report-stat{display:flex;gap:12px;margin-bottom:16px}
.report-card{flex:1;background:${brand.bg2};border-radius:8px;padding:12px;text-align:center}
.report-card-num{font-size:22px;font-weight:800}
.report-card-lbl{font-size:10px;color:${brand.text2};margin-top:2px}
.summary-table{width:100%;border-collapse:collapse;font-size:11px}
.summary-table th{text-align:left;color:${brand.text2};font-weight:500;padding:6px 4px;border-bottom:1px solid ${brand.border}}
.summary-table td{padding:6px 4px;border-bottom:1px solid ${brand.border};color:${brand.text}}
.summary-table .status{font-size:10px;font-weight:600;padding:2px 6px;border-radius:3px}
.status.ok{background:rgba(45,122,49,0.2);color:${brand.gl}}
.status.warn{background:rgba(201,149,46,0.2);color:${brand.al}}
.status.bad{background:rgba(255,80,80,0.15);color:#ff6060}
.export-btn{display:block;width:100%;padding:10px;margin-top:16px;border-radius:6px;border:none;background:linear-gradient(135deg,${brand.p},${brand.t});color:#fff;font-size:12px;font-weight:600;cursor:pointer}
.page{background:#f8f8fc;display:flex;flex-direction:column;align-items:center;justify-content:center}
`,
  panel: `
<div class="panel-header">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='60' fill='%234e2e92'/%3E%3Ctext x='64' y='80' font-family='system-ui' font-size='60' font-weight='800' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" alt="" />
  <span>Source Taster</span>
</div>
<div class="report">
  <div class="report-title">Verification Report</div>
  <div class="report-sub">manuscript_v3.pdf · 47 references · 2.4s total</div>
  <div class="report-stat">
    <div class="report-card">
      <div class="report-card-num" style="color:${brand.gl}">32</div>
      <div class="report-card-lbl">Verified</div>
    </div>
    <div class="report-card">
      <div class="report-card-num" style="color:${brand.al}">11</div>
      <div class="report-card-lbl">Uncertain</div>
    </div>
    <div class="report-card">
      <div class="report-card-num" style="color:#ff6060">4</div>
      <div class="report-card-lbl">Fake</div>
    </div>
  </div>
  <table class="summary-table">
    <tr><th>Reference</th><th>Score</th><th>Status</th></tr>
    <tr><td>Vaswani et al. (2023)</td><td>100%</td><td><span class="status ok">Verified</span></td></tr>
    <tr><td>Devlin et al. (2019)</td><td>92%</td><td><span class="status ok">Verified</span></td></tr>
    <tr><td>Brown et al. (2024)</td><td>85%</td><td><span class="status ok">Verified</span></td></tr>
    <tr><td>Chen et al. (2023)</td><td>67%</td><td><span class="status warn">Uncertain</span></td></tr>
    <tr><td>Martinez & Kim (2024)</td><td>18%</td><td><span class="status bad">Not Found</span></td></tr>
    <tr><td>Liu & Wang (2024)</td><td>12%</td><td><span class="status bad">Not Found</span></td></tr>
  </table>
  <button class="export-btn">📋 Copy Report</button>
</div>
`,
  page: `
<div style="text-align:center;padding:40px;color:#888;font-size:13px">
  <div style="font-size:48px;margin-bottom:16px">📊</div>
  <p style="font-weight:600;color:#555;margin-bottom:4px">Batch verification complete</p>
  <p style="font-size:12px">47 references checked across 5 databases</p>
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
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  for (const { html, name } of screenshots) {
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.screenshot({ path: resolve(OUT, name), fullPage: false })
    console.log(`✓ ${name}`)
  }

  await browser.close()
  console.log('\nAll screenshots generated.')
}

main().catch(console.error)
