// SPDX-License-Identifier: AGPL-3.0-or-later
import { useRef, useState, type ReactNode } from "react";
import * as Aria from "react-aria-components";
import type { AiStructuringResult } from "@source-taster/contract-verification/ai";
import type { ImportResult } from "@source-taster/contract-verification/import";
import { FileText, List, PanelRight, RotateCcw } from "lucide-react";
import { m } from "@source-taster/i18n";
import { GlassSurface, Modal, AlertDialog } from "./primitives/index.ts";
import { MoreActions } from "./check-summary.tsx";
import { IconButton } from "./primitives/index.ts";
import { Filter } from "./workspace-icons.tsx";
import {
  VerdictGlyph,
  verdictLabels,
  shortVerdictLabels,
} from "./outcome-badges.tsx";
import { useNarrow, useStickySize } from "./sticky-layout.ts";
import type { IntakeSource } from "./check-results.tsx";

/** Recognized input before a Check exists. No result, Status or evidence is invented. */
export function CountedPreview({
  result,
  source,
  sourceLabel,
  consumption,
  choice,
  notices,
  footer,
  onReset,
  onMenuOpenChange,
  onResetOpenChange,
}: {
  result: AiStructuringResult | ImportResult;
  source: IntakeSource;
  sourceLabel: string;
  consumption?: string;
  choice?: ReactNode;
  notices?: ReactNode;
  footer?: ReactNode;
  onReset: () => void;
  onMenuOpenChange: (open: boolean) => void;
  onResetOpenChange: (open: boolean) => void;
}) {
  const sticky = useStickySize("--checking-strip-height");
  const anchor = useRef<HTMLDivElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const narrow = useNarrow(stage);
  // #194 D narrow strip: an i-filter toggle beside the menu folds the counts.
  const [countsOpen, setCountsOpen] = useState(true);
  const count = result.references.length;
  const heading =
    count === 1
      ? m.workspace_recognized_one()
      : m.workspace_recognized({ count });
  const SourceIcon =
    source === "file" ? FileText : source === "selection" ? PanelRight : List;
  return (
    <section
      className="workspace-results counted-preview"
      data-testid="counted-preview"
      aria-label={heading}
    >
      <div ref={stage} className="check-stage">
        <div className="check-main">
          <div ref={sticky} className="summary-container">
            <section className="summary-section" aria-label={heading}>
              <GlassSurface
                ref={anchor}
                layer="summary-strip"
                className="summary-strip"
              >
                <div className="summary-row">
                  <div
                    className="counted-heading"
                    role="status"
                    aria-live="polite"
                  >
                    <strong>{heading}</strong>
                    <span
                      id="counted-consumption"
                      data-testid={
                        !choice && consumption ? "quota-note" : undefined
                      }
                    >
                      {consumption ?? m.shell_auto_start()}
                    </span>
                  </div>
                  {narrow && (
                    <IconButton
                      size="sm"
                      variant="secondary"
                      label={m.shell_counts()}
                      aria-expanded={countsOpen}
                      onPress={() => setCountsOpen((open) => !open)}
                    >
                      <Filter aria-hidden="true" size={16} />
                    </IconButton>
                  )}
                  <MoreActions
                    anchor={anchor}
                    onOpenChange={onMenuOpenChange}
                    actions={[
                      {
                        id: "reset",
                        label: m.check_reset(),
                        icon: <RotateCcw aria-hidden="true" size={16} />,
                        onAction: () => {
                          setConfirmReset(true);
                          onResetOpenChange(true);
                        },
                      },
                    ]}
                  />
                </div>
                {choice}
                {(!narrow || countsOpen) && (
                  <div className="summary-counts">
                    <div
                      role="group"
                      aria-label={m.shell_verdicts()}
                      className="summary-verdicts"
                    >
                      {(
                        Object.keys(
                          verdictLabels,
                        ) as (keyof typeof verdictLabels)[]
                      ).map((verdict) => (
                        <Aria.ToggleButton
                          key={verdict}
                          isDisabled
                          className="summary-counter"
                          data-verdict={verdict}
                          aria-label={`${m[verdictLabels[verdict]]()}: 0`}
                        >
                          <VerdictGlyph verdict={verdict} />
                          <span className="summary-count" aria-hidden="true">
                            0
                          </span>
                          <span className="summary-label" aria-hidden="true">
                            {m[shortVerdictLabels[verdict]]()}
                          </span>
                        </Aria.ToggleButton>
                      ))}
                    </div>
                  </div>
                )}
              </GlassSurface>
            </section>
          </div>
          <div className="check-feed">
            <p className="feed-echo">
              <SourceIcon aria-hidden="true" size={16} />
              <b>{sourceLabel}</b>
              <span className="feed-echo-count">· {heading}</span>
            </p>
            {notices}
            <ol className="feed-cards" aria-label={m.workspace_references()}>
              {result.references.map((reference, index) => {
                const metadata = [
                  reference.csl.author
                    ?.map(
                      (author) =>
                        author.literal ??
                        [author.given, author.family].filter(Boolean).join(" "),
                    )
                    .join("; "),
                  reference.csl.issued?.literal,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li
                    key={`${reference.span.start}:${reference.span.end}`}
                    className="feed-card counted-card"
                  >
                    <span className="card-num" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="card-main">
                      <h3 className="card-title">
                        {reference.csl.title ?? reference.originalText}
                      </h3>
                      <p className="card-meta">{metadata}</p>
                    </div>
                    <div className="card-result" />
                    {/* Empty decorative track, not a forecast of searches or evidence. */}
                    <div className="card-track" aria-hidden="true">
                      <div className="evidence-track counted-empty-track">
                        <i className="track-node" data-state="pend" />
                        <i className="track-node" data-state="pend" />
                        <i className="track-node" data-state="pend" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <footer className="feed-foot">{footer}</footer>
          </div>
        </div>
      </div>
      <Modal
        isOpen={confirmReset}
        onOpenChange={(open) => {
          setConfirmReset(open);
          onResetOpenChange(open);
        }}
      >
        <AlertDialog
          title={m.check_reset()}
          cancelLabel={m.shell_keep()}
          actionLabel={m.check_reset()}
          onAction={onReset}
        >
          {m.shell_reset_confirm()}
        </AlertDialog>
      </Modal>
    </section>
  );
}
