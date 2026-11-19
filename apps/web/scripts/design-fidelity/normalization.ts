// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";
import { compareQuotaProportion } from "./measurements.ts";
import en from "../../../../packages/i18n/messages/en.json" with { type: "json" };
import de from "../../../../packages/i18n/messages/de.json" with { type: "json" };

export interface ShellFixture {
  quota?: { granted: number; remaining: number; reserved: number };
  inputText?: string;
  inputScrollTop?: number;
  countedConsumption?: string;
  lead?: string;
  notice?: string;
  devNotice?: string;
  /** The product's quiet Help and legal link row; #194 D has none. */
  legal?: string[];
  inputHint?: string;
  inputDisabledReason?: string;
  selectionAvailable?: boolean;
  commandPlaceholder?: string;
  commandEmpty?: string;
  /** Signed-in identity as the chip shows it; absent for Guests. */
  account?: { label: string; initial: string };
  commands: { id: string; group: string; label: string; disabled: boolean }[];
}
/** Text is projected into the original prototype DOM; source CSS stays authoritative. */
export async function readShellFixture(page: Page): Promise<ShellFixture> {
  return page.evaluate(() => ({
    inputText:
      document.querySelector<HTMLTextAreaElement>(".intake-textarea")?.value,
    inputScrollTop:
      document.querySelector<HTMLTextAreaElement>(".intake-textarea")
        ?.scrollTop,
    countedConsumption: document
      .querySelector(".counted-heading > span")
      ?.textContent?.trim(),
    lead: document.querySelector(".intake-lead")?.textContent?.trim(),
    notice: [...(document.querySelector(".workspace-notes")?.children ?? [])]
      .filter((node) => !node.matches(".workspace-legal"))
      .map((node) => node.textContent)
      .join("")
      .trim(),
    legal: [
      ...document.querySelectorAll(".workspace-notes .workspace-legal a"),
    ].map((link) => link.textContent.trim()),
    devNotice: document.querySelector(".dev-note > span")?.textContent?.trim(),
    inputHint: document.querySelector(".intake-hint")?.textContent?.trim(),
    inputDisabledReason: document
      .querySelector(".intake-submit .st-disabled-control > span")
      ?.textContent?.trim(),
    selectionAvailable: (() => {
      const selection = document.querySelector<HTMLButtonElement>(
        ".intake-segment button:nth-child(3)",
      );
      return selection ? !selection.disabled : undefined;
    })(),
    commandPlaceholder: document.querySelector<HTMLInputElement>(
      ".command-palette-search input",
    )?.placeholder,
    commandEmpty: document
      .querySelector(".command-palette-empty")
      ?.textContent?.trim(),
    account: (() => {
      const initial = document
        .querySelector(".account-chip .account-avatar")
        ?.textContent?.trim();
      const label = document
        .querySelector(".account-chip .account-chip-label")
        ?.textContent?.trim();
      return initial && label ? { label, initial } : undefined;
    })(),
    commands: [
      ...document.querySelectorAll('.command-palette-list [role="menuitem"]'),
    ]
      .filter((node) => (node as HTMLElement).checkVisibility())
      .map((node) => ({
        id: node.getAttribute("data-key") ?? "",
        group:
          node
            .closest('[role="group"]')
            ?.querySelector("header")
            ?.textContent?.trim() ?? "",
        label: node.textContent?.trim() ?? "",
        disabled: node.getAttribute("aria-disabled") === "true",
      })),
  }));
}

/** Explicit mode/owner amendments, separate from fixture normalization and source styles. */
export async function normalizeShell(
  page: Page,
  fixture: ShellFixture,
  hosted: boolean,
) {
  const changes: {
    field: string;
    reason: string;
    before: string;
    after: string;
  }[] = [];
  // docs/design/voice-and-tone.md rule 3: Befund replaces #194's Urteil (DE).
  const disclaimer = await page.evaluate(
    (copy) => {
      const source = (
        window as unknown as {
          ST: {
            t(key: string): string;
            lang(): string;
            strings(value: unknown): void;
            state: { view: string };
            act: { nav(view: string): void };
          };
        }
      ).ST;
      const before = source.t("disclaimer");
      if (before === copy[source.lang() as "de" | "en"]) return null;
      source.strings({
        de: { disclaimer: copy.de },
        en: { disclaimer: copy.en },
      });
      source.act.nav(source.state.view);
      return { before, after: source.t("disclaimer") };
    },
    { de: de.shell_feed_disclaimer, en: en.shell_feed_disclaimer },
  );
  if (disclaimer)
    changes.push({
      field: "copy.disclaimer",
      reason:
        "docs/design/voice-and-tone.md rule 3 replaces Urteil with Befund; the product disclaimer is the source sentence in the settled voice",
      ...disclaimer,
    });
  const removedPager = await page
    .locator(".v-D .dhead .pos,.v-D .dhead .pg")
    .allTextContents();
  if (removedPager.length) {
    await page
      .locator(".v-D .dhead .pos,.v-D .dhead .pg")
      .evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
    changes.push({
      field: "detail.pager",
      reason:
        "Owner #212 amendment in docs/design/reconciliations.md removes previous/next and position counter; GridList and Back retain navigation",
      before: removedPager.join("\n"),
      after: "Back/Close only",
    });
  }
  if (fixture.quota) {
    const before = await page.evaluate(
      () =>
        (window as unknown as { ST: { state: { quota: unknown } } }).ST.state
          .quota,
    );
    await page.evaluate((quota) => {
      const source = (
        window as unknown as {
          ST: {
            state: { quota: typeof quota; quotaMode: string; view: string };
            act: { nav(view: string): void };
          };
        }
      ).ST;
      source.state.quota = quota;
      source.state.quotaMode = "enough";
      source.act.nav(source.state.view);
    }, fixture.quota);
    changes.push({
      field: "quota",
      reason:
        "Actual acting Owner balance; source short-choice is computed from the identical reference count and balance",
      before: JSON.stringify(before),
      after: JSON.stringify(fixture.quota),
    });
  }
  if (fixture.inputText) {
    const before = await page.locator(".v-D .cmdbar textarea").inputValue();
    if (before !== fixture.inputText) {
      await page.evaluate((text) => {
        const source = (
          window as unknown as { ST: { act: { setInput(text: string): void } } }
        ).ST;
        source.act.setInput(text);
      }, fixture.inputText);
      changes.push({
        field: "inputText",
        reason:
          "Identical text submitted through the real product driver; source renderer/styles unchanged",
        before,
        after: fixture.inputText,
      });
    }
  }
  if (fixture.lead) {
    const lead = page.locator(".v-D .ilead");
    if (await lead.count()) {
      const before = (await lead.textContent()) ?? "";
      if (before !== fixture.lead) {
        await lead.evaluate((node, text) => {
          node.textContent = text;
        }, fixture.lead);
        changes.push({
          field: "intake.lead",
          reason:
            "Truthful enabled Data source copy (ADR-0003); identical text isolates typography and wrapping",
          before,
          after: fixture.lead,
        });
      }
    }
  }
  if (!hosted) {
    const before = await page.locator(".v-D .intake .nrow").allTextContents();
    await page.evaluate(
      ({ notice, devNotice }) => {
        // The feed footer is re-rendered (and morphed) with every source state
        // change, so drive it through the source's own strings: its storage
        // line becomes the development notice, the Quota consumption line is
        // hidden, and the storage icon follows the product's info icon.
        const source = (
          window as unknown as {
            ST: { strings(value: unknown): void };
          }
        ).ST;
        const style = document.createElement("style");
        style.textContent = `.v-D .feed .foot>.nrow:has(use[href='#i-list'])${devNotice ? "" : ",.v-D .feed .foot>.nrow:first-child"}{display:none!important}`;
        document.head.append(style);
        if (devNotice) {
          source.strings({
            de: { storageTemp: devNotice },
            en: { storageTemp: devNotice },
          });
          // No re-render here: it would reset states opened before this
          // step. Later source renders read the string; patch the current
          // footer once.
          for (const span of document.querySelectorAll(
            ".v-D .feed .foot>.nrow:first-child>span",
          ))
            span.textContent = devNotice;
          const root = document.querySelector(".v-D") ?? document.body;
          const fix = () => {
            for (const use of root.querySelectorAll(
              ".feed .foot>.nrow:first-child use[href='#i-lock']",
            ))
              use.setAttribute("href", "#i-info");
          };
          fix();
          new MutationObserver(fix).observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["href"],
          });
        }
        document
          .querySelectorAll(
            '.v-D .hbtn,.v-D .acct,.v-D [data-act="src:selection"]',
          )
          .forEach((node) => node.remove());
        const notes = [...document.querySelectorAll(".v-D .intake .nrow")];
        if (notes[0] && notice) {
          const span = notes[0].querySelector("span");
          if (span) span.textContent = notice;
        }
        notes.slice(notice ? 1 : 0).forEach((node) => node.remove());
        document
          .querySelectorAll(".v-D .feed > .nrow")
          .forEach((node) => node.remove());
      },
      { notice: fixture.notice, devNotice: fixture.devNotice },
    );
    changes.push({
      field: "shell.mode",
      reason:
        "ADR-0003 standalone exposes no Account, History, Plan or Quota service; development notice remains visible",
      before: before.join("\n"),
      after: fixture.notice ?? "",
    });
    changes.push({
      field: "feed.footer",
      reason:
        "ADR-0003 standalone keeps no Checks and has no Quota: the feed footer's storage line is the development notice and the consumption line is absent, as in the product",
      before: "Storage line, disclaimer, consumption and Quota line",
      after: `${fixture.devNotice ?? ""}\nDisclaimer`,
    });
    changes.push({
      field: "intake.sources",
      reason:
        "The 360px comparison is the web app, which supports Text and File intake; browser Selection belongs to the extension",
      before: "Text, File, Selection in source panel frame",
      after: "Text, File in the actual web client",
    });
  }
  if (!hosted && fixture.countedConsumption) {
    const before = await page.locator(".v-D .sh .t > span").textContent();
    await page.evaluate((consumption) => {
      const source = (
        window as unknown as {
          ST: {
            strings(value: unknown): void;
            state: { view: string };
            act: { nav(view: string): void };
          };
        }
      ).ST;
      source.strings({
        de: { quotaPreview: () => consumption, autoStart: "" },
        en: { quotaPreview: () => consumption, autoStart: "" },
      });
      source.act.nav(source.state.view);
      // The source re-render restores mode-specific entries; remove only Guest-service data.
      document
        .querySelectorAll(".v-D .hbtn,.v-D .acct,.v-D .feed > .nrow")
        .forEach((node) => node.remove());
    }, fixture.countedConsumption);
    changes.push({
      field: "counted.consumption",
      reason:
        "ADR-0003 standalone has no Owner Quota; original source renderer receives the actual auto-start message",
      before: before ?? "",
      after: fixture.countedConsumption,
    });
  }
  if (hosted && fixture.countedConsumption) {
    const before = await page.evaluate(() => {
      const source = (
        window as unknown as {
          ST: { available(): number; N(): number };
        }
      ).ST;
      return source.available() < source.N()
        ? (document.querySelector(".v-D .sh .t > span")?.textContent ?? "")
        : null;
    });
    if (before !== null && before !== fixture.countedConsumption) {
      await page.evaluate((body) => {
        const source = (
          window as unknown as {
            ST: {
              strings(value: unknown): void;
              state: { view: string };
              act: { nav(view: string): void };
            };
          }
        ).ST;
        source.strings({
          de: { quotaChoiceBody: () => body },
          en: { quotaChoiceBody: () => body },
        });
        source.act.nav(source.state.view);
      }, fixture.countedConsumption);
      changes.push({
        field: "quota.choice-body",
        reason:
          "FA-KTO-20 sells check packs beside Plans; the product sentence names both where #194 says only Plan",
        before,
        after: fixture.countedConsumption,
      });
    }
  }
  if (hosted) {
    const removed = await page.evaluate(() => {
      const source = (
        window as unknown as {
          ST: {
            HISTORY: unknown[];
            state: { view: string; historyOn: boolean };
            act: { nav(view: string): void };
          };
        }
      ).ST;
      // A fresh hosted Free Account starts with History off and no entries.
      const entries = source.HISTORY.length;
      source.HISTORY.length = 0;
      source.state.historyOn = false;
      source.act.nav(source.state.view);
      // Prototype review meta-text, not product copy (#194 accountStub).
      const stub = document.querySelector(".v-D .pop > h2 + p.note");
      const text = stub?.textContent ?? "";
      stub?.remove();
      return { entries, text };
    });
    changes.push({
      field: "history.entries",
      reason:
        "Fresh hosted Free Account: History is off until opt-in and holds no entries; the source off-state renderer is used",
      before: `${removed.entries} fixture entries`,
      after: "History off, 0 entries",
    });
    const guest = await page.evaluate(
      () =>
        (window as unknown as { ST: { state: { account: string } } }).ST.state
          .account === "guest",
    );
    if (guest) {
      await page.addStyleTag({ content: ".v-D .hbtn{display:none}" });
      changes.push({
        field: "topbar.history",
        reason:
          "ADR-0005: Guests are always without History (FA-UEB-10), so the product renders no History control for them; the source still renders .hbtn for Guests",
        before: "History button",
        after: "",
      });
    }
    if (fixture.account) {
      const before = await page.evaluate((account) => {
        const source = (
          window as unknown as {
            ST: {
              ACCOUNT: { free: { name: string; email: string } };
              state: { view: string };
              act: { nav(view: string): void };
            };
          }
        ).ST;
        const was = `${source.ACCOUNT.free.name} <${source.ACCOUNT.free.email}>`;
        source.ACCOUNT.free.name = account.label;
        source.ACCOUNT.free.email = account.label;
        const root = document.querySelector(".v-D") ?? document.body;
        const fix = () => {
          // The source derives initials by splitting the name; the product shows one upper-case letter.
          root.querySelectorAll(".av").forEach((node) => {
            if (
              !node.querySelector("svg") &&
              node.textContent !== account.initial
            )
              node.textContent = account.initial;
          });
          // Re-renders restore #194 accountStub; it stays removed (account.stub).
          const stub = root.querySelector(".pop > h2 + p.note");
          if (/ticket/i.test(stub?.textContent ?? "")) stub?.remove();
          // AccountSession has no display name; the product shows only the email.
          root.querySelectorAll(".pop .row > div > .note").forEach((node) => {
            if (node.previousElementSibling?.textContent === account.label)
              node.remove();
          });
        };
        source.act.nav(source.state.view);
        fix();
        new MutationObserver(fix).observe(root, {
          childList: true,
          subtree: true,
        });
        return was;
      }, fixture.account);
      changes.push({
        field: "account.identity",
        reason:
          "Hosted fixture identity: the AccountSession contract carries accountId, ownerId and email but no display name, so the product names the Account by its email and one initial; the source fixture name is replaced by that text and its separate email line dropped",
        before,
        after: fixture.account.label,
      });
    }
    if (removed.text)
      changes.push({
        field: "account.stub",
        reason:
          "#194 accountStub is review meta-text about a separate ticket, not product copy",
        before: removed.text,
        after: "",
      });
  }
  if (hosted) {
    // #194 mounts its 360px frame as the extension panel; the hosted 360px
    // comparison is the web app, which sells Plans in place.
    const panel = await page.evaluate(() => {
      const source = (window as unknown as { ST: { t(key: string): string } })
        .ST;
      const root = document.querySelector(".v-D.panel");
      if (!root) return false;
      const upgrade = source.t("quotaUpgrade");
      const webOnly = source.t("planWebOnly");
      const fix = () => {
        root.querySelectorAll(".pop p.note").forEach((node) => {
          if (node.textContent === webOnly) node.textContent = upgrade;
        });
        root.querySelectorAll('a.lnk[data-act="planweb"]').forEach((link) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "btn sm";
          button.dataset.act = "planweb";
          button.textContent = upgrade;
          link.replaceWith(button);
        });
      };
      fix();
      new MutationObserver(fix).observe(root, {
        childList: true,
        subtree: true,
      });
      return true;
    });
    if (panel)
      changes.push({
        field: "plan.surface",
        reason:
          "#194 renders w=360 as the extension panel (Plan changes on the web); the hosted 360px frame is the web app, so the web surface's Change Plan button and copy apply",
        before:
          "planWebOnly note and Open on the web / Change Plan on the web link",
        after: "quotaUpgrade note and Change Plan button",
      });
  }
  // docs/design/voice-and-tone.md rule 5 supersedes the #194 capitalised English terms.
  const recased = await page.evaluate(() => {
    const source = (window as unknown as { ST: { lang(): string } }).ST;
    if (source.lang() !== "en") return [];
    const seen = new Set<string>();
    const term =
      /(?<=[a-z0-9,;:)] )(Checks?|References?|Quota|Plans?|History|Accounts?|Verdicts?|Guests?|Evidence)\b/g;
    const fix = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.nodeValue ?? "";
        const next = text.replace(term, (word) => {
          seen.add(word);
          return word.toLowerCase();
        });
        if (next !== text) node.nodeValue = next;
      }
    };
    const root = document.querySelector(".v-D") ?? document.body;
    fix(root);
    // The source re-renders on every action; keep later renders on the same rule.
    new MutationObserver(() => fix(root)).observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return [...seen];
  });
  if (recased.length)
    changes.push({
      field: "copy.case",
      reason:
        "docs/design/voice-and-tone.md rule 5 (settled in #192, wins over prototypes): English UI copy uses lower-case domain nouns mid-sentence; the #194 source capitalises them as domain markers",
      before: recased.join(", "),
      after: recased.map((word) => word.toLowerCase()).join(", "),
    });
  if (hosted && (fixture.lead || fixture.devNotice)) {
    // Hosted normalizations re-render the source after the lead projection
    // above, so keep both projections live across later renders.
    await page.evaluate(
      ({ lead, notice }) => {
        const source = (
          window as unknown as { ST: { ico(name: string): string } }
        ).ST;
        const root = document.querySelector(".v-D") ?? document.body;
        const fix = () => {
          const node = root.querySelector(".ilead");
          if (lead && node && node.textContent !== lead)
            node.textContent = lead;
          if (!notice) return;
          for (const box of root.querySelectorAll(".intake, .feed .foot")) {
            if (box.querySelector("[data-dev-note]")) continue;
            const lock = [...box.querySelectorAll(":scope .nrow")].find((row) =>
              row.querySelector("use[href='#i-lock']"),
            );
            if (!lock) continue;
            const row = document.createElement("p");
            row.className = "nrow";
            row.dataset.devNote = "";
            row.innerHTML = `${source.ico("i-info")}<span></span>`;
            row.querySelector("span")!.textContent = notice;
            lock.before(row);
          }
        };
        fix();
        new MutationObserver(fix).observe(root, {
          childList: true,
          subtree: true,
        });
      },
      { lead: fixture.lead, notice: fixture.devNotice },
    );
    if (fixture.devNotice)
      changes.push({
        field: "intake.dev-notice",
        reason:
          "The development preview notice (skeleton_notice) is a pre-release product line #194 D does not draw; it is projected into the source as one more .nrow before the storage line of the intake and feed footer, in the product's order",
        before: "",
        after: fixture.devNotice,
      });
  }
  if (fixture.legal?.length) {
    // Product addition: Help and the legal pages stay reachable on every
    // screen as a quiet row closing the intake notes and the feed foot. D
    // draws no such row, so it is projected after D's last note in D's own
    // foot type (sm, secondary); the source re-renders, so keep it live.
    await page.evaluate((labels) => {
      const root = document.querySelector(".v-D") ?? document.body;
      const make = () => {
        const nav = document.createElement("nav");
        nav.dataset.appLegal = "";
        nav.style.cssText =
          "display:flex;flex-wrap:wrap;gap:4px 16px;font-size:var(--st-text-sm);color:var(--st-text-secondary)";
        for (const label of labels) {
          const link = document.createElement("a");
          link.href = "#";
          link.textContent = label;
          link.style.cssText =
            "color:inherit;text-decoration:underline;text-underline-offset:3px";
          nav.append(link);
        }
        return nav;
      };
      const fix = () => {
        for (const box of root.querySelectorAll(".intake, .feed .foot")) {
          if (box.querySelector(":scope > [data-app-legal]")) continue;
          const rows = box.querySelectorAll(":scope > .nrow");
          const last = rows[rows.length - 1];
          if (!last) continue;
          last.after(make());
        }
      };
      fix();
      new MutationObserver(fix).observe(root, {
        childList: true,
        subtree: true,
      });
    }, fixture.legal);
    changes.push({
      field: "notes.legal",
      reason:
        "Product addition (web-gaps section 13): Help, Contact and the legal pages stay reachable on every screen as a quiet row after the last note of the intake and the feed foot; #194 D draws no such row, so it is projected in D's foot type",
      before: "",
      after: fixture.legal.join(" · "),
    });
  }
  if (hosted && fixture.selectionAvailable === undefined) {
    // Hosted re-renders the source, so hide rather than remove.
    await page.addStyleTag({
      content: `.v-D [data-act="src:selection"]{display:none!important}`,
    });
    changes.push({
      field: "intake.sources",
      reason:
        "The hosted comparison is the web app, which supports Text and File intake; browser Selection belongs to the extension",
      before: "Text, File, Selection in source panel frame",
      after: "Text, File in the actual web client",
    });
  }
  // The owner's explicit correction supersedes the prototype's asymmetric flex margins.
  await page.addStyleTag({
    content: `.v-D .top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,min(620px,calc(100% - 480px))) minmax(0,1fr)}.v-D .cmdf{margin:0;width:100%}.v-D .acct{justify-self:end}@media(max-width:699px){.v-D .top{grid-template-columns:auto minmax(0,1fr) auto}}`,
  });
  changes.push({
    field: "topbar.alignment",
    reason:
      "Owner amendment, 17 November 2026: command field shares the content centre line",
    before: "D asymmetric flex margins",
    after: "Equal side tracks; original source dimensions, gap and padding",
  });
  // Owner finding, 17 November 2026: the Quota meter has round ends. #196 KA
  // already rounds its fill; #194 D left the fill's leading edge square.
  await page.addStyleTag({
    content: `.v-D .pop .meter>i{border-radius:var(--st-radius-full)}`,
  });
  changes.push({
    field: "quota.fill.radius",
    reason:
      "Owner amendment, 17 November 2026: Quota meter fill has round ends, as in #196 KA",
    before: "D fill with square ends inside the round track",
    after: "Fill radius full; track unchanged",
  });
  if (fixture.commandPlaceholder) {
    const input = page.locator(".v-D .pq input");
    const before = await input.getAttribute("placeholder");
    await input.evaluate(
      (node, value) => node.setAttribute("placeholder", value),
      fixture.commandPlaceholder,
    );
    changes.push({
      field: "palette.placeholder",
      reason: "Available command-search wording; source input recipe unchanged",
      before: before ?? "",
      after: fixture.commandPlaceholder,
    });
  }
  if (fixture.commandEmpty) {
    const empty = page.locator(".v-D .palette .pl .note");
    const before = await empty.textContent();
    await empty.evaluate((node, text) => {
      node.textContent = text;
    }, fixture.commandEmpty);
    changes.push({
      field: "palette.empty",
      reason:
        "Identical empty-query message; source empty-state recipe unchanged",
      before: before ?? "",
      after: fixture.commandEmpty,
    });
  }
  if (fixture.commands.length) {
    const before = await page.locator(".v-D .palette .po").allTextContents();
    await page.evaluate((items) => {
      const list = document.querySelector(".v-D .palette .pl");
      if (!list) throw new Error("Source palette list is absent");
      const template = list.querySelector(".po");
      if (!template) throw new Error("Source palette row is absent");
      const icons: Record<string, string> = {
        input: "i-search",
        history: "i-history",
        account: "i-user",
        reset: "i-plus",
        preferences: "i-gear",
        stop: "i-stop",
      };
      const source = (
        window as unknown as { ST: { ico(name: string): string } }
      ).ST;
      const rows = items.map((item, i) => {
        const row = template.cloneNode(true) as HTMLElement;
        row.id = `fidelity-command-${i}`;
        row.dataset.i = String(i);
        row.setAttribute("aria-selected", String(i === 0));
        row.setAttribute("aria-disabled", String(item.disabled));
        const icon = icons[item.id];
        if (!icon)
          throw new Error(`No source command glyph mapping for ${item.id}`);
        row.querySelector("svg")?.remove();
        row.insertAdjacentHTML("afterbegin", source.ico(icon));
        const label = row.querySelector("span");
        if (label) label.textContent = item.label;
        row.querySelector("small")?.remove();
        return { row, group: item.group };
      });
      list.replaceChildren();
      let group: string | undefined;
      for (const item of rows) {
        if (item.group !== group) {
          const heading = document.createElement("li");
          heading.className = "pg-h eyebrow";
          heading.setAttribute("role", "presentation");
          heading.textContent = item.group;
          list.append(heading);
          group = item.group;
        }
        list.append(item.row);
      }
    }, fixture.commands);
    changes.push({
      field: "palette.commands",
      reason:
        "Available actions differ by client mode and lifecycle; identical command data uses untouched source row/group recipes",
      before: before.join("\n"),
      after: fixture.commands
        .map((item) => `${item.group}: ${item.label}`)
        .join("\n"),
    });
  }
  if (fixture.inputText && fixture.inputScrollTop !== undefined) {
    const input = page.locator(".v-D .cmdbar textarea");
    const before = await input.evaluate(
      (node) => (node as HTMLTextAreaElement).scrollTop,
    );
    await input.evaluate((node, top) => {
      (node as HTMLTextAreaElement).scrollTop = top;
    }, fixture.inputScrollTop);
    changes.push({
      field: "intake.scrollTop",
      reason:
        "Identical textarea scroll position after pasting the same input; source sizing and styles unchanged",
      before: String(before),
      after: String(fixture.inputScrollTop),
    });
  }
  return changes;
}

export async function ownerGeometryChecks(
  page: Page,
  quota?: ShellFixture["quota"],
): Promise<string[]> {
  const failures: string[] = [];
  const meter = page.locator('.account-entry [role="meter"]');
  if (quota && (await meter.count())) {
    const actual = await meter.evaluate((node) => {
      const track = node.querySelector<HTMLElement>(".st-track")!;
      const fill = track.querySelector<HTMLElement>(".st-fill")!;
      return {
        remaining: Number(node.getAttribute("aria-valuenow")),
        granted: Number(node.getAttribute("aria-valuemax")),
        trackWidth: track.clientWidth,
        fillWidth: fill.getBoundingClientRect().width,
        // Owner finding: both meter ends are round, on the track and fill.
        ends: [track, fill].map((part) => {
          const style = getComputedStyle(part);
          const height = part.getBoundingClientRect().height;
          return [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomLeftRadius,
            style.borderBottomRightRadius,
          ].every((radius) => parseFloat(radius) >= height / 2 - 0.5);
        }),
      };
    });
    if (actual.ends.includes(false))
      failures.push("Owner quota meter: track and fill ends are not round");
    failures.push(
      ...compareQuotaProportion(quota, actual.trackWidth, actual.fillWidth),
    );
    if (
      actual.remaining !== quota.remaining ||
      actual.granted !== Math.max(1, quota.granted)
    )
      failures.push(
        `Quota meter semantics: expected ${quota.remaining}/${Math.max(1, quota.granted)}, received ${actual.remaining}/${actual.granted}`,
      );
  }
  const trigger = await page.locator(".command-trigger").boundingBox();
  const detailOpen = await page
    .locator('.check-stage[data-detail-open="true"]')
    .count();
  const column = await page
    .locator(
      detailOpen
        ? '.check-stage[data-detail-open="true"]'
        : ".intake, .summary-strip",
    )
    .first()
    .boundingBox();
  if (
    trigger &&
    column &&
    page.viewportSize()!.width >= 700 &&
    Math.abs(trigger.x + trigger.width / 2 - column.x - column.width / 2) > 1
  )
    failures.push(
      "Owner alignment: command trigger and content column do not share their centre line",
    );
  const toggle = page.locator(".theme-toggle");
  const theme = await toggle.boundingBox();
  if (
    theme &&
    !(await toggle.evaluate(
      (node) =>
        parseFloat(getComputedStyle(node).borderTopLeftRadius) >=
        node.getBoundingClientRect().height / 2 - 0.5,
    ))
  )
    failures.push("Owner appearance control is not circular");
  if (!theme) failures.push("Owner appearance control is absent");
  else if (
    Math.abs(theme.width - 36) > 0.5 ||
    Math.abs(theme.height - 36) > 0.5
  )
    failures.push(
      `Owner appearance control: expected 36×36, received ${theme.width}×${theme.height}`,
    );
  return failures;
}
