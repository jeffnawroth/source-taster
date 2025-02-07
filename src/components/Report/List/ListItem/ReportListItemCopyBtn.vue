<script setup lang="ts">
import { mdiCheck, mdiContentCopy } from '@mdi/js'
import { useClipboard } from '@vueuse/core'
import { useDoiStore } from '~/stores/doi'

// Props
const { index } = defineProps<{
  index: number
}>()

// I18n
const { t } = useI18n()

// Doi Store
const { extractedDois } = storeToRefs(useDoiStore())

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
        @click="copy(extractedDois[index])"
      />
    </template>
    {{ copied ? `${t('doi-copied')}!` : t('copy-doi') }}
  </v-tooltip>
</template>
