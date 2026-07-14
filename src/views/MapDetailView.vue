<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { fetchPlace } from '../api/places'
import AppHeader from '../components/common/AppHeader.vue'

const route = useRoute()
const place = ref(null)
const error = ref('')
const placeholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520">
    <rect width="900" height="520" fill="#ffffff"/>
    <g transform="translate(330 190)">
      <rect x="0" y="0" width="86" height="86" rx="26" fill="#ff385c" transform="rotate(-6 43 43)"/>
      <text x="43" y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="900" fill="#ffffff">대</text>
      <circle cx="90" cy="85" r="19" fill="#ffffff" stroke="#ff385c" stroke-width="6"/>
      <text x="90" y="94" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#ff385c">전</text>
      <text x="153" y="65" font-family="Arial, sans-serif" font-size="54" font-weight="900" fill="#222222">유잼</text>
    </g>
  </svg>`)

onMounted(async () => {
  try {
    place.value = await fetchPlace(route.params.placeId)
  } catch {
    error.value = '장소 정보를 불러오지 못했어요.'
  }
})
</script>

<template>
  <AppHeader />
  <main class="detail-layout">
    <section class="map-panel">
      <div class="fake-map">
        <span>지도 영역</span>
        <small v-if="place">{{ place.mapy }}, {{ place.mapx }}</small>
      </div>
    </section>
    <aside class="detail-panel">
      <p v-if="error" class="notice">{{ error }}</p>
      <template v-if="place">
        <img class="detail-image" :src="place.first_image || place.first_image2 || placeholder" :alt="place.title" />
        <p class="meta">{{ place.content_type }}</p>
        <h1>{{ place.title }}</h1>
        <p>{{ place.addr1 || '주소 정보 없음' }} {{ place.addr2 || '' }}</p>
        <p>{{ place.tel || '전화번호 정보 없음' }}</p>
        <p class="rating">별점 {{ place.average_rating }} · 리뷰 {{ place.review_count }}</p>
        <section class="ai-briefing">
          <strong>AI 리뷰 브리핑</strong>
          <p>리뷰 요약 기능은 다음 단계에서 백엔드 AI API와 연결합니다.</p>
        </section>
        <section>
          <h2>리뷰</h2>
          <p class="muted">아직 리뷰 목록 API가 연결되지 않았어요.</p>
        </section>
      </template>
    </aside>
  </main>
</template>
