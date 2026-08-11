import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

export const router = createRouter({
  history: createWebHashHistory('/app/'),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/results', name: 'results', component: () => import('@/views/ResultsView.vue') },
    { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
  ],
})
