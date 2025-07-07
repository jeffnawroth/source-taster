<script setup lang="ts">
import { mdiFileDocumentMultipleOutline } from '@mdi/js'

// I18n
const { t } = useI18n()
</script>

<template>
  <v-empty-state
    :icon="mdiFileDocumentMultipleOutline"
    :headline="t('input-required')"
    :text="t('import-pdf-or-add-references')"
    :title="t('no-references-to-check')"
  />
</template>
