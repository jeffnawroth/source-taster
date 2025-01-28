import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../options/views/General.vue'), name: 'general' },
  { path: '/appearance', component: () => import('../options/views/Appearance.vue'), name: 'appearance' },
  { path: '/language', component: () => import('../options/views/Language.vue'), name: 'language' },
  { path: '/about', component: () => import('../options/views/About.vue'), name: 'about' },
  { path: '/help', component: () => import('../options/views/Help.vue'), name: 'help' },
]

const router = createRouter({
  history: createMemoryHistory('/dist/options/index.html'),
  routes,
})

export default router
