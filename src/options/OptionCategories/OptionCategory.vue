<script setup lang="ts">
defineProps<{
  subheader: string
}>()
</script>

<template>
  <v-card flat>
    <v-list
      lines="two"
      subheader
    >
      <v-list-subheader>{{ subheader }}</v-list-subheader>
      <slot />
    </v-list>
  </v-card>
</template>
