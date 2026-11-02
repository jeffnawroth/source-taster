// SPDX-License-Identifier: AGPL-3.0-or-later
import { useState } from "react";
import type { InvoiceClient } from "@source-taster/contract-service/client";
import { m } from "@source-taster/i18n";
/** A current Account request authorizes every list/download; IDs are never credentials. */
export function InvoiceControls({
  client,
  language,
}: {
  client: InvoiceClient;
  language: "de" | "en";
}) {
  const [rows, setRows] =
    useState<Awaited<ReturnType<InvoiceClient["list"]>>>();
  const [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  const locale = { locale: language };
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await action();
    } catch {
      setRows(undefined);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label={m.invoices_title({}, locale)}>
      <h2>{m.invoices_title({}, locale)}</h2>
      <button
        disabled={busy}
        onClick={() => void run(async () => setRows(await client.list()))}
      >
        {m.invoices_load({}, locale)}
      </button>
      {busy && <p role="status">{m.invoices_loading({}, locale)}</p>}
      {failed && <p role="alert">{m.invoices_unavailable({}, locale)}</p>}
      {rows?.length === 0 && <p>{m.invoices_empty({}, locale)}</p>}
      {rows?.map((row) => (
        <article key={row.id}>
          <h3>{row.id}</h3>
          <p>
            <time dateTime={row.issuedAt}>
              {new Intl.DateTimeFormat(language).format(new Date(row.issuedAt))}
            </time>
            {" · "}
            {new Intl.NumberFormat(language, {
              style: "currency",
              currency: row.currency,
            }).format(row.grossCents / 100)}
          </p>
          {row.formats.map((format) => (
            <button
              key={format}
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const blob = await client.download(row.id, format);
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download =
                    format === "pdf" ? "invoice.pdf" : "invoice.xml";
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                })
              }
            >
              {format === "pdf"
                ? m.invoices_pdf({}, locale)
                : m.invoices_ubl({}, locale)}
            </button>
          ))}
        </article>
      ))}
    </section>
  );
}
