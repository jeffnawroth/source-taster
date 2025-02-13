<script setup lang="ts">
import { useDoiStore } from '~/stores/doi'
import { useWorkStore } from '~/stores/work'

// App Store
const { valid, invalid } = storeToRefs(useWorkStore())

// FOUND DOIs
const { extractedDois } = storeToRefs(useDoiStore())

// I18n
const { t } = useI18n()
</script>

<template>
  <div>
    <div class="text-wrap">
      <span class="mx-1">
        {{ `${t('found')}: ${extractedDois.length}` }}
      </span>
      <span
        class=" mx-1"
        :class="valid > 0 ? 'text-success' : ''"
      >
        {{ `${t('valid')}: ${valid}` }}
      </span>
      <span
        class="mx-1"
        :class="invalid > 0 ? 'text-error' : ''"
      >
        {{ `${t('invalid')}: ${invalid}` }}
      </span>
    </div>
  </div>
</template>
