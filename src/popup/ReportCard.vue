<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { CrossrefClient } from '@jamesgopsill/crossref-client'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import NetworkErrorState from './NetworkErrorState.vue'
import NoWorksFoundState from './NoWorksFoundState.vue'
import { generatePDFReport } from './pdfUtils'

// Props
const props = defineProps<{
  dois: string[]
}>()

// i18n
const { t } = useI18n()

// Client
const client = new CrossrefClient()

// Data
const loading = ref(false)
const loadAborted = ref(false)

const works = ref<HttpResponse<Item<Work>>[]>([])
const { copy, copied } = useClipboard()

// Template Refs

type NetworkErrorStateType = InstanceType<typeof NetworkErrorState>
const networkErrorStateRef = useTemplateRef<NetworkErrorStateType>('networkErrorStateRef')

// Number of DOIs that passed the check
const passed = computed(() => works.value.filter(work => work.ok && work.status === 200 && work.content).length)

// Number of DOIs that have a warning
const warning = computed(() => works.value.filter(work => work.ok && work.status === 200 && !work.content).length)

// Number of DOIs that failed the check
const failed = computed(() => works.value.filter(work => !work.ok && work.status === 404).length)

// Watcher

// Functions
//  Fetches the DOIs metadata

const getDOIsMetadata = useDebounceFn(async () => {
  loadAborted.value = false
  works.value = []

  for (const doi of props.dois) {
    if (loadAborted.value) {
      break
    }

    try {
      loading.value = true
      const response = await client.work(doi)

      if (!response.ok) {
        const response2 = await resolveDOI(doi) as HttpResponse<Item<Work>>
        works.value.push(response2)
        continue
      }
      works.value.push(response)
    }
    catch (error) {
      console.error(error)
    }
    finally {
      loading.value = false
    }
  }
}, 500)

// Watches the network error state
watch(() => networkErrorStateRef.value?.isOnline, (isOnline) => {
  if (isOnline) {
    getDOIsMetadata()
  }
  else {
    abortFetching()
  }
})

watch(() => props.dois, () => getDOIsMetadata())

// Aborts fetching the DOIs metadata
function abortFetching() {
  loadAborted.value = true
  loading.value = false
}

// Reloads the DOIs metadata
function reload() {
  loadAborted.value = false
  getDOIsMetadata()
}

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

// Resolves the DOI
async function resolveDOI(doi: string) {
  try {
    const response = await fetch(`https://doi.org/${doi}`)
    return response
  }
  catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <v-card
    flat
    :title="t('report')"
  >
    <template #prepend>
      <v-icon
        icon="mdi-file-document-outline"
        size="large"
      />
    </template>
    <template #append>
      <v-tooltip v-if="works.length > 0">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon="mdi-download"
            variant="plain"

            @click="generatePDFReport(dois, passed, warning, failed, works)"
          />
        </template>
        {{ t('download-report-pdf') }}
      </v-tooltip>
    </template>
    <template
      #subtitle
    >
      <div class="text-wrap">
        <span class="mx-1">
          {{ `${t('found')}: ${dois.length}` }}
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
    </template>
    <v-card-text
      class="pa-0"
    >
      <v-row
        dense
        no-gutters
      >
        <v-col
          cols="11"
          class="d-flex align-center"
        >
          <v-progress-linear
            v-show="loading || loadAborted"
            :loading
            :indeterminate="loading"
            rounded
          />
        </v-col>
        <v-col cols="1">
          <v-btn
            v-if="loading"
            icon="mdi-close"
            variant="plain"
            @click="abortFetching"
          />
          <v-btn
            v-else-if="loadAborted"
            icon="mdi-reload"
            variant="plain"
            @click="reload"
          />
        </v-col>
      </v-row>
      <NoWorksFoundState
        v-show="works.length === 0 && !loading && networkErrorStateRef?.isOnline"
      />
      <NetworkErrorState
        ref="networkErrorStateRef"
      />
      <v-list
        v-if="works.length > 0"
      >
        <v-list-item
          v-for="(work, index) in works"
          :key="work.content?.message.DOI"
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
      </v-list>
    </v-card-text>
  </v-card>
</template>
