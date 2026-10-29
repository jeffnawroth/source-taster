// SPDX-License-Identifier: AGPL-3.0-or-later
// Self-contained: registered synchronously at top level, no imports, no
// messaging and no network. The toolbar action opens the native panel.
interface Namespace {
  sidePanel?: {
    setPanelBehavior(behavior: {
      openPanelOnActionClick: boolean;
    }): Promise<void>;
  };
  sidebarAction?: { toggle(): Promise<void> };
  action: { onClicked: { addListener(listener: () => void): void } };
  storage: {
    local: {
      setAccessLevel?(options: {
        accessLevel: "TRUSTED_CONTEXTS";
      }): Promise<void>;
    };
  };
}
const scope = globalThis as { browser?: Namespace; chrome?: Namespace };
const api = (scope.browser ?? scope.chrome)!;
if (import.meta.env.MODE === "chromium") {
  void api.sidePanel!.setPanelBehavior({ openPanelOnActionClick: true });
  // Content scripts and other untrusted contexts never see extension storage.
  void api.storage.local.setAccessLevel!({ accessLevel: "TRUSTED_CONTEXTS" });
} else {
  api.action.onClicked.addListener(() => {
    void api.sidebarAction!.toggle();
  });
}
