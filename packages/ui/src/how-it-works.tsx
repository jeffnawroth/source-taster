// SPDX-License-Identifier: AGPL-3.0-or-later
import * as Aria from "react-aria-components";
import { Shield } from "lucide-react";
import { m } from "@source-taster/i18n";
import { Button } from "./primitives/actions.tsx";
import { Dialog, DialogHeading, Modal } from "./primitives/overlays.tsx";

/** #194 D dlg:how: the method, its limits and the human decision. */
export function HowItWorksDialog({
  isOpen,
  onOpenChange,
}: {
  /** Omitted inside a DialogTrigger, which then owns the open state. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
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
              <li>{m.workspace_method()}</li>
              <li>{m.workspace_limits()}</li>
              <li>{m.doi_uncalibrated()}</li>
            </ol>
            <p className="detail-note">{m.workspace_human()}</p>
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
export function FeedDisclaimer() {
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
      <HowItWorksDialog />
    </Aria.DialogTrigger>
  );
}
