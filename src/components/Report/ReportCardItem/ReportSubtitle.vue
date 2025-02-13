<script setup lang="ts">
import { useWorkStore } from '~/stores/work'

// App Store
const { valid, invalid, found } = storeToRefs(useWorkStore())

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
        :class="invalid > 0 ? 'text-error' : ''"
      >
        {{ `${t('invalid')}: ${invalid}` }}
      </span>
    </div>
  </div>
</template>
