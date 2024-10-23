<script setup lang="ts">
import { localeOption } from '~/logic'

// I18n
const { t } = useI18n()

// Data
const languages = ref([
  { locale: 'de', name: 'German' },
  { locale: 'en', name: 'English' },
])
</script>

<template>
  <v-card>
    <v-list>
      <!-- Spracheinstellungen -->
      <v-list-subheader>{{ t('language') }}</v-list-subheader>

      <v-list-item
        :title="t('language')"
        :subtitle="t('language-option-description')"
      >
        <template #prepend>
          <v-list-item-action start>
            <v-select
              v-model="localeOption"
              :items="languages"
              :item-title="(option) => t(option.name.toLocaleLowerCase())"
              item-value="locale"
              hide-details
              density="compact"
              variant="solo"
              flat
            />
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
