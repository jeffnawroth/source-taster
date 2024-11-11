<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'

// App Store
const { valid, incomplete, failed, found } = storeToRefs(useDoiStore())

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
        :class="incomplete > 0 ? 'text-warning' : ''"
      >
        {{ `${t('incomplete')}: ${incomplete}` }}
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
