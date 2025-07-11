<script setup lang="ts">
import { mdiEarth, mdiHelpCircleOutline, mdiInformationOutline, mdiPalette, mdiTune } from '@mdi/js'

// I18n
const { t } = useI18n()

// Model
const drawer = defineModel<boolean>()

// Data
const items = ref([
  { prependIcon: mdiPalette, title: computed(() => t('appearance')), to: '/' },
  { prependIcon: mdiEarth, title: computed(() => t('language')), to: '/language' },
  { prependIcon: mdiTune, title: computed(() => t('expert-settings')), to: '/expert-settings' },
  { prependIcon: mdiInformationOutline, title: computed(() => t('about')), to: '/about' },
  { prependIcon: mdiHelpCircleOutline, title: computed(() => t('help')), to: '/help' },
])
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    floating
  >
    <v-list
      nav
    >
      <v-list-item
        v-for="item in items"
        :key="item.to"
        v-bind="item"
        replace
      />
    </v-list>
  </v-navigation-drawer>
</template>
