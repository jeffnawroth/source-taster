<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { mdiCheck, mdiContentCopy } from '@mdi/js'
import { useClipboard } from '@vueuse/core'

// Props
defineProps<{
  work: HttpResponse<Item<Work>>
}>()

// I18n
const { t } = useI18n()

// Clipboard
const { copy, copied } = useClipboard()
</script>

<template>
  <v-tooltip>
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        density="compact"
        :icon="copied ? mdiCheck : mdiContentCopy"
        variant="plain"
        size="large"
        @click="work.content?.message.DOI ? copy(work.content?.message.DOI) : ''"
      />
    </template>
    {{ copied ? `${t('doi-copied')}!` : t('copy-doi') }}
  </v-tooltip>
</template>
