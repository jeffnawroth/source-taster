<script setup lang="ts">
import { VDivider } from 'vuetify/lib/components/index.mjs'
import { useLocale } from 'vuetify/lib/framework.mjs'

import ReportCard from '~/components/Report/ReportCard.vue'
import { localeOption } from '~/logic/storage'
import InputCard from '../Input/InputCard.vue'

const { locale } = useI18n()
const { current } = useLocale()

const components = [
  InputCard,
  VDivider,
  ReportCard,
]

// Watchers
watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})
</script>

<template>
  <v-card
    flat
  >
    <v-card-text>
      <v-row>
        <v-col
          v-for="component in components"
          :key="component.name"
          cols="12"
        >
          <component :is="component" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
