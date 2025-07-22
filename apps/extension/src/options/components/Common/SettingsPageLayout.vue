<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <v-container>
    <v-card
      variant="text"
      :prepend-icon="icon"
      :subtitle="description"
    >
      <template #title>
        <v-card-title class="text-h5 font-weight-bold">
          {{ title }}
        </v-card-title>
      </template>

      <v-card-text>
        <v-divider class="my-4" />
        <slot />
      </v-card-text>
    </v-card>
  </v-container>
</template>
