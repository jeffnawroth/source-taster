<script setup lang="ts">
import { mdiAlertCircleOutline, mdiTextBoxOutline } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'

// I18n
const { t } = useI18n()

// Doi Store
const { dois, bibliography } = storeToRefs(useDoiStore())
</script>

<template>
  <v-empty-state
    v-if="dois.length === 0 && bibliography.length === 0"
    :icon="mdiTextBoxOutline"
    :text="t('enter-dois')"
    :title="t('no-input-provided')"
  />

  <v-empty-state
    v-else-if="dois.length === 0"
    :icon=" mdiAlertCircleOutline"
    :title="t('no-valid-dois-were-found')"
    :text="t('check-dois')"
  />
</template>
