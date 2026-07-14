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
  { id: 1, title: '한밭수목원', content_type: '관광지', addr1: '대전광역시 서구', average_rating: 0, review_count: 0, recommendation_reason: '산책과 사진 촬영 취향에 잘 맞는 넓은 녹지 공간이에요.' },
  { id: 2, title: '성심당 본점', content_type: '음식점', addr1: '대전광역시 중구', average_rating: 0, review_count: 0, recommendation_reason: '대전 여행에서 빠지기 어려운 대표 맛집이에요.' }
]

const profile = computed(() => profileStore.profile || {})
const filteredPlaces = computed(() => places.value)
const interestText = computed(() => (profile.value.interests || []).join(', ') || '대전 로컬')

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
    error.value = 'API 연결이 불안정해 예시 데이터를 표시합니다.'
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
      <div class="home-hero-visual" aria-hidden="true">
        <span class="visual-map"></span>
        <span class="visual-pin visual-pin-main"></span>
        <span class="visual-pin visual-pin-sub"></span>
      </div>
      <div class="home-hero-copy">
        <p class="eyebrow">{{ profile.district || '대전' }} 기반 추천</p>
        <h1>{{ profile.nickname || '여행자' }}님, 오늘은 어디가 유잼일까요?</h1>
        <p>{{ interestText }} 관심사와 {{ profile.travelStyle || '여행 스타일' }} 스타일을 반영했어요.</p>
        <form class="search-bar" @submit.prevent="loadPlaces">
          <input v-model="query" placeholder="장소, 지역, 카테고리를 검색해 보세요" />
          <button type="submit">검색</button>
        </form>
      </div>
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

    <section class="section-card feature-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Board</p>
          <h2>지금 보면 좋은 대전 이야기</h2>
        </div>
        <RouterLink class="text-link" to="/board">전체 보기</RouterLink>
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
