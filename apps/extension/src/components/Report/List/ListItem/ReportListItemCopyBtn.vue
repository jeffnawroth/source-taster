<script setup lang="ts">
import { mdiCheck, mdiContentCopy } from '@mdi/js'
import { useClipboard } from '@vueuse/core'

// Props
const { value } = defineProps<{
  value: string
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
        :prepend-icon="copied ? mdiCheck : mdiContentCopy"
        variant="text"
        slim
        :text="t('copy')"
        @click="copy(value)"
      />
    </template>
    {{ copied ? `${t('doi-copied')}!` : t('copy-reference') }}
  </v-tooltip>
</template>
