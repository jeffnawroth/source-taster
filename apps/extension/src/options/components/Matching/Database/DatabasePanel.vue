<script setup lang="ts">
import type { UIDatabaseConfig } from '@source-taster/types'
import { mdiDatabase, mdiDragVertical, mdiEye, mdiEyeOff } from '@mdi/js'
import { DEFAULT_UI_SETTINGS } from '@source-taster/types'
import { settings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Reactive copy of database settings for drag & drop
const databaseList = ref([...settings.value.databases])

// Watch for changes and update settings
watch(databaseList, (newList) => {
  settings.value.databases = newList.map((db, index) => ({
    ...db,
    priority: index + 1, // Update priorities based on order
  }))
}, { deep: true })

// Reset to defaults
function resetToDefaults() {
  databaseList.value = [...DEFAULT_UI_SETTINGS.databases]
}

// Toggle database enabled state
function toggleDatabase(database: UIDatabaseConfig) {
  database.enabled = !database.enabled
}

// Get database display name
function getDatabaseDisplayName(dbName: string): string {
  const displayNames: Record<string, string> = {
    openalex: 'OpenAlex',
    crossref: 'Crossref',
    semanticscholar: 'Semantic Scholar',
    europepmc: 'Europe PMC',
    arxiv: 'arXiv',
  }
  return displayNames[dbName] || dbName
}

// Get database description
function getDatabaseDescription(dbName: string): string {
  const descriptions: Record<string, string> = {
    openalex: t('database-openalex-description'),
    crossref: t('database-crossref-description'),
    semanticscholar: t('database-semanticscholar-description'),
    europepmc: t('database-europepmc-description'),
    arxiv: t('database-arxiv-description'),
  }
  return descriptions[dbName] || ''
}

// Color for database status
function getDatabaseColor(database: UIDatabaseConfig): string {
  return database.enabled ? 'success' : 'default'
}
</script>

<template>
  <SettingsPanelCard
    :title="t('database-settings-title')"
    :description="t('database-settings-description')"
    :subtitle="t('database-settings-subtitle')"
    :icon="mdiDatabase"
  >
    <template #actions>
      <v-btn
        size="small"
        variant="outlined"
        @click="resetToDefaults"
      >
        {{ t('reset-to-defaults') }}
      </v-btn>
    </template>

    <!-- Database List -->
    <v-container class="pa-0">
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ t('database-settings-help') }}
      </p>

      <!-- Sortable Database List -->
      <v-list class="pa-0">
        <template
          v-for="(database, index) in databaseList"
          :key="database.name"
        >
          <v-list-item
            class="pa-3 ma-1 rounded"
            :class="{ 'bg-surface-variant': !database.enabled }"
            three-line
          >
            <!-- Drag Handle -->
            <template #prepend>
              <v-icon
                :icon="mdiDragVertical"
                class="drag-handle me-2"
                color="medium-emphasis"
              />
            </template>

            <!-- Database Info -->
            <v-list-item-title class="d-flex align-center">
              <span class="text-h6 me-2">
                {{ index + 1 }}.
              </span>
              <span
                :class="{ 'text-medium-emphasis': !database.enabled }"
              >
                {{ getDatabaseDisplayName(database.name) }}
              </span>
            </v-list-item-title>

            <v-list-item-subtitle class="mt-1">
              {{ getDatabaseDescription(database.name) }}
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <!-- Priority Badge -->
                <v-chip
                  :color="getDatabaseColor(database)"
                  variant="outlined"
                  size="small"
                  class="me-2"
                >
                  {{ t('priority') }}: {{ database.priority }}
                </v-chip>

                <!-- Enable/Disable Toggle -->
                <v-btn
                  :icon="database.enabled ? mdiEye : mdiEyeOff"
                  :color="database.enabled ? 'success' : 'default'"
                  variant="text"
                  size="small"
                  @click="toggleDatabase(database)"
                />
              </div>
            </template>
          </v-list-item>

          <!-- Divider (except for last item) -->
          <v-divider
            v-if="index < databaseList.length - 1"
            class="mx-3"
          />
        </template>
      </v-list>

      <!-- Statistics -->
      <v-alert
        type="info"
        variant="tonal"
        class="mt-4"
      >
        <strong>{{ t('enabled-databases') }}:</strong>
        {{ databaseList.filter(db => db.enabled).length }} / {{ databaseList.length }}
      </v-alert>
    </v-container>
  </SettingsPanelCard>
</template>

<style scoped>
.drag-handle {
  cursor: move;
}

.v-list-item:hover .drag-handle {
  color: rgb(var(--v-theme-primary)) !important;
}

.v-list-item {
  transition: all 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
}
</style>
