<script setup lang="ts">
import Display from './OptionCategories/Display.vue'
import General from './OptionCategories/General.vue'
import Language from './OptionCategories/Language.vue'
</script>

<template>
  <v-row>
    <v-col cols="12">
      <General />
    </v-col>
    <v-col cols="12">
      <Display />
    </v-col>
    <v-col cols="12">
      <Language />
    </v-col>
  </v-row>
</template>
