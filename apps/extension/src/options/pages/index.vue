<script setup lang="ts">
import { mdiAutoUpload, mdiInformationOutline, mdiTextBoxSearchOutline } from '@mdi/js'
import { useAutoCheckReferences, useAutoImport } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-container>
    <p class="text-h5 font-weight-bold mb-3">
      {{ t('general') }}
    </p>

    <p class="text-body-2 text-medium-emphasis">
      {{ t('general-description') }}
    </p>

    <v-divider class="my-4" />

    <OptionListItem
      :title="t('auto-import-references')"
      :prepend-icon="mdiAutoUpload"

      @click="useAutoImport = !useAutoImport"
    >
      <template #subtitle>
        <p>{{ t('auto-import-references-description') }}</p>
        <p class="text-medium-emphasis mt-1">
          <v-icon
            :icon="mdiInformationOutline"
            size="small"
          />
          {{ t('auto-import-references-info') }}
        </p>
      </template>
      <OptionSwitch
        v-model="useAutoImport"
      />
    </OptionListItem>
    <OptionListItem
      :title="t('auto-references-check')"
      :prepend-icon="mdiTextBoxSearchOutline"

      @click="useAutoCheckReferences = !useAutoCheckReferences"
    >
      <template #subtitle>
        <p>{{ t('auto-check-references-description') }}</p>
        <p class="text-medium-emphasis mt-1">
          <v-icon
            :icon="mdiInformationOutline"
            size="small"
          />
          {{ t('auto-check-references-info') }}
        </p>
      </template>
      <OptionSwitch
        v-model="useAutoCheckReferences"
      />
    </OptionListItem>
  </v-container>
</template>
