import type {
  ApiAIProvider,
  ApiUserAISecretsData,
  ApiUserAISecretsDeleteData,
  ApiUserAISecretsInfoData,
  ApiUserAISecretsRequest,
} from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { UserService } from '@/extension/services/userService'
import { aiSettings } from '../logic'
import { mapApiError } from '../utils/mapApiError'

export const useUserSettingsStore = defineStore('userSettings', () => {
  // --- State ---
  const hasApiKey = ref<boolean>(false)
  const provider = ref<ApiAIProvider | undefined>(undefined)

  const isLoading = ref(false)
  const isSaving = ref(false)

  const loadError = ref<string | null>(null)
  const saveError = ref<string | null>(null)

  // --- Computed ---
  const canUseAI = computed(() => hasApiKey.value && !!provider.value)
  const providerLabel = computed(() => provider.value ?? '—')

  // --- Actions ---
  async function loadAISecretsInfo(): Promise<ApiUserAISecretsInfoData | undefined> {
    isLoading.value = true
    loadError.value = null

    const res = await UserService.getAISecretsInfo(aiSettings.value.provider)

    isLoading.value = false

    if (!res.success) {
      loadError.value = mapApiError(res)
      return
    }

    hasApiKey.value = !!res.data.hasApiKey
    provider.value = (res.data.provider as ApiAIProvider | undefined) ?? undefined

    return res.data
  }

  async function saveAISecrets(payload: ApiUserAISecretsRequest): Promise<ApiUserAISecretsData | undefined> {
    isSaving.value = true
    saveError.value = null

    const res = await UserService.saveAISecrets(payload)

    isSaving.value = false

    if (!res.success) {
      saveError.value = mapApiError(res)
      return
    }

    await loadAISecretsInfo()
    return res.data // { saved: true }
  }

  async function deleteAISecrets(): Promise<ApiUserAISecretsDeleteData | undefined> {
    isSaving.value = true
    saveError.value = null

    const res = await UserService.deleteAISecrets(aiSettings.value.provider)

    isSaving.value = false

    if (!res.success) {
      saveError.value = mapApiError(res)
      return
    }

    // Lokalen Zustand zurücksetzen
    hasApiKey.value = false
    provider.value = undefined

    return res.data // { deleted: true }
  }

  function clearErrors() {
    loadError.value = null
    saveError.value = null
  }

  // --- Exposed API ---
  return {
    // state (readonly rausgeben)
    hasApiKey: readonly(hasApiKey),
    provider: readonly(provider),
    isLoading: readonly(isLoading),
    isSaving: readonly(isSaving),
    loadError: readonly(loadError),
    saveError: readonly(saveError),

    // computed
    canUseAI,
    providerLabel,

    // actions
    loadAISecretsInfo,
    saveAISecrets,
    deleteAISecrets,
    clearErrors,
  }
})
