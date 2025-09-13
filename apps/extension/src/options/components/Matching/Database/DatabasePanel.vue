<script setup lang="ts">
import type { UISearchDatabaseConfig } from '@source-taster/types'
import { mdiDatabase, mdiDragVertical, mdiEye, mdiEyeOff } from '@mdi/js'
import { DEFAULT_UI_SETTINGS } from '@source-taster/types'
import { settings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Reset to defaults
function resetToDefaults() {
  settings.value.search.databases = [...DEFAULT_UI_SETTINGS.search.databases]
}

// Toggle database enabled state
function toggleDatabase(database: UISearchDatabaseConfig) {
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
function getDatabaseColor(database: UISearchDatabaseConfig): string {
  return database.enabled ? 'success' : 'default'
}
</script>

<template>
  <SettingsPanel
    :title="t('database-settings-title')"
    :description="t('database-settings-description')"
    :subtitle="t('database-settings-subtitle')"
    :icon="mdiDatabase"
  >
    <template #actions>
      <ResetButton @click="resetToDefaults" />
    </template>

    <p class="text-body-2 text-medium-emphasis mb-4">
      {{ t('database-settings-help') }}
    </p>

    <!-- Sortable Database List -->
    <v-list>
      <template
        v-for="(database, index) in settings.search.databases"
        :key="database.id"
      >
        <v-list-item
          :title="`${index + 1}. ${getDatabaseDisplayName(database.name)}`"
          :subtitle="getDatabaseDescription(database.name)"
          lines="two"
        >
          <template #prepend>
            <v-icon
              :icon="mdiDragVertical"
              color="medium-emphasis"
            />
          </template>

          <template #append>
            <div class="d-flex align-center">
              <!-- Priority Badge -->
              <v-chip
                :color="getDatabaseColor(database)"
                variant="outlined"
                size="small"
                class="me-2"
                :text="`${t('priority')}: ${database.priority}`"
              />

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
      </template>
    </v-list>
  </SettingsPanel>
</template>
