<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { mdiOpenInNew } from '@mdi/js'

const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

type ReferenceMetadata = DeepReadonly<ApiExtractReference['metadata']>

type UrlResolver = (metadata: ReferenceMetadata) => string | undefined

function resolveDoi({ DOI }: ReferenceMetadata): string | undefined {
  const trimmed = DOI?.trim()
  return trimmed ? `https://doi.org/${trimmed}` : undefined
}

function resolveArxiv({ arxivId }: ReferenceMetadata): string | undefined {
  const rawId = arxivId?.trim()
  if (!rawId)
    return undefined
  if (rawId.startsWith('http'))
    return rawId
  const normalizedId = rawId.replace(/^arxiv:/i, '')
  return `https://arxiv.org/abs/${normalizedId}`
}

function resolvePmc({ PMCID }: ReferenceMetadata): string | undefined {
  const trimmed = PMCID?.trim()
  if (!trimmed)
    return undefined
  const pmcid = trimmed.startsWith('PMC') ? trimmed : `PMC${trimmed}`
  return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
}

function resolvePmid({ PMID }: ReferenceMetadata): string | undefined {
  const trimmed = PMID?.trim()
  return trimmed ? `https://pubmed.ncbi.nlm.nih.gov/${trimmed}` : undefined
}

function resolveUrl({ URL }: ReferenceMetadata): string | undefined {
  return URL?.trim() || undefined
}

const urlResolvers: UrlResolver[] = [
  resolveDoi,
  resolveArxiv,
  resolvePmc,
  resolvePmid,
  resolveUrl,
]

// PRIMARY URL for opening source
const primaryUrl = computed(() => {
  const metadata = reference.metadata
  for (const resolve of urlResolvers) {
    const url = resolve(metadata)
    if (url)
      return url
  }
  return undefined
})

// OPEN SOURCE function
function openSource() {
  if (primaryUrl.value) {
    window.open(primaryUrl.value, '_blank')
  }
}
</script>

<template>
  <v-tooltip
    v-if="primaryUrl"
    location="top"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        :icon="mdiOpenInNew"
        @click="openSource"
      />
    </template>
    <span>{{ $t('open-source-tooltip') }}</span>
  </v-tooltip>
</template>
