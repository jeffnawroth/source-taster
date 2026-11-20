// SPDX-License-Identifier: AGPL-3.0-or-later
import * as Aria from "react-aria-components";
import { Shield } from "lucide-react";
import { m } from "@source-taster/i18n";
import { Button } from "./primitives/actions.tsx";
import { Dialog, DialogHeading, Modal } from "./primitives/overlays.tsx";

/**
 * #194 D dlg:how: D's three points and its bold Verdict disclaimer. Quota use
 * is named only where a Quota exists (hosted); the uncalibrated-rules note
 * stays while no release is qualified (web-gaps §13).
 */
export function HowItWorksDialog({
  isOpen,
  onOpenChange,
  quota = false,
}: {
  /** Omitted inside a DialogTrigger, which then owns the open state. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Hosted: the count comes with the expected Quota use. */
  quota?: boolean;
}) {
  return (
    <Modal
      {...(isOpen === undefined ? {} : { isOpen })}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      <Dialog className="workspace-dialog">
        {({ close }) => (
          <>
            <DialogHeading>{m.workspace_help()}</DialogHeading>
            <ol className="workspace-dialog-steps">
              <li>
                {quota
                  ? m.workspace_how_recognise_quota()
                  : m.workspace_how_recognise()}
              </li>
              <li>{m.workspace_how_match()}</li>
              <li>{m.workspace_how_unknown()}</li>
            </ol>
            <p className="detail-note">
              <b>{m.shell_feed_disclaimer()}</b>
            </p>
            <p className="detail-note">{m.doi_uncalibrated()}</p>
            <div className="st-actions">
              <Button variant="primary" onPress={close}>
                {m.shell_close()}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </Modal>
  );
}

/** #194 D feed .foot: the Verdict disclaimer with its inline method link. */
export function FeedDisclaimer({ quota = false }: { quota?: boolean }) {
  // A DialogTrigger moves focus into the Dialog and back to the link on close.
  return (
    <Aria.DialogTrigger>
      <p className="note-row">
        <Shield aria-hidden="true" size={16} />
        <span>
          {m.shell_feed_disclaimer()}{" "}
          <Button variant="ghost" size="sm" className="feed-link">
            {m.workspace_help()}
          </Button>
        </span>
      </p>
      <HowItWorksDialog quota={quota} />
    </Aria.DialogTrigger>
  );
}
