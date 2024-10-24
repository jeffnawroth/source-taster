<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { useClipboard } from '@vueuse/core'
import { useAppStore } from '~/stores/app'

// Props
const { work } = defineProps<{
  work: HttpResponse<Item<Work>>
  index: number
}>()

const { dois } = storeToRefs(useAppStore())

// I18n
const { t } = useI18n()

const { copy, copied } = useClipboard()

// Functions

// Opens the work in a new tab
function openWork(work: HttpResponse<Item<Work>>) {
  if (work.ok && work.content?.message.URL) {
    const url = work.content.message.URL
    window.open(url, '_blank')
  }
  else if (work.ok) {
    const url = work.url
    window.open(url, '_blank')
  }
  else {
    console.error('Invalid URL or DOI not found:', work)
  }
}
</script>

<template>
  <v-list-item
    rounded="lg"
    :color="work.ok && work.content ? 'success' : work.ok ? 'warning' : 'error'"
    active
    class="my-1"
  >
    <template #prepend>
      <v-tooltip>
        <template #activator="{ props: tooltipProps }">
          <v-icon
            v-bind="tooltipProps"
            size="x-large"
            :icon="work.ok && work.content ? 'mdi-check-circle-outline' : work.ok ? 'mdi-alert-circle-outline' : 'mdi-close-circle-outline'"
          />
        </template>
        <template v-if="work.ok && work.content">
          <p>{{ t('doi-found-metadata') }}</p>
        </template>
        <template v-else-if="work.ok">
          <!-- <p>The DOI was found but the metadata <span class="font-weight-bold">could not</span> be retrieved from the Crossref-Database.</p> -->
          <p>{{ t('doi-found-no-metadata') }}</p>
        </template>
        <template v-else>
          <div class="ma-1">
            <p>{{ t('doi-not-found') }}</p>
            <!-- <p>The DOI was <span class="font-weight-bold">not</span> found. Possible reasons are:</p> -->
            <ul>
              <li>{{ t('doi-incorrect') }}</li>
              <li>{{ t('doi-incorrect-extraced') }}</li>
              <li>{{ t('doi-not-activated') }}</li>
            </ul>
          </div>
        </template>
      </v-tooltip>
    </template>

    <v-list-item-title>
      {{ work.ok && work.content ? work.content.message.title[0] : dois[index] }}
    </v-list-item-title>

    <v-list-item-subtitle>
      {{ work.ok && work.content ? work.content?.message.DOI : '' }}
    </v-list-item-subtitle>

    <template #append>
      <v-tooltip>
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            density="compact"
            icon="mdi-content-copy"
            variant="plain"
            size="large"
            @click="copy(dois[index])"
          />
        </template>
        {{ copied ? `${t('doi-copied')}!` : t('copy-doi') }}
      </v-tooltip>
      <v-tooltip v-if="work.ok">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            density="compact"
            icon="mdi-open-in-new"
            variant="plain"
            size="large"
            @click="() => openWork(work)"
          />
        </template>
        {{ t('open-work') }}
      </v-tooltip>
    </template>
  </v-list-item>
</template>
