<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'

const { getDOIsMetadata, abortFetching } = useDoiStore()

// Refs
const isOnline = ref(navigator.onLine)

// Functions
function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

// Event Listeners
window.addEventListener('offline', () => {
  updateOnlineStatus()
})

window.addEventListener('online', () => {
  updateOnlineStatus()
})

defineExpose({
  isOnline,
})

// Watchers
watch(isOnline, (newValue) => {
  if (newValue) {
    getDOIsMetadata()
  }
  else {
    abortFetching()
  }
})
</script>

<template>
  <v-empty-state
    v-show="!isOnline"
    image="https://cdn.vuetifyjs.com/docs/images/components/v-empty-state/connection.svg"
    :text="$t('connection-problem')"
    :title="$t('sth-went-wrong')"
  />
</template>
