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
const passed = computed(() => works.value.filter(work => work.ok && work.status === 200).length)

// Number of DOIs that failed the check
const failed = computed(() => works.value.filter(work => !work.ok).length)

// Watcher

// Functions
// Extracts the DOI from the URL
function getNotFoundDOI(work: HttpResponse<Item<Work>>) {
  const url = work.url
  return url.replace('https://api.crossref.org/works/', '')
}

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
      works.value.push(response)
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

// Opens the resolved DOI URL in a new tab if it exists
function openDOI(work: HttpResponse<Item<Work>>) {
  if (work && work.ok && work.content?.message.URL) {
    const url = work.content.message.URL
    window.open(url, '_blank')
  }
  else {
    console.error('Invalid URL or DOI not found:', work)
  }
}

// Removes a report entry
function removeReportEntry(work: HttpResponse<Item<Work>>) {
  works.value.splice(works.value.indexOf(work), 1)
}
</script>

<template>
  <v-card
    flat
    title="Report"
  >
    <template #prepend>
      <v-icon
        icon="mdi-file-document-outline"
        size="large"
      />
    </template>
    <template #append>
      <tooltip>
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            size="large"
          />
        </template>
      </tooltip>
      <v-tooltip>
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon="mdi-export-variant"
            variant="plain"

            @click="generatePDFReport(dois, failed, passed, works, getNotFoundDOI)"
          />
        </template>
        Export Report as PDF
      </v-tooltip>
    </template>
    <template
      #subtitle
    >
      <span class="mx-1">
        {{ `Found: ${dois.length}` }}
      </span>
      <span
        class=" mx-1"
        :class="passed > 0 ? 'text-success' : ''"
      >
        {{ `Passed: ${passed}` }}
      </span>
      <span
        class="mx-1"
        :class="failed > 0 ? 'text-error' : ''"
      >
        {{ `Failed: ${failed}` }}
      </span>
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
          v-for="work in works"
          :key="work.content?.message.DOI"
          rounded="lg"
          :color="work.ok ? 'success' : 'error'"
          active
          class="my-1"
        >
          <template #prepend>
            <v-icon
              size="x-large"
              :icon="work.ok ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            />
          </template>

          <v-list-item-title>
            {{ work.ok ? work.content.message.title[0] : work.statusText }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ work.ok ? work.content?.message.DOI : getNotFoundDOI(work) }}
          </v-list-item-subtitle>

          <template #append>
            <v-tooltip>
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  density="compact"
                  icon="mdi-delete-outline"
                  variant="plain"
                  size="large"
                  @click="removeReportEntry(work)"
                />
              </template>
              Delete
            </v-tooltip>
            <v-tooltip>
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  density="compact"
                  icon="mdi-content-copy"
                  variant="plain"
                  size="large"
                  @click="copy(work.ok ? work.content.message.DOI : getNotFoundDOI(work))"
                />
              </template>
              {{ copied ? "DOI Copied!" : "Copy DOI" }}
            </v-tooltip>
            <v-tooltip v-if="work.ok">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  density="compact"
                  icon="mdi-open-in-new"
                  variant="plain"
                  size="large"
                  @click="() => openDOI(work)"
                />
              </template>
              Open Source
            </v-tooltip>

            <v-menu
              v-else
              open-on-hover
            >
              <template #activator="{ props: menuProps }">
                <v-btn
                  class="cursor-pointer"
                  v-bind="menuProps"
                  density="compact"
                  icon="mdi-information-outline "
                  variant="plain"

                  size="large"
                />
              </template>
              <v-card
                title="Not Found"
              >
                <v-card-subtitle class="no-truncate">
                  Why couldn't the work be found? There could be several reasons for this:
                </v-card-subtitle>
                <v-card-text>
                  <v-list>
                    <v-list-item
                      class="no-truncate"
                      title="The DOI was not extracted properly"
                      subtitle="Verify the DOI was extracted correctly from the given bibliography"
                    />
                    <v-list-item
                      title="The DOI is not registered in the CrossRef database"
                      subtitle="You may want to check other databases"
                    />
                    <v-list-item
                      title="The DOI does not exist."
                    />
                  </v-list>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.no-truncate {
  white-space: wrap !important;
  overflow: visible;
  text-overflow: initial;
}

/* .v-card-title  {
  padding: 0 !important;
} */
</style>
