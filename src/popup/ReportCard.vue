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
</script>

<template>
  <v-card
    title="Report"
    :loading
    flat
  >
    <v-card-subtitle>
      <p>{{ `Found: ${dois.length}` }}</p>
      <p>{{ `Passed: ${passed}` }}</p>
      <p>{{ `Failed: ${failed}` }}</p>
    </v-card-subtitle>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="work in works"
          :key="work.content?.message.DOI"
          color="error"
          :active="!work.ok"
        >
          <template #prepend>
            <v-icon
              size="x-large"
              :color="work.ok ? 'success' : 'error'"
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
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  density="compact"
                  icon="mdi-content-copy"
                  variant="plain"
                  size="large"
                  @click="copy(work.ok ? work.content.message.DOI : getNotFoundDOI(work))"
                />
              </template>
              {{ copied ? "DOI Copied!" : "Copy DOI" }}
            </v-tooltip>
            <v-btn
              v-if="work.ok"
              density="compact"
              icon="mdi-open-in-new"
              variant="plain"
              size="large"
              :href="work.content.message.URL"
            />

            <v-tooltip
              v-else
            >
              <template #activator="{ props }">
                <v-btn
                  density="compact"
                  v-bind="props"
                  icon="mdi-information-outline "
                  variant="plain"

                  size="large"
                />
              </template>
              <p class="font-weight-bold text-h6">
                Why couldn't the work be found?
              </p>
              <p class="text-subtitle-1">
                There could be several reasons for this:
              </p>

              <ol class="text-body-2">
                <li>
                  The DOI was not extracted properly. Please verify the DOI.
                </li>
                <li>The DOI is not registered in the CrossRef database. You may want to check other databases.</li>
                <li>The DOI does not exist.</li>
              </ol>
            </v-tooltip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
