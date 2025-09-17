<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()
</script>

<template>
  <v-card
    flat
    :title
    :subtitle
    variant="text"
  >
    <v-card-text>
      <v-expansion-panels
        elevation="0"
        multiple
      >
        <slot />
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>
