<script setup lang="ts">
interface Props {
  title: string
  weight: number
  showAlert?: boolean
  alertText?: string
}

withDefaults(defineProps<Props>(), {
  showAlert: false,
  alertText: '',
})
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <!-- <v-icon
          :icon
          class="mr-2"
        /> -->
        {{ title }}
        <v-chip
          size="small"
          class="ml-2"
        >
          {{ weight }} %
        </v-chip>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-alert
        v-if="showAlert"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ alertText }}
      </v-alert>

      <slot />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
