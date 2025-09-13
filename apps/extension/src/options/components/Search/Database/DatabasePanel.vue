<script setup lang="ts">
import type { UISearchDatabaseConfig } from '@source-taster/types'
import { mdiDragVertical, mdiEye, mdiEyeOff } from '@mdi/js'
import { moveArrayElement, useSortable } from '@vueuse/integrations/useSortable'
import { settings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

const el = useTemplateRef<HTMLElement>('el')

const databases = computed({
  get: () => settings.value.search.databases,
  set: v => (settings.value.search.databases = v),
})

useSortable(el, databases, {
  animation: 150,
  onUpdate: (e: any) => {
    // do something
    moveArrayElement(databases, e.oldIndex, e.newIndex, e)
    // nextTick required here as moveArrayElement is executed in a microtask
    // so we need to wait until the next tick until that is finished.
    nextTick(() => {
      databases.value = databases.value.map((db, i) => ({ ...db, priority: i + 1 }))
    })
  },
})

// Reset to defaults
// function resetToDefaults() {
//   databases.value = [...DEFAULT_UI_SETTINGS.search.databases]
// }

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
  <!-- <SettingsPanel
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
    </p> -->

  <!-- Sortable Database List -->
  <v-list
    ref="el"
  >
    <v-list-item
      v-for="(database) in databases"
      :key="database.id"
      :title="getDatabaseDisplayName(database.name)"
      :subtitle="getDatabaseDescription(database.name)"
      lines="two"
      class="cursor-grab ma-2"
      :color="getDatabaseColor(database)"
      :active="database.enabled"
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
            variant="outlined"
            size="small"
            class="me-2"
            :text="`${t('priority')}: ${database.priority}`"
          />

          <v-btn
            :icon="database.enabled ? mdiEye : mdiEyeOff"
            variant="text"
            size="small"
            @click="toggleDatabase(database)"
          />
        </div>
      </template>
    </v-list-item>
  </v-list>
  <!-- </SettingsPanel> -->
</template>

<style scoped>
.with-separator {
  border-bottom: 1px solid var(--v-theme-surface-variant);
}
.no-separator {
  border-bottom: 0;
}
</style>
