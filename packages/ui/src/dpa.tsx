// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useState } from "react";
import type {
  DpaAgreement,
  DpaParty,
  DpaPacket,
} from "@source-taster/contract-service";
import {
  GuestTokenError,
  type DpaClient,
} from "@source-taster/contract-service/client";
import { m } from "@source-taster/i18n";
const field = "block w-full rounded border border-slate-500 p-2";
const button = "rounded border border-slate-500 px-3 py-2";
const emptyParty = { name: "", address: "", representative: "" };
function failure(error: unknown) {
  if (error instanceof GuestTokenError) {
    if (error.status === 409) return m.dpa_conflict();
    if (error.status === 400 || error.status === 403)
      return m.dpa_proof_failed();
    if (error.status === 429) return m.dpa_limited();
    if (error.status === 401) return m.auth_expired();
  }
  return m.dpa_failed();
}
function Packet({ packet }: { packet: DpaPacket }) {
  return (
    <div>
      <p>
        {packet.version} · {packet.language.toUpperCase()}
      </p>
      {packet.documents.map((document, index) => (
        <article key={index} className="my-3">
          <h4 className="font-semibold">
            {document.title} · {document.version}
          </h4>
          <pre className="whitespace-pre-wrap font-sans">{document.text}</pre>
        </article>
      ))}
    </div>
  );
}
/** Bundled controls over the private legal-record API, identical in both clients.
 * Persist only an opaque operation ID for recovery, never party data or codes. */
export function DpaControls({
  client,
  accountId,
  language,
}: {
  client: DpaClient;
  accountId: string;
  language: "en" | "de";
}) {
  const [open, setOpen] = useState(false),
    [state, setState] = useState<Awaited<
      ReturnType<DpaClient["state"]>
    > | null>(null);
  const [party, setParty] = useState<DpaParty>(emptyParty),
    [accepted, setAccepted] = useState(false);
  const [operation, setOperation] = useState<{
      id: string;
      canConclude: boolean;
    } | null>(null),
    [code, setCode] = useState("");
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [concluded, setConcluded] = useState<DpaAgreement | null>(null),
    [reason, setReason] = useState("");
  const storageKey = `source-taster-dpa-operation:${accountId}`;
  async function refresh() {
    const next = await client.state(language);
    setState(next);
    setParty(next.party ?? emptyParty);
    return next;
  }
  async function recover(id: string) {
    const result = await client.operation(id);
    if (result.agreement) {
      setConcluded(result.agreement);
      setOperation(null);
      sessionStorage.removeItem(storageKey);
      setNotice(m.dpa_concluded());
      await refresh();
    } else {
      setNotice(
        result.status === "expired"
          ? m.dpa_expired()
          : m.dpa_recovery_pending(),
      );
    }
  }
  useEffect(() => {
    if (!open) return;
    let active = true;
    void client
      .state(language)
      .then((next) => {
        if (!active) return;
        setState(next);
        setParty(next.party ?? emptyParty);
        const id = sessionStorage.getItem(storageKey);
        if (id) {
          setOperation({ id, canConclude: false });
          return recover(id);
        }
      })
      .catch((e) => {
        if (active) setError(failure(e));
      })
      .finally(() => {
        if (active) setPending(false);
      });
    return () => {
      active = false;
    };
    // Each Account mounts its own controls; only language or opening reloads state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, language, client]);
  async function run(action: () => Promise<void>) {
    setPending(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(failure(e));
    } finally {
      setPending(false);
    }
  }
  async function begin() {
    if (!state?.packet || !accepted) return;
    const id = crypto.randomUUID();
    sessionStorage.setItem(storageKey, id);
    setOperation({ id, canConclude: false });
    const result = await client.challenge({
      operationId: id,
      packetVersion: state.packet.version,
      language,
      party,
      partyRevision: state.partyRevision,
      authorityAccepted: true,
      businessUse: true,
    });
    if (result.agreement) {
      setConcluded(result.agreement);
      setNotice(m.dpa_concluded());
      await refresh();
    } else {
      setOperation({ id, canConclude: true });
      setNotice(m.dpa_pending());
    }
  }
  async function conclude() {
    if (!operation?.canConclude) return;
    const result = await client.conclude({ operationId: operation.id, code });
    if (result.agreement) {
      setConcluded(result.agreement);
      setOperation(null);
      setCode("");
      sessionStorage.removeItem(storageKey);
      setNotice(m.dpa_concluded());
      await refresh();
    }
  }
  async function download(agreement: DpaAgreement) {
    const blob = await client.download(agreement.id),
      url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download = `dpa-${agreement.id}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function restart() {
    sessionStorage.removeItem(storageKey);
    setOperation(null);
    setCode("");
    setAccepted(false);
    setConcluded(null);
    setNotice("");
    void run(async () => {
      await refresh();
    });
  }
  return (
    <div className="mt-4">
      <button
        className={button}
        onClick={() => {if (!open) {setPending(true);setError("");} setOpen(!open);}}
        aria-expanded={open}
      >
        {m.dpa_title()}
      </button>
      {open && (
        <section
          aria-label={m.dpa_title()}
          className="mt-3 rounded border border-slate-400 p-3"
        >
          <h3 className="font-semibold">{m.dpa_title()}</h3>
          <p>{m.dpa_legal_review()}</p>
          {pending && <p role="status">{m.auth_pending()}</p>}
          {error && <p role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}
          {state && (
            <>
              {!operation &&
                !concluded &&
                (state.packet ? (
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void run(begin);
                    }}
                  >
                    <p>{m.dpa_review()}</p>
                    <Packet packet={state.packet} />
                    <label>
                      {m.dpa_name()}
                      <input
                        className={field}
                        value={party.name}
                        required
                        maxLength={200}
                        readOnly={!!state.party}
                        disabled={pending}
                        onChange={(e) =>
                          setParty({ ...party, name: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      {m.dpa_address()}
                      <textarea
                        className={field}
                        value={party.address}
                        required
                        maxLength={1000}
                        readOnly={!!state.party}
                        disabled={pending}
                        onChange={(e) =>
                          setParty({ ...party, address: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      {m.dpa_representative()}
                      <input
                        className={field}
                        value={party.representative}
                        required
                        maxLength={200}
                        readOnly={!!state.party}
                        disabled={pending}
                        onChange={(e) =>
                          setParty({ ...party, representative: e.target.value })
                        }
                      />
                    </label>
                    {state.party && <p>{m.dpa_party_change()}</p>}
                    <label>
                      <input
                        type="checkbox"
                        checked={accepted}
                        disabled={pending}
                        onChange={(e) => setAccepted(e.target.checked)}
                      />
                      {m.dpa_authority()}
                    </label>
                    <button className={button} disabled={pending || !accepted}>
                      {m.dpa_request()}
                    </button>
                  </form>
                ) : (
                  <p>{m.dpa_not_offered()}</p>
                ))}
              {operation && (
                <div className="flex flex-col gap-3">
                  {operation.canConclude && (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void run(conclude);
                      }}
                    >
                      <p>
                        {party.name} · {party.address} · {party.representative}
                      </p>
                      {state.packet && <Packet packet={state.packet} />}
                      <label>
                        {m.dpa_code()}
                        <input
                          autoFocus
                          className={field}
                          value={code}
                          required
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          minLength={6}
                          disabled={pending}
                          onChange={(e) => setCode(e.target.value)}
                        />
                      </label>
                      <button className={button} disabled={pending}>
                        {m.dpa_conclude()}
                      </button>
                    </form>
                  )}
                  <button
                    className={button}
                    disabled={pending}
                    onClick={() => void run(() => recover(operation.id))}
                  >
                    {m.dpa_recover()}
                  </button>
                  <button
                    className={button}
                    disabled={pending}
                    onClick={restart}
                  >
                    {m.dpa_restart()}
                  </button>
                </div>
              )}
              <h4 className="mt-4 font-semibold">{m.dpa_saved()}</h4>
              {state.agreements.map((agreement) => (
                <article key={agreement.id} className="my-3">
                  <p>
                    {agreement.packet.version} ·{" "}
                    {agreement.packet.language.toUpperCase()} ·{" "}
                    {agreement.concludedAt} · {agreement.party.name}
                  </p>
                  <button
                    className={button}
                    disabled={pending}
                    onClick={() => void run(() => download(agreement))}
                  >
                    {m.dpa_download()}
                  </button>
                </article>
              ))}
              {state.notices.length > 0 && (
                <h4 className="font-semibold">{m.dpa_notices()}</h4>
              )}
              {state.notices.map((change) => (
                <article key={change.id} className="my-3">
                  <p>
                    {change.version} · {change.change}
                  </p>
                  <p>
                    {m.dpa_notice_dates({
                      effective: change.intendedEffectiveAt,
                      deadline: change.objectionDeadline,
                    })}
                  </p>
                  <a
                    className="underline"
                    href={change.objectionRoute}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {m.dpa_notice_route()}
                  </a>
                  <p>
                    {change.delivery === "sent" ? m.dpa_sent() : m.dpa_queued()}
                  </p>
                  {!change.resolved && <p>{m.dpa_hold()}</p>}
                  {change.objection ? (
                    <p>{change.objection}</p>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void run(async () => {
                          await client.object({ noticeId: change.id, reason });
                          setReason("");
                          await refresh();
                        });
                      }}
                    >
                      <label>
                        {m.dpa_objection()}
                        <textarea
                          className={field}
                          required
                          maxLength={2000}
                          disabled={pending}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </label>
                      <button className={button} disabled={pending}>
                        {m.dpa_object()}
                      </button>
                    </form>
                  )}
                </article>
              ))}
            </>
          )}
          <button className={button} onClick={() => setOpen(false)}>
            {m.dpa_close()}
          </button>
        </section>
      )}
    </div>
  );
}
