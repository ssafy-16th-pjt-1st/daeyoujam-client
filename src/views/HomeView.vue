<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import AppFooter from '../components/common/AppFooter.vue'
import AppHeader from '../components/common/AppHeader.vue'
import EmptyState from '../components/common/EmptyState.vue'
import LoadingState from '../components/common/LoadingState.vue'
import CategoryChips from '../components/place/CategoryChips.vue'
import PlaceCard from '../components/place/PlaceCard.vue'
import { fetchPlaces, searchPlaces } from '../api/places'
import { fetchRecommendations, fetchRecommendedPosts } from '../api/recommendations'
import { useProfileStore } from '../stores/profile'

const profileStore = useProfileStore()
const selectedCategory = ref('전체')
const query = ref('')
const places = ref([])
const posts = ref([])
const loading = ref(false)
const error = ref('')

const mockPlaces = [
  { id: 1, title: '장태산자연휴양림', content_type: '관광지', addr1: '대전광역시 서구', average_rating: 0, review_count: 0, recommendation_reason: '관광지 관심사를 반영한 예시 추천이에요.' },
  { id: 2, title: '성심당 본점', content_type: '음식점', addr1: '대전광역시 중구', average_rating: 0, review_count: 0, recommendation_reason: '음식점 관심사를 반영한 예시 추천이에요.' }
]

const profile = computed(() => profileStore.profile || {})
const filteredPlaces = computed(() => places.value)

async function loadPlaces() {
  loading.value = true
  error.value = ''
  const category = selectedCategory.value === '전체' ? undefined : selectedCategory.value
  try {
    const response = query.value.trim()
      ? await searchPlaces({ q: query.value.trim(), category, size: 12 })
      : selectedCategory.value === '전체'
        ? await fetchRecommendations({
            age_group: profile.value.ageGroup,
            gender: profile.value.gender,
            district: profile.value.district,
            interests: profile.value.interests || [],
            limit: 12
          })
        : await fetchPlaces({ category, size: 12 })
    places.value = response.items
  } catch {
    error.value = 'API 연결 전이라 예시 데이터를 표시합니다.'
    places.value = mockPlaces
  } finally {
    loading.value = false
  }
}

async function loadPosts() {
  try {
    const response = await fetchRecommendedPosts({
      age_group: profile.value.ageGroup,
      gender: profile.value.gender,
      district: profile.value.district,
      interests: profile.value.interests || [],
      limit: 6
    })
    posts.value = response.items
  } catch {
    posts.value = []
  }
}

watch(selectedCategory, loadPlaces)
onMounted(() => {
  loadPlaces()
  loadPosts()
})
</script>

<template>
  <AppHeader />
  <main class="app-container page-stack">
    <section class="home-hero">
      <p class="eyebrow">{{ profile.district }} 기반 추천</p>
      <h1>{{ profile.nickname }}님, 오늘은 어디가 유잼일까요?</h1>
      <p>{{ (profile.interests || []).join(', ') }} 관심사와 {{ profile.district }} 생활권을 반영했어요.</p>
      <form class="search-bar" @submit.prevent="loadPlaces">
        <input v-model="query" placeholder="장소, 지역, 카테고리를 검색해보세요" />
        <button type="submit">검색</button>
      </form>
    </section>

    <section class="tool-strip">
      <CategoryChips v-model="selectedCategory" />
      <RouterLink class="outline-button" to="/map/1">지도로 보기</RouterLink>
    </section>
    <p v-if="error" class="notice">{{ error }}</p>
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="!filteredPlaces.length" />
    <section v-else class="place-grid">
      <PlaceCard v-for="place in filteredPlaces" :key="place.id" :place="place" />
    </section>

    <section class="section-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">개인화 게시물</p>
          <h2>지금 보면 좋은 동네 이야기</h2>
        </div>
        <RouterLink to="/board">전체 보기</RouterLink>
      </div>
      <div v-if="posts.length" class="post-grid">
        <RouterLink v-for="post in posts" :key="post.id" class="post-card" :to="`/board/${post.id}`">
          <span class="badge">{{ post.category }}</span>
          <strong>{{ post.title }}</strong>
          <p>{{ post.content }}</p>
          <small>{{ post.nickname }} · 조회 {{ post.view_count }}</small>
          <em>{{ post.recommendation_reason }}</em>
        </RouterLink>
      </div>
      <p v-else class="muted">아직 추천할 게시물이 없어요.</p>
    </section>
  </main>
  <RouterLink class="floating-chat" to="/chat">챗봇</RouterLink>
  <RouterLink class="floating-write" to="/board/new">글쓰기</RouterLink>
  <AppFooter />
</template>
