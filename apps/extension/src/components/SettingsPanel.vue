<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon
          :icon
          class="me-3"
        />
        <div>
          <div class="text-h6">
            {{ title }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ description }}
          </div>
        </div>
      </div>
    </v-expansion-panel-title>

    <v-expansion-panel-text>
      <v-card
        :subtitle
        flat
      >
        <v-card-text>
          <slot />
        </v-card-text>
        <v-card-actions>
          <slot name="actions" />
        </v-card-actions>
      </v-card>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
