<script setup lang="ts">
const search = defineModel({ default: '' })
</script>

<template>
  <v-text-field
    v-model.trim="search"
    density="compact"
    hide-details
    variant="solo-filled"
    :placeholder="`${$t('search')}...`"
    flat
    clearable
  />
</template>
