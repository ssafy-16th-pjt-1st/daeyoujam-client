import { createRouter, createWebHistory } from 'vue-router'

import BoardDetailView from '../views/BoardDetailView.vue'
import BoardFormView from '../views/BoardFormView.vue'
import BoardListView from '../views/BoardListView.vue'
import HomeView from '../views/HomeView.vue'
import LandingView from '../views/LandingView.vue'
import MapDetailView from '../views/MapDetailView.vue'
import ChatView from '../views/ChatView.vue'

const routes = [
  { path: '/', name: 'landing', component: LandingView },
  { path: '/home', name: 'home', component: HomeView },
  { path: '/map/:placeId', name: 'map-detail', component: MapDetailView },
  { path: '/chat', name: 'chat', component: ChatView },
  { path: '/board', name: 'board-list', component: BoardListView },
  { path: '/board/new', name: 'board-new', component: BoardFormView },
  { path: '/board/:postId', name: 'board-detail', component: BoardDetailView },
  { path: '/board/:postId/edit', name: 'board-edit', component: BoardFormView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const saved = localStorage.getItem('localhub-profile')
  const completed = saved ? JSON.parse(saved).onboardingCompleted : false
  if (to.name === 'home' && !completed) return { name: 'landing' }
  if (to.name === 'landing' && completed) return { name: 'home' }
  return true
})

export default router
