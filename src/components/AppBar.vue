<!-- eslint-disable no-console -->
<script setup lang="ts">
import { useTheme } from 'vuetify'
import browser from 'webextension-polyfill'
import { onMounted, ref } from 'vue'
import { toggleThemeOption } from '~/logic/storage'

const theme = useTheme()
const useSidePanel = ref(true) // Initial state is SidePanel enabled, Popup is disabled

// Functions

// Opens the extension options page to allow users to modify settings
function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

// Toggles between light and dark theme, saves the user preference globally
function toggleTheme() {
  // Switch to light if currently dark, or to dark if currently light
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  // Save the new theme selection for persistence
  toggleThemeOption.value = theme.global.name.value
}

// Synchronize the UI theme based on saved preference whenever it changes
watchEffect(() => {
  theme.global.name.value = toggleThemeOption.value
})

// Toggle between SidePanel and Popup views, depending on the current state
async function toggleView() {
  console.log('Switching between Popup and SidePanel')

  try {
    // Request the background script to toggle the current view
    await browser.runtime.sendMessage({ action: 'toggleView' })
    // Update the state to reflect the change locally
    useSidePanel.value = !useSidePanel.value
    console.log('Switched view: SidePanel:', useSidePanel.value)

    // If SidePanel is disabled, stop execution
    if (!useSidePanel.value)
      return

    // Fetch the currently active tab in the current window
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length === 0 || !chrome.sidePanel)
      return // Exit if no active tab or the SidePanel is unavailable

    // Retrieve tabId and windowId of the active tab
    const tabId = tabs[0].id
    const windowId = tabs[0].windowId
    if (tabId === undefined || windowId === undefined)
      return // Exit if either tabId or windowId is undefined

    // Enable the SidePanel and set the correct content path
    await chrome.sidePanel.setOptions({ enabled: true, tabId, path: 'dist/sidepanel/index.html' })
    // Open the SidePanel for the current tab
    await chrome.sidePanel.open({ tabId, windowId })
    console.log('SidePanel opened')

    // Since the SidePanel is open, close the current Popup window to avoid redundancy
    window.close()
  }
  catch (error) {
    // Log errors related to switching views (SidePanel/Popup), useful for debugging
    console.error('Error switching views:', error)
  }
}

let stateInitialized = false // Flag to ensure state is fetched only once

// When the component is mounted, check if we need to initialize the SidePanel state
onMounted(async () => {
  console.log('Component mounted, checking if state needs to be initialized')

  // If state has already been initialized, skip
  if (!stateInitialized) {
    try {
      console.log('Requesting state for the first time...')
      const response = await browser.runtime.sendMessage({ action: 'getState' }) as { useSidePanel: boolean }

      // Update local state if the SidePanel state has changed
      if (useSidePanel.value !== response.useSidePanel) {
        useSidePanel.value = response.useSidePanel
        console.log('State updated:', useSidePanel.value)
      }

      // Mark state as initialized to avoid further requests
      stateInitialized = true
    }
    catch (error) {
      // Log errors encountered while fetching the initial state
      console.error('Error getting state:', error)
    }
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
        id="toggleView"
        icon="mdi-toggle-switch"
        @click="toggleView"
      />
      <v-btn
        icon="mdi-cog"
        @click="openOptionsPage"
      />
    </template>
  </v-app-bar>
</template>
