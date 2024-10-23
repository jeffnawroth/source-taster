<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify/lib/framework.mjs'
import { localeOption } from '~/logic/storage'
import Index from './OptionCagegories/Index.vue'

// i18n
const { locale } = useI18n()
const { current } = useLocale()

// Watchers
watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})
</script>

<template>
  <v-app>
    <AppBar />
    <v-main>
      <v-container>
        <Index />
      </v-container>
    </v-main>
  </v-app>
</template>
