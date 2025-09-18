<script setup lang="ts">
import { mdiEye, mdiEyeOff } from '@mdi/js'

defineProps<{
  apiKeyError?: string | null
}>()

const modelValue = defineModel<string>({ required: true })

const { t } = useI18n()
const showApiKey = ref(false)
</script>

<template>
  <v-text-field
    v-model="modelValue"
    :placeholder="t('ai-settings-api-key-placeholder')"
    :type="showApiKey ? 'text' : 'password'"
    :error-messages="apiKeyError"
    density="compact"
    variant="solo-filled"
    flat
    clearable
    class="mb-3"
    @click:clear="modelValue = ''"
  >
    <template #append-inner>
      <v-icon
        :icon="showApiKey ? mdiEyeOff : mdiEye"
        variant="text"
        size="small"
        @click="showApiKey = !showApiKey"
      />
    </template>
  </v-text-field>
</template>
