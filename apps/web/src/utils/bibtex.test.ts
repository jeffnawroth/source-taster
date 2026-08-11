import { describe, expect, it } from 'vitest'
import { cslToBibtex } from './bibtex'

describe('cslToBibtex', () => {
  it('renders a minimal article', () => {
    const item = {
      'type': 'article-journal',
      'title': 'Deep Learning',
      'author': [{ family: 'LeCun', given: 'Yann' }],
      'container-title': 'Nature',
      'issued': { 'date-parts': [[2015, 5, 28]] },
      'volume': '521',
      'page': '436–444',
      'DOI': '10.1038/nature14539',
    }
    const out = cslToBibtex(item as never)
    expect(out).toContain('@article{')
    expect(out).toContain('title = {Deep Learning}')
    expect(out).toContain('author = {LeCun, Yann}')
    expect(out).toContain('doi = {10.1038/nature14539}')
  })
})
