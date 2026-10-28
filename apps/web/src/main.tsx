// SPDX-License-Identifier: AGPL-3.0-or-later
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import {
  type Check,
  type StructuringResult,
} from "@source-taster/contract-verification";
import {
  CheckStreamError,
  ApiError,
  verificationClient,
  watchCheckEvents,
} from "@source-taster/contract-verification/client";
import { m } from "@source-taster/i18n";
import { setLocale } from "@source-taster/i18n/runtime";
import { Button, Label, Text, TextArea, TextField } from "@source-taster/ui";
import {
  citationStyles,
  isCitationStyle,
  isInterfaceLanguage,
  loadGuestPreferences,
  saveGuestPreferences,
  webPreferenceStorage,
  type CitationStyle,
  type Preferences,
} from "@source-taster/ui/preferences";
import {
  GuestIdentityError,
  guestCredentials,
  webGuestIdentityStorage,
} from "@source-taster/ui/guest-identity";
import { InformationLinks } from "@source-taster/ui/information";
import { StructuringResults } from "./structuring-results.tsx";
import "./style.css";
import { ReferenceOutcomeView } from "./reference-outcome.tsx";

type MessageKey = Extract<keyof typeof m, `problem_${string}`>;
const preferenceStorage = webPreferenceStorage();
const initial = await loadGuestPreferences(
  preferenceStorage,
  navigator.languages,
);
void setLocale(initial.preferences.language, { reload: false });
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

const mode = import.meta.env.VITE_SOURCE_TASTER_MODE ?? "standalone";
if (mode !== "standalone" && mode !== "hosted")
  throw new Error("Choose standalone or hosted client mode");
const serviceUrl = import.meta.env.VITE_SOURCE_TASTER_SERVICE_URL;
if (mode === "hosted" && !serviceUrl)
  throw new Error("Hosted client requires a service URL");
const guest =
  mode === "hosted"
    ? guestCredentials({
        storage: webGuestIdentityStorage(),
        client: "web",
        serviceUrl: serviceUrl!,
      })
    : undefined;
const credentials = guest?.credentials;
const api = verificationClient({ client: "web/0.0.0", credentials });
function problemKey(error: unknown, fallback: MessageKey): MessageKey {
  if (error instanceof GuestIdentityError)
    return "problem_guest_identity_storage";
  const key =
    error instanceof ApiError || error instanceof CheckStreamError
      ? error.problem?.i18nKey
      : undefined;
  return key?.startsWith("problem_") && key in m
    ? (key as MessageKey)
    : error instanceof ApiError
      ? "problem_internal"
      : fallback;
}

function Workspace() {
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
  const [pending, setPending] = useState<"create" | "structure" | null>(null);
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
    check?.state === "running" && !cancelRequested && !accessStopped
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
  }, [activeId, renewalInterval]);
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
      const next = new AbortController();
      controller.current = next;
      setCheck(created);
      void watchCheckEvents(created.id, {
        credentials,
        client: "web/0.0.0",
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
              references: current.references.map((reference) =>
                reference.slot === event.reference.slot
                  ? { ...reference, ...event.reference }
                  : reference,
              ),
            };
          });
        },
      }).catch((error) => {
        if (generation.current === token && !next.signal.aborted) {
          setAccessStopped(true);
          setStreamError(problemKey(error, "problem_connection"));
        }
      });
    } catch (error) {
      if (generation.current === token) setRequestError(error);
    } finally {
      if (generation.current === token) setPending(null);
    }
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
    if (check?.state === "running") void cancelDetached(check.id);
    setText("");
    setCheck(null);
    setPreview(null);
    setPending(null);
    setRequestError(null);
    setStreamError(null);
    setCancelling(false);
    setCancelRequested(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  const busy = pending !== null || check?.state === "running";
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
    <main className="mx-auto max-w-3xl px-6 py-10 sm:py-16">
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
        <TextField
          value={text}
          onChange={(value) => {
            setText(value);
            setPreview(null);
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
            limit: String(
              requestError instanceof ApiError
                ? (requestError.problem?.limit ?? 1000)
                : 1000,
            ),
          })}
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
            className="rounded-2xl border border-slate-300 bg-white p-6"
          >
            <div aria-live="polite" aria-atomic="true">
              <p className="mb-4 font-semibold">
                {check.state === "running"
                  ? m.check_running()
                  : m.check_ended()}
              </p>
              <p>
                {m.check_progress({
                  completed: String(completed),
                  total: String(check.references.length),
                })}
              </p>
            </div>
            <progress
              aria-label={m.check_progress_label()}
              value={completed}
              max={check.references.length}
              className="my-3 w-full"
            />
            {check.endReason === "lease-expired" && (
              <p>{m.check_lease_expired()}</p>
            )}
            {check.state === "running" && (
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
            <ol className="space-y-4">
              {check.references.map((reference) => (
                <li
                  key={reference.slot}
                  className="rounded-xl bg-slate-100 p-4"
                >
                  <p className="break-words">{reference.originalText}</p>
                  {reference.outcome.kind === "status" &&
                    reference.outcome.status === "running" && (
                      <p>
                        {reference.progress === "queued"
                          ? m.reference_queued()
                          : reference.progress === "doi.org" ||
                              reference.progress === "crossref"
                            ? m.reference_source({
                                source:
                                  reference.progress === "doi.org"
                                    ? "doi.org"
                                    : "Crossref",
                              })
                            : m.reference_checking()}
                      </p>
                    )}
                  <ReferenceOutcomeView outcome={reference.outcome} />
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
      <InformationLinks
        language={locale}
        siteUrl={import.meta.env.VITE_SOURCE_TASTER_WEBSITE_URL}
      />
    </main>
  );
}
const rootRoute = createRootRoute({ component: Outlet });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Workspace,
});
const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute]) });
const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
