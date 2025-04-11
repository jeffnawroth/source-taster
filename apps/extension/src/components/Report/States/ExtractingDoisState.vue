<script setup lang="ts">
import { useAppStore } from '@/extension/stores/app'
import { useDoiStore } from '@/extension/stores/doi'
import { mdiContentCut } from '@mdi/js'

const { isLoading } = storeToRefs(useAppStore())
const { dois } = storeToRefs(useDoiStore())
</script>

<template>
  <v-empty-state
    v-show="isLoading && dois.length === 0"
    :icon="mdiContentCut"
    :title="$t('extracting-dois')"
    :text="$t('extracting-dois-description')"
  />
</template>
