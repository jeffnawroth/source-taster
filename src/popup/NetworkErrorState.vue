<script setup lang="ts">
const isOnline = ref(navigator.onLine)

function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

window.addEventListener('offline', () => {
  updateOnlineStatus()
})

window.addEventListener('online', () => {
  updateOnlineStatus()
})
</script>

<template>
  <v-empty-state
    v-if="!isOnline"
    action-text="Retry Request"
    image="https://cdn.vuetifyjs.com/docs/images/components/v-empty-state/connection.svg"
    text="There might be a problem with your connection. Please check your internet connection."
    title="Something Went Wrong"
  />
</template>
