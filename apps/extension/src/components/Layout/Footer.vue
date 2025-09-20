<script setup lang="ts">
// DATE
const fullYear = computed(() => new Date().getFullYear())
const { t } = useI18n()
</script>

<template>
  <v-footer
    tile
    class="text-center d-flex flex-column"
    app
  >
    <div>
      {{ fullYear }} — <strong>{{ t('app-title') }}</strong>
    </div>
  </v-footer>
</template>
