<script setup lang="ts">
import { useAppStore } from '~/stores/app'

// App Store
const { passed, warning, failed, found } = storeToRefs(useAppStore())

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
        :class="passed > 0 ? 'text-success' : ''"
      >
        {{ `${t('passed')}: ${passed}` }}
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
