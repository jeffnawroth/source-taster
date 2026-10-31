// SPDX-License-Identifier: AGPL-3.0-or-later
// Listeners are registered at top level. Selection content lives only in memory
// during the panel handshake; the background never makes verification requests.
import type { Selection, SelectionPort } from "./selection-protocol.ts";
interface Namespace {
  runtime: {
    id: string;
    getURL(path: string): string;
    onInstalled: { addListener(listener: () => void): void };
    onConnect: { addListener(listener: (port: SelectionPort) => void): void };
    lastError?: { message?: string };
  };
  i18n: { getMessage(key: string): string };
  contextMenus?: Menus;
  menus?: Menus;
  sidePanel?: {
    setPanelBehavior(behavior: { openPanelOnActionClick: boolean }): Promise<void>;
    open(options: { windowId: number }): Promise<void>;
  };
  sidebarAction?: { toggle(): Promise<void>; open(): Promise<void> };
  action: { onClicked: { addListener(listener: () => void): void } };
  storage: { local: { setAccessLevel?(options: { accessLevel: "TRUSTED_CONTEXTS" }): Promise<void> } };
}
interface Menus {
  create(item: { id: string; title: string; contexts: ["selection"] }): void;
  onClicked: { addListener(listener: (info: { menuItemId: string | number; selectionText?: string }, tab?: { windowId?: number }) => void): void };
}
const scope = globalThis as { browser?: Namespace; chrome?: Namespace };
const api = (scope.browser ?? scope.chrome)!;
const chromium = import.meta.env.MODE === "chromium";
const menus = (api.menus ?? api.contextMenus)!;
const menuId = "check-selected-text";
// Kept literal here so the classic Firefox background stays self-contained.
const selectionPort = "source-taster-selection-v1";
// onInstalled runs for install/update, not every service-worker wakeup. Native
// menu registrations survive worker suspension; duplicate IDs are never made.
api.runtime.onInstalled.addListener(() => {
  menus.create({ id: menuId, title: api.i18n.getMessage("check_selected_text"), contexts: ["selection"] });
});
const panels = new Map<SelectionPort, number>();
const waiting = new Map<number, { selection: Selection; timer: ReturnType<typeof setTimeout> }>();
function clear(windowId: number) {
  const pending = waiting.get(windowId);
  if (pending) clearTimeout(pending.timer);
  waiting.delete(windowId);
}
function deliver(port: SelectionPort, selection: Selection) {
  try { port.postMessage(selection); } catch { panels.delete(port); }
}
api.runtime.onConnect.addListener((port) => {
  // Only our trusted panel may receive text. No page, external extension or
  // unrelated extension page can subscribe; no generic message intake exists.
  if (port.name !== selectionPort || port.sender?.id !== api.runtime.id || port.sender.url !== api.runtime.getURL("panel.html")) {
    port.disconnect();
    return;
  }
  port.onMessage.addListener((message) => {
    const ready = message as { windowId?: unknown } | null;
    if (typeof ready?.windowId !== "number" || !Number.isInteger(ready.windowId)) return;
    panels.set(port, ready.windowId);
    const pending = waiting.get(ready.windowId);
    if (pending) {
      clear(ready.windowId);
      deliver(port, pending.selection);
    }
  });
  port.onDisconnect.addListener(() => { panels.delete(port); });
});
menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== menuId || tab?.windowId === undefined) return;
  // Preserve the native user gesture: this must precede promises, messaging,
  // preference reads or any other asynchronous work.
  const opened = chromium ? api.sidePanel!.open({ windowId: tab.windowId }) : api.sidebarAction!.open();
  const windowId = tab.windowId;
  const selection: Selection = {
    text: info.selectionText ?? "",
    possiblyShortened: !chromium && info.selectionText?.length === 16_384,
  };
  clear(windowId);
  const recipients = [...panels].filter(([, window]) => window === windowId);
  if (recipients.length) {
    for (const [port] of recipients) deliver(port, selection);
  } else {
    // Cold panels connect once the shared input is ready. Never persist a draft
    // to survive a worker/browser restart; discard a failed/abandoned handshake.
    waiting.set(windowId, { selection, timer: setTimeout(() => clear(windowId), 30_000) });
  }
  void opened.catch(() => {
    if (waiting.get(windowId)?.selection === selection) clear(windowId);
  });
});
if (chromium) {
  void api.sidePanel!.setPanelBehavior({ openPanelOnActionClick: true });
  void api.storage.local.setAccessLevel!({ accessLevel: "TRUSTED_CONTEXTS" });
} else {
  api.action.onClicked.addListener(() => { void api.sidebarAction!.toggle(); });
}
