// SPDX-License-Identifier: AGPL-3.0-or-later
export const apiUrl = `http://127.0.0.1:${process.env.SOURCE_TASTER_E2E_API_PORT ?? "3192"}`;
export const webUrl = `http://127.0.0.1:${process.env.SOURCE_TASTER_E2E_WEB_PORT ?? "5192"}`;
/** Explicit development configuration; no public domain is implied. */
export const standaloneConfig = {
  SOURCE_TASTER_EXTENSION_API_URL: apiUrl,
  SOURCE_TASTER_EXTENSION_WEBSITE_URL: webUrl,
};
