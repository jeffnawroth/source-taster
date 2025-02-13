<script setup lang="ts">
import connection from '/assets/connection.svg'

const { getDOIsMetadata } = useDoiStore()

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
  // else {
  //   abortFetching()
  // }
})
</script>

<template>
  <v-empty-state
    v-show="!isOnline"
    :text="$t('connection-problem')"
    :title="$t('sth-went-wrong')"
  >
    <template #media>
      <v-img :src="connection" />
    </template>
  </v-empty-state>
</template>
