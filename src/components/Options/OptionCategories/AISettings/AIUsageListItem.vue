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

    <template #append>
      <v-chip
        label
      >
        {{ `${count}/${maxCount}` }}
      </v-chip>
    </template>
  </v-list-item>
</template>
