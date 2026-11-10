// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
// This is the only owner of the ADR-0027 unstable-export exception.
import {
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastRegion as AriaToastRegion,
  Text,
} from "react-aria-components";
import { ToastQueue, type QueuedToast } from "react-stately/useToastState";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button, IconButton } from "./actions.tsx";
import { FeedbackIcon, type Tone } from "./display.tsx";
export type ToastMessage = {
  title: string;
  description?: string;
  tone?: Tone;
  action?: { label: string; onAction: () => void };
};
export interface ToastController {
  add(message: ToastMessage): string;
  close(key: string): void;
  clear(): void;
}
const queues = new WeakMap<ToastController, ToastQueue<ToastMessage>>();
// Instance ownership prevents cross-root/SSR notification leakage. The queue is
// private so callers cannot accidentally add an expiring action via queue.add.
export function createToastQueue(): ToastController {
  const queue = new ToastQueue<ToastMessage>({ maxVisibleToasts: 3 });
  const controller: ToastController = {
    add(message) {
      return queue.add(message, message.action ? {} : { timeout: 5000 });
    },
    close(key) {
      queue.close(key);
    },
    clear() {
      queue.clear();
    },
  };
  queues.set(controller, queue);
  return controller;
}
export function Toast({
  toast,
  controller,
  closeLabel,
}: {
  toast: QueuedToast<ToastMessage>;
  controller: ToastController;
  closeLabel: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const { title, description, tone = "info", action } = toast.content;
  return (
    <AriaToast
      toast={toast}
      className="st-toast st-glass st-focus flex items-start gap-3 rounded-lg border border-glass-border p-4 font-sans text-base text-text shadow-glass"
      data-st-glass="glass"
      data-st-layer="toast"
    >
      <FeedbackIcon tone={tone} />
      <div className="min-w-0 flex-1">
        <div
          aria-hidden={visible ? undefined : true}
          role={tone === "danger" ? "alert" : "status"}
          aria-live={tone === "danger" ? "assertive" : "polite"}
          aria-atomic="true"
        >
          <Text slot="title" className="block font-medium">
            {title}
          </Text>
          {description && (
            <Text
              slot="description"
              className="block text-text-on-glass-secondary"
            >
              {description}
            </Text>
          )}
        </div>
        {action && (
          <Button
            variant="ghost"
            onPress={() => {
              action.onAction();
              controller.close(toast.key);
            }}
          >
            {action.label}
          </Button>
        )}
      </div>
      <IconButton slot="close" label={closeLabel} size="sm">
        <X aria-hidden="true" size={16} strokeWidth={1.75} />
      </IconButton>
    </AriaToast>
  );
}
export function ToastRegion({
  controller,
  label,
  closeLabel,
}: {
  controller: ToastController;
  label: string;
  closeLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    // RAC 1.22.1 only cycles registered landmarks. Also work in roots without
    // a registered Main, preserving the user's entry point on the next F6.
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.key !== "F6" ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        !ref.current
      )
        return;
      const active = document.activeElement;
      if (ref.current.contains(active)) {
        if (!previousFocus.current?.isConnected) return;
        previousFocus.current.focus();
      } else {
        previousFocus.current = active instanceof HTMLElement ? active : null;
        ref.current.focus();
      }
      event.preventDefault();
      event.stopPropagation();
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
  const queue = queues.get(controller);
  if (!queue)
    throw new Error(
      "ToastRegion requires a controller from createToastQueue().",
    );
  return (
    <AriaToastRegion
      ref={ref}
      queue={queue}
      aria-label={label}
      className="st-toast-region st-focus"
    >
      {({ toast }) => (
        <Toast toast={toast} controller={controller} closeLabel={closeLabel} />
      )}
    </AriaToastRegion>
  );
}
