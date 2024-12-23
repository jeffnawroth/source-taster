<script setup lang="ts">
import { mdiAlertCircleOutline } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'

// I18n
const { t } = useI18n()

// Doi Store
const { dois, bibliography, file } = storeToRefs(useDoiStore())
</script>

<template>
  <v-empty-state
    v-if="dois.length === 0 && (!!bibliography.length || file)"
    :icon=" mdiAlertCircleOutline"
    :title="t('no-valid-dois-were-found')"
    :text="t('check-dois')"
  />
</template>
