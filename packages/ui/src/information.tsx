// SPDX-License-Identifier: AGPL-3.0-or-later
import { m } from "@source-taster/i18n";

/** Public page identities shared by web and the future extension panel menu.
 * Callers supply only a language and (for another origin) the qualified site URL.
 * No reference text, session, search query or other context is accepted.
 */
export type InformationLanguage = "de" | "en";
export function informationLinks(language: InformationLanguage, siteUrl = "") {
  if (siteUrl && !/^https?:\/\/[^/]+\/?$/.test(siteUrl))
    throw new Error("Information site URL must be an HTTP(S) origin");
  const base = siteUrl.replace(/\/$/, "");
  return [
    {
      id: "help",
      label: m.information_help({}, { locale: language }),
      href: `${base}/docs/${language}/`,
    },
    {
      id: "contact",
      label: m.information_contact({}, { locale: language }),
      href: `${base}/${language}/contact/`,
    },
    {
      id: "legal-notice",
      label: m.information_legal_notice({}, { locale: language }),
      href: `${base}/${language}/legal-notice/`,
    },
    {
      id: "terms",
      label: m.information_terms({}, { locale: language }),
      href: `${base}/${language}/terms/`,
    },
    {
      id: "privacy",
      label: m.information_privacy({}, { locale: language }),
      href: `${base}/${language}/privacy/`,
    },
    {
      id: "withdrawal",
      label: m.information_withdrawal({}, { locale: language }),
      href: `${base}/${language}/withdrawal/`,
    },
  ];
}
export function InformationLinks({
  language,
  siteUrl,
}: {
  language: InformationLanguage;
  siteUrl?: string;
}) {
  return (
    <nav
      aria-label={m.information_navigation({}, { locale: language })}
      className="mt-8 flex flex-wrap gap-4 text-sm"
    >
      {informationLinks(language, siteUrl).map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
