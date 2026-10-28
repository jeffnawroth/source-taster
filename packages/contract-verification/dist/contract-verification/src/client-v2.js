// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { CheckResponse, CheckEvent, isFinalEvent } from "./v2.js";
import { createVerificationClient, watchContractEvents, } from "./client.js";
export { ApiError, CheckStreamError, readSseFrames, } from "./client.js";
export function verificationClient(options = {}) {
    return createVerificationClient(options, "/v2", CheckResponse);
}
export function watchCheckEvents(checkId, options) {
    return watchContractEvents(checkId, options, "/v2", CheckEvent, isFinalEvent);
}
