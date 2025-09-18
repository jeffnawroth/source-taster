<script setup lang="ts">
import { mdiKeyOutline } from '@mdi/js'
import AutoDismissAlert from '@/extension/components/UI/AutoDismissAlert.vue'
import { settings } from '@/extension/logic'
import { useUserSettingsStore } from '@/extension/stores/userStore'
import APIKeyInput from './APIKeyInput.vue'
import APIKeyLink from './APIKeyLink.vue'
import APIKeyTestBtn from './APIKeyTestBtn.vue'

const apiKey = ref<string>('')

const user = useUserSettingsStore()
const { t } = useI18n()

const alertType = ref<'success' | 'error'>('success')
const alertMessage = ref<string | null>(null)

// Methoden für Save/Delete aus dem Store
async function handleSave() {
  const res = await user.saveAISecrets({ provider: settings.value.ai.provider, apiKey: apiKey.value })
  alertType.value = res ? 'success' : 'error'
  alertMessage.value = res ? t('ai-settings-saved') : (user.saveError ?? t('ai-settings-save-error'))
}

async function handleDelete() {
  const res = await user.deleteAISecrets()
  alertType.value = res ? 'success' : 'error'
  alertMessage.value = res ? t('ai-settings-deleted') : (user.saveError ?? t('ai-settings-delete-error'))
}

function handleTest(result: { ok: boolean, messageKey: string }) {
  alertType.value = result.ok ? 'success' : 'error'
  alertMessage.value = t(result.messageKey)
}

function reset() {
  apiKey.value = ''
  alertMessage.value = null
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
        variant="tonal"
        :loading="user.isSaving"
        color="primary"
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
    <AutoDismissAlert
      v-if="alertMessage"
      v-model="alertMessage"
      :type="alertType"
      variant="tonal"
      density="compact"
      class="mb-3"
    >
      {{ alertMessage }}
    </AutoDismissAlert>
    <APIKeyLink />
  </v-card>
</template>
