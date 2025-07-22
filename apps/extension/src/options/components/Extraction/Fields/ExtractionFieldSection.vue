<script setup lang="ts">
// PROPS
defineProps<{
  title: string
  icon: string
  fields: string[]
  count: number
  totalFields: number
  color: string
}>()

// MODEL
const extractionSettings = defineModel<{
  enabledFields: Record<string, boolean>
}>({ required: true })
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon
          :icon
          class="mr-2"
        />
        {{ title }}
        <v-chip
          size="small"
          class="ml-2"
          :color
        >
          {{ count }}/{{ totalFields }}
        </v-chip>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-row>
        <v-col
          v-for="field in fields"
          :key="field"
          cols="auto"
        >
          <FieldCheckbox
            v-model="extractionSettings.enabledFields[field]"
            :field
          />
        </v-col>
      </v-row>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
