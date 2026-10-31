// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Check,
  StructuringResult,
} from "@source-taster/contract-verification/v2";
import {
  ApiError,
  CheckStreamError,
  verificationClient,
  watchCheckEvents,
  type VerificationClientOptions,
} from "@source-taster/contract-verification/client-v2";
import {
  documentClient,
  documentSettingsClient,
} from "@source-taster/contract-verification/document-client";
import { m } from "@source-taster/i18n";
import { GuestTokenError } from "@source-taster/contract-service/client";
import { setLocale } from "@source-taster/i18n/runtime";
import { Button, Label, Text, TextArea, TextField } from "./index.tsx";
import {
  citationStyles,
  isCitationStyle,
  isInterfaceLanguage,
  saveGuestPreferences,
  type CitationStyle,
  type Preferences,
  type PreferenceStorage,
} from "./preferences.ts";
import { GuestIdentityError } from "./guest-identity.ts";
import { InformationLinks } from "./information.tsx";
import { StructuringResults } from "./structuring-results.tsx";
import { CheckResults } from "./check-results.tsx";
type MessageKey = Extract<keyof typeof m, `problem_${string}`>;
const styleMessages = {
  apa: "citation_style_apa",
  mla: "citation_style_mla",
  chicago: "citation_style_chicago",
  ieee: "citation_style_ieee",
  vancouver: "citation_style_vancouver",
  harvard: "citation_style_harvard",
  acs: "citation_style_acs",
  ama: "citation_style_ama",
  oxford: "citation_style_oxford",
  springer: "citation_style_springer",
  "din-iso-690": "citation_style_din_iso_690",
} as const satisfies Record<CitationStyle, keyof typeof m>;

function problemKey(error: unknown, fallback: MessageKey): MessageKey {
  if (error instanceof GuestIdentityError)
    return "problem_guest_identity_storage";
  const key =
    error instanceof ApiError ||
    error instanceof CheckStreamError ||
    error instanceof GuestTokenError
      ? error.problem?.i18nKey
      : undefined;
  return key?.startsWith("problem_") && key in m
    ? (key as MessageKey)
    : error instanceof ApiError
      ? "problem_internal"
      : fallback;
}

/** One in-memory Check workflow for web and panel hosts. Storage carries preferences only. */
export function CheckWorkspace({
  initial,
  preferenceStorage,
  transport,
  siteUrl,
}: {
  initial: { preferences: Preferences; citationStyleReset: boolean };
  preferenceStorage: PreferenceStorage;
  transport: VerificationClientOptions;
  siteUrl?: string;
}) {
  const api = useMemo(() => verificationClient(transport), [transport]);
  const uploadDocument = useMemo(() => documentClient(transport), [transport]);
  const documentSettings = useMemo(
    () => documentSettingsClient(transport),
    [transport],
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentNotice, setDocumentNotice] = useState(false);
  const [preferences, updatePreferences] = useState(initial.preferences);
  const [styleReset, setStyleReset] = useState(initial.citationStyleReset);
  const locale = preferences.language;
  const [text, setText] = useState("");
  const [check, setCheck] = useState<Check | null>(null);
  const [accessStopped, setAccessStopped] = useState(false);
  const [streamError, setStreamError] = useState<MessageKey | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [pending, setPending] = useState<
    "create" | "structure" | "document" | null
  >(null);
  const [preview, setPreview] = useState<StructuringResult | null>(null);
  const [requestError, setRequestError] = useState<unknown>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [cleanupPending, setCleanupPending] = useState(false);
  useEffect(
    () => () => {
      generation.current++;
      controller.current?.abort();
    },
    [],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = m.app_title();
  }, [locale]);
  const activeId =
    check?.references.some(
      (r) => r.outcome.kind === "status" && r.outcome.status === "running",
    ) &&
    !cancelRequested &&
    !accessStopped
      ? check.id
      : null;
  const renewalInterval = check?.leaseRenewAfterMs;
  useEffect(() => {
    if (!activeId || !renewalInterval) return;
    const token = generation.current;
    let alive = true;
    let renewing = false;
    const timer = setInterval(() => {
      if (renewing || !alive) return;
      renewing = true;
      void api
        .renewCheckLease(activeId)
        .then((snapshot) => {
          if (!alive || generation.current !== token) return;
          setCheck((current) =>
            current?.id === snapshot.id &&
            current.lastEventSeq <= snapshot.lastEventSeq
              ? snapshot
              : current,
          );
        })
        .catch((error) => {
          if (alive && generation.current === token) {
            setAccessStopped(true);
            controller.current?.abort();
            setStreamError(problemKey(error, "problem_connection"));
          }
        })
        .finally(() => {
          renewing = false;
        });
    }, renewalInterval);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [activeId, renewalInterval, api]);
  async function cancelDetached(id: string) {
    try {
      await api.cancelCheck(id);
    } catch {
      setCleanupPending(true);
    }
  }
  async function start(operation: "create" | "structure") {
    const token = ++generation.current;
    controller.current?.abort();
    setCheck(null);
    setPreview(null);
    setStreamError(null);
    setRequestError(null);
    setPending(operation);
    setAccessStopped(false);
    setCancelRequested(false);
    try {
      if (operation === "structure") {
        const result = await api.structureReferences(text);
        if (generation.current === token) setPreview(result);
        return;
      }
      const created = await api.createCheck(text);
      if (generation.current !== token) {
        void cancelDetached(created.id);
        return;
      }
      follow(created);
    } catch (error) {
      if (generation.current === token) setRequestError(error);
    } finally {
      if (generation.current === token) setPending(null);
    }
  }
  async function upload() {
    if (!file) return;
    const token = ++generation.current;
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setCheck(null);
    setPreview(null);
    setDocumentNotice(false);
    setStreamError(null);
    setRequestError(null);
    setPending("document");
    try {
      const { inputBytes } = await documentSettings(next.signal);
      if (generation.current !== token || next.signal.aborted) return;
      if (file.size > inputBytes)
        throw new ApiError(413, {
          type: "urn:source-taster:problem:document-size-limit",
          title: "The document exceeds the 20 MB limit.",
          status: 413,
          code: "document-size-limit",
          i18nKey: "problem_document_size_limit",
          limit: inputBytes,
        });
      const result = await uploadDocument(file, file.name, next.signal);
      if (generation.current !== token) return;
      setText(result.document.text);
      setPreview(result.structuring);
      setDocumentNotice(result.document.notice === "partial-no-text");
    } catch (error) {
      if (generation.current === token && !next.signal.aborted)
        setRequestError(error);
    } finally {
      if (generation.current === token) setPending(null);
    }
  }
  function follow(created: Check) {
    const token = generation.current;
    controller.current?.abort();
    setCancelRequested(false);
    setAccessStopped(false);
    const next = new AbortController();
    controller.current = next;
    setCheck((current) =>
      current?.id === created.id && current.lastEventSeq > created.lastEventSeq
        ? current
        : created,
    );
    if (
      !created.references.some(
        (r) => r.outcome.kind === "status" && r.outcome.status === "running",
      )
    )
      return;
    void watchCheckEvents(created.id, {
      ...transport,
      signal: next.signal,
      lastEventSeq: created.lastEventSeq,
      onEvent: (event) => {
        if (generation.current !== token || next.signal.aborted) return;
        setCheck((current) => {
          if (
            !current ||
            current.id !== event.checkId ||
            event.seq <= current.lastEventSeq
          )
            return current;
          if (event.type === "check.updated")
            return {
              ...current,
              state: event.state,
              endReason: event.endReason,
              lastEventSeq: event.seq,
              lastEventCursor: `${event.checkId}:${event.seq}`,
            };
          return {
            ...current,
            lastEventSeq: event.seq,
            lastEventCursor: `${event.checkId}:${event.seq}`,
            references: event.reference.removed
              ? current.references.filter(
                  (r) => r.slot !== event.reference.slot,
                )
              : current.references.some((r) => r.slot === event.reference.slot)
                ? current.references.map((r) =>
                    r.slot === event.reference.slot
                      ? { ...r, ...event.reference }
                      : r,
                  )
                : [
                    ...current.references,
                    event.reference as Check["references"][number],
                  ].sort((a, b) => a.slot - b.slot),
          };
        });
      },
    }).catch((error) => {
      if (generation.current === token && !next.signal.aborted) {
        setAccessStopped(true);
        setStreamError(problemKey(error, "problem_connection"));
      }
    });
  }
  async function cancel() {
    if (!check || cancelling) return;
    const token = generation.current,
      id = check.id;
    setCancelling(true);
    setCancelRequested(true);
    setStreamError(null);
    try {
      const confirmed = await api.cancelCheck(id);
      if (generation.current !== token) return;
      controller.current?.abort();
      setCheck((current) =>
        current?.id === id && current.lastEventSeq <= confirmed.lastEventSeq
          ? confirmed
          : current,
      );
    } catch {
      if (generation.current === token) setCleanupPending(true);
    } finally {
      if (generation.current === token) setCancelling(false);
    }
  }
  function reset() {
    generation.current++;
    controller.current?.abort();
    controller.current = null;
    if (
      check?.references.some(
        (r) => r.outcome.kind === "status" && r.outcome.status === "running",
      )
    )
      void cancelDetached(check.id);
    setText("");
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
    setDocumentNotice(false);
    setCheck(null);
    setPreview(null);
    setPending(null);
    setRequestError(null);
    setStreamError(null);
    setCancelling(false);
    setCancelRequested(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  const workspaceGeneration = generation.current;
  const running = check?.references.some(
    (r) => r.outcome.kind === "status" && r.outcome.status === "running",
  );
  const busy = pending !== null || running;
  const errorKey =
    streamError ??
    (requestError ? problemKey(requestError, "problem_connection") : null);
  const completed =
    check?.references.filter(
      (reference) =>
        reference.outcome.kind === "verdict" ||
        reference.outcome.status !== "running",
    ).length ?? 0;
  function changePreferences(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch };
    void setLocale(next.language, { reload: false });
    updatePreferences(next);
    void saveGuestPreferences(preferenceStorage, next);
    if (patch.citationStyle) setStyleReset(false);
  }
  return (
    <main className="check-workspace mx-auto max-w-7xl px-6 py-10 sm:py-16">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{m.app_title()}</h1>
          <p className="mt-2 text-slate-600">{m.app_intro()}</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {m.language_label()}
          <select
            className="rounded-lg border border-slate-500 bg-white p-2"
            value={locale}
            onChange={(event) => {
              if (isInterfaceLanguage(event.target.value))
                changePreferences({ language: event.target.value });
            }}
          >
            <option value="de">{m.language_de()}</option>
            <option value="en">{m.language_en()}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {m.citation_style_label()}
          <select
            className="rounded-lg border border-slate-500 bg-white p-2"
            value={preferences.citationStyle}
            onChange={(event) => {
              if (isCitationStyle(event.target.value))
                changePreferences({ citationStyle: event.target.value });
            }}
          >
            {citationStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {m[styleMessages[style.id]]()}
              </option>
            ))}
          </select>
        </label>
      </header>
      {styleReset && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950"
        >
          {m.citation_style_reset()}
        </p>
      )}
      <p className="mb-8 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950">
        {m.skeleton_notice()}
      </p>
      <form
        className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if (text.trim() && !busy) void start("create");
        }}
      >
        <fieldset className="mb-6 flex flex-col gap-3" disabled={busy}>
          <label htmlFor="document-file" className="text-lg font-semibold">
            {m.document_upload_label()}
          </label>
          <p id="document-hint" className="text-sm text-slate-600">
            {m.document_upload_hint()}
          </p>
          <input
            ref={fileInput}
            id="document-file"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            aria-describedby="document-hint"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setRequestError(null);
            }}
            className="max-w-full rounded-lg border border-slate-500 p-3"
          />
          <Button
            type="button"
            isDisabled={!file || busy}
            onPress={() => {
              void upload();
            }}
            className="self-start rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-600"
          >
            {pending === "document"
              ? m.document_upload_pending()
              : m.document_upload_action()}
          </Button>
        </fieldset>
        <TextField
          value={text}
          onChange={(value) => {
            setText(value);
            setPreview(null);
            setDocumentNotice(false);
          }}
          isDisabled={busy}
          className="flex flex-col gap-3"
        >
          <Label className="text-lg font-semibold">{m.input_label()}</Label>
          <Text slot="description" className="text-sm text-slate-600">
            {m.input_hint()}
          </Text>
          <TextArea
            ref={inputRef}
            className="min-h-40 resize-y rounded-xl border border-slate-500 p-4 leading-relaxed placeholder:text-slate-500 disabled:bg-slate-100"
            placeholder={m.input_example()}
          />
        </TextField>
        <Button
          type="button"
          isDisabled={!text.trim() || busy}
          onPress={() => {
            void start("structure");
          }}
          className="mt-5 mr-3 rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-600"
        >
          {pending === "structure"
            ? m.structuring_pending()
            : m.structuring_action()}
        </Button>
        <Button
          type="submit"
          isDisabled={!text.trim() || busy}
          className="mt-5 rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-600"
        >
          {pending === "create" ? m.check_starting() : m.check_action()}
        </Button>
        <Button
          type="button"
          onPress={reset}
          className="mt-5 ml-3 rounded-xl border border-slate-600 px-5 py-3 font-semibold"
        >
          {m.check_reset()}
        </Button>
      </form>
      {cleanupPending && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950"
        >
          {m.check_cleanup_pending()}
        </p>
      )}
      {errorKey && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-400 bg-red-50 p-4 text-red-900"
        >
          {m[errorKey]({
            limit:
              requestError instanceof ApiError &&
              errorKey === "problem_document_size_limit"
                ? new Intl.NumberFormat(locale, {
                    maximumSignificantDigits: 3,
                  }).format(
                    (requestError.problem?.limit ?? 20_971_520) / 1_048_576,
                  )
                : String(
                    requestError instanceof ApiError
                      ? (requestError.problem?.limit ?? 1000)
                      : 1000,
                  ),
          })}
        </p>
      )}
      {documentNotice && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-amber-400 bg-amber-50 p-4"
        >
          {m.document_partial_no_text()}
        </p>
      )}
      {preview && <StructuringResults result={preview} />}
      {check && (
        <section aria-labelledby="results-title" className="mt-10">
          <h2 id="results-title" className="mb-4 text-2xl font-semibold">
            {m.results_heading()}
          </h2>
          <div
            role="status"
            aria-live="off"
            aria-atomic="true"
            className="check-status rounded-2xl border border-slate-300 bg-white p-6"
          >
            <div aria-live="polite" aria-atomic="true">
              <p className="mb-4 font-semibold">
                {running ? m.check_running() : m.check_ended()}
              </p>
              <p>
                {m.check_progress({
                  completed: String(completed),
                  total: String(check.references.length),
                })}
              </p>
            </div>
            {check.endReason === "lease-expired" && (
              <p>{m.check_lease_expired()}</p>
            )}
            {running && (
              <Button
                type="button"
                isDisabled={cancelling}
                onPress={() => {
                  void cancel();
                }}
                className="mb-4 rounded-xl border border-slate-600 px-5 py-3 font-semibold"
              >
                {cancelling ? m.check_cancelling() : m.check_cancel()}
              </Button>
            )}
            <CheckResults
              key={check.id}
              check={check}
              completed={completed}
              citationStyle={preferences.citationStyle}
              citationStyleLabel={m[styleMessages[preferences.citationStyle]]()}
              transport={transport}
              onSnapshot={(snapshot) => {
                if (
                  generation.current === workspaceGeneration &&
                  check.id === snapshot.id
                )
                  follow(snapshot);
              }}
            />
          </div>
        </section>
      )}
      <InformationLinks language={locale} siteUrl={siteUrl} />
    </main>
  );
}
