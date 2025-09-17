<script setup lang="ts">
import { mdiCheck, mdiContentCopy } from '@mdi/js'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  icon: string
  title?: string | number
  text?: string | number
  color?: string
  link?: boolean
}>()

const { t } = useI18n()
const { copy } = useClipboard()

const valueHovered = ref(false)
const showCopiedMessage = ref(false)

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

  // Handle PMCID links - check for PMC pattern
  if ((textStr.match(/^PMC\d+$/) || textStr.match(/^\d+$/)) && titleStr.includes('pmcid')) {
    const pmcid = textStr.startsWith('PMC') ? textStr : `PMC${textStr}`
    return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
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

async function copyText(text: string) {
  await copy(text)
  showCopiedMessage.value = true
  setTimeout(() => {
    showCopiedMessage.value = false
  }, 2000)
}

function copyValue() {
  return copyText(String(props.text))
}
</script>

<template>
  <v-list-item>
    <div class="mb-1">
      <div class="d-flex align-start">
        <v-icon
          :icon
          size="small"
          class="me-2 mt-1"
        />
        <div class="flex-grow-1">
          <!-- Title -->
          <div class="text-caption text-medium-emphasis d-flex align-center">
            {{ title }}
            <!-- Modification indicator -->
          </div>

          <!-- Value with copy functionality on hover -->
          <div
            v-if="!link"
            class="text-body-2 d-flex align-center cursor-pointer"
            @click="copyValue"
            @mouseenter="valueHovered = true"
            @mouseleave="valueHovered = false"
          >
            <span class="flex-grow-1">{{ text }}</span>
            <v-tooltip
              v-if="valueHovered"
              location="top"
              :text="showCopiedMessage ? t('copy-clicked') : t('copy-hover')"
            >
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  :icon="showCopiedMessage ? mdiCheck : mdiContentCopy"
                  size="x-small"
                  class="ms-1 cursor-pointer"
                  :class="showCopiedMessage ? 'text-success' : 'opacity-75'"
                  @click.stop="copyValue"
                />
              </template>
            </v-tooltip>
          </div>

          <!-- Link value with discrete copy functionality -->
          <div
            v-else
            class="d-flex align-center"
            @mouseenter="valueHovered = true"
            @mouseleave="valueHovered = false"
          >
            <a
              :href
              target="_blank"
              rel="noopener noreferrer"
              class="text-body-2 text-primary text-decoration-none flex-grow-1"
            >{{ text }}</a>
            <v-tooltip
              v-if="valueHovered"
              location="top"
              :text="showCopiedMessage ? t('copy-clicked') : t('copy-hover')"
            >
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  :icon="showCopiedMessage ? mdiCheck : mdiContentCopy"
                  size="x-small"
                  class="ms-1 opacity-75 cursor-pointer"
                  :class="{ 'text-success': showCopiedMessage }"
                  @click="copyValue"
                />
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>
    </div>
  </v-list-item>
</template>
