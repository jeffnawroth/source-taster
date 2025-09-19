<script setup lang="ts">
import { mdiCogOutline } from '@mdi/js'
import { useTheme } from 'vuetify'
import { settings } from '@/extension/logic'

// THEME
const theme = useTheme()

watchEffect(() => {
  if (settings.value.theme === 'system') {
    theme.change(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }
  else {
    theme.change(settings.value.theme)
  }
})

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  const newColorScheme = event.matches ? 'dark' : 'light'

  theme.change(newColorScheme)
})

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
  <v-system-bar color="surface">
    <v-icon
      :icon="mdiCogOutline"
      variant="plain"

      @click="openOptionsPage"
    />
  </v-system-bar>
</template>
