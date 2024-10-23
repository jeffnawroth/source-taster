<script setup lang="ts">
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
</script>

<template>
  <v-empty-state
    v-show="!isOnline"
    image="https://cdn.vuetifyjs.com/docs/images/components/v-empty-state/connection.svg"
    :text="$t('connection-problem')"
    :title="$t('sth-went-wrong')"
  />
</template>
