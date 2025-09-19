<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { extractYearFromCSLDate, formatAuthorsCompact } from '@source-taster/types'
import { translateSourceType } from '@/extension/utils/sourceType'

const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

// I18n
const { t } = useI18n()

const ARTICLE_TYPES = new Set([
  'article',
  'article-journal',
  'article-magazine',
  'article-newspaper',
  'paper-conference',
  'review',
  'review-book',
])

const CHAPTER_TYPES = new Set([
  'chapter',
  'entry',
  'entry-dictionary',
  'entry-encyclopedia',
])

const BOOK_TYPES = new Set([
  'book',
  'classic',
  'collection',
])

const REPORT_TYPES = new Set([
  'report',
  'manuscript',
  'thesis',
  'standard',
])

const DATASET_TYPES = new Set([
  'dataset',
  'software',
])

const WEB_TYPES = new Set([
  'webpage',
  'post',
  'post-weblog',
])

// SOURCE TYPE - using the translation utility
const sourceType = computed(() => {
  if (!reference.metadata.type)
    return null
  try {
    return translateSourceType(t, reference.metadata.type)
  }
  catch (error) {
    console.warn('Error translating source type:', error)
    return reference.metadata.type
  }
})

const normalizedType = computed(() => reference.metadata.type?.toLowerCase() ?? null)

const typeGroup = computed<'article' | 'chapter' | 'book' | 'report' | 'dataset' | 'web' | 'default'>(() => {
  const type = normalizedType.value
  if (!type)
    return 'default'
  if (ARTICLE_TYPES.has(type))
    return 'article'
  if (CHAPTER_TYPES.has(type))
    return 'chapter'
  if (BOOK_TYPES.has(type))
    return 'book'
  if (REPORT_TYPES.has(type))
    return 'report'
  if (DATASET_TYPES.has(type))
    return 'dataset'
  if (WEB_TYPES.has(type))
    return 'web'
  return 'default'
})

const publicationYear = computed(() => {
  if (!reference.metadata.issued)
    return null
  try {
    const issuedData = reference.metadata.issued as any
    return extractYearFromCSLDate(issuedData) || null
  }
  catch (error) {
    console.warn('Error parsing issued date:', error)
    return null
  }
})

// AUTHORS - using the compact formatter utility
const authors = computed(() => {
  if (!reference.metadata.author)
    return null
  try {
    // Convert readonly type to mutable for the utility function
    const authorsData = reference.metadata.author as any
    return formatAuthorsCompact(authorsData)
  }
  catch (error) {
    console.warn('Error formatting authors:', error)
    return null
  }
})

// CARD SUBTITLE
// Combine year, authors, and key metadata into a single subtitle string
const subtitle = computed(() => {
  const parts: string[] = []

  const addPart = (value?: string | number | null) => {
    if (value === null || value === undefined)
      return
    const text = String(value).trim()
    if (!text)
      return
    if (!parts.includes(text))
      parts.push(text)
  }

  addPart(publicationYear.value)

  const containerTitle = reference.metadata['container-title']
  const publisher = reference.metadata.publisher
  const publisherPlace = reference.metadata['publisher-place']
  const pages = reference.metadata.page
  const volume = reference.metadata.volume
  const issue = reference.metadata.issue

  const getVolumeIssuePages = () => {
    const volumeText = volume ? String(volume).trim() : ''
    const issueText = issue ? String(issue).trim() : ''
    const pagesText = pages ? String(pages).trim() : ''

    let volumeIssue = ''
    if (volumeText)
      volumeIssue = volumeText
    if (issueText)
      volumeIssue = volumeIssue ? `${volumeIssue}(${issueText})` : issueText

    if (pagesText)
      return volumeIssue ? `${volumeIssue}, ${pagesText}` : pagesText

    return volumeIssue
  }

  switch (typeGroup.value) {
    case 'article':
      addPart(authors.value)
      addPart(containerTitle)
      addPart(getVolumeIssuePages())
      break
    case 'chapter':
      addPart(authors.value)
      addPart(containerTitle)
      addPart(pages)
      break
    case 'book':
      addPart(authors.value)
      addPart(publisher)
      addPart(publisherPlace)
      break
    case 'report':
      addPart(authors.value)
      addPart(publisher)
      addPart(publisherPlace)
      break
    case 'dataset':
      addPart(authors.value)
      addPart(publisher || containerTitle)
      addPart(reference.metadata.DOI)
      break
    case 'web':
      addPart(authors.value)
      addPart(containerTitle || publisher)
      if (reference.metadata.URL) {
        try {
          const url = new URL(reference.metadata.URL)
          addPart(url.hostname)
        }
        catch {
          addPart(reference.metadata.URL)
        }
      }
      break
    default:
      addPart(authors.value)
      addPart(containerTitle)
      break
  }

  if (parts.length <= 1) {
    addPart(authors.value)
    addPart(containerTitle || publisher)
  }

  return parts.join(' · ')
})
</script>

<template>
  <!-- <v-card-subtitle> -->
  <v-chip
    v-if="sourceType"
    variant="outlined"
    class="mr-2"
  >
    {{ sourceType }}
  </v-chip>
  <span v-if="subtitle">
    {{ subtitle }}
  </span>
  <!-- </v-card-subtitle> -->
</template>
