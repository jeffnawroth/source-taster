<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { useDoiStore } from '~/stores/doi'

// Props
const { index } = defineProps<{
  index: number
}>()

// I18n
const { t } = useI18n()

// Doi Store
const { dois } = storeToRefs(useDoiStore())

// Clipboard
const { copy, copied } = useClipboard()
</script>

<template>
  <v-tooltip>
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        density="compact"
        icon="mdi-content-copy"
        variant="plain"
        size="large"
        @click="copy(dois[index])"
      />
    </template>
    {{ copied ? `${t('doi-copied')}!` : t('copy-doi') }}
  </v-tooltip>
</template>
