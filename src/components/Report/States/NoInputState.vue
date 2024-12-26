<script setup lang="ts">
import { mdiInformationOutline } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'

// I18n
const { t } = useI18n()

// Doi Store
const { bibliography, file } = storeToRefs(useDoiStore())
</script>

<template>
  <v-empty-state
    v-if="bibliography.length === 0 && !file"
    :icon="mdiInformationOutline"
    :text="t('enter-dois')"
    :title="t('no-input-provided')"
  />
</template>
