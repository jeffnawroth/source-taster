// SPDX-License-Identifier: AGPL-3.0-or-later
// The client lease of the shared e2e service (scripts/e2e-serve.ts). Production
// holds a Check for 75 s and renews every 25 s, so a renewal may take 50 s. The
// harness shrinks the lease only so a test can watch an abandoned Check lapse;
// request latency does not shrink with it, so the lease must still outlast the
// slowest renewal a loaded machine produces (measured at 0.8 s). The renewal
// interval is a third of this value; the rest is the margin before a lapse.
// Tests that wait for a lapse derive their wait from this value.
export const e2eClientLeaseMs = 6000;
