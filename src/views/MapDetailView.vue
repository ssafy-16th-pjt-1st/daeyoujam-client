<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { fetchPlace } from "../api/places";
import AppHeader from "../components/common/AppHeader.vue";
import { DAEYUJAM_PLACEHOLDER_IMAGE } from "../constants/images";
// MapDetailView.vue 의 <script setup> 상단
import SinglePlaceMap from "../components/place/SinglePlaceMap.vue";

const route = useRoute();
const place = ref(null);
const error = ref("");

onMounted(async () => {
  try {
    place.value = await fetchPlace(route.params.placeId);
  } catch {
    error.value = "장소 정보를 불러오지 못했어요.";
  }
});
</script>

<template>
  <AppHeader />
  <main class="detail-layout">
    <section class="map-panel">
      <SinglePlaceMap v-if="place" :content_id="place.content_id" />
    </section>
    <aside class="detail-panel">
      <p v-if="error" class="notice">{{ error }}</p>
      <template v-if="place">
        <img
          class="detail-image"
          :src="place.first_image || place.first_image2 || DAEYUJAM_PLACEHOLDER_IMAGE"
          :alt="place.title"
        />
        <p class="meta">{{ place.content_type }}</p>
        <h1>{{ place.title }}</h1>
        <p>{{ place.addr1 || "주소 정보 없음" }} {{ place.addr2 || "" }}</p>
        <p>{{ place.tel || "전화번호 정보 없음" }}</p>
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
