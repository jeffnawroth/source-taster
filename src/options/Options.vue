<script setup lang="ts">
import { useLocale } from 'vuetify/lib/framework.mjs'
import { localeOption } from '~/logic/storage'

// i18n
const { locale } = useI18n()
const { current } = useLocale()

// Model
const drawer = ref(true)

// Watchers
watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})
</script>

<template>
  <v-app>
    <AppBar
      v-model="drawer"
      hide-settings
      show-nav-bar-icon
    />
    <NavigationBar v-model="drawer" />
    <v-main>
      <RouterView />
    </v-main>
    <Footer />
  </v-app>
</template>
