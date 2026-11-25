# Reviewed dependency patches

## react-aria 3.53.1: cancelled animation completion

An animation's `finished` promise rejects when a CSS transition is cancelled. The packaged animation helper previously swallowed that rejection without completing the pending lifecycle. A closing sheet could remain mounted with `data-exiting`, leaving focus in an invisible overlay. Changing reduced motion during exit reproduces the failure through the owned UI.

The patch invokes the existing completion callback on fulfillment or rejection. It preserves the exit-state guard that ignores completion after reopening, and applies to the packaged `.mjs`, `.js` and `.cjs` runtime variants. It changes no CSS duration or dismissal/focus policy. Apache-2.0 copyright/license notices remain intact. pnpm pins the patch hash in the lockfile.

The primitive regression changes reduced motion during sheet exit, checks unmount and focus return, then reopens and closes the same sheet. Run it through the normal primitive browser harness, together with the complete primitive suite.

Remove this patch and its workspace entry only after an upstream version completes cancelled animation lifecycles and passes the regression plus the Chromium/Firefox/WebKit primitive gates. Keep upstream version upgrades separately qualified.
