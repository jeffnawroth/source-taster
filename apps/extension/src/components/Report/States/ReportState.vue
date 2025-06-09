<script setup lang="ts">
// import type NetworkErrorState from './NetworkErrorState.vue'
// import { useDoiStore } from '@/extension/stores/doi'

// const { works, loading } = storeToRefs(useDoiStore())

// type NetworkErrorStateType = InstanceType<typeof NetworkErrorState>
// const networkErrorStateRef = useTemplateRef<NetworkErrorStateType>('networkErrorStateRef')
</script>

<template>
  <NoInputState />
  <ExtractingReferencesState />
  <!-- <NoDoisFoundState /> -->
  <!-- <ExtractingDoisState /> -->
  <!-- <NoWorksFoundState
    v-show="works.length === 0 && !loading && networkErrorStateRef?.isOnline"
  /> -->
  <!-- <NetworkErrorState
    ref="networkErrorStateRef"
  /> -->
</template>
