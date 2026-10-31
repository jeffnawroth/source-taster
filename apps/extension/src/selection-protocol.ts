// SPDX-License-Identifier: AGPL-3.0-or-later
// Transient extension-internal transport only; never an API or storage schema.
export const selectionPort = "source-taster-selection-v1";
export interface Selection {
  text: string;
  possiblyShortened: boolean;
}
export interface SelectionPort {
  name: string;
  sender?: { id?: string; url?: string };
  postMessage(message: unknown): void;
  disconnect(): void;
  onMessage: {
    addListener(listener: (message: unknown) => void): void;
    removeListener(listener: (message: unknown) => void): void;
  };
  onDisconnect: { addListener(listener: () => void): void };
}
