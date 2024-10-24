<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'
import NetworkErrorState from './NetworkErrorState.vue'

const { works, loading } = storeToRefs(useDoiStore())

type NetworkErrorStateType = InstanceType<typeof NetworkErrorState>
const networkErrorStateRef = useTemplateRef<NetworkErrorStateType>('networkErrorStateRef')
</script>

<template>
  <NoWorksFoundState
    v-show="works.length === 0 && !loading && networkErrorStateRef?.isOnline"
  />
  <NetworkErrorState
    ref="networkErrorStateRef"
  />
</template>
