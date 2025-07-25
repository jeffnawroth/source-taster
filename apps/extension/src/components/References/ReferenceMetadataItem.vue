<script setup lang="ts">
import type { FieldProcessingResult } from '@source-taster/types'
import { mdiCheck, mdiContentCopy, mdiInformationOutline } from '@mdi/js'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  icon: string
  title?: string | number
  text?: string | number
  color?: string
  link?: boolean
  modification?: FieldProcessingResult
  modifications?: FieldProcessingResult[] // Support for multiple modifications
}>()

const { t } = useI18n()
const { copy } = useClipboard()

const valueHovered = ref(false)
const showCopiedMessage = ref(false)

// Check if we have any modifications (single or multiple)
const hasModifications = computed(() => {
  return props.modification || (props.modifications && props.modifications.length > 0)
})

// Get all modifications (single or multiple)
const allModifications = computed(() => {
  if (props.modifications && props.modifications.length > 0) {
    return props.modifications
  }
  if (props.modification) {
    return [props.modification]
  }
  return []
})

// Get the original and final extracted values (special handling for combined fields like authors)
const originalValue = computed(() => {
  // For authors field, we need to reconstruct the original combined text
  if (allModifications.value.length > 0 && allModifications.value[0]?.fieldPath.includes('metadata.authors[')) {
    // Collect all original author values and combine them
    const authorMods = allModifications.value.filter(mod => mod.fieldPath.includes('metadata.authors['))
    return authorMods.map(mod => mod.originalValue).join(', ')
  }

  return allModifications.value[0]?.originalValue || ''
})

const extractedValue = computed(() => {
  // For authors field, use the actual displayed text from the component
  if (allModifications.value.length > 0 && allModifications.value[0]?.fieldPath.includes('metadata.authors[')) {
    // Use the text prop which already contains the formatted author list
    return String(props.text || '')
  }

  // All modifications should have the same processedValue as they're for the same field
  const value = allModifications.value[0]?.processedValue

  // If the processed value is an object (like for individual author modifications), format it as a readable string
  if (typeof value === 'object' && value !== null) {
    // Check if it's an author object with firstName and lastName
    if ('firstName' in value && 'lastName' in value) {
      const authorValue = value as { firstName?: string, lastName?: string }
      const firstName = authorValue.firstName || ''
      const lastName = authorValue.lastName || ''
      return `${firstName} ${lastName}`.trim()
    }
    // For other objects, stringify them
    return JSON.stringify(value)
  }

  return value || ''
})

// Get all modification types for this field (deduplicated with counts)
const modificationTypes = computed(() => {
  const types = allModifications.value.flatMap(mod =>
    mod.actionTypes.map(actionType => t(`modification-type-${actionType}`)),
  )

  // Count occurrences of each type
  const typeCounts = new Map<string, number>()
  types.forEach((type) => {
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1)
  })

  // Return formatted strings with counts if > 1
  return Array.from(typeCounts.entries()).map(([type, count]) => {
    return count > 1 ? `${type} (${count}x)` : type
  })
})

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
            <v-tooltip
              v-if="hasModifications"
              location="top"
              max-width="400"
            >
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  :icon="mdiInformationOutline"
                  size="small"
                  class="ms-1 text-info"
                />
              </template>
              <div class="text-caption">
                <div class="font-weight-medium mb-2">
                  {{ t('extraction-modification') }}
                </div>

                <!-- Show original and extracted values once -->
                <div class="mb-1">
                  <span class="text-medium-emphasis">{{ t('original') }}:</span>
                  "{{ originalValue }}"
                </div>
                <div class="mb-2">
                  <span class="text-medium-emphasis">{{ t('extracted') }}:</span>
                  "{{ extractedValue }}"
                </div>

                <!-- Show all modification types -->
                <div>
                  <span class="text-medium-emphasis">{{ t('changes-applied') }}:</span>
                  <div class="mt-1">
                    <v-chip
                      v-for="(type, index) in modificationTypes"
                      :key="index"
                      size="small"
                      variant="flat"
                      color="info"
                      class="me-1 mb-1"
                    >
                      {{ type }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-tooltip>
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
