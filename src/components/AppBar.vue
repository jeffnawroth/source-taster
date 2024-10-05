<!-- eslint-disable no-console -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { toggleThemeOption } from '~/logic/storage'

const theme = useTheme()

// Function to open the options page
function openOptionsPage() {
  // Check if the Chrome API is available (for Chrome-based browsers)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
      .then(() => {
        console.log('Options page opened successfully')
      })
      .catch((error: any) => {
        console.error('Failed to open options page with Chrome API:', error)
      })
  }
  // Check if the browser API is available (for Firefox-based browsers)
  else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage()
      .then(() => {
        console.log('Options page opened successfully')
      })
      .catch((error) => {
        console.error('Failed to open options page with Browser API:', error)
      })
  }
  else {
    console.error('Neither browser.runtime.openOptionsPage() nor chrome.runtime.openOptionsPage() is supported.')
  }
}

// Function to toggle between light and dark theme
function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  toggleThemeOption.value = theme.global.name.value
}

// Watcher to update the theme based on the stored toggle option
watchEffect(() => {
  theme.global.name.value = toggleThemeOption.value
})

// Ensure that the browser or chrome API is available after the component is mounted
onMounted(() => {
  if (typeof chrome !== 'undefined') {
    console.log('Chrome API available.')
  }
  else if (typeof browser !== 'undefined') {
    console.log('Browser API available.')
  }
  else {
    console.error('Neither Chrome nor Browser API is available.')
  }
})
</script>

<template>
  <v-app-bar
    app
    flat
    title="The Source Taster"
    density="compact"
  >
    <template #append>
      <v-btn
        icon="mdi-github"
        href="https://github.com/jeffnawroth/source-taster"
        target="_blank"
      />
      <v-btn
        icon="mdi-theme-light-dark"
        @click="toggleTheme"
      />

      <v-btn
        icon="mdi-cog"
        @click="openOptionsPage"
      />
    </template>
  </v-app-bar>
</template>
