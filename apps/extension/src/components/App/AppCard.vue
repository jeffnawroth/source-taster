<script setup lang="ts">
import ReportCard from '@/extension/components/Report/ReportCard.vue'
import { localeOption } from '@/extension/logic/storage'
import { useLocale } from 'vuetify'
import { VDivider } from 'vuetify/lib/components/index.mjs'
import InputCard from '../Input/InputCard.vue'

// LOCALE
const { locale } = useI18n()
const { current } = useLocale()

watchEffect(() => {
  locale.value = localeOption.value
  current.value = localeOption.value
})

// COMPONENTS
const components = [
  InputCard,
  VDivider,
  ReportCard,
]
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
