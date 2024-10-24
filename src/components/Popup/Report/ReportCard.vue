<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useDoiStore } from '~/stores/doi'
import NetworkErrorState from './States/NetworkErrorState.vue'
import NoWorksFoundState from './States/NoWorksFoundState.vue'

// App Store
const doiStore = useDoiStore()
const { getDOIsMetadata, abortFetching } = doiStore
const { works, loading } = storeToRefs(doiStore)

// i18n
const { t } = useI18n()

// Template Refs

type NetworkErrorStateType = InstanceType<typeof NetworkErrorState>
const networkErrorStateRef = useTemplateRef<NetworkErrorStateType>('networkErrorStateRef')

// Watcher

// Watches the network error state
watch(() => networkErrorStateRef.value?.isOnline, (isOnline) => {
  if (isOnline) {
    getDOIsMetadata()
  }
  else {
    abortFetching()
  }
})
</script>

<template>
  <v-card
    flat
    :title="t('report')"
  >
    <template #prepend>
      <ReportCardPrependIcon />
    </template>
    <template #append>
      <ReportCardPdfDownload />
    </template>
    <template
      #subtitle
    >
      <ReportCardSubtitle />
    </template>
    <v-card-text
      class="pa-0"
    >
      <ReportLoadingBar />

      <ReportList />

      <NoWorksFoundState
        v-show="works.length === 0 && !loading && networkErrorStateRef?.isOnline"
      />
      <NetworkErrorState
        ref="networkErrorStateRef"
      />
    </v-card-text>
  </v-card>
</template>
