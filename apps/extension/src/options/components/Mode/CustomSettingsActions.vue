<script setup lang="ts">
export interface PresetButton {
  label: string
  icon: string
  onClick: () => void
}

defineProps<{
  presetButtons: PresetButton[]
}>()
</script>

<template>
  <v-card-actions>
    <v-row
      dense
    >
      <v-col
        v-for="preset in presetButtons"
        :key="preset.label"
        cols="6"
      >
        <v-btn
          variant="tonal"
          color="primary"
          block
          @click="preset.onClick"
        >
          <v-icon
            :icon="preset.icon"
            start
          />
          {{ preset.label }}
        </v-btn>
      </v-col>
    </v-row>
  </v-card-actions>
</template>
