<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { fetchPlace } from "../api/places";
import { createReview, fetchRating, fetchReviews, summarizeReviews } from "../api/reviews";
import AppHeader from "../components/common/AppHeader.vue";
import SinglePlaceMap from "../components/place/SinglePlaceMap.vue";
import { DAEYUJAM_PLACEHOLDER_IMAGE } from "../constants/images";
import { useProfileStore } from "../stores/profile";

const route = useRoute();
const profileStore = useProfileStore();

const place = ref(null);
const rating = ref({ average_rating: 0, review_count: 0 });
const reviews = ref([]);
const briefing = ref([]);
const loading = ref(false);
const reviewLoading = ref(false);
const summaryLoading = ref(false);
const error = ref("");
const reviewMessage = ref("");

const reviewForm = reactive({
  rating: 5,
  content: "",
  edit_password: "",
});

const selectedImage = computed(() => {
  if (!place.value) return DAEYUJAM_PLACEHOLDER_IMAGE;
  return place.value.first_image || place.value.first_image2 || DAEYUJAM_PLACEHOLDER_IMAGE;
});

const reviewAuthor = computed(() => profileStore.nickname);

async function loadReviewSummary(placeId) {
  summaryLoading.value = true;
  try {
    const data = await summarizeReviews(placeId);
    briefing.value = data.summary || [];
  } catch {
    briefing.value = [
      "AI 리뷰 요약을 불러오지 못했습니다.",
      "등록된 리뷰와 평균 별점은 아래 목록에서 확인할 수 있습니다.",
    ];
  } finally {
    summaryLoading.value = false;
  }
}

async function loadPlaceReviews(placeId) {
  reviewLoading.value = true;
  reviewMessage.value = "";
  try {
    const [reviewData, ratingData] = await Promise.all([fetchReviews(placeId), fetchRating(placeId)]);
    reviews.value = reviewData;
    rating.value = ratingData;
    await loadReviewSummary(placeId);
  } catch {
    reviewMessage.value = "리뷰 정보를 불러오지 못했습니다.";
  } finally {
    reviewLoading.value = false;
  }
}

async function loadPlaceDetail() {
  const placeId = route.params.placeId;
  if (!placeId) return;

  loading.value = true;
  error.value = "";
  try {
    place.value = await fetchPlace(placeId);
    await loadPlaceReviews(placeId);
  } catch {
    error.value = "장소 정보를 불러오지 못했습니다.";
    place.value = null;
  } finally {
    loading.value = false;
  }
}

async function submitReview() {
  if (!place.value) return;

  reviewMessage.value = "";
  if (!profileStore.profile?.guestId) {
    reviewMessage.value = "닉네임을 먼저 등록해 주세요.";
    return;
  }

  try {
    await createReview(place.value.id, {
      guest_id: profileStore.profile.guestId,
      rating: Number(reviewForm.rating),
      content: reviewForm.content.trim(),
      edit_password: reviewForm.edit_password,
    });
    reviewForm.rating = 5;
    reviewForm.content = "";
    reviewForm.edit_password = "";
    await loadPlaceReviews(place.value.id);
    reviewMessage.value = "리뷰가 등록되었습니다.";
  } catch {
    reviewMessage.value = "별점, 리뷰, 비밀번호를 모두 입력해 주세요.";
  }
}

onMounted(loadPlaceDetail);

watch(
  () => route.params.placeId,
  () => {
    loadPlaceDetail();
  },
);
</script>

<template>
  <AppHeader />
  <main class="detail-layout">
    <section class="map-panel">
      <SinglePlaceMap v-if="place" :content_id="place.content_id" />
      <p v-else-if="loading" class="status">지도를 준비하고 있습니다.</p>
    </section>

    <aside class="detail-panel">
      <p v-if="error" class="notice">{{ error }}</p>
      <p v-else-if="loading && !place" class="notice">장소 정보를 불러오는 중입니다.</p>

      <template v-else-if="place">
        <img class="detail-image" :src="selectedImage" :alt="place.title" />
        <p class="meta">{{ place.content_type || "장소" }}</p>
        <h1>{{ place.title }}</h1>
        <p>{{ place.addr1 || "주소 정보 없음" }} {{ place.addr2 || "" }}</p>
        <p>{{ place.tel || "전화번호 정보 없음" }}</p>
        <p class="rating">
          별점 {{ rating.average_rating || place.average_rating || 0 }} · 리뷰
          {{ rating.review_count || place.review_count || 0 }}
        </p>

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
            <textarea v-model="reviewForm.content" required placeholder="이 장소는 어땠나요?" rows="4"></textarea>
            <div class="review-form-row">
              <input v-model="reviewForm.edit_password" required type="password" placeholder="수정용 비밀번호" />
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
            <small>{{ new Date(review.created_at).toLocaleDateString("ko-KR") }}</small>
          </article>
        </section>
      </template>
    </aside>
  </main>
</template>
