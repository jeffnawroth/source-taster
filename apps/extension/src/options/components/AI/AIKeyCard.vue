<script setup lang="ts">
import { mdiKeyOutline } from '@mdi/js'
import { settings } from '@/extension/logic'
import { useUserSettingsStore } from '@/extension/stores/userStore'
import APIKeyInput from './APIKeyInput.vue'
import APIKeyLink from './APIKeyLink.vue'
import APIKeyTestBtn from './APIKeyTestBtn.vue'

const apiKey = ref<string>('')

const user = useUserSettingsStore()
const { t } = useI18n()

// Einheitlicher Alert-State
const alert = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Methoden für Save/Delete aus dem Store
async function handleSave() {
  const res = await user.saveAISecrets({ provider: settings.value.ai.provider, apiKey: apiKey.value })
  alert.value = res
    ? { type: 'success', message: t('ai-settings-saved') }
    : { type: 'error', message: user.saveError ?? t('ai-settings-save-error') }
}

async function handleDelete() {
  const res = await user.deleteAISecrets()
  alert.value = res
    ? { type: 'success', message: t('ai-settings-deleted') }
    : { type: 'error', message: user.saveError ?? t('ai-settings-delete-error') }
}

function handleTest(result: { ok: boolean, messageKey: string }) {
  alert.value = {
    type: result.ok ? 'success' : 'error',
    message: t(result.messageKey),
  }
}

function reset() {
  apiKey.value = ''
  alert.value = null
  user.clearErrors()
}

onMounted(() => {
  reset()
  user.loadAISecretsInfo()
})

watch(() => settings.value.ai.provider, () => {
  reset()
  user.loadAISecretsInfo()
})
</script>

<template>
  <v-card
    variant="text"
    density="compact"
  >
    <template #prepend>
      <v-icon :icon="mdiKeyOutline" />
    </template>
    <template #title>
      {{ t('ai-settings-api-key-label') }}
    </template>

    <v-card-text>
      <APIKeyInput
        v-model="apiKey"
        :api-key-error="user.saveError"
      />
    </v-card-text>

    <v-card-actions>
      <v-btn
        color="primary"
        variant="tonal"
        :loading="user.isSaving"
        :disabled="apiKey.trim().length === 0 || user.isSaving"
        @click="handleSave"
      >
        {{ t('save') }}
      </v-btn>
      <v-btn
        color="error"
        variant="tonal"
        :loading="user.isSaving"
        :disabled="!user.hasApiKey || user.isSaving"
        @click="handleDelete"
      >
        {{ t('delete') }}
      </v-btn>

      <APIKeyTestBtn
        :has-key="user.hasApiKey"
        @tested="handleTest"
      />
    </v-card-actions>
    <v-alert
      v-if="alert"
      :type="alert.type"
      variant="tonal"
      density="compact"
      class="mb-3"
      closable
      @click:close="alert = null"
    >
      {{ alert.message }}
    </v-alert>
    <APIKeyLink />
  </v-card>
</template>
