// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useId, useState } from "react";
import {
  ArrowRight,
  Lock,
  RotateCcw,
  Trash,
  Warn,
} from "./workspace-icons.tsx";
import { m } from "@source-taster/i18n";
import { getLocale } from "@source-taster/i18n/runtime";
import {
  ApiError,
  type verificationClient,
} from "@source-taster/contract-verification/client-v2";
import type { Check } from "@source-taster/contract-verification/v2";
import { ownerQuota, planStart } from "./quota.ts";
import {
  Button,
  Modal,
  Dialog,
  DialogHeading,
  SearchField,
  type Availability,
} from "./primitives/index.ts";
import { QuotaChoice } from "./quota-panel.tsx";
type Api = ReturnType<typeof verificationClient>;
type HistoryData = Awaited<ReturnType<Api["getHistory"]>>;
type Entry = HistoryData["entries"][number];
export function HistoryPanel({
  api,
  busy,
  currentId,
  refreshKey,
  onCheck,
  onDelete,
  onData,
  upgradeUrl,
}: {
  api: Api;
  busy: boolean;
  /** The open Check, tagged as current and named by the storage line. */
  currentId?: string;
  refreshKey: string;
  onCheck: (check: Check) => void;
  onDelete: (id?: string) => void;
  /** Every History state this panel reads or writes, for the storage line. */
  onData?: (data: HistoryData) => void;
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
    if (data) onData?.(data);
  }, [data, onData]);
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
  const whileBusy: Availability = busy
    ? { isDisabled: true, disabledReason: m.shell_busy() }
    : { isDisabled: false };
  const current = currentId
    ? data?.entries.find((entry) => entry.id === currentId)
    : undefined;
  const storage = !data
    ? undefined
    : !data.enabled
      ? m.storage_temporary()
      : current
        ? m.storage_history({ date: historyDate(current.expiresAt) })
        : undefined;
  const entries = (data?.entries ?? []).filter((entry) =>
    `${entry.label ?? ""} ${entry.storedAt} ${entry.id}`
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()),
  );
  return (
    <div className="history-body">
      {storage && (
        <p className="history-note">
          <Lock aria-hidden="true" size={16} />
          <span>{storage}</span>
        </p>
      )}
      {error && (
        <div className="history-box" role="alert">
          <p>{m.history_unavailable()}</p>
          <div className="history-row">
            <Button
              size="sm"
              isPending={pending}
              onPress={() =>
                void run(async () => {
                  setData(await api.getHistory());
                })
              }
            >
              {m.history_refresh()}
            </Button>
          </div>
        </div>
      )}
      {data && !data.enabled && (
        <div className="history-box">
          <p>{m.history_off()}</p>
          <p className="history-muted">{m.history_consent()}</p>
          <div className="history-row">
            <Button
              size="sm"
              variant="primary"
              isPending={pending}
              {...whileBusy}
              onPress={() =>
                void run(async () => {
                  setData(await api.setHistory(true));
                })
              }
            >
              {m.history_enable()}
            </Button>
          </div>
        </div>
      )}
      {data?.enabled && (
        <>
          {data.entries.length > 0 && (
            <SearchField
              label={m.history_search()}
              clearLabel={m.history_search_clear()}
              value={search}
              onChange={setSearch}
            />
          )}
          {!data.entries.length && (
            <p className="history-muted">{m.history_empty()}</p>
          )}
          <ul className="history-list">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="history-entry"
                data-locked={entry.locked || undefined}
              >
                <div className="history-entry-head">
                  <span>
                    {entry.label ??
                      m.history_count({ count: String(entry.referenceCount) })}
                  </span>
                  {entry.id === currentId && (
                    <span className="history-current">
                      {m.history_current()}
                    </span>
                  )}
                </div>
                <div className="history-entry-meta">
                  <time dateTime={entry.storedAt}>
                    {historyDate(entry.storedAt)}
                  </time>
                  <span>
                    {m.history_count({ count: String(entry.referenceCount) })}
                  </span>
                  <span>
                    {entry.locked ? (
                      <Lock aria-hidden="true" size={14} />
                    ) : (
                      <Trash aria-hidden="true" size={14} />
                    )}{" "}
                    {m.history_expires({ date: historyDate(entry.expiresAt) })}
                  </span>
                </div>
                {entry.locked ? (
                  <>
                    <p className="history-note">
                      <Lock aria-hidden="true" size={16} />
                      <span>
                        {m.problem_history_locked()}{" "}
                        {upgradeUrl && (
                          <a className="history-link" href={upgradeUrl}>
                            {m.quota_upgrade()}
                          </a>
                        )}
                      </span>
                    </p>
                    <div className="history-row">
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<Trash aria-hidden="true" size={16} />}
                        {...whileBusy}
                        onPress={() => setChoice({ kind: "delete", entry })}
                      >
                        {m.history_delete()}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="history-row">
                      <Button
                        size="sm"
                        icon={<ArrowRight aria-hidden="true" size={16} />}
                        {...whileBusy}
                        onPress={() =>
                          void run(async () => {
                            onCheck(await api.getCheck(entry.id));
                          })
                        }
                      >
                        {m.history_open()}
                      </Button>
                      {entry.referenceCount > 0 && (
                        <Button
                          size="sm"
                          icon={<RotateCcw aria-hidden="true" size={16} />}
                          {...whileBusy}
                          onPress={() => {
                            setPartial(null);
                            setChoice({ kind: "restart", entry });
                          }}
                        >
                          {m.history_restart()}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash aria-hidden="true" size={16} />}
                        {...whileBusy}
                        onPress={() => setChoice({ kind: "delete", entry })}
                      >
                        {m.history_delete()}
                      </Button>
                    </div>
                    {entry.referenceCount > 0 && (
                      <p className="history-bill">
                        <Warn aria-hidden="true" size={15} />
                        <span>
                          {m.history_billable_short({
                            count: String(entry.referenceCount),
                          })}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="history-row">
            <Button
              size="sm"
              variant="ghost"
              isPending={pending}
              {...whileBusy}
              onPress={() => setChoice({ kind: "revoke" })}
            >
              {m.history_revoke()}
            </Button>
          </div>
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
    </div>
  );
}

/** #194 D ST.date: "7 Nov 2026" in English, "7.11.2026" in German. */
export function historyDate(iso: string) {
  const locale = getLocale();
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", {
    day: "numeric",
    month: locale === "de" ? "numeric" : "short",
    year: "numeric",
  }).format(new Date(iso));
}
