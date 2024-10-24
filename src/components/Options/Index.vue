<script setup lang="ts">
import DisplaySettings from './OptionCategories/DisplaySettings.vue'
import GeneralSettings from './OptionCategories/GeneralSettings.vue'
import LanguageSettings from './OptionCategories/LanguageSettings.vue'

const components = {
  GeneralSettings,
  DisplaySettings,
  LanguageSettings,
}
</script>

<template>
  <v-row>
    <v-col
      v-for="component in components"
      :key="component.name"
      cols="12"
    >
      <component :is="component" />
    </v-col>
  </v-row>
</template>
