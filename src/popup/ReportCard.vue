<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { CrossrefClient } from '@jamesgopsill/crossref-client'
import { useClipboard } from '@vueuse/core'

// Props
const props = defineProps<{
  dois: string[]
}>()

// Watcher
watch(() => props.dois, getDOIsMetadata)

// Client
const client = new CrossrefClient()

// Data
const loading = ref(false)
const works = ref<HttpResponse<Item<Work>>[]>([])
const { copy, copied } = useClipboard()

// Number of DOIs that passed the check
const passed = computed(() => works.value.filter(work => work.ok && work.status === 200).length)

// Number of DOIs that failed the check
const failed = computed(() => works.value.filter(work => !work.ok).length)

// Functions
// Extracts the DOI from the URL
function getNotFoundDOI(work: HttpResponse<Item<Work>>) {
  const url = work.url
  return url.replace('https://api.crossref.org/works/', '')
}

async function getDOIsMetadata() {
  works.value = []
  for (const doi of props.dois) {
    try {
      loading.value = true
      const response = await client.work(doi)
      works.value.push(response)
    }
    finally {
      loading.value = false
    }
  }
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
</script>

<template>
  <v-card
    flat
  >
    <v-card-title class="pa-0">
      Report
    </v-card-title>
    <v-card-subtitle class="pa-0">
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
    </v-card-subtitle>
    <v-card-text
      class="pa-0"
    >
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
              <template #activator="{ props }">
                <v-btn
                  class="cursor-pointer"
                  v-bind="props"
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
      <div class="text-center">
        <v-progress-circular
          v-show="loading"
          :loading
          indeterminate
          class="text-center my-4"
        />
      </div>
      <v-empty-state
        v-if="works.length === 0 && !loading "
        icon="mdi-magnify"
        text="Unable to find matching literature using the provided DOI(s). Please double-check the DOI entries for accuracy. Ensuring correct formatting and completeness can help improve search results."
        title="We couldn't find a match."
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.no-truncate {
  white-space: wrap !important;
  overflow: visible;
  text-overflow: initial;
}
</style>
