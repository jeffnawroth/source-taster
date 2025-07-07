<script setup lang="ts">
// DATE
const fullYear = computed(() => new Date().getFullYear())
</script>

<template>
  <v-footer
    app
    tile
  >
    <v-row
      justify="center"
      no-gutters
    >
      <v-col
        class="text-center"
        cols="12"
      >
        {{ fullYear }} — <strong>{{ $t('app-title') }}</strong>
      </v-col>
    </v-row>
  </v-footer>
</template>
