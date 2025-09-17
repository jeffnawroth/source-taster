export interface NormalizeOptions {
  unicodeNFKC?: boolean // Unicode-Kanonisierung
  stripZeroWidth?: boolean // Zero-Width-Zeichen entfernen
  toLower?: boolean // Kleinschreibung
  normalizeWhitespace?: boolean // Mehrfach-Spaces -> 1 Space, trim
  mapDashes?: boolean // – — ‐ − -> -
  mapQuotes?: boolean // „“”’' -> "
  stripPunctuation?: boolean // Satzzeichen (außer -/") entfernen
  keepDigits?: boolean // Ziffern erhalten, wenn stripPunctuation=true
  mapUmlauts?: boolean // ä->ae, ö->oe, ü->ue, ß->ss
  removeAccents?: boolean // diakritische Zeichen entfernen (á->a)
}

export const defaultNormalizeOptions: NormalizeOptions = {
  unicodeNFKC: true,
  stripZeroWidth: true,
  toLower: true,
  normalizeWhitespace: true,
  mapDashes: true,
  mapQuotes: true,
  stripPunctuation: false,
  keepDigits: true,
  mapUmlauts: false,
  removeAccents: false,
}

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g // ZWSP, ZWNBSP, ZWJ, ZWNJ, BOM

const DASHES = /[–—‐−]/g // en, em, hyphen, minus
const QUOTES = /[“”„‟’']/g

// Satzzeichen außer - und " (werden ggf. vorher gemappt)
const PUNCT_EXCEPT = /[^\p{L}\p{N}\s\-"]/gu

// kombinierende diakritische Zeichen
const COMBINING_MARKS = /\p{M}+/gu

function mapUmlautsFn(s: string): string {
  return s
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
}

/**
 * Normalisiert einen String gemäß der angegebenen Optionen.
 * Jede Regel ist optional und kann unabhängig geschaltet werden.
 */
export function normalizeText(input: string, opts: NormalizeOptions = {}): string {
  const o = { ...defaultNormalizeOptions, ...opts }
  let s = input

  if (o.unicodeNFKC)
    s = s.normalize('NFKC')
  if (o.stripZeroWidth)
    s = s.replace(ZERO_WIDTH, '')
  if (o.mapDashes)
    s = s.replace(DASHES, '-')
  if (o.mapQuotes)
    s = s.replace(QUOTES, '"')

  if (o.mapUmlauts)
    s = mapUmlautsFn(s)

  if (o.removeAccents) {
    // Zerlegen in NFD und kombinierende Zeichen entfernen, dann zurück nach NFC
    s = s.normalize('NFD').replace(COMBINING_MARKS, '').normalize('NFC')
  }

  if (o.stripPunctuation) {
    // Erlaube Ziffern optional zu erhalten (Letters immer erhalten)
    s = s.replace(PUNCT_EXCEPT, () => {
      if (o.keepDigits)
        return ''
      // Wenn keepDigits=false, fallen Ziffern unter \p{N} sowieso nicht hier rein.
      return ''
    })
  }

  if (o.normalizeWhitespace) {
    s = s.replace(/\s+/g, ' ').trim()
  }

  if (o.toLower)
    s = s.toLowerCase()

  return s
}

/**
 * Kleine Hilfs-API: baue dir eine Pipeline mit vordefinierten Optionen.
 * Später kannst du die Pipeline überall wiederverwenden.
 */
export function createNormalizer(options?: NormalizeOptions) {
  const o = { ...defaultNormalizeOptions, ...options }
  return (text: string) => normalizeText(text, o)
}
