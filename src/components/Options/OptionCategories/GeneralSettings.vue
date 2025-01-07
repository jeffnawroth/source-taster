<script setup lang="ts">
import { mdiAutoUpload, mdiInformationOutline } from '@mdi/js'
import { autoImportOption } from '~/logic'

// i18n
const { t } = useI18n()
</script>

<template>
  <OptionCategory
    :subheader="t('general')"
  >
    <OptionListItem
      :title="t('auto-import-dois')"
      :prepend-icon="mdiAutoUpload"

      @click="autoImportOption = !autoImportOption"
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
        v-model="autoImportOption"
      />
    </OptionListItem>
  </OptionCategory>
</template>
