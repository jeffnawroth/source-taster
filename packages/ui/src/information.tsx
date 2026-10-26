// SPDX-License-Identifier: AGPL-3.0-or-later
/** Public page identities shared by web and the future extension panel menu.
 * Callers supply only a language and (for another origin) the qualified site URL.
 * No reference text, session, search query or other context is accepted.
 */
export type InformationLanguage = "de" | "en";
export function informationLinks(language: InformationLanguage, siteUrl = "") {
  if (siteUrl && !/^https?:\/\/[^/]+\/?$/.test(siteUrl)) throw new Error('Information site URL must be an HTTP(S) origin');
  const base = siteUrl.replace(/\/$/,'');
  return [
    { id:'help', label: language === 'de' ? 'Hilfe' : 'Help', href:`${base}/docs/${language}/` },
    { id:'contact', label: language === 'de' ? 'Kontakt' : 'Contact', href:`${base}/${language}/contact/` },
    { id:'legal-notice', label: language === 'de' ? 'Impressum' : 'Legal notice', href:`${base}/${language}/legal-notice/` },
    { id:'terms', label: language === 'de' ? 'Nutzungsbedingungen' : 'Terms', href:`${base}/${language}/terms/` },
    { id:'privacy', label: language === 'de' ? 'Datenschutz' : 'Privacy policy', href:`${base}/${language}/privacy/` },
    { id:'withdrawal', label: language === 'de' ? 'Widerruf' : 'Withdrawal instructions', href:`${base}/${language}/withdrawal/` },
  ];
}
export function InformationLinks({ language, siteUrl }: { language: InformationLanguage; siteUrl?: string }) {
  return <nav aria-label={language === 'de' ? 'Hilfe und Rechtliches' : 'Help and legal information'} className="mt-8 flex flex-wrap gap-4 text-sm">
    {informationLinks(language,siteUrl).map(link => <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{link.label}</a>)}
  </nav>;
}
