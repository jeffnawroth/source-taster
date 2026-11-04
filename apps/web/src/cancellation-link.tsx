// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useState } from "react";
import { m } from "@source-taster/i18n";
/** Always rendered by the web shell, independently of Account/Quota requests. */
export function CancellationLink({
  serviceUrl,
  language: initial,
}: {
  serviceUrl: string;
  language: "de" | "en";
}) {
  const [language, setLanguage] = useState(initial);
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setLanguage(document.documentElement.lang === "de" ? "de" : "en"),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <footer className="mx-auto max-w-5xl p-6">
      <a
        className="inline-block rounded border border-slate-700 p-3 underline"
        href={`${serviceUrl.replace(/\/$/, "")}/cancel?language=${language}`}
        referrerPolicy="no-referrer"
      >
        {m.cancellation_button({}, { locale: language })}
      </a>
    </footer>
  );
}
