// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useId, useState } from "react";
import { m } from "@source-taster/i18n";
import {
  ApiError,
  type verificationClient,
} from "@source-taster/contract-verification/client-v2";
import type { Check } from "@source-taster/contract-verification/v2";
import { ownerQuota, planStart } from "./quota.ts";
import { Button, Modal, Dialog, DialogHeading } from "./primitives/index.ts";
import { QuotaChoice } from "./quota-panel.tsx";
type Api = ReturnType<typeof verificationClient>;
type HistoryData = Awaited<ReturnType<Api["getHistory"]>>;
type Entry = HistoryData["entries"][number];
export function HistoryPanel({
  api,
  busy,
  refreshKey,
  onCheck,
  onDelete,
  upgradeUrl,
}: {
  api: Api;
  busy: boolean;
  refreshKey: string;
  onCheck: (check: Check) => void;
  onDelete: (id?: string) => void;
  upgradeUrl?: string;
}) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [choice, setChoice] = useState<
    { kind: "restart" | "delete"; entry: Entry } | { kind: "revoke" } | null
  >(null);
  const [partial, setPartial] = useState<{
    entry: Entry;
    available: number;
  } | null>(null);
  const id = useId();
  useEffect(() => {
    let live = true;
    api.getHistory().then(
      (value) => {
        if (live) {
          setData(value);
          setError(false);
        }
      },
      () => {
        if (live) setError(true);
      },
    );
    return () => {
      live = false;
    };
  }, [api, refreshKey]);
  async function run(action: () => Promise<void>) {
    setPending(true);
    setError(false);
    try {
      await action();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }
  async function restart(entry: Entry, max?: number) {
    // A restart is new work, so use the same real-Quota preview and first-N
    // choice as ordinary Check starts. The API remains the billing authority.
    const quota = ownerQuota(await api.getQuota());
    if (!quota) throw new Error("quota-unavailable");
    const plan = planStart(entry.referenceCount, quota);
    if (max === undefined && plan.kind === "partial") {
      setPartial({ entry, available: plan.available });
      setChoice(null);
      return;
    }
    try {
      const check = await api.restartHistory(entry.id, max);
      setChoice(null);
      setPartial(null);
      onCheck(check);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.problem?.code === "quota-insufficient" &&
        error.problem.available !== undefined
      ) {
        setPartial({ entry, available: error.problem.available });
        setChoice(null);
      } else throw error;
    }
  }
  const disabled = busy || pending;
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="my-6 rounded-xl border border-border-emphasis bg-surface p-4"
    >
      <h2 id={`${id}-heading`} className="text-xl font-semibold">
        {m.history_heading()}
      </h2>
      <p>{m.history_policy()}</p>
      {error && <p role="alert">{m.history_unavailable()}</p>}
      <div className="my-3 flex flex-wrap gap-3">
        <button
          className="rounded border border-border-emphasis px-3 py-2"
          disabled={pending}
          onClick={() =>
            void run(async () => {
              setData(await api.getHistory());
            })
          }
        >
          {m.history_refresh()}
        </button>
        {data &&
          (data.enabled ? (
            <button
              className="rounded border border-border-emphasis px-3 py-2"
              disabled={disabled}
              onClick={() => setChoice({ kind: "revoke" })}
            >
              {m.history_revoke()}
            </button>
          ) : (
            <button
              className="rounded border border-border-emphasis px-3 py-2"
              disabled={disabled}
              onClick={() =>
                void run(async () => {
                  setData(await api.setHistory(true));
                })
              }
            >
              {m.history_enable()}
            </button>
          ))}
      </div>
      {data?.enabled && (
        <>
          <label htmlFor={`${id}-search`}>{m.history_search()}</label>
          <input
            id={`${id}-search`}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="my-2 block w-full max-w-md rounded border border-border-emphasis p-2"
          />
          {!data.entries.length && <p>{m.history_empty()}</p>}
          <ul className="space-y-4">
            {data.entries
              .filter((entry) =>
                `${entry.label ?? ""} ${entry.storedAt} ${entry.id}`
                  .toLocaleLowerCase()
                  .includes(search.toLocaleLowerCase()),
              )
              .map((entry) => (
                <li
                  key={entry.id}
                  className="rounded border border-border-emphasis p-3"
                >
                  {entry.label && <p>{entry.label}</p>}
                  <p>
                    <time dateTime={entry.storedAt}>{entry.storedAt}</time> ·{" "}
                    {m.history_count({ count: String(entry.referenceCount) })}
                  </p>
                  <p>{m.history_expires({ date: entry.expiresAt })}</p>
                  {entry.locked && (
                    <p>
                      {m.problem_history_locked()}{" "}
                      {upgradeUrl && (
                        <a href={upgradeUrl}>{m.quota_upgrade()}</a>
                      )}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded border border-border-emphasis px-3 py-2"
                      disabled={disabled || entry.locked}
                      onClick={() =>
                        void run(async () => {
                          onCheck(await api.getCheck(entry.id));
                        })
                      }
                    >
                      {m.history_open()}
                    </button>
                    <button
                      className="rounded border border-border-emphasis px-3 py-2"
                      disabled={
                        disabled || entry.locked || entry.referenceCount === 0
                      }
                      onClick={() => {
                        setPartial(null);
                        setChoice({ kind: "restart", entry });
                      }}
                    >
                      {m.history_restart()}
                    </button>
                    <button
                      className="rounded border border-border-emphasis px-3 py-2"
                      disabled={disabled}
                      onClick={() => setChoice({ kind: "delete", entry })}
                    >
                      {m.history_delete()}
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </>
      )}
      {choice && (
        <Modal
          isOpen
          isDismissable={!pending}
          isKeyboardDismissDisabled={pending}
          onOpenChange={(open) => {
            if (!open && !pending) setChoice(null);
          }}
        >
          <Dialog role="alertdialog" aria-describedby={`${id}-confirm`}>
            <DialogHeading>
              {choice.kind === "restart"
                ? m.history_restart()
                : choice.kind === "revoke"
                  ? m.history_revoke()
                  : m.history_delete()}
            </DialogHeading>
            <p id={`${id}-confirm`}>
              {choice.kind === "restart"
                ? m.history_billable({
                    count: String(choice.entry.referenceCount),
                  })
                : choice.kind === "revoke"
                  ? m.history_revoke_warning()
                  : m.history_delete_warning()}
            </p>
            {error && <p role="alert">{m.history_unavailable()}</p>}
            <div className="st-actions">
              <Button
                autoFocus
                {...(pending
                  ? {
                      isDisabled: true as const,
                      disabledReason: m.shell_busy(),
                    }
                  : { isDisabled: false as const })}
                onPress={() => setChoice(null)}
              >
                {m.history_back()}
              </Button>
              <Button
                variant={choice.kind === "restart" ? "primary" : "danger"}
                isPending={pending}
                {...(disabled
                  ? {
                      isDisabled: true as const,
                      disabledReason: m.shell_busy(),
                    }
                  : { isDisabled: false as const })}
                onPress={() => {
                  void run(async () => {
                    if (choice.kind === "restart") await restart(choice.entry);
                    else if (choice.kind === "delete") {
                      setData(await api.deleteHistory(choice.entry.id));
                      onDelete(choice.entry.id);
                      setChoice(null);
                    } else {
                      setData(await api.setHistory(false));
                      onDelete();
                      setChoice(null);
                    }
                  });
                }}
              >
                {choice.kind === "restart"
                  ? m.history_restart_confirm()
                  : choice.kind === "revoke"
                    ? m.history_revoke_confirm()
                    : m.history_delete_confirm()}
              </Button>
            </div>
          </Dialog>
        </Modal>
      )}
      {partial && (
        <QuotaChoice
          required={partial.entry.referenceCount}
          available={partial.available}
          upgradeUrl={upgradeUrl}
          onFirst={() => {
            if (!disabled)
              void run(() => restart(partial.entry, partial.available));
          }}
          onDismiss={() => setPartial(null)}
        />
      )}
    </section>
  );
}
