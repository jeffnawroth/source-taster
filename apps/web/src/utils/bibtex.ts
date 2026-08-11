import type { CSLItem } from '@source-taster/types'

function typeToBibtex(type: string): string {
  const map: Record<string, string> = {
    'article-journal': 'article',
    'article-magazine': 'article',
    'article-newspaper': 'article',
    'book': 'book',
    'chapter': 'incollection',
    'paper-conference': 'inproceedings',
    'thesis': 'phdthesis',
    'report': 'techreport',
    'webpage': 'misc',
    'software': 'software',
  }
  return map[type] ?? 'misc'
}

function authorsToBibtex(authors: { family?: string, given?: string }[]): string {
  return authors.map(a => `${a.family ?? ''}, ${a.given ?? ''}`.trim().replace(/, $/, '')).join(' and ')
}

function escape(value: string): string {
  return value.replace(/([{}#\\])/g, '\\$1').replace(/–/g, '--')
}

function yearOf(item: CSLItem): string | undefined {
  const issued = item.issued
  if (typeof issued !== 'object' || issued === null)
    return undefined
  const year = issued['date-parts']?.[0]?.[0]
  return year === undefined ? undefined : String(year)
}

export function cslToBibtex(item: CSLItem): string {
  const lines: string[] = []
  const entryType = typeToBibtex(item.type ?? 'book')
  const year = yearOf(item)
  const key = item.id ?? `${item.author?.[0]?.family ?? 'unknown'}${year ?? ''}`
  lines.push(`@${entryType}{${key},`)
  const push = (field: string, value: string | number | undefined) => {
    if (value)
      lines.push(`  ${field} = {${escape(String(value))}},`)
  }
  push('title', item.title)
  if (item.author?.length)
    push('author', authorsToBibtex(item.author as never))
  push('journal', item['container-title'])
  push('booktitle', item['container-title'])
  push('volume', item.volume)
  push('number', item.issue)
  push('pages', item.page)
  push('doi', item.DOI)
  push('url', item.URL)
  push('year', year)
  push('publisher', item.publisher)
  lines.push('}')
  return lines.join('\n')
}
