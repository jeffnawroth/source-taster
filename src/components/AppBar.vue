<script setup lang="ts">
import { useTheme } from 'vuetify'
import { toggleThemeOption } from '~/logic/storage'

const theme = useTheme()

// Functions
function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  toggleThemeOption.value = theme.global.name.value
}

watchEffect(() => {
  theme.global.name.value = toggleThemeOption.value
})
</script>

<template>
  <v-app-bar
    app
    flat
    title="The Source Taster"
  >
    <template #append>
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
