<script setup lang="ts">
import type { CSLVariable } from '@source-taster/types'
import { settings } from '@/extension/logic'

// PROPS
defineProps<{
  title: string
  icon: string
  fields: CSLVariable[]
  count: number
  totalFields: number
  color: string
}>()
</script>

<template>
  <v-expansion-panel elevation="0">
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon
          :icon
          class="mr-2"
        />
        {{ title }}
        <v-chip
          class="ml-2"
          :color
        >
          {{ count }}/{{ totalFields }}
        </v-chip>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-selection-control-group
        v-model="settings.extract.extractionConfig.variables"
      >
        <v-row
          dense
          no-gutters
        >
          <v-col
            v-for="field in fields"
            :key="field"
            :cols="4"
          >
            <v-tooltip
              location="top"
            >
              <template #activator="{ props }">
                <v-checkbox
                  v-bind="props"
                  :label="$t(field)"
                  :value="field"
                />
              </template>
              {{ $t(`tooltip-${field}`) }}
            </v-tooltip>
          </v-col>
        </v-row>
      </v-selection-control-group>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
