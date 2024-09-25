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
    text="There might be a problem with your connection. Please check your internet connection."
    title="Something Went Wrong"
  />
</template>
