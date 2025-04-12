<script setup lang="ts">
import { useDoiStore } from '@/extension/stores/doi'
import { useIssnStore } from '@/extension/stores/issn'

const { dois, registeredDoisCount, unregisteredDoisCount } = storeToRefs(useDoiStore())
const { issns, registeredIssnsCount, unregisteredIssnsCount } = storeToRefs(useIssnStore())

// Total DOIs and ISSNs found
const foundTotal = computed(() => {
  return dois.value.length + issns.value.length
})

// Total DOIs and ISSNs registered
const registeredTotal = computed(() => {
  return registeredDoisCount.value + registeredIssnsCount.value
})

// Total DOIs and ISSNs unregistered
const unregisteredTotal = computed(() => {
  return unregisteredDoisCount.value + unregisteredIssnsCount.value
})

// I18n
const { t } = useI18n()
</script>

<template>
  <v-row
    no-gutters
    density="compact"
  >
    <span class="mr-4">
      {{ `${t('found')}: ${foundTotal}` }}
    </span>
    <v-divider vertical />

    <span class="mx-4">
      {{ `${t('registered')}: ${registeredTotal}` }}
    </span>

    <v-divider vertical />

    <span class="mx-4">
      {{ `${t('unregistered')}: ${unregisteredTotal}` }}
    </span>
  </v-row>
</template>
