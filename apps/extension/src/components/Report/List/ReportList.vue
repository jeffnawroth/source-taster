<script setup lang="ts">
import type { IdentifierResult } from '@/extension/types'
import type { FuseResult } from 'fuse.js'
import { useDoiStore } from '@/extension/stores/doi'
import { useIssnStore } from '@/extension/stores/issn'

const { results } = defineProps<{
  results: FuseResult<IdentifierResult>[]
}>()

const dois = computed(() => results.filter(result => result.item.type === 'DOI'))
const issns = computed(() => results.filter(result => result.item.type === 'ISSN'))

const { registeredDoisCount, unregisteredDoisCount } = storeToRefs(useDoiStore())
const { registeredIssnsCount, unregisteredIssnsCount } = storeToRefs(useIssnStore())
</script>

<template>
  <v-list
    v-if="results.length > 0"
    class="pa-0"
  >
    <v-list-subheader
      v-if="dois.length"
      title="DOIs"
    >
      <template #default>
        <v-row
          no-gutters
          density="compact"
        >
          <span class="mx-4 font-weight-bold">
            DOIs
          </span>
          <span class="mx-4">
            {{ `${$t('found')}: ${dois.length}` }}
          </span>
          <v-divider vertical />

          <span class="mx-4">
            {{ `${$t('registered')}: ${registeredDoisCount}` }}
          </span>

          <v-divider vertical />

          <span class="mx-4">
            {{ `${$t('unregistered')}: ${unregisteredDoisCount}` }}
          </span>
        </v-row>
      </template>
    </v-list-subheader>

    <v-slide-y-transition group>
      <ReportListItem
        v-for="(doi) in dois"
        :key="doi.item.value"
        :identifier="doi.item"
      />
    </v-slide-y-transition>
    <v-list-subheader
      v-if="dois.length"
    >
      <template #default>
        <v-row
          no-gutters
          density="compact"
          align="center"
        >
          <span class="mx-4 font-weight-bold">
            ISSNs
          </span>
          <span class="mx-4">
            {{ `${$t('found')}: ${issns.length}` }}
          </span>
          <v-divider vertical />

          <span class="mx-4">
            {{ `${$t('registered')}: ${registeredIssnsCount}` }}
          </span>

          <v-divider vertical />

          <span class="mx-4">
            {{ `${$t('unregistered')}: ${unregisteredIssnsCount}` }}
          </span>
        </v-row>
      </template>
    </v-list-subheader>

    <v-slide-y-transition group>
      <ReportListItem
        v-for="(issn) in issns"
        :key="issn.item.value"
        :identifier="issn.item"
      />
    </v-slide-y-transition>
  </v-list>
  <NoResultsFoundState v-else />
</template>
