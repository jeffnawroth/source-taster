<script>
</script>

<template>
  <v-app class="h-100">
    <SystemBar />
    <v-main class="d-flex flex-column h-100 min-h-0 overflow-hidden">
      <v-container
        class="d-flex flex-column flex-1 min-h-0 pa-0"
      >
        <AppLayout class="flex-1 d-flex flex-column min-h-0" />
      </v-container>
    </v-main>
    <Disclaimer />
  </v-app>
</template>

<style>
html,
body,
#app {
  height: 100%;
}
.v-application {
  height: 100%;
} /* Vuetify 3 root */
.v-application__wrap {
  min-height: 100%;
}

/* Minimal utilities needed for nested flex scrolling */
.min-h-0 {
  min-height: 0 !important;
}
.overflow-auto {
  overflow: auto !important;
}
</style>
