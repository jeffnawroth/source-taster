<script setup lang="ts">
// Emits
const emit = defineEmits<{
  'update:bibliography': [bibliography: string]
}>()
// Props
const bibliography = ref('')

// Data
const placeholder = 'Insert your bibliography here. For example: https://doi.org/10.1111/dome.12082'
</script>

<template>
  <v-textarea
    v-model="bibliography"
    auto-grow
    :placeholder
    hide-details
    max-rows="8"
    :rows="3"
    autofocus
    @update:model-value="emit('update:bibliography', bibliography)"
  />
</template>
