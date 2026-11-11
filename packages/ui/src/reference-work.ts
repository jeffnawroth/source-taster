// SPDX-License-Identifier: AGPL-3.0-or-later
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  Check,
  ReferenceSlot,
  StructuredCsl,
} from "@source-taster/contract-verification/v2";
import { ApiError } from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import { abuseMessage } from "./abuse-message.tsx";

/**
 * Identity of the result a draft is taken from: revision and result, never
 * the outcome payload. Benign stream updates that re-serialize the same
 * result therefore keep a draft current.
 */
export function resultBinding(checkId: string, reference: ReferenceSlot) {
  return `${checkId}:${reference.slot}:${reference.revision}:${reference.results[0]?.id ?? "none"}`;
}

/** A local, unsaved field draft bound to the result it was taken from. */
export type FieldDraft = {
  fields: StructuredCsl;
  authorsTruncated: boolean;
  expectedRevision: number;
  binding: string;
  /** The committed values the draft started from, for the dirty check. */
  baseline: { fields: StructuredCsl; authorsTruncated: boolean };
};
export function committedDraft(
  checkId: string,
  reference: ReferenceSlot,
  fields: StructuredCsl = reference.fields,
): FieldDraft {
  const authorsTruncated = reference.authorsTruncated ?? false;
  return {
    fields,
    authorsTruncated,
    expectedRevision: reference.revision,
    binding: resultBinding(checkId, reference),
    baseline: { fields: reference.fields, authorsTruncated },
  };
}
export function isDirty(draft: FieldDraft) {
  return !sameValue(
    { fields: draft.fields, authorsTruncated: draft.authorsTruncated },
    draft.baseline,
  );
}
/** Structural equality that ignores key order, as serializers differ. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b))
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => sameValue(item, b[index]))
    );
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const left = Object.entries(a).filter(([, value]) => value !== undefined);
  const right = Object.entries(b).filter(([, value]) => value !== undefined);
  return (
    left.length === right.length &&
    left.every(([key, value]) =>
      sameValue(value, (b as Record<string, unknown>)[key]),
    )
  );
}

/** The one message a failed Reference request shows. */
export function errorMessage(error: unknown) {
  const limited = abuseMessage(error);
  if (limited) return limited;
  if (error instanceof ApiError && error.status === 409)
    return m.problem_reference_conflict();
  if (error instanceof ApiError && error.status === 410)
    return m.problem_check_expired();
  const key = error instanceof ApiError ? error.problem?.i18nKey : undefined;
  if (key && key in m) return (m[key as keyof typeof m] as () => string)();
  return m.problem_connection();
}

/**
 * Accepts only current, monotonic snapshots for the mounted Check, so a late
 * HTTP reply cannot roll back a newer stream event or a replaced Check.
 */
export function useSnapshotGate(
  check: Check,
  onSnapshot: (check: Check) => void,
) {
  const live = useRef<Check | null>(null);
  useLayoutEffect(() => {
    live.current = check;
    return () => {
      live.current = null;
    };
  }, [check]);
  return useMemo(
    () => ({
      /** The Check as currently shown, or null once it is unmounted. */
      current: () => live.current,
      accept(snapshot: Check) {
        const current = live.current;
        if (
          !current ||
          current.id !== snapshot.id ||
          snapshot.lastEventSeq < current.lastEventSeq
        )
          return false;
        onSnapshot(snapshot);
        return true;
      },
    }),
    [onSnapshot],
  );
}
export type SnapshotGate = ReturnType<typeof useSnapshotGate>;

/**
 * Drafts and in-flight operations per slot, held above the keyed detail so
 * that selecting another Reference, filtering or closing the detail neither
 * discards an unsaved draft nor allows a second request for the same slot.
 */
export function useReferenceWork() {
  const [drafts, setDrafts] = useState<ReadonlyMap<number, FieldDraft>>(
    () => new Map(),
  );
  const [pending, setPending] = useState<ReadonlySet<number>>(() => new Set());
  const claimed = useRef(new Set<number>());
  const setDraft = useCallback(
    (
      slot: number,
      next: FieldDraft | null | ((draft: FieldDraft) => FieldDraft),
    ) =>
      setDrafts((drafts) => {
        const current = drafts.get(slot);
        const value =
          typeof next === "function" ? (current ? next(current) : null) : next;
        const copy = new Map(drafts);
        if (value) copy.set(slot, value);
        else copy.delete(slot);
        return copy;
      }),
    [],
  );
  const begin = useCallback((slot: number) => {
    if (claimed.current.has(slot)) return false;
    claimed.current.add(slot);
    setPending((pending) => new Set(pending).add(slot));
    return true;
  }, []);
  const end = useCallback((slot: number) => {
    claimed.current.delete(slot);
    setPending((pending) => {
      const copy = new Set(pending);
      copy.delete(slot);
      return copy;
    });
  }, []);
  return useCallback(
    (slot: number) => ({
      draft: drafts.get(slot) ?? null,
      setDraft: (
        next: FieldDraft | null | ((draft: FieldDraft) => FieldDraft),
      ) => setDraft(slot, next),
      pending: pending.has(slot),
      /** Claims the slot for one request; false while another one runs. */
      begin: () => begin(slot),
      end: () => end(slot),
    }),
    [drafts, pending, setDraft, begin, end],
  );
}
export type SlotWork = ReturnType<ReturnType<typeof useReferenceWork>>;
