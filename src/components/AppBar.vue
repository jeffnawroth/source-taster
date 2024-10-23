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
    color="transparent"
    density="compact"
  >
    <!-- <template #prepend>
      <v-app-bar-nav-icon
        size="small"
        icon="mdi-book-check-outline"
      />
    </template> -->
    <template #append>
      <v-btn
        icon="mdi-github"
        href="https://github.com/jeffnawroth/source-taster"
        target="_blank"
        size="small"
        variant="plain"
      />
      <v-btn
        size="small"
        icon="mdi-theme-light-dark"
        variant="plain"
        @click="toggleTheme"
      />

      <v-btn
        size="small"
        icon="mdi-cog"
        variant="plain"

        @click="openOptionsPage"
      />
    </template>
  </v-app-bar>
</template>
