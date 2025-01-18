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
  >
    <template #subtitle>
      <p>{{ subtitle }}</p>
    </template>
    <p> {{ `${$t('resets-in')} ${resetInterval} ${$t(intervalUnit)}` }} </p>

    <template #append>
      <v-chip
        color="primary"
        label
      >
        {{ `${count}/${maxCount}` }}
      </v-chip>
    </template>
  </v-list-item>
</template>
