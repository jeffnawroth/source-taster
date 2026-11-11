import { MaintenanceNotice } from "./maintenance.tsx";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HistoryPanel } from "./history.tsx";
import { ContinuationTime } from "./abuse-message.tsx";
import type { AiStructuringResult as StructuringResult } from "@source-taster/contract-verification/ai";
import type { ReactNode } from "react";
import {
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Check } from "@source-taster/contract-verification/v2";
import {
  ApiError,
  CheckStreamError,
  verificationClient,
  watchCheckEvents,
  type VerificationClientOptions,
} from "@source-taster/contract-verification/client-v2";
import {
  documentClient,
  textStructuringClient,
  documentSettingsClient,
} from "@source-taster/contract-verification/document-client";
import type {
  ImportResult,
  LibraryInput,
} from "@source-taster/contract-verification/import";
import type { BibliographyDocument } from "@source-taster/contract-verification/document";
import { BibliographyEditor, validRegions } from "./bibliography-selection.tsx";
import { m } from "@source-taster/i18n";
import { GuestTokenError } from "@source-taster/contract-service/client";
import { setLocale } from "@source-taster/i18n/runtime";
import {
  Button,
  DropZone,
  FileTrigger,
  type Availability,
} from "./primitives/index.ts";
import {
  Label,
  Description,
  TextArea,
  TextFieldRoot,
} from "./primitives/fields.tsx";
import { CheckingTopBar } from "./checking-top-bar.tsx";
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
import { QuotaChoice, QuotaMeter, QuotaPending } from "./quota-panel.tsx";
import { ownerQuota, planStart, type OwnerQuota } from "./quota.ts";
function availability(disabled: boolean, reason: string): Availability {
  return disabled
    ? { isDisabled: true, disabledReason: reason }
    : { isDisabled: false };
}
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
export interface SelectionIntake {
  subscribe(
    receive: (selection: { text: string; possiblyShortened: boolean }) => void,
  ): () => void;
}
export function CheckWorkspace({
  initial,
  preferenceStorage,
  transport,
  siteUrl,
  accountControls,
  accountLabel,
  accountNotice,
  onPreferencesChange,
  controlledPreferences,
  selectionIntake,
  upgradeUrl,
  accountHistory = false,
  deferQuotaRead = false,
}: {
  accountHistory?: boolean;
  initial: { preferences: Preferences; citationStyleReset: boolean };
  preferenceStorage: PreferenceStorage;
  transport: VerificationClientOptions;
  siteUrl?: string;
  accountLabel?: string;
  accountNotice?: ReactNode;
  accountControls?: (
    language: "de" | "en",
    quota: OwnerQuota | null,
  ) => ReactNode;
  onPreferencesChange?: (
    patch: Partial<Pick<Preferences, "language" | "citationStyle">>,
  ) => void;
  controlledPreferences?: {
    preferences: Preferences;
    citationStyleReset: boolean;
  };
  selectionIntake?: SelectionIntake;
  /** Where the host sells Plans; without it the upgrade offer is text only. */
  upgradeUrl?: string;
  /**
   * Hosted only: skip the mount-time Quota read. The Quota slot stays neutral
   * (empty) and is read at the first Start, which stays fail-closed. For a
   * Guest view that follows a completed Account deletion, so that opening it
   * does not request a Guest token.
   */
  deferQuotaRead?: boolean;
}) {
  const api = useMemo(() => verificationClient(transport), [transport]);
  const structureText = useMemo(
    () => textStructuringClient(transport),
    [transport],
  );
  const [sourceDocument, setSourceDocument] =
    useState<BibliographyDocument | null>(null);
  const [selectionLimit, setSelectionLimit] = useState<number | null>(null);
  const uploadDocument = useMemo(() => documentClient(transport), [transport]);
  const documentSettings = useMemo(
    () => documentSettingsClient(transport),
    [transport],
  );
  const documentFileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentNotice, setDocumentNotice] = useState(false);
  const [localPreferences, updatePreferences] = useState(initial.preferences);
  const preferences = controlledPreferences?.preferences ?? localPreferences;
  const [localStyleReset, setStyleReset] = useState(initial.citationStyleReset);
  const styleReset =
    controlledPreferences?.citationStyleReset ?? localStyleReset;
  const locale = preferences.language;
  const [text, setText] = useState("");
  const [inputKind, setInputKind] = useState<"text" | "selection">("text");
  const [filesOpen, setFilesOpen] = useState(false);
  const languageInput = useRef<HTMLSelectElement>(null);
  const fileId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [library, setLibrary] = useState<LibraryInput | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<MessageKey | null>(null);
  const [selectionNotice, setSelectionNotice] = useState<
    "empty" | "shortened" | null
  >(null);
  const [selectionUndo, setSelectionUndo] = useState<{
    text: string;
    inputKind: "text" | "selection";
    library: LibraryInput | null;
    preview: StructuringResult | ImportResult | null;
    fileName: string;
    file: File | null;
    documentNotice: boolean;
    sourceDocument: BibliographyDocument | null;
    selectionLimit: number | null;
    fileError: MessageKey | null;
  } | null>(null);
  const receiveSelection = useEffectEvent(
    (selection: { text: string; possiblyShortened: boolean }) => {
      if (!selection.text) {
        setSelectionNotice("empty");
        return;
      }
      setSelectionNotice(selection.possiblyShortened ? "shortened" : null);
      setSelectionUndo({
        text,
        inputKind,
        library,
        preview,
        fileName,
        file,
        documentNotice,
        sourceDocument,
        selectionLimit,
        fileError,
      });
      // A selection is a new draft, not a new Check. Keep the existing Check,
      // its event stream and lease alive. Ignore only obsolete draft preparation.
      if (pending === "structure" || pending === "document") {
        generation.current++;
        controller.current?.abort();
        setPending(null);
      }
      setText(selection.text);
      setInputKind("selection");
      setSourceDocument(null);
      setSelectionLimit(null);
      setLibrary(null);
      setPreview(null);
      setFileName("");
      setFileError(null);
      setFile(null);
      setDocumentNotice(false);
      setRequestError(null);
      if (fileInput.current) fileInput.current.value = "";
      if (documentFileInput.current) documentFileInput.current.value = "";
    },
  );
  useEffect(
    () => selectionIntake?.subscribe(receiveSelection),
    [selectionIntake],
  );
  const [check, setCheck] = useState<Check | null>(null);
  const [accessStopped, setAccessStopped] = useState(false);
  const [streamFailure, setStreamFailure] = useState<unknown>(null);
  const [connection, setConnection] = useState<
    "connecting" | "connected" | "reconnecting"
  >("connecting");
  const [reconnecting, setReconnecting] = useState(false);
  const [streamError, setStreamError] = useState<MessageKey | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [pending, setPending] = useState<
    "create" | "structure" | "document" | null
  >(null);
  const [preview, setPreview] = useState<
    StructuringResult | ImportResult | null
  >(null);
  const [requestError, setRequestError] = useState<unknown>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [cleanupPending, setCleanupPending] = useState(false);
  // Hosted clients carry credentials; only they have an Owner Quota to show.
  const hostedQuota = transport.credentials !== undefined;
  const [quota, setQuota] = useState<OwnerQuota | null>(null);
  const [quotaState, setQuotaState] = useState<
    "loading" | "ready" | "unavailable"
  >(hostedQuota && !deferQuotaRead ? "loading" : "ready");
  const lastQuota = useRef<OwnerQuota | null>(null);
  const [quotaChoice, setQuotaChoice] = useState<{
    required: number;
    available: number;
    input: Parameters<typeof api.createCheck>[0];
  } | null>(null);
  const [quotaNote, setQuotaNote] = useState<{
    required: number;
    remaining: number;
    after: number;
    skipped: number;
  } | null>(null);
  /** Reads the acting identity's balance; throws when the read fails. */
  async function readQuota() {
    try {
      const next = ownerQuota(await api.getQuota());
      lastQuota.current = next;
      setQuota(next);
      setQuotaState("ready");
      return next;
    } catch (error) {
      // Never invent a balance: without a last real one, say it is unavailable.
      if (!lastQuota.current && hostedQuota) setQuotaState("unavailable");
      throw error;
    }
  }
  async function refreshQuota() {
    try {
      return await readQuota();
    } catch {
      // Display only: keeps the last real balance; the server still enforces
      // Quota on every start.
      return lastQuota.current;
    }
  }
  // #99: Quota is visible before the first start. The host mounts this
  // workspace only once the identity is settled (Account, or Guest after the
  // session answered "none"), so this read never mints a Guest while an
  // Account session is pending or failed; the transport refuses that itself.
  useEffect(() => {
    if (!hostedQuota || deferQuotaRead) return;
    let live = true;
    api.getQuota().then(
      (response) => {
        if (!live) return;
        const next = ownerQuota(response);
        lastQuota.current = next;
        setQuota(next);
        setQuotaState("ready");
      },
      () => {
        // Never invent a balance: without a real one, say it is unavailable.
        if (live && !lastQuota.current) setQuotaState("unavailable");
      },
    );
    return () => {
      live = false;
    };
  }, [api, hostedQuota, deferQuotaRead]);
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
            setStreamFailure(error);
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
  async function loadLibrary(file: File) {
    setSelectionUndo(null);
    const token = ++generation.current;
    controller.current?.abort();
    setCheck(null);
    setPreview(null);
    setLibrary(null);
    setText("");
    setRequestError(null);
    setStreamError(null);
    setFileError(null);
    setFileName(file.name);
    setFile(null);
    setDocumentNotice(false);
    setSourceDocument(null);
    setSelectionLimit(null);
    if (documentFileInput.current) documentFileInput.current.value = "";
    const format = /\.(bib|bibtex)$/iu.test(file.name)
      ? "bibtex"
      : /\.ris$/iu.test(file.name)
        ? "ris"
        : null;
    if (!format || file.size > 20 * 1024 * 1024) {
      setFileError(format ? "problem_library_size" : "problem_library_format");
      return;
    }
    setPending("structure");
    try {
      const bytes = await file.arrayBuffer();
      const input: LibraryInput = {
        format,
        text: new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
          bytes,
        ),
      };
      const result = await api.importLibrary(input);
      if (generation.current !== token) return;
      setLibrary(input);
      setPreview(result);
    } catch (error) {
      if (generation.current !== token) return;
      if (error instanceof TypeError) setFileError("problem_library_encoding");
      else setRequestError(error);
    } finally {
      if (generation.current === token) setPending(null);
    }
  }
  async function start(operation: "create" | "structure") {
    setSelectionUndo(null);
    const token = ++generation.current;
    controller.current?.abort();
    const structuringController = new AbortController();
    controller.current = structuringController;
    setCheck(null);
    if (!library) setPreview(null);
    setStreamError(null);
    setRequestError(null);
    setPending(operation);
    setAccessStopped(false);
    setCancelRequested(false);
    setQuotaChoice(null);
    setQuotaNote(null);
    let selection: BibliographyDocument | null = null;
    let previewCount: number | null = null;
    let extraction: Parameters<typeof api.createCheck>[0] | null = null;
    try {
      if (library) {
        if (operation === "structure") {
          const result = await api.importLibrary(library);
          if (generation.current === token) setPreview(result);
          return;
        }
      } else {
        // Only the Bibliography selection of a document is structured and checked.
        const result = await structureText(
          sourceDocument
            ? {
                text: sourceDocument.text,
                document: true,
                regions: sourceDocument.selection.regions,
              }
            : { text },
          structuringController.signal,
        );
        if (generation.current !== token) return;
        setSourceDocument(result.document);
        setPreview(result.structuring);
        setSelectionLimit(
          result.referenceLimitExceeded
            ? result.structuring.referenceLimit
            : null,
        );
        if (
          operation === "structure" ||
          result.referenceLimitExceeded ||
          !result.structuring.references.length
        )
          return;
        selection = result.document;
        previewCount = result.structuring.references.length;
        if (result.structuring.receipt)
          extraction = {
            extraction: {
              text: result.document?.text ?? text,
              ...(result.document
                ? { regions: result.document.selection.regions }
                : {}),
              result: result.structuring,
            },
          };
      }
      const input: Parameters<typeof api.createCheck>[0] =
        extraction ??
        (library
          ? { library }
          : selection
            ? {
                document: {
                  text: selection.text,
                  regions: selection.selection.regions,
                },
              }
            : text);
      const required = library
        ? (preview?.references.length ?? 0)
        : (previewCount ?? 0);
      // Count and expected consumption come before the automatic start. A
      // hosted start needs a real balance: a failed read stops it (fail closed).
      const plan = planStart(
        required,
        hostedQuota ? await readQuota() : await refreshQuota(),
      );
      if (generation.current !== token) return;
      if (plan.kind === "partial") {
        setQuotaChoice({
          required: plan.required,
          available: plan.available,
          input,
        });
        return;
      }
      if (plan.kind === "fits")
        setQuotaNote({
          required: plan.required,
          remaining: plan.remainingAfter + plan.required,
          after: plan.remainingAfter,
          skipped: 0,
        });
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      if (generation.current !== token) return;
      await launch(input, token, undefined, {
        required: plan.kind === "fits" ? plan.required : null,
        after: plan.kind === "fits" ? plan.remainingAfter : null,
        skipped: 0,
      });
    } catch (error) {
      if (generation.current === token) setRequestError(error);
    } finally {
      if (generation.current === token) setPending(null);
    }
  }
  /** Creates the Check; `max` limits the start to the first N References in input order. */
  async function launch(
    input: Parameters<typeof api.createCheck>[0],
    token: number,
    max?: number,
    note?: { required: number | null; after: number | null; skipped: number },
  ) {
    try {
      const created = await api.createCheck(
        input,
        max === undefined ? {} : { maxReferences: max },
      );
      if (generation.current !== token) {
        void cancelDetached(created.id);
        return;
      }
      setQuotaChoice(null);
      setQuotaNote(
        note && note.required !== null && note.after !== null
          ? {
              required: note.required,
              remaining: note.after + note.required,
              after: note.after,
              skipped: note.skipped,
            }
          : null,
      );
      void refreshQuota();
      follow(created);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.problem?.code === "quota-insufficient" &&
        error.problem.available !== undefined &&
        error.problem.required !== undefined
      ) {
        // The balance changed since the preview: offer the choice again.
        if (generation.current === token) {
          setQuotaChoice({
            required: error.problem.required,
            available: error.problem.available,
            input,
          });
          void refreshQuota();
        }
        return;
      }
      throw error;
    }
  }
  async function startFirst() {
    if (!quotaChoice) return;
    const { input, available, required } = quotaChoice;
    setSelectionUndo(null);
    const token = ++generation.current;
    controller.current?.abort();
    setCheck(null);
    setStreamError(null);
    setRequestError(null);
    setPending("create");
    setAccessStopped(false);
    setCancelRequested(false);
    try {
      await launch(input, token, available, {
        required: available,
        after: 0,
        skipped: required - available,
      });
    } catch (error) {
      if (generation.current === token) setRequestError(error);
    } finally {
      if (generation.current === token) setPending(null);
    }
  }
  async function upload() {
    if (!file) return;
    setSelectionUndo(null);
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
    setLibrary(null);
    setFileName("");
    setFileError(null);
    if (fileInput.current) fileInput.current.value = "";
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
      setSourceDocument({
        text: result.document.text,
        selection: result.selection,
      });
      setSelectionLimit(
        result.referenceLimitExceeded
          ? result.structuring.referenceLimit
          : null,
      );
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
    let connected = false;
    void watchCheckEvents(created.id, {
      ...transport,
      fetch: async (input, init) => {
        const live = () => generation.current === token && !next.signal.aborted;
        if (live()) setConnection(connected ? "reconnecting" : "connecting");
        try {
          const response = await (transport.fetch ?? globalThis.fetch)(
            input,
            init,
          );
          connected = true;
          if (live() && response.ok) setConnection("connected");
          return response;
        } catch (error) {
          if (live()) setConnection("reconnecting");
          throw error;
        }
      },
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
                  ],
          };
        });
      },
    }).catch((error) => {
      if (generation.current === token && !next.signal.aborted) {
        setAccessStopped(true);
        setStreamFailure(error);
        setStreamError(problemKey(error, "problem_connection"));
      }
    });
  }
  async function reconnect() {
    if (!check || reconnecting) return;
    const token = generation.current;
    const id = check.id;
    setReconnecting(true);
    try {
      const snapshot = await api.getCheck(id);
      if (generation.current !== token) return;
      setStreamError(null);
      setStreamFailure(null);
      follow(snapshot);
    } catch (error) {
      if (generation.current === token) {
        setStreamFailure(error);
        setStreamError(problemKey(error, "problem_connection"));
      }
    } finally {
      if (generation.current === token) setReconnecting(false);
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
    if (
      check?.references.some(
        (r) => r.outcome.kind === "status" && r.outcome.status === "running",
      )
    )
      void cancelDetached(check.id);
    setText("");
    setInputKind("text");
    setSelectionUndo(null);
    setSelectionNotice(null);
    setFile(null);
    if (documentFileInput.current) documentFileInput.current.value = "";
    setDocumentNotice(false);
    setLibrary(null);
    setFileName("");
    setFileError(null);
    if (fileInput.current) fileInput.current.value = "";
    setSourceDocument(null);
    setSelectionLimit(null);
    setCheck(null);
    setPreview(null);
    setPending(null);
    setQuotaChoice(null);
    setQuotaNote(null);
    setRequestError(null);
    setStreamError(null);
    setCancelling(false);
    setReconnecting(false);
    setCancelRequested(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  const workspaceGeneration = generation.current;
  const running = check?.references.some(
    (r) => r.outcome.kind === "status" && r.outcome.status === "running",
  );
  const busy = pending !== null || running;
  // Debits settle shortly after the last Verdict; look again a few times.
  const checkId = check?.id;
  useEffect(() => {
    if (!checkId || running) return;
    const timers = [0, 1500, 4000].map((delay) =>
      setTimeout(() => void refreshQuota(), delay),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkId, running]);
  const selectionBlocked =
    !!sourceDocument &&
    (!!check ||
      !sourceDocument.selection.regions.length ||
      !validRegions(sourceDocument.text, sourceDocument.selection.regions));
  const errorKey =
    fileError ??
    streamError ??
    (requestError ? problemKey(requestError, "problem_connection") : null);
  const completed =
    check?.references.filter(
      (reference) =>
        reference.outcome.kind === "verdict" ||
        reference.outcome.status !== "running",
    ).length ?? 0;
  function changePreferences(
    patch: Partial<Pick<Preferences, "language" | "citationStyle">>,
  ) {
    const next = { ...preferences, ...patch };
    void setLocale(next.language, { reload: false });
    updatePreferences(next);
    if (onPreferencesChange) onPreferencesChange(patch);
    else void saveGuestPreferences(preferenceStorage, next);
    if (patch.citationStyle) setStyleReset(false);
  }
  return (
    <main className="check-workspace mx-auto max-w-7xl px-6 py-10 sm:py-16">
      <MaintenanceNotice baseUrl={transport.baseUrl} language={locale} />
      <CheckingTopBar
        documentName={file?.name ?? (fileName || undefined)}
        account={accountControls?.(locale, quota)}
        accountLabel={accountLabel}
        onInput={() => inputRef.current?.focus()}
        onReset={reset}
        onPreferences={() => languageInput.current?.focus()}
        onStop={
          running
            ? () => {
                void cancel();
              }
            : undefined
        }
        history={
          accountHistory
            ? (close) => (
                <HistoryPanel
                  api={api}
                  busy={!!busy || !!quotaChoice}
                  refreshKey={`${check?.id ?? ""}:${!!running}`}
                  upgradeUrl={upgradeUrl}
                  onCheck={(snapshot) => {
                    reset();
                    follow(snapshot);
                    void refreshQuota();
                    close();
                  }}
                  onDelete={(id) => {
                    if (!id || check?.id === id) reset();
                  }}
                />
              )
            : undefined
        }
      />
      {accountNotice}
      <div className="workspace-preferences">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {m.language_label()}
          <select
            className="rounded-lg border border-border-emphasis bg-surface p-2"
            ref={languageInput}
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
            className="rounded-lg border border-border-emphasis bg-surface p-2"
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
      </div>
      {quota ? (
        <QuotaMeter quota={quota} upgradeUrl={upgradeUrl} />
      ) : (
        quotaState !== "ready" && <QuotaPending state={quotaState} />
      )}
      {styleReset && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-border-emphasis bg-surface-sunken p-4 text-text"
        >
          {m.citation_style_reset()}
        </p>
      )}
      <form
        className="rounded-2xl border border-border-emphasis bg-surface p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if ((text.trim() || (library && preview?.references.length)) && !busy)
            void start("create");
        }}
      >
        <div className="intake-command">
          {!sourceDocument && (
            <TextFieldRoot
              value={text}
              onChange={(value) => {
                setText(value);
                setInputKind("text");
                setSelectionUndo(null);
                setLibrary(null);
                setFileName("");
                setFileError(null);
                if (fileInput.current) fileInput.current.value = "";
                setPreview(null);
                setDocumentNotice(false);
              }}
              isDisabled={!!busy}
              className="intake-text"
            >
              <Label>{m.input_label()}</Label>
              <Description>
                {m.input_hint()}
                {busy && ` · ${m.shell_busy()}`}
              </Description>
              <TextArea
                ref={inputRef}
                placeholder={m.input_example()}
                className="intake-textarea"
                rows={2}
              />
            </TextFieldRoot>
          )}
          <DropZone
            aria-label={m.shell_drop()}
            isDisabled={!!busy}
            onDrop={(event) => {
              const token = generation.current;
              void (async () => {
                const item = event.items.find((item) => item.kind === "file");
                if (item?.kind === "file") {
                  const dropped = await item.getFile();
                  if (generation.current !== token) return;
                  setFilesOpen(true);
                  if (/\.(bib|bibtex|ris)$/iu.test(dropped.name))
                    void loadLibrary(dropped);
                  else {
                    setFile(dropped);
                    setRequestError(null);
                  }
                }
              })().catch((error: unknown) => {
                if (generation.current === token) setRequestError(error);
              });
            }}
          >
            <p>{m.shell_drop()}</p>
            <FileTrigger
              acceptedFileTypes={[".pdf", ".docx", ".bib", ".bibtex", ".ris"]}
              onSelect={(files) => {
                const selected = files?.[0];
                if (!selected) return;
                setFilesOpen(true);
                if (/\.(bib|bibtex|ris)$/iu.test(selected.name))
                  void loadLibrary(selected);
                else {
                  setFile(selected);
                  setRequestError(null);
                }
              }}
            >
              <Button
                type="button"
                variant="ghost"
                {...availability(!!busy, m.shell_busy())}
              >
                {m.shell_choose_file()}
              </Button>
            </FileTrigger>
          </DropZone>
        </div>
        {(text.trim() || fileName || file) && (
          <p className="intake-source">
            {fileName || file
              ? m.shell_file_source({ name: fileName || file!.name })
              : inputKind === "selection"
                ? m.shell_selection_source()
                : m.shell_text_source()}
          </p>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={filesOpen}
          aria-controls="intake-files"
          onPress={() => setFilesOpen(!filesOpen)}
        >
          {m.shell_files()}
        </Button>
        <div id="intake-files" hidden={!filesOpen}>
          <fieldset
            className="mb-6 flex min-w-0 flex-col gap-3"
            disabled={busy}
          >
            <label htmlFor="document-file" className="text-lg font-semibold">
              {m.document_upload_label()}
            </label>
            <p id="document-hint" className="text-sm text-text-secondary">
              {m.document_upload_hint()}
            </p>
            <input
              ref={documentFileInput}
              id="document-file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              aria-describedby="document-hint"
              onChange={(event) => {
                setFilesOpen(true);
                setFile(event.target.files?.[0] ?? null);
                setRequestError(null);
              }}
              className="max-w-full rounded-lg border border-border-emphasis p-3"
            />
            <Button
              type="button"
              variant="secondary"
              {...availability(
                !file || !!busy,
                busy ? m.shell_busy() : m.shell_empty_input(),
              )}
              onPress={() => {
                void upload();
              }}
              className="mt-3"
            >
              {pending === "document"
                ? m.document_upload_pending()
                : m.document_upload_action()}
            </Button>
          </fieldset>
          <label htmlFor={fileId} className="mb-2 block font-semibold">
            {m.library_import_label()}
          </label>
          <p id={`${fileId}-hint`} className="mb-2 text-sm">
            {m.library_import_hint()}
          </p>
          <input
            ref={fileInput}
            id={fileId}
            type="file"
            accept=".bib,.bibtex,.ris"
            disabled={busy}
            aria-describedby={`${fileId}-hint`}
            className="mb-5 block max-w-full"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setFilesOpen(true);
                void loadLibrary(file);
              }
            }}
          />
          {fileName && (
            <p className="mb-4">{m.library_selected({ name: fileName })}</p>
          )}
        </div>
        {sourceDocument && (
          <BibliographyEditor
            document={sourceDocument}
            disabled={!!busy || !!check}
            onChange={(regions) => {
              setSelectionUndo(null);
              setSourceDocument({
                ...sourceDocument,
                selection: { ...sourceDocument.selection, regions },
              });
              setPreview(null);
              setSelectionLimit(null);
            }}
          />
        )}
        {selectionLimit && (
          <p role="alert">{m.selection_limit({ limit: selectionLimit })}</p>
        )}
        {selectionIntake && (
          <p className="mt-3 text-sm text-text-secondary">
            {m.selection_intake_help()}
          </p>
        )}
        {selectionNotice && (
          <p
            role="status"
            className="mt-3 rounded-xl border border-border-emphasis bg-surface-sunken p-4"
          >
            {selectionNotice === "empty"
              ? m.selection_empty()
              : m.selection_shortened()}
          </p>
        )}
        {selectionUndo !== null && (
          <Button
            type="button"
            onPress={() => {
              setSelectionNotice(null);
              setText(selectionUndo.text);
              setInputKind(selectionUndo.inputKind);
              setSourceDocument(selectionUndo.sourceDocument);
              setSelectionLimit(selectionUndo.selectionLimit);
              setLibrary(selectionUndo.library);
              setPreview(selectionUndo.preview);
              setFileName(selectionUndo.fileName);
              setFile(selectionUndo.file);
              if (documentFileInput.current && selectionUndo.file) {
                const restored = new DataTransfer();
                restored.items.add(selectionUndo.file);
                documentFileInput.current.files = restored.files;
              }
              setFileError(selectionUndo.fileError);
              setDocumentNotice(selectionUndo.documentNotice);
              setSelectionUndo(null);
            }}
            className="mt-3 rounded-xl border border-border-emphasis px-5 py-3 font-semibold"
          >
            {m.selection_undo()}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          {...availability(
            (!text.trim() && !library) || !!busy || selectionBlocked,
            busy
              ? m.shell_busy()
              : selectionBlocked
                ? m.shell_selection_blocked()
                : m.shell_empty_input(),
          )}
          onPress={() => {
            void start("structure");
          }}
          className="mt-3"
        >
          {pending === "structure"
            ? m.structuring_pending()
            : m.structuring_action()}
        </Button>
        <Button
          type="submit"
          variant="primary"
          {...availability(
            (!text.trim() && !(library && preview?.references.length)) ||
              !!busy ||
              selectionBlocked,
            busy
              ? m.shell_busy()
              : selectionBlocked
                ? m.shell_selection_blocked()
                : m.shell_empty_input(),
          )}
          className="mt-3"
        >
          {pending === "create" ? m.check_starting() : m.check_action()}
        </Button>
        <Button
          type="button"
          onPress={reset}
          className="mt-5 ml-3 rounded-xl border border-border-emphasis px-5 py-3 font-semibold"
        >
          {m.check_reset()}
        </Button>
      </form>
      <p className="mb-8 rounded-xl border border-border-emphasis bg-surface-sunken p-4 text-text">
        {m.skeleton_notice()}
      </p>
      {quotaChoice && (
        <QuotaChoice
          required={quotaChoice.required}
          available={quotaChoice.available}
          upgradeUrl={upgradeUrl}
          onFirst={() => void startFirst()}
          onDismiss={() => setQuotaChoice(null)}
        />
      )}
      {quotaNote && (
        <p
          role="status"
          data-testid="quota-note"
          className="mt-6 rounded-xl border border-border-emphasis bg-surface p-4"
        >
          {quotaNote.skipped > 0
            ? m.quota_started({
                started: String(quotaNote.required),
                required: String(quotaNote.required + quotaNote.skipped),
                skipped: String(quotaNote.skipped),
              })
            : m.quota_preview_fits({
                required: String(quotaNote.required),
                remaining: String(quotaNote.remaining),
                after: String(quotaNote.after),
              })}
        </p>
      )}
      {cleanupPending && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-border-emphasis bg-surface-sunken p-4 text-text"
        >
          {m.check_cleanup_pending()}
        </p>
      )}
      {errorKey && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-border-emphasis bg-surface-sunken p-4 text-text"
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
          <ContinuationTime
            error={streamError ? streamFailure : requestError}
          />
        </p>
      )}
      {streamError && check && (
        <Button
          onPress={() => {
            void reconnect();
          }}
          {...availability(reconnecting, m.shell_reconnecting())}
        >
          {reconnecting ? m.shell_reconnecting() : m.shell_reconnect()}
        </Button>
      )}
      {documentNotice && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-border-emphasis bg-surface-sunken p-4"
        >
          {m.document_partial_no_text()}
        </p>
      )}
      {preview && (
        <StructuringResults
          result={preview}
          inputText={sourceDocument?.text ?? text}
          upgradeUrl={upgradeUrl}
        />
      )}
      {check && (
        <section aria-labelledby="results-title" className="mt-10">
          <h2 id="results-title" className="mb-4 text-2xl font-semibold">
            {m.results_heading()}
          </h2>
          <div
            role="status"
            aria-labelledby="results-title"
            aria-live="off"
            aria-atomic="true"
            className="check-status rounded-2xl border border-border-emphasis bg-surface p-6"
          >
            <div>
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
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {m.check_progress({
                completed: String(
                  completed === check.references.length
                    ? completed
                    : Math.floor(completed / 3) * 3,
                ),
                total: String(check.references.length),
              })}
            </p>
            {running && !accessStopped && (
              <p role="status">
                {connection === "connected"
                  ? m.shell_connected()
                  : connection === "reconnecting"
                    ? m.shell_reconnecting()
                    : m.shell_connecting()}
              </p>
            )}
            {check.endReason === "lease-expired" && (
              <p>{m.check_lease_expired()}</p>
            )}
            {running && (
              <Button
                type="button"
                {...availability(cancelling, m.check_cancelling())}
                onPress={() => {
                  void cancel();
                }}
                className="mb-4 rounded-xl border border-border-emphasis px-5 py-3 font-semibold"
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
              quota={quota}
              upgradeUrl={upgradeUrl}
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
