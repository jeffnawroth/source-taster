<script setup lang="ts">
import { mdiInformationOutline, mdiLightbulbOutline } from '@mdi/js'

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-tooltip
    location="left"
    max-width="400"
  >
    <template #activator="{ props: activatorProps }">
      <v-icon
        :icon="mdiInformationOutline"
        v-bind="activatorProps"
        size="large"
        class="text-medium-emphasis"
      />
    </template>

    <div class="pa-2">
      <div class="d-flex align-center mb-3">
        <v-icon
          :icon="mdiInformationOutline"
          class="mr-2"
        />
        <span class="font-weight-medium">{{ t('how-field-weights-work') }}</span>
      </div>

      <p class="text-body-2 mb-3">
        {{ t('field-weights-explanation') }}
      </p>

      <div class="d-flex align-center mb-2">
        <v-icon
          :icon="mdiLightbulbOutline"
          class="mr-2"
        />
        <span class="font-weight-medium">{{ t('practical-example') }}</span>
      </div>

      <p class="text-caption mb-2">
        <strong>{{ t('scenario') }}:</strong> {{ t('example-scenario') }}
      </p>

      <v-table
        density="compact"
        class="mb-3"
      >
        <thead>
          <tr>
            <th class="text-caption">
              {{ t('field') }}
            </th>
            <th class="text-caption">
              {{ t('weight') }}
            </th>
            <th class="text-caption">
              {{ t('impact') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-caption">
              {{ t('title') }}
            </td>
            <td class="text-caption">
              50%
            </td>
            <td class="text-caption">
              {{ t('high-impact') }}
            </td>
          </tr>
          <tr>
            <td class="text-caption">
              DOI
            </td>
            <td class="text-caption">
              30%
            </td>
            <td class="text-caption">
              {{ t('medium-impact') }}
            </td>
          </tr>
          <tr>
            <td class="text-caption">
              {{ t('authors') }}
            </td>
            <td class="text-caption">
              20%
            </td>
            <td class="text-caption">
              {{ t('low-impact') }}
            </td>
          </tr>
          <tr>
            <td class="text-caption">
              {{ t('other-fields') }}
            </td>
            <td class="text-caption">
              0%
            </td>
            <td class="text-caption">
              {{ t('no-impact') }}
            </td>
          </tr>
        </tbody>
      </v-table>

      <p class="text-caption text-medium-emphasis">
        {{ t('example-explanation') }}
      </p>
    </div>
  </v-tooltip>
</template>
