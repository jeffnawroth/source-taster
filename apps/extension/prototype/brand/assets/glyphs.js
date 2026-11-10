/* PROTOTYPE (#194) — throwaway. SVG sprite (logo mark, six verdict glyphs, status and UI icons), from the
   chosen identity prototype (prototype/191-identity, round4/c-revised) with verdict ids renamed to token keys. */
window.ST = window.ST || {};
ST.SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <!-- ===== MARK =====
         A closing quote built from two drops. The first drop is solid: the reference.
         The second is glass, half-filled: the sample still being tasted. -->
    <linearGradient id="mk-g" x1="2" y1="1" x2="30" y2="31" gradientUnits="userSpaceOnUse">
      <stop offset="0" style="stop-color:oklch(0.66 0.17 252)"/><stop offset=".55" style="stop-color:oklch(0.52 0.21 263)"/><stop offset="1" style="stop-color:oklch(0.42 0.2 274)"/>
    </linearGradient>
    <linearGradient id="mk-rim" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".35" stop-color="#fff" stop-opacity=".12"/><stop offset=".7" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".38"/>
    </linearGradient>
    <linearGradient id="mk-sheen" x1="0" y1="1" x2="0" y2="18" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="mk-drop" x1="0" y1="-5" x2="0" y2="12" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff"/><stop offset="1" style="stop-color:oklch(0.93 0.035 262)"/>
    </linearGradient>
    <path id="drop" d="M4.6 0C4.6 6.3 1.7 10.3-3.5 11.7C-4.5 12-5.1 10.8-4.3 10.2C-1.8 8.6-.4 6.8-.1 4.6A4.6 4.6 0 1 1 4.6 0Z"/>

    <symbol id="mark" viewBox="0 0 32 32">
      <rect x=".5" y=".5" width="31" height="31" rx="9.6" fill="url(#mk-g)"/>
      <rect x=".5" y=".5" width="31" height="31" rx="9.6" fill="url(#mk-sheen)"/>
      <rect x="1" y="1" width="30" height="30" rx="9.1" fill="none" stroke="url(#mk-rim)" stroke-width="1"/>
      <g transform="translate(16 16) scale(.9) translate(-16 -16)">
        <g transform="translate(20.9 12.4)"><use href="#drop" fill="#fff" fill-opacity=".34"/><use href="#drop" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width=".95"/><path d="M-3.1-1.6A3.3 3.3 0 0 1-.9-3.2" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/></g>
        <g transform="translate(10.7 12.4)"><use href="#drop" fill="url(#mk-drop)"/></g>
      </g>
    </symbol>
    <!-- optical size for 16 px: no rim, no sheen, heavier drops, solid second drop at lower opacity -->
    <symbol id="mark-sm" viewBox="0 0 32 32">
      <rect x="0" y="0" width="32" height="32" rx="8.4" fill="url(#mk-g)"/>
      <g transform="translate(21.3 12.2) scale(1.12)"><use href="#drop" fill="#fff" fill-opacity=".55"/></g>
      <g transform="translate(10.2 12.2) scale(1.12)"><use href="#drop" fill="#fff"/></g>
    </symbol>
    <!-- monochrome: one colour, no transparency. The pending sample becomes an outline. -->
    <symbol id="mark-mono" viewBox="0 0 32 32">
      <g transform="translate(10.4 10.6) scale(1.18)"><use href="#drop" fill="currentColor"/></g>
      <g transform="translate(22.6 10.6) scale(1.18)"><use href="#drop" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/></g>
    </symbol>
    <mask id="mk-ko" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
      <rect width="32" height="32" rx="9.6" fill="#fff"/>
      <g transform="translate(10.7 12.4)"><use href="#drop" fill="#000"/></g>
      <g transform="translate(20.9 12.4)"><use href="#drop" fill="none" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></g>
    </mask>
    <symbol id="mark-ko" viewBox="0 0 32 32"><rect width="32" height="32" rx="9.6" fill="currentColor" mask="url(#mk-ko)"/></symbol>

    <!-- app icon: the mark as a lit glass object on a deep field -->
    <radialGradient id="ai-f1" cx="22" cy="18" r="70" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:oklch(0.78 0.13 232)"/><stop offset="1" style="stop-color:oklch(0.78 0.13 232)" stop-opacity="0"/></radialGradient>
    <radialGradient id="ai-f2" cx="116" cy="112" r="80" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:oklch(0.62 0.2 296)"/><stop offset="1" style="stop-color:oklch(0.62 0.2 296)" stop-opacity="0"/></radialGradient>
    <linearGradient id="ai-bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:oklch(0.56 0.2 258)"/><stop offset="1" style="stop-color:oklch(0.33 0.17 272)"/></linearGradient>
    <linearGradient id="ai-rim" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#fff" stop-opacity=".14"/><stop offset=".72" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".42"/></linearGradient>
    <linearGradient id="ai-glass" x1="0" y1="-6" x2="0" y2="13" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset="1" stop-color="#fff" stop-opacity=".16"/></linearGradient>
    <filter id="ai-sh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.6" flood-color="oklch(0.2 0.15 270)" flood-opacity=".45"/></filter>
    <symbol id="appicon" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="29" fill="url(#ai-bg)"/>
      <rect width="128" height="128" rx="29" fill="url(#ai-f1)"/>
      <rect width="128" height="128" rx="29" fill="url(#ai-f2)" opacity=".85"/>
      <rect x="1" y="1" width="126" height="126" rx="28" fill="none" stroke="url(#ai-rim)" stroke-width="2"/>
      <g filter="url(#ai-sh)">
        <g transform="translate(81.5 50) scale(4.05)"><use href="#drop" fill="url(#ai-glass)"/><use href="#drop" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width=".32"/></g>
        <g transform="translate(43 50) scale(4.05)"><use href="#drop" fill="url(#mk-drop)"/></g>
      </g>
      <path d="M70.2 44.6A13 13 0 0 1 78.6 37.6" fill="none" stroke="#fff" stroke-opacity=".95" stroke-width="3.2" stroke-linecap="round"/>
    </symbol>
  </defs>

  <!-- Verdict glyphs: six distinct silhouettes. circle / diamond / hexagon / rounded square / magnifier / dashed ring.
       The three reds (mixed, doi, miss) are hexagon, square and magnifier: tellable apart in greyscale and at 15 px. -->
  <symbol id="g-correct" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.3" style="fill:currentColor"/><path d="M7.3 12.4l3.2 3.2 6.2-6.8" style="fill:none;stroke:var(--on);stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round"/></symbol>
  <symbol id="g-deviations" viewBox="0 0 24 24"><path d="M12 1.6L22.4 12 12 22.4 1.6 12Z" style="fill:currentColor;stroke:currentColor;stroke-width:1.6;stroke-linejoin:round"/><path d="M8 10.2h8M8 13.8h8M13.4 6.8l-2.8 10.4" style="fill:none;stroke:var(--on);stroke-width:1.8;stroke-linecap:round"/></symbol>
  <symbol id="g-mixed" viewBox="0 0 24 24"><path d="M12 1.7l8.9 5.1v10.4L12 22.3 3.1 17.2V6.8Z" style="fill:currentColor;stroke:currentColor;stroke-width:1.6;stroke-linejoin:round"/><circle cx="9.6" cy="12" r="3.3" style="fill:none;stroke:var(--on);stroke-width:1.7"/><circle cx="14.4" cy="12" r="3.3" style="fill:none;stroke:var(--on);stroke-width:1.7"/></symbol>
  <symbol id="g-doi-conflict" viewBox="0 0 24 24"><rect x="2.4" y="2.4" width="19.2" height="19.2" rx="5.2" style="fill:currentColor"/><path d="M6.4 12h3.4M14.2 12h3.4M11 15.6l2-7.2" style="fill:none;stroke:var(--on);stroke-width:2;stroke-linecap:round"/></symbol>
  <symbol id="g-not-found" viewBox="0 0 24 24"><circle cx="10.2" cy="10.2" r="7.6" style="fill:none;stroke:currentColor;stroke-width:2.5"/><path d="M15.8 15.8l5.6 5.6" style="fill:none;stroke:currentColor;stroke-width:3.2;stroke-linecap:round"/><path d="M7.4 7.4l5.6 5.6M13 7.4l-5.6 5.6" style="fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round"/></symbol>
  <symbol id="g-not-verifiable" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6" style="fill:none;stroke:currentColor;stroke-width:2.1;stroke-dasharray:3.4 2.7"/><path d="M9.5 9.6a2.6 2.6 0 1 1 3.7 2.3c-.9.5-1.2 1-1.2 1.9M12 17h.01" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"/></symbol>

  <!-- evidence icons -->
  <symbol id="e-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.6 4.6L19 7.4"/></symbol>
  <symbol id="e-none" viewBox="0 0 24 24"><path d="M6 12h12"/></symbol>
  <symbol id="e-diff" viewBox="0 0 24 24"><path d="M6 9h12M6 15h12M14.4 4.6L9.6 19.4"/></symbol>
  <symbol id="e-bad" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></symbol>
  <symbol id="e-warn" viewBox="0 0 24 24"><path d="M12 6.5v7M12 17.4h.01"/></symbol>
  <symbol id="e-end" viewBox="0 0 24 24"><path d="M5 20V4M5 5h12l-2.5 4L17 13H5"/></symbol>
  <!-- ui icons -->
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></symbol>
  <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V15"/></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.5A2 2 0 0 0 13.5 4.5h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24"><path d="M9 5.5l6.5 6.5L9 18.5"/></symbol>
  <symbol id="i-back" viewBox="0 0 24 24"><path d="M15 5.5L8.5 12 15 18.5"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.6 4.6L19 7.4"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-swatch" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5"/><path d="M4 14l6-6 10 10"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5 8 8 0 1 0 19.5 14.5z"/></symbol>
  <symbol id="i-panel" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M14.5 4v16"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M7 3.5h6.5L18 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1zM13 3.5V8h5M9 12.5h6M9 16h6"/></symbol>
  <symbol id="i-undo" viewBox="0 0 24 24"><path d="M9 7.5L4.5 12 9 16.5M5 12h9.5a5 5 0 0 1 0 10H12"/></symbol>
  <symbol id="i-pen" viewBox="0 0 24 24"><path d="M14.5 5.5l4 4M4.5 19.5l1-4.6L15.8 4.6a1.6 1.6 0 0 1 2.3 0l1.3 1.3a1.6 1.6 0 0 1 0 2.3L9.1 18.5z"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5z"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></symbol>

  <!-- status icons (technical Statuses, never a Verdict) -->
  <symbol id="s-running" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" style="fill:none;stroke:currentColor;stroke-width:2.2;opacity:.22"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" style="fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round"/></symbol>
  <symbol id="s-queued" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" style="fill:none;stroke:currentColor;stroke-width:1.8;stroke-dasharray:1.5 3.2;stroke-linecap:round"/></symbol>
  <symbol id="s-cancelled" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" style="fill:none;stroke:currentColor;stroke-width:1.8"/><path d="M8 12h8" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"/></symbol>
  <symbol id="s-failed" viewBox="0 0 24 24"><path d="M12 3.2 21.3 19.5H2.7Z" style="fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round"/><path d="M12 9.5v4.5M12 16.8h.01" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"/></symbol>
  <symbol id="s-not-checked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" style="fill:none;stroke:currentColor;stroke-width:1.8"/><path d="M6 18 18 6" style="fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round"/></symbol>
  <!-- more ui icons -->
  <symbol id="i-history" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4.5v4h4M12 8v4.5l3 2"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/></symbol>
  <symbol id="i-cmd" viewBox="0 0 24 24"><path d="M9 6.5V17.5M15 6.5V17.5M6.5 9H17.5M6.5 15H17.5"/></symbol>
  <symbol id="i-stop" viewBox="0 0 24 24"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/></symbol>
  <symbol id="i-reset" viewBox="0 0 24 24"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/></symbol>
  <symbol id="i-pdf" viewBox="0 0 24 24"><path d="M7 3.5h6.5L18 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1zM13 3.5V8h5"/><path d="M9 13.5h6M9 16.5h4"/></symbol>
  <symbol id="i-list" viewBox="0 0 24 24"><path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/></symbol>
  <symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></symbol>
  <symbol id="i-wifi-off" viewBox="0 0 24 24"><path d="M3.5 3.5l17 17M8.5 16a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.3M14.8 10.3a10 10 0 0 1 4.2 2.2M2 9a14 14 0 0 1 3.4-2.3M12 19.5h.01"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M5 7h14M9.5 7V5h5v2M7 7l.8 12.5h8.4L17 7"/></symbol>
  <symbol id="i-ext" viewBox="0 0 24 24"><path d="M14 4.5h5.5V10M19.5 4.5 11 13M17 13.5v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h5"/></symbol>
  <symbol id="i-more" viewBox="0 0 24 24"><path d="M6 12h.01M12 12h.01M18 12h.01" style="stroke-width:3"/></symbol>
  <symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6"/></symbol>
  <symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.1.9-1.1 1.8M12 16.6h.01"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/></symbol>
  <symbol id="i-edit-list" viewBox="0 0 24 24"><path d="M4.5 6.5h10M4.5 12h7M4.5 17.5h5M14 19.5l.6-2.8 4.8-4.8a1.4 1.4 0 0 1 2 2l-4.8 4.8z"/></symbol>
</svg>`;
document.addEventListener('DOMContentLoaded', () => document.body.insertAdjacentHTML('afterbegin', ST.SPRITE));
/* helpers: ST.gly('not-found') → verdict glyph; ST.stat('running') → status icon; ST.ico('i-copy') → UI icon; ST.mark() → logo */
ST.gly = (v, cls = '') => `<svg class="gly ${cls}" data-v="${v}" aria-hidden="true"><use href="#g-${v}"/></svg>`;
ST.stat = (s, cls = '') => `<svg class="ico st-${s} ${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#s-${s}"/></svg>`;
ST.ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#${n}"/></svg>`;
ST.mark = (size = 24, id = 'mark') => `<svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true"><use href="#${id}"/></svg>`;
