<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { CrossrefClient } from '@jamesgopsill/crossref-client'
import BibliographyInput from './BibliographyInput.vue'

// Client
const client = new CrossrefClient()

// Data
const loading = ref(false)
const works = ref<HttpResponse<Item<Work>>[]>([])
const dois = ref<string[]>([])

// Computed Props

// Number of DOIs that passed the check
const passed = computed(() => works.value.filter(work => work.ok && work.status === 200).length)

// Number of DOIs that failed the check
const failed = computed(() => works.value.filter(work => !work.ok).length)

// Extracts DOIs from the bibliography
function extractDOIs(bibliography: string) {
  dois.value = []
  const doiPattern = /(https:\/\/doi\.org\/)?(10\.\d{4,9}\/[-.\w;()/:]+)/gi

  const matches = bibliography.match(doiPattern)
  if (!matches)
    return []

  dois.value = matches.map((match) => {
    // Remove the prefix if it exists
    const doi = match.replace('https://doi.org/', '')
    // Remove any trailing dot
    return doi.replace(/\.$/, '')
  })
}

async function getDOIsMetadata() {
  works.value = []
  for (const doi of dois.value) {
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

function handleUpdateBibliography(bibliography: string) {
  extractDOIs(bibliography)
  getDOIsMetadata()
}

function getNotFoundDOI(work: HttpResponse<Item<Work>>) {
  const url = work.url
  return url.replace('https://api.crossref.org/works/', '')
}
</script>

<template>
  <v-card
    flat
    min-width="400px"
    title="The Source Taster"
  >
    <template #append>
      <v-tooltip>
        <template #activator="{ props }">
          <v-icon
            size="large"
            icon="i-mdi-help-circle-outline"
            v-bind="props"
          />
        </template>
        <p class="text-h6">
          How does it work?
        </p>
        <p><span class="font-italic font-weight-bold">The Source Taster</span> extracts the DOIs from your bibliography and checks them using the CrossRef database.</p>
      </v-tooltip>
    </template>
    <v-card-text>
      <BibliographyInput
        @update:bibliography="handleUpdateBibliography"
      />
    </v-card-text>
  </v-card>

  <v-divider class="border-opacity-100" />

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
              :icon="work.ok ? 'i-mdi-check-circle-outline' : 'i-mdi-close-circle-outline'"
            />
          </template>

          <v-list-item-title>
            {{ work.ok ? work.content.message.title[0] : work.statusText }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ work.ok ? work.content?.message.DOI : getNotFoundDOI(work) }}
          </v-list-item-subtitle>

          <template #append>
            <v-btn
              density="compact"
              icon="i-mdi-content-copy"
              variant="plain"
              size="large"
            />
            <v-btn
              v-if="work.ok"
              density="compact"

              icon="i-mdi-open-in-new"
              variant="plain"

              size="large"
            />

            <v-tooltip
              v-else
            >
              <template #activator="{ props }">
                <v-btn
                  density="compact"
                  v-bind="props"
                  icon="i-mdi-information-outline "
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
