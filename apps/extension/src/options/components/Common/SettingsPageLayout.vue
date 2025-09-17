<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <v-container
    style="max-width: 800px;"
  >
    <v-card
      variant="text"
      :subtitle="description"
    >
      <template #prepend>
        <v-icon size="x-large">
          {{ icon }}
        </v-icon>
      </template>
      <template #title>
        <v-card-title
          class="text-h5 font-weight-bold"
        >
          {{ title }}
        </v-card-title>
      </template>

      <v-card-text>
        <v-divider class="my-4" />
        <div
          class="mx-auto"
        >
          <slot />
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
