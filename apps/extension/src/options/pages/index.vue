<script setup lang="ts">
import { useAutoImport } from '@/extension/logic'
import { mdiAutoUpload, mdiInformationOutline } from '@mdi/js'

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
      :title="t('auto-import-dois')"
      :prepend-icon="mdiAutoUpload"

      @click="useAutoImport = !useAutoImport"
    >
      <template #subtitle>
        <p>{{ t('auto-import-dois-description') }}</p>
        <p class="text-medium-emphasis mt-1">
          <v-icon
            :icon="mdiInformationOutline"
            size="small"
          />
          {{ t('auto-import-dois-info') }}
        </p>
      </template>
      <OptionSwitch
        v-model="useAutoImport"
      />
    </OptionListItem>
  </v-container>
</template>
