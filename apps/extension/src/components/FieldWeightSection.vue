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
      {{ title }} ({{ weight }}%)
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <div class="py-2">
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
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
