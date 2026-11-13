import { MaintenanceNotice } from "./maintenance.tsx";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HistoryPanel } from "./history.tsx";
import { ContinuationTime } from "./abuse-message.tsx";
import type { AiStructuringResult as StructuringResult } from "@source-taster/contract-verification/ai";
import type { ReactNode } from "react";
import {
  useDeferredValue,
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
import * as Aria from "react-aria-components";
import {
  Check as CheckIcon,
  FileText,
  Info,
  List,
  PanelRight,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  Banner,
  Button,
  Dialog,
  DialogHeading,
  DropZone,
  FileTrigger,
  IconButton,
  Kbd,
  Modal,
  type Availability,
} from "./primitives/index.ts";
import {
  Label,
  Description,
  TextArea,
  TextFieldRoot,
} from "./primitives/fields.tsx";
import { CheckingTopBar } from "./checking-top-bar.tsx";
import { recognizedCount } from "./recognized-count.ts";
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
import { CheckResults, type IntakeSource } from "./check-results.tsx";
import { QuotaChoice, QuotaMeter, QuotaPending } from "./quota-panel.tsx";
import { ownerQuota, planStart, type OwnerQuota } from "./quota.ts";
const apple =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/u.test(navigator.platform);
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
  brandMark,
}: {
  /** The host's brand mark URL for the top bar; the hosts ship it already. */
  brandMark?: string;
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
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Only an explicit structuring or library import opens the preview dialog.
  const structureRequested = useRef(false);
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
  // Standalone structures with the same deterministic parser, so the intake
  // can count locally. Hosted may structure with AI and shows no count (#229).
  const deferredText = useDeferredValue(text);
  const recognized = useMemo(
    () => (hostedQuota ? null : recognizedCount(deferredText)),
    [hostedQuota, deferredText],
  );
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
  // A requested Structuring opens its preview dialog; any other preview stays closed.
  function showPreview(result: typeof preview) {
    setPreview(result);
    setPreviewOpen(!!result && structureRequested.current);
    structureRequested.current = false;
  }
  async function loadLibrary(file: File) {
    structureRequested.current = true;
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
      showPreview(result);
    } catch (error) {
      if (generation.current !== token) return;
      if (error instanceof TypeError) setFileError("problem_library_encoding");
      else setRequestError(error);
    } finally {
      if (generation.current === token) setPending(null);
    }
  }
  async function start(operation: "create" | "structure") {
    if (operation === "create") structureRequested.current = false;
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
          if (generation.current === token) showPreview(result);
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
        showPreview(result.structuring);
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
      showPreview(result.structuring);
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
  const intakeSource: IntakeSource =
    file || fileName || sourceDocument
      ? "file"
      : inputKind === "selection"
        ? "selection"
        : "text";
  const sourceLabel =
    file?.name ??
    (fileName ||
      (inputKind === "selection"
        ? m.shell_selection_source()
        : m.shell_text_source()));
  const canCheck =
    (!!text.trim() || !!(library && preview?.references.length)) &&
    !busy &&
    !selectionBlocked;
  const checkReason = busy
    ? m.shell_busy()
    : selectionBlocked
      ? m.shell_selection_blocked()
      : m.shell_empty_input();
  const notices = (
    <>
      {styleReset && <Banner>{m.citation_style_reset()}</Banner>}
      {check && inputKind === "selection" && text && (
        <Banner>{m.shell_selection_after_check()}</Banner>
      )}
      {selectionNotice && (
        <Banner tone="warning">
          {selectionNotice === "empty"
            ? m.selection_empty()
            : m.selection_shortened()}
        </Banner>
      )}
      {selectionLimit && (
        <Banner tone="danger">
          {m.selection_limit({ limit: selectionLimit })}
        </Banner>
      )}
      {quotaChoice && (
        <QuotaChoice
          required={quotaChoice.required}
          available={quotaChoice.available}
          upgradeUrl={upgradeUrl}
          onFirst={() => void startFirst()}
          onDismiss={() => setQuotaChoice(null)}
        />
      )}
      {/* Standalone has no Owner Quota: no Quota line, note or upgrade. */}
      {hostedQuota && quotaNote && (
        <Banner data-testid="quota-note">
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
        </Banner>
      )}
      {cleanupPending && (
        <Banner tone="danger">{m.check_cleanup_pending()}</Banner>
      )}
      {errorKey && (
        <Banner
          tone="danger"
          action={
            streamError && check ? (
              <Button
                size="sm"
                onPress={() => {
                  void reconnect();
                }}
                {...availability(reconnecting, m.shell_reconnecting())}
              >
                {reconnecting ? m.shell_reconnecting() : m.shell_reconnect()}
              </Button>
            ) : undefined
          }
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
        </Banner>
      )}
      {documentNotice && (
        <Banner tone="warning">{m.document_partial_no_text()}</Banner>
      )}
      {check?.endReason === "lease-expired" && (
        <Banner tone="warning">{m.check_lease_expired()}</Banner>
      )}
    </>
  );
  const notes = (
    <div className="workspace-notes">
      <p className="note-row">
        <Info aria-hidden="true" size={16} />
        <span>{m.skeleton_notice()}</span>
      </p>
      {hostedQuota &&
        (quota ? (
          <QuotaMeter quota={quota} upgradeUrl={upgradeUrl} />
        ) : (
          quotaState !== "ready" && <QuotaPending state={quotaState} />
        ))}
    </div>
  );
  const fileInputs = (
    <div
      id="intake-files"
      className="intake-files"
      hidden={intakeSource !== "file" && !filesOpen}
    >
      <DropZone
        aria-label={m.shell_drop()}
        isDisabled={!!busy}
        className="intake-drop"
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
        <Upload aria-hidden="true" size={20} />
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
            size="sm"
            {...availability(!!busy, m.shell_busy())}
          >
            {m.shell_choose_file()}
          </Button>
        </FileTrigger>
      </DropZone>
      <fieldset className="intake-file-fields" disabled={busy}>
        <label htmlFor="document-file" className="intake-file-label">
          {m.document_upload_label()}
        </label>
        <p id="document-hint" className="intake-hint">
          {m.document_upload_hint()}
        </p>
        <div className="intake-file-row">
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
            className="intake-file-input"
          />
          <Button
            type="button"
            size="sm"
            {...availability(
              !file || !!busy,
              busy ? m.shell_busy() : m.shell_empty_input(),
            )}
            onPress={() => {
              void upload();
            }}
          >
            {pending === "document"
              ? m.document_upload_pending()
              : m.document_upload_action()}
          </Button>
        </div>
      </fieldset>
      <div className="intake-file-fields">
        <label htmlFor={fileId} className="intake-file-label">
          {m.library_import_label()}
        </label>
        <p id={`${fileId}-hint`} className="intake-hint">
          {m.library_import_hint()}
        </p>
        <input
          ref={fileInput}
          id={fileId}
          type="file"
          accept=".bib,.bibtex,.ris"
          disabled={busy}
          aria-describedby={`${fileId}-hint`}
          className="intake-file-input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              setFilesOpen(true);
              void loadLibrary(file);
            }
          }}
        />
        {fileName && <p>{m.library_selected({ name: fileName })}</p>}
      </div>
    </div>
  );
  function clearFile() {
    setFile(null);
    setFileName("");
    setLibrary(null);
    setPreview(null);
    setFileError(null);
    setDocumentNotice(false);
    setSourceDocument(null);
    setSelectionLimit(null);
    if (fileInput.current) fileInput.current.value = "";
    if (documentFileInput.current) documentFileInput.current.value = "";
  }
  return (
    <main className="check-workspace" data-stage={check ? "check" : "intake"}>
      <MaintenanceNotice baseUrl={transport.baseUrl} language={locale} />
      <CheckingTopBar
        brandMark={brandMark}
        documentName={file?.name ?? (fileName || undefined)}
        account={accountControls?.(locale, quota)}
        accountLabel={accountLabel}
        onInput={() => inputRef.current?.focus()}
        onReset={reset}
        onPreferences={() => setPreferencesOpen(true)}
        commands={[
          // Structuring is offered only while it can run: its unavailability
          // is the Check's reason, which the intake already states once.
          ...(!check &&
          (!!text.trim() || !!library) &&
          !selectionBlocked &&
          !busy
            ? [
                {
                  id: "structure",
                  label: m.structuring_action(),
                  onAction: () => {
                    structureRequested.current = true;
                    void start("structure");
                  },
                },
              ]
            : []),
          ...(!check && preview && !previewOpen
            ? [
                {
                  id: "structuring-preview",
                  label: m.shell_structuring_preview(),
                  onAction: () => setPreviewOpen(true),
                },
              ]
            : []),
        ]}
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
      <Modal isOpen={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <Dialog className="workspace-dialog">
          {({ close }) => (
            <>
              <DialogHeading>{m.shell_preferences()}</DialogHeading>
              <div className="workspace-preferences">
                <label className="workspace-select">
                  {m.language_label()}
                  <select
                    ref={languageInput}
                    autoFocus
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
                <label className="workspace-select">
                  {m.citation_style_label()}
                  <select
                    value={preferences.citationStyle}
                    onChange={(event) => {
                      if (isCitationStyle(event.target.value))
                        changePreferences({
                          citationStyle: event.target.value,
                        });
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
              <div className="st-actions">
                <Button variant="primary" onPress={close}>
                  {m.shell_close()}
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
      {!check && (
        <form
          className="intake"
          onSubmit={(event) => {
            event.preventDefault();
            if (canCheck) void start("create");
          }}
        >
          <div>
            <h2 className="intake-heading">{m.shell_intake_heading()}</h2>
            <p className="intake-lead">{m.shell_intake_lead()}</p>
          </div>
          <div className="intake-command">
            {sourceDocument || intakeSource === "file" ? (
              <div className="intake-file-card">
                <FileText aria-hidden="true" size={20} />
                <div className="intake-file-name">
                  <span>{sourceLabel}</span>
                  {pending === "document" && (
                    <small>{m.document_upload_pending()}</small>
                  )}
                </div>
                <IconButton
                  size="sm"
                  label={m.shell_remove_file()}
                  {...availability(!!busy, m.shell_busy())}
                  onPress={clearFile}
                >
                  <X aria-hidden="true" size={16} />
                </IconButton>
              </div>
            ) : (
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
                <Search
                  aria-hidden="true"
                  size={20}
                  className="intake-search"
                />
                <Label className="sr-only">{m.input_label()}</Label>
                <TextArea
                  ref={inputRef}
                  placeholder={m.shell_intake_placeholder()}
                  className="intake-textarea"
                  autoFocus
                  rows={1}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      (event.metaKey || event.ctrlKey)
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <Description className="sr-only">
                  {m.input_hint()}
                  {busy && ` · ${m.shell_busy()}`}
                </Description>
              </TextFieldRoot>
            )}
            <div className="intake-submit">
              {intakeSource === "text" &&
                !library &&
                (pending === "structure" ? (
                  <span className="intake-count">{m.structuring_pending()}</span>
                ) : (
                  !!recognized && (
                    <span className="intake-count">
                      {recognized === 1
                        ? m.workspace_recognized_one()
                        : m.workspace_recognized({ count: recognized })}
                    </span>
                  )
                ))}
              {canCheck && (
                <span className="intake-kbd" aria-hidden="true">
                  <Kbd modifier={apple ? "apple" : "other"}>↵</Kbd>{" "}
                  {m.shell_kbd_submit()}
                </span>
              )}
              <Button
                type="submit"
                variant="primary"
                icon={<CheckIcon aria-hidden="true" size={16} />}
                aria-label={
                  pending === "create" ? undefined : m.check_action()
                }
                reasonPlacement="start"
                {...availability(!canCheck, checkReason)}
              >
                {pending === "create"
                  ? m.check_starting()
                  : m.shell_check_short()}
              </Button>
            </div>
          </div>
          <div className="intake-sources">
            <Aria.ToggleButtonGroup
              aria-label={m.shell_source()}
              selectionMode="single"
              disallowEmptySelection
              isDisabled={!!busy}
              selectedKeys={[filesOpen ? "file" : intakeSource]}
              onSelectionChange={(keys) => {
                const key = [...keys][0];
                if (key === "file") setFilesOpen(true);
                else if (key === "text") {
                  setFilesOpen(false);
                  if (intakeSource === "file") clearFile();
                  setInputKind("text");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }
              }}
              className="intake-segment"
            >
              <Aria.ToggleButton id="text">
                <List aria-hidden="true" size={16} />
                {m.shell_source_text()}
              </Aria.ToggleButton>
              <Aria.ToggleButton id="file">
                <Upload aria-hidden="true" size={16} />
                {m.shell_source_file()}
              </Aria.ToggleButton>
              {selectionIntake && (
                <Aria.ToggleButton
                  id="selection"
                  isDisabled={intakeSource !== "selection"}
                >
                  <PanelRight aria-hidden="true" size={16} />
                  {m.shell_source_selection()}
                </Aria.ToggleButton>
              )}
            </Aria.ToggleButtonGroup>
            <span className="intake-spacer" />
            {intakeSource !== "file" && !filesOpen && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                icon={<Plus aria-hidden="true" size={16} />}
                {...availability(!!busy, m.shell_busy())}
                onPress={() => {
                  setText(m.input_example());
                  setInputKind("text");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
              >
                {m.shell_insert_example()}
              </Button>
            )}
          </div>
          <p className="intake-hint" id="intake-hint">
            {intakeSource === "file" || filesOpen
              ? m.shell_formats()
              : m.input_hint()}
          </p>
          {intakeSource === "selection" && selectionIntake && (
            <p className="note-row">
              <Info aria-hidden="true" size={16} />
              <span>{m.selection_intake_help()}</span>
            </p>
          )}
          {fileInputs}
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
          {selectionUndo !== null && (
            <Button
              type="button"
              size="sm"
              onPress={() => {
                setSelectionNotice(null);
                setText(selectionUndo.text);
                setInputKind(selectionUndo.inputKind);
                setSourceDocument(selectionUndo.sourceDocument);
                setSelectionLimit(selectionUndo.selectionLimit);
                setLibrary(selectionUndo.library);
                showPreview(selectionUndo.preview);
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
            >
              {m.selection_undo()}
            </Button>
          )}
          <div className="workspace-banners">{notices}</div>
          {notes}
        </form>
      )}
      <Modal
        isOpen={!!preview && previewOpen && !check}
        onOpenChange={setPreviewOpen}
      >
        <Dialog
          aria-label={m.structuring_heading()}
          className="workspace-dialog wide"
        >
          {({ close }) =>
            preview && (
              <>
                <StructuringResults
                  result={preview}
                  inputText={sourceDocument?.text ?? text}
                  upgradeUrl={upgradeUrl}
                />
                <div className="st-actions">
                  <Button variant="primary" onPress={close}>
                    {m.shell_close()}
                  </Button>
                </div>
              </>
            )
          }
        </Dialog>
      </Modal>
      {check && (
        <section aria-labelledby="results-title" className="workspace-results">
          <h2 id="results-title" className="sr-only">
            {m.results_heading()}
          </h2>
          <div
            role="status"
            aria-labelledby="results-title"
            aria-live="off"
            aria-atomic="true"
            className="check-status"
          >
            <p className="sr-only">
              {running ? m.check_running() : m.check_ended()}
            </p>
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
            <CheckResults
              key={check.id}
              check={check}
              completed={completed}
              running={!!running}
              citationStyle={preferences.citationStyle}
              citationStyleLabel={m[styleMessages[preferences.citationStyle]]()}
              transport={transport}
              quota={quota}
              upgradeUrl={upgradeUrl}
              onStop={() => {
                void cancel();
              }}
              stopping={cancelling}
              onReset={reset}
              busy={!!busy}
              source={intakeSource}
              sourceLabel={sourceLabel}
              notices={
                <>
                  {/* A healthy stream is announced, not shown; only a lost
                      one earns a Banner (D). */}
                  <p role="status" className="sr-only">
                    {running &&
                      !accessStopped &&
                      connection !== "reconnecting" &&
                      (connection === "connected"
                        ? m.shell_connected()
                        : m.shell_connecting())}
                  </p>
                  <div className="workspace-banners">
                    {running &&
                      !accessStopped &&
                      connection === "reconnecting" && (
                        <Banner tone="warning">
                          {m.shell_reconnecting()}
                        </Banner>
                      )}
                    {notices}
                  </div>
                </>
              }
              footer={notes}
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
