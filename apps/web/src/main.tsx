// SPDX-License-Identifier: AGPL-3.0-or-later
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import {
  CheckResponse,
  ProblemDetails,
  type Check,
  type ReferenceStatus,
} from "@source-taster/contract-verification";
import {
  CheckStreamError,
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
import "./style.css";

type MessageKey = keyof typeof m;
const preferenceStorage = webPreferenceStorage();
const initial = await loadGuestPreferences(
  preferenceStorage,
  navigator.languages,
);
void setLocale(initial.preferences.language, { reload: false });
const styleMessages: Record<CitationStyle, MessageKey> = {
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
};

class ApiProblem extends Error {
  readonly key: MessageKey;
  constructor(key: MessageKey) {
    super(key);
    this.key = key;
  }
}
async function startCheck(text: string) {
  const response = await fetch("/v1/checks", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Source-Taster-Client": "web/0.0.0",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const problem = ProblemDetails.safeParse(await response.json());
    const key = problem.data?.i18nKey;
    throw new ApiProblem(
      key && key in m ? (key as MessageKey) : "problem_internal",
    );
  }
  return CheckResponse.parse(await response.json()).data;
}
const statusMessage: Record<ReferenceStatus, MessageKey> = {
  running: "status_running",
  "not-checked": "status_not_checked",
  failed: "status_failed",
  cancelled: "status_cancelled",
};

function Workspace() {
  const [preferences, updatePreferences] = useState(initial.preferences);
  const [styleReset, setStyleReset] = useState(initial.citationStyleReset);
  const locale = preferences.language;
  const [text, setText] = useState("");
  const [check, setCheck] = useState<Check | null>(null);
  const [streamError, setStreamError] = useState<MessageKey | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = m.app_title();
  }, [locale]);
  const create = useMutation({
    mutationFn: startCheck,
    onSuccess: (created) => {
      controller.current?.abort();
      const next = new AbortController();
      controller.current = next;
      setCheck(created);
      setStreamError(null);
      void watchCheckEvents(created.id, {
        signal: next.signal,
        lastEventSeq: created.lastEventSeq,
        onEvent: (event) => {
          setCheck((current) => {
            if (!current || current.id !== event.checkId) return current;
            if (event.type === "check.updated")
              return {
                ...current,
                state: event.state,
                lastEventSeq: event.seq,
              };
            return {
              ...current,
              lastEventSeq: event.seq,
              references: current.references.map((reference) =>
                reference.slot === event.reference.slot
                  ? { ...reference, outcome: event.reference.outcome }
                  : reference,
              ),
            };
          });
        },
      }).catch((error) => {
        if (next.signal.aborted) return;
        const key =
          error instanceof CheckStreamError
            ? error.problem?.i18nKey
            : undefined;
        setStreamError(
          key && key in m ? (key as MessageKey) : "problem_connection",
        );
      });
    },
  });
  const busy = create.isPending || check?.state === "running";
  const errorKey =
    streamError ??
    (create.error
      ? create.error instanceof ApiProblem
        ? create.error.key
        : "problem_connection"
      : null);
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
          if (text.trim() && !busy) create.mutate(text);
        }}
      >
        <TextField
          value={text}
          onChange={setText}
          isDisabled={busy}
          className="flex flex-col gap-3"
        >
          <Label className="text-lg font-semibold">{m.input_label()}</Label>
          <Text slot="description" className="text-sm text-slate-600">
            {m.input_hint()}
          </Text>
          <TextArea
            className="min-h-40 resize-y rounded-xl border border-slate-500 p-4 leading-relaxed placeholder:text-slate-500 disabled:bg-slate-100"
            placeholder={m.input_example()}
          />
        </TextField>
        <Button
          type="submit"
          isDisabled={!text.trim() || busy}
          className="mt-5 rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-600"
        >
          {create.isPending ? m.check_starting() : m.check_action()}
        </Button>
      </form>
      {errorKey && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-400 bg-red-50 p-4 text-red-900"
        >
          {m[errorKey]()}
        </p>
      )}
      {check && (
        <section aria-labelledby="results-title" className="mt-10">
          <h2 id="results-title" className="mb-4 text-2xl font-semibold">
            {m.results_heading()}
          </h2>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="rounded-2xl border border-slate-300 bg-white p-6"
          >
            <p className="mb-4 font-semibold">
              {check.state === "running" ? m.check_running() : m.check_ended()}
            </p>
            <ol className="space-y-4">
              {check.references.map((reference) => (
                <li
                  key={reference.slot}
                  className="rounded-xl bg-slate-100 p-4"
                >
                  <p className="break-words">{reference.originalText}</p>
                  <p className="mt-2 font-semibold text-teal-900">
                    {m[statusMessage[reference.outcome.status]]()}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
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
