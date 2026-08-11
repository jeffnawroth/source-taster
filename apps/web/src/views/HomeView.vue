<script setup lang="ts">
import type { ApiAIProvider } from '@source-taster/types'
import { PROVIDER_MODELS } from '@source-taster/types'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useExtractionStore } from '@/stores/extraction'
import { extractTextFromPdfFile } from '@/utils/pdfUtils'

const router = useRouter()
const extraction = useExtractionStore()

const inputText = ref('')
const useAi = ref(false)
const aiSettings = ref<{ provider: ApiAIProvider }>({ provider: 'openai' })

const providers: { label: string, value: ApiAIProvider }[] = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic (Claude)', value: 'anthropic' },
  { label: 'Google (Gemini)', value: 'google' },
  { label: 'DeepSeek', value: 'deepseek' },
]

async function onPdf(file: File | null) {
  if (!file)
    return
  const text = await extractTextFromPdfFile(file)
  if (text)
    inputText.value = text
}

async function onExtract() {
  const ai = useAi.value
    ? { provider: aiSettings.value.provider, model: PROVIDER_MODELS[aiSettings.value.provider][0] }
    : undefined
  await extraction.extract(inputText.value, ai)
  if (!extraction.error)
    router.push('/results')
}
</script>

<template>
  <v-row justify="center">
    <v-col cols="12" md="8">
      <h1 class="text-h4 mb-2">
        {{ $t('home.title') }}
      </h1>
      <p class="text-body-1 mb-6">
        {{ $t('home.subtitle') }}
      </p>

      <v-alert v-if="extraction.error" type="error" class="mb-4" closable @click:close="extraction.error = null">
        {{ extraction.error }}
      </v-alert>

      <v-textarea
        v-model="inputText"
        :label="$t('home.textareaLabel')"
        variant="outlined"
        auto-grow
        rows="8"
        class="mb-4"
      />

      <v-file-input
        :label="$t('home.pdfLabel')"
        accept="application/pdf"
        prepend-icon="mdi-file-pdf-box"
        class="mb-4"
        @change="onPdf"
      />

      <v-switch v-model="useAi" :label="$t('home.useAiLabel')" class="mb-2" />
      <div v-if="useAi" class="mb-4">
        <v-select v-model="aiSettings.provider" :items="providers" item-title="label" item-value="value" label="Provider" />
      </div>

      <v-btn
        color="primary"
        size="large"
        :loading="extraction.loading"
        :disabled="!inputText.trim()"
        @click="onExtract"
      >
        {{ $t('home.extractButton') }}
      </v-btn>
    </v-col>
  </v-row>
</template>
