<script setup lang="ts">
import { mdiCogOutline } from '@mdi/js'
import { useTheme } from 'vuetify'
import { settings } from '@/extension/logic'

// PROPS
defineProps<{
  hideSettings?: boolean
  showNavBarIcon?: boolean
}>()

// NAVIGATION DRAWER
const drawer = defineModel()

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

// OPTIONS PAGE
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
    density="compact"
    scroll-threshold="25"
    scroll-behavior="hide"
  >
    <v-app-bar-nav-icon
      v-if="$vuetify.display.mdAndDown && showNavBarIcon"
      variant="plain"
      color="undefined"
      @click.stop="drawer = !drawer"
    />

    <v-app-bar-title>
      {{ $t('app-title') }}
    </v-app-bar-title>

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
