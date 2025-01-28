<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  resetInterval: number
  intervalUnit: 'hr' | 'min' | 'sec'
  maxCount: number
  count: number
}>()
</script>

<template>
  <v-list-item
    :title
    :subtitle
  >
    <p class="font-weight-light text-medium-emphasis">
      {{ `${$t('resets-in')} ${resetInterval} ${$t(intervalUnit)}` }}
    </p>

    <template
      #append
    >
      <v-chip
        variant="text"
        :text="`${count}/${maxCount}`"
      />
    </template>
  </v-list-item>
</template>

<style>
</style>
