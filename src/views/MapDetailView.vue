<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fetchPlace, fetchPlaces } from '../api/places'
import { createReview, fetchRating, fetchReviews, summarizeReviews } from '../api/reviews'
import AppHeader from '../components/common/AppHeader.vue'
import { DAEYUJAM_PLACEHOLDER_IMAGE } from '../constants/images'
import { useProfileStore } from '../stores/profile'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()

const places = ref([])
const selectedPlace = ref(null)
const reviews = ref([])
const rating = ref({ average_rating: 0, review_count: 0 })
const briefing = ref([])
const loading = ref(false)
const reviewLoading = ref(false)
const summaryLoading = ref(false)
const error = ref('')
const reviewMessage = ref('')

const reviewForm = reactive({
  rating: 5,
  content: '',
  edit_password: ''
})

const reviewAuthor = computed(() => profileStore.nickname)

const mapBounds = computed(() => {
  const points = mappablePlaces.value
  if (!points.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 }
  const xs = points.map((place) => Number(place.mapx))
  const ys = points.map((place) => Number(place.mapy))
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  }
})

const mappablePlaces = computed(() =>
  places.value.filter((place) => Number.isFinite(Number(place.mapx)) && Number.isFinite(Number(place.mapy)))
)

const selectedImage = computed(() => {
  if (!selectedPlace.value) return DAEYUJAM_PLACEHOLDER_IMAGE
  return selectedPlace.value.first_image || selectedPlace.value.first_image2 || DAEYUJAM_PLACEHOLDER_IMAGE
})

function pinStyle(place) {
  const bounds = mapBounds.value
  const xRange = bounds.maxX - bounds.minX || 1
  const yRange = bounds.maxY - bounds.minY || 1
  const left = 8 + ((Number(place.mapx) - bounds.minX) / xRange) * 84
  const top = 88 - ((Number(place.mapy) - bounds.minY) / yRange) * 76
  return {
    left: `${Math.max(6, Math.min(92, left))}%`,
    top: `${Math.max(8, Math.min(88, top))}%`
  }
}

async function loadPlaces() {
  const response = await fetchPlaces({ size: 80 })
  places.value = response.items
}

async function loadSelectedPlace() {
  const placeId = route.params.placeId
  if (!placeId) {
    selectedPlace.value = places.value[0] || null
    if (selectedPlace.value) await loadPlaceReviews(selectedPlace.value.id)
    return
  }
  selectedPlace.value = await fetchPlace(placeId)
  await loadPlaceReviews(placeId)
}

async function loadPlaceReviews(placeId) {
  reviewLoading.value = true
  reviewMessage.value = ''
  try {
    const [reviewData, ratingData] = await Promise.all([fetchReviews(placeId), fetchRating(placeId)])
    reviews.value = reviewData
    rating.value = ratingData
    await loadReviewSummary(placeId)
  } catch {
    reviewMessage.value = '리뷰 정보를 불러오지 못했습니다.'
  } finally {
    reviewLoading.value = false
  }
}

async function loadReviewSummary(placeId) {
  summaryLoading.value = true
  try {
    const data = await summarizeReviews(placeId)
    briefing.value = data.summary || []
  } catch {
    briefing.value = [
      'AI 리뷰 브리핑을 잠시 불러오지 못했습니다.',
      '등록된 리뷰와 평균 별점은 아래 목록에서 확인할 수 있습니다.',
      '잠시 후 다시 열면 최신 리뷰 기준으로 요약을 다시 시도합니다.'
    ]
  } finally {
    summaryLoading.value = false
  }
}

async function selectPlace(place) {
  selectedPlace.value = place
  await router.replace({ name: 'map-detail', params: { placeId: place.id } })
}

async function submitReview() {
  if (!selectedPlace.value) return
  reviewMessage.value = ''
  try {
    if (!profileStore.profile?.guestId) {
      reviewMessage.value = '닉네임을 먼저 등록해 주세요.'
      return
    }
    await createReview(selectedPlace.value.id, {
      guest_id: profileStore.profile.guestId,
      rating: Number(reviewForm.rating),
      content: reviewForm.content.trim(),
      edit_password: reviewForm.edit_password
    })
    reviewForm.rating = 5
    reviewForm.content = ''
    reviewForm.edit_password = ''
    await loadPlaceReviews(selectedPlace.value.id)
    reviewMessage.value = '리뷰가 등록되었습니다.'
  } catch {
    reviewMessage.value = '닉네임, 별점, 리뷰, 비밀번호를 모두 입력해 주세요.'
  }
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    await loadPlaces()
    await loadSelectedPlace()
  } catch {
    error.value = '장소 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

watch(
  () => route.params.placeId,
  async () => {
    if (!loading.value) {
      try {
        await loadSelectedPlace()
      } catch {
        error.value = '장소 정보를 불러오지 못했습니다.'
      }
    }
  }
)
</script>

<template>
  <AppHeader />
  <main class="map-page">
    <section class="map-canvas" aria-label="장소 지도">
      <div class="map-grid" aria-hidden="true"></div>
      <div class="map-river" aria-hidden="true"></div>
      <div class="map-district district-a" aria-hidden="true"></div>
      <div class="map-district district-b" aria-hidden="true"></div>
      <div class="map-toolbar">
        <div>
          <p class="eyebrow">Map</p>
          <h1>대전·충청 장소 지도</h1>
        </div>
        <RouterLink class="outline-button" to="/home">홈으로</RouterLink>
      </div>

      <p v-if="loading" class="map-state">지도를 준비하고 있습니다.</p>
      <p v-else-if="error" class="map-state error">{{ error }}</p>

      <template v-else>
        <button
          v-for="place in mappablePlaces"
          :key="place.id"
          class="map-pin"
          :class="{ active: selectedPlace?.id === place.id }"
          :style="pinStyle(place)"
          type="button"
          @click="selectPlace(place)"
        >
          <span>{{ place.title }}</span>
        </button>
      </template>

      <div class="map-list-panel">
        <strong>장소 {{ places.length }}곳</strong>
        <button
          v-for="place in places.slice(0, 12)"
          :key="place.id"
          :class="{ active: selectedPlace?.id === place.id }"
          type="button"
          @click="selectPlace(place)"
        >
          <span>{{ place.title }}</span>
          <small>{{ place.content_type || '장소' }} · ★ {{ place.average_rating || 0 }}</small>
        </button>
      </div>
    </section>

    <aside v-if="selectedPlace" class="place-detail-drawer">
      <img class="detail-image" :src="selectedImage" :alt="selectedPlace.title" />
      <div class="place-detail-content">
        <div class="place-detail-heading">
          <span class="badge">{{ selectedPlace.content_type || '장소' }}</span>
          <h2>{{ selectedPlace.title }}</h2>
          <p>{{ selectedPlace.addr1 || '주소 정보 없음' }} {{ selectedPlace.addr2 || '' }}</p>
        </div>

        <div class="rating-summary">
          <strong>★ {{ rating.average_rating || selectedPlace.average_rating || 0 }}</strong>
          <span>리뷰 {{ rating.review_count || selectedPlace.review_count || 0 }}개</span>
          <small>{{ selectedPlace.tel || '전화번호 정보 없음' }}</small>
        </div>

        <section class="ai-briefing">
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">AI Briefing</p>
              <h3>AI 리뷰 브리핑</h3>
            </div>
            <span v-if="summaryLoading" class="muted">생성 중</span>
          </div>
          <p v-for="line in briefing" :key="line">{{ line }}</p>
        </section>

        <section class="review-section">
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">Review</p>
              <h3>별점과 리뷰 남기기</h3>
            </div>
          </div>
          <form class="review-form" @submit.prevent="submitReview">
            <div class="review-form-row">
              <span class="comment-author">{{ reviewAuthor }}</span>
              <select v-model="reviewForm.rating" aria-label="별점">
                <option v-for="score in [5, 4, 3, 2, 1]" :key="score" :value="score">★ {{ score }}</option>
              </select>
            </div>
            <textarea v-model="reviewForm.content" placeholder="이 장소는 어땠나요?" rows="4"></textarea>
            <div class="review-form-row">
              <input v-model="reviewForm.edit_password" type="password" placeholder="수정용 비밀번호" />
              <button class="primary-button" type="submit">등록</button>
            </div>
          </form>
          <p v-if="reviewMessage" class="muted">{{ reviewMessage }}</p>
        </section>

        <section class="review-list">
          <h3>방문자 리뷰</h3>
          <p v-if="reviewLoading" class="muted">리뷰를 불러오는 중입니다.</p>
          <p v-else-if="!reviews.length" class="muted">아직 등록된 리뷰가 없습니다.</p>
          <article v-for="review in reviews" v-else :key="review.id" class="review-card">
            <div>
              <strong>{{ review.nickname }}</strong>
              <span>★ {{ review.rating }}</span>
            </div>
            <p>{{ review.content }}</p>
            <small>{{ new Date(review.created_at).toLocaleDateString('ko-KR') }}</small>
          </article>
        </section>
      </div>
    </aside>
  </main>
</template>
