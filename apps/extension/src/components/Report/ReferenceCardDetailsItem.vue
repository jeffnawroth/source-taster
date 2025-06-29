<script setup lang="ts">
const props = defineProps<{
  icon: string
  title?: string | number
  text?: string | number
  color?: string
  link?: boolean
}>()

const href = computed(() => {
  const textStr = String(props.text)
  const titleStr = props.title?.toString().toLowerCase() || ''

  // Handle DOI links - check if it's a DOI by looking for common DOI patterns
  if (textStr.match(/^10\.\d{4,}/)) {
    return `https://doi.org/${textStr}`
  }

  // Handle PMID links - check if it's a numeric PMID
  if (textStr.match(/^\d+$/) && titleStr.includes('pmid')) {
    return `https://pubmed.ncbi.nlm.nih.gov/${textStr}`
  }

  // Handle arXiv ID links - check for arXiv patterns
  if (textStr.match(/^\d{4}\.\d{4,5}(v\d+)?$/) || titleStr.includes('arxiv')) {
    return `https://arxiv.org/abs/${textStr}`
  }

  // Handle ISSN links - check for ISSN patterns (XXXX-XXXX)
  if (textStr.match(/^\d{4}-\d{3}[\dX]$/) || titleStr.includes('issn')) {
    return `https://portal.issn.org/api/search?search[]=MUST=allissnbis=%22${encodeURIComponent(textStr)}%22`
  }

  // Handle ISBN links - check for ISBN patterns (various formats)
  if (textStr.match(/^\d{1,5}[- ]?\d{1,7}[- ]?\d{1,7}[- ]?[\dX]$/) || titleStr.includes('isbn')) {
    return `https://www.isbn.de/buecher/suche/${textStr}`
  }

  // Handle URLs that already start with http/https
  if (textStr.startsWith('http')) {
    return textStr
  }

  // Default: add https:// prefix
  return `https://${textStr}`
})
</script>

<template>
  <!-- <v-list-item
    v-if="text"
  >
    <v-icon
      class="me-1 pb-1"
      :icon
      :color
    />

    <strong :class="`text-${color}`">{{ title }}: </strong>

    <span v-if="link">
      <a
        :href
        target="_blank"
        rel="noopener noreferrer"
      >{{ text }}</a>
    </span>
    <span v-else>{{ text }}</span>
  </v-list-item> -->
  <v-list-item>
    <div
      class="mb-1"
    >
      <div class="d-flex align-start">
        <v-icon
          :icon
          size="small"
          class="me-2 mt-1"
        />
        <div>
          <div class="text-caption text-medium-emphasis">
            {{ title }}
          </div>
          <div
            v-if="!link"
            class="text-body-2"
          >
            {{ text }}
          </div>
          <div v-else>
            <a
              :href
              target="_blank"
              rel="noopener noreferrer"
              class="text-body-2 text-primary text-decoration-none"
            >{{ text }}</a>
          </div>
        </div>
      </div>
    </div>
  </v-list-item>
</template>
