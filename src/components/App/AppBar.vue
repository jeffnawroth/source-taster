<script setup lang="ts">
import { mdiCogOutline } from '@mdi/js'
import { useTheme } from 'vuetify'
import { themeOption } from '~/logic/storage'

// Props
defineProps<{
  hideSettings?: boolean
}>()

// Theme
const theme = useTheme()

// Watchers
watchEffect(() => {
  if (themeOption.value === 'system') {
    theme.global.name.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  else {
    theme.global.name.value = themeOption.value
  }
})

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  const newColorScheme = event.matches ? 'dark' : 'light'

  theme.global.name.value = newColorScheme
})

// Functions
function openOptionsPage() {
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage()
  }
  else {
    console.warn('Browser API not available. Cannot open options page.')
  }
}
</script>

<template>
  <v-app-bar
    app
    flat
    title="The Source Taster"
    color="transparent"
    density="compact"
    scroll-threshold="25"
    scroll-behavior="hide"
  >
    <template
      v-if="!hideSettings"
      #append
    >
      <v-btn

        size="small"
        :icon="mdiCogOutline"
        variant="plain"

        @click="openOptionsPage"
      />
    </template>
  </v-app-bar>
</template>
