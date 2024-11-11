<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'

// App Store
const { valid, warning, failed, found } = storeToRefs(useDoiStore())

// I18n
const { t } = useI18n()
</script>

<template>
  <div>
    <div class="text-wrap">
      <span class="mx-1">
        {{ `${t('found')}: ${found}` }}
      </span>
      <span
        class=" mx-1"
        :class="valid > 0 ? 'text-success' : ''"
      >
        {{ `${t('valid')}: ${valid}` }}
      </span>
      <span
        class="mx-1"
        :class="warning > 0 ? 'text-warning' : ''"
      >
        {{ `${t('warning')}: ${warning}` }}
      </span>
      <span
        class="mx-1"
        :class="failed > 0 ? 'text-error' : ''"
      >
        {{ `${t('failed')}: ${failed}` }}
      </span>
    </div>
  </div>
</template>
