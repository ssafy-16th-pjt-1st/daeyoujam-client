<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '../components/common/AppHeader.vue'
import { fetchPlace } from '../api/places'

const route = useRoute()
const place = ref(null)
const error = ref('')
const placeholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520">
    <rect width="900" height="520" fill="#f7f7f5"/>
    <text x="450" y="266" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="800" fill="#d83b18">대유잼</text>
    <text x="374" y="290" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="#008b72">전</text>
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
          <p>리뷰 요약 기능은 다음 단계에서 백엔드 AI API와 연결됩니다.</p>
        </section>
        <section>
          <h2>리뷰</h2>
          <p class="muted">아직 리뷰 목록 API가 연결되지 않았어요.</p>
        </section>
      </template>
    </aside>
  </main>
</template>
