<script setup lang="ts">
import { autoImportOption } from '~/logic'

// i18n
const { t } = useI18n()
</script>

<template>
  <v-card flat>
    <v-list
      lines="two"
      subheader
    >
      <!-- Allgemeine Einstellungen -->
      <v-list-subheader>{{ t('general') }}</v-list-subheader>

      <v-list-item
        :subtitle="t('auto-import-dois-description')"
        :title="t('auto-import-dois')"
        @click="autoImportOption = !autoImportOption"
      >
        <template #prepend>
          <v-list-item-action start>
            <v-checkbox-btn
              v-model="autoImportOption"
              color="primary"
            />
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
