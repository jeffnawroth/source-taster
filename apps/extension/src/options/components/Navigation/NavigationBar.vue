<script setup lang="ts">
import { mdiCogOutline, mdiEarth, mdiHelpCircleOutline, mdiInformationOutline, mdiPalette, mdiRobotOutline } from '@mdi/js'

// I18n
const { t } = useI18n()

// Model
const drawer = defineModel<boolean>()

// Data
const items = ref([
  { prependIcon: mdiCogOutline, title: computed(() => t('general')), to: '/' },
  { prependIcon: mdiPalette, title: computed(() => t('appearance')), to: '/appearance' },
  { prependIcon: mdiEarth, title: computed(() => t('language')), to: '/language' },
  { prependIcon: mdiRobotOutline, title: computed(() => t('ai')), to: '/ai' },
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
