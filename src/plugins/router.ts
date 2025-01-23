import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../components/Options/OptionCategories/GeneralSettings.vue'), name: 'general' },
  { path: '/appearance', component: () => import('../components/Options/OptionCategories/DisplaySettings.vue'), name: 'appearance' },
  { path: '/language', component: () => import('../components/Options/OptionCategories/LanguageSettings.vue'), name: 'language' },
  { path: '/about', component: () => import('../components/Options/OptionCategories/About.vue'), name: 'about' },
  { path: '/help', component: () => import('../components/Options/OptionCategories/Help.vue'), name: 'help' },
]

const router = createRouter({
  history: createMemoryHistory('/dist/options/index.html'),
  routes,
})

export default router
