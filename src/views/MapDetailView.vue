<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { fetchPlace } from "../api/places";
import { createReview, deleteReview, fetchRating, fetchReviews, summarizeReviews, updateReview } from "../api/reviews";
import { saveUser } from "../api/users";
import AppHeader from "../components/common/AppHeader.vue";
import SinglePlaceMap from "../components/place/SinglePlaceMap.vue";
import { DAEYUJAM_PLACEHOLDER_IMAGE } from "../constants/images";
import { useNotificationStore } from "../stores/notification";
import { useProfileStore } from "../stores/profile";

const route = useRoute();
const profileStore = useProfileStore();
const notificationStore = useNotificationStore();

const place = ref(null);
const rating = ref({ average_rating: 0, review_count: 0 });
const reviews = ref([]);
const briefing = ref([]);
const loading = ref(false);
const reviewLoading = ref(false);
const summaryLoading = ref(false);
const error = ref("");
const detailPanel = ref(null);

const reviewForm = reactive({
  rating: 5,
  content: "",
  edit_password: "",
});

const editForm = reactive({
  id: null,
  rating: 5,
  content: "",
  edit_password: "",
});

const selectedImage = computed(() => {
  if (!place.value) return DAEYUJAM_PLACEHOLDER_IMAGE;
  return place.value.first_image || place.value.first_image2 || DAEYUJAM_PLACEHOLDER_IMAGE;
});

const reviewAuthor = computed(() => profileStore.nickname);
const averageRating = computed(() => rating.value.average_rating || place.value?.average_rating || 0);
const reviewCount = computed(() => rating.value.review_count || place.value?.review_count || 0);

function notifySuccess(message, title = "완료되었습니다") {
  notificationStore.show({ title, message, tone: "success" });
}

function notifyError(message, title = "처리하지 못했습니다") {
  notificationStore.show({ title, message, tone: "error" });
}

async function ensureUserProfileSaved() {
  const profile = profileStore.profile;
  if (!profile?.guestId) {
    throw new Error("PROFILE_MISSING");
  }

  await saveUser({
    guest_id: profile.guestId,
    nickname: profile.nickname || "여행자",
    age_group: profile.ageGroup,
    gender: profile.gender,
    province: profile.province || "대전광역시",
    city: profile.city || "대덕구",
    district: profile.district || "",
    interests: profile.interests || [],
    preferred_keywords: profile.preferredKeywords || [],
    travel_style: profile.travelStyle,
    companion_type: profile.companionType,
  });
}

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
  try {
    const [reviewData, ratingData] = await Promise.all([fetchReviews(placeId), fetchRating(placeId)]);
    reviews.value = reviewData;
    rating.value = ratingData;
    await loadReviewSummary(placeId);
  } catch {
    notifyError("리뷰 정보를 불러오지 못했습니다.");
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
    await nextTick();
    detailPanel.value?.scrollTo({ top: 0 });
  } catch {
    error.value = "장소 정보를 불러오지 못했습니다.";
    place.value = null;
  } finally {
    loading.value = false;
  }
}

async function submitReview() {
  if (!place.value) return;

  if (!profileStore.profile?.guestId) {
    notifyError("닉네임을 먼저 등록해 주세요.");
    return;
  }

  try {
    await ensureUserProfileSaved();
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
    notifySuccess("리뷰가 등록되었습니다.");
  } catch (submitError) {
    const detail = submitError.response?.data?.detail || submitError.cause?.response?.data?.detail;
    if (detail === "User profile not found") {
      notifyError("프로필 정보를 서버에 저장한 뒤 다시 시도해 주세요.");
      return;
    }
    notifyError("리뷰 내용과 비밀번호를 확인해 주세요.");
  }
}

function startEditReview(review) {
  editForm.id = review.id;
  editForm.rating = review.rating;
  editForm.content = review.content;
  editForm.edit_password = "";
}

function cancelEditReview() {
  editForm.id = null;
  editForm.rating = 5;
  editForm.content = "";
  editForm.edit_password = "";
}

async function submitEditReview() {
  if (!place.value || !editForm.id) return;

  try {
    await updateReview(place.value.id, editForm.id, {
      rating: Number(editForm.rating),
      content: editForm.content.trim(),
      edit_password: editForm.edit_password,
    });
    cancelEditReview();
    await loadPlaceReviews(place.value.id);
    notifySuccess("리뷰가 수정되었습니다.");
  } catch {
    notifyError("비밀번호가 맞지 않거나 수정 내용을 확인할 수 없습니다.");
  }
}

async function removeReview(review) {
  if (!place.value) return;
  const password = window.prompt("리뷰 작성 시 입력한 비밀번호를 입력해 주세요.");
  if (!password) return;

  try {
    await deleteReview(place.value.id, review.id, password);
    if (editForm.id === review.id) cancelEditReview();
    await loadPlaceReviews(place.value.id);
    notifySuccess("리뷰가 삭제되었습니다.");
  } catch {
    notifyError("비밀번호가 맞지 않아 리뷰를 삭제하지 못했습니다.");
  }
}

onMounted(loadPlaceDetail);

watch(
  () => route.params.placeId,
  () => {
    cancelEditReview();
    loadPlaceDetail();
  },
);
</script>

<template>
  <AppHeader />
  <main class="detail-layout">
    <section class="map-panel">
      <div class="map-frame">
        <SinglePlaceMap v-if="place" :content_id="place.content_id" />
        <p v-else-if="loading" class="status">지도를 준비하고 있습니다.</p>
      </div>
    </section>

    <aside ref="detailPanel" class="detail-panel">
      <p v-if="error" class="notice">{{ error }}</p>
      <p v-else-if="loading && !place" class="notice">장소 정보를 불러오는 중입니다.</p>

      <template v-else-if="place">
        <section class="detail-hero">
          <img class="detail-image" :src="selectedImage" :alt="place.title" />
          <div class="detail-hero-body">
            <span class="badge">{{ place.content_type || "장소" }}</span>
            <h1>{{ place.title }}</h1>
            <p>{{ place.addr1 || "주소 정보 없음" }} {{ place.addr2 || "" }}</p>
          </div>
        </section>

        <section class="detail-summary-strip">
          <div>
            <strong>★ {{ averageRating }}</strong>
            <span>평균 별점</span>
          </div>
          <div>
            <strong>{{ reviewCount }}</strong>
            <span>리뷰</span>
          </div>
        </section>

        <section class="ai-briefing detail-section">
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">AI Briefing</p>
              <h3>AI 리뷰 브리핑</h3>
            </div>
            <span v-if="summaryLoading" class="muted">생성 중</span>
          </div>
          <p v-for="line in briefing" :key="line">{{ line }}</p>
        </section>

        <section class="review-section detail-section">
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
              <input v-model="reviewForm.edit_password" required type="password" placeholder="수정/삭제용 비밀번호" />
              <button class="primary-button" type="submit">등록</button>
            </div>
          </form>
        </section>

        <section class="review-list detail-section">
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">Visitors</p>
              <h3>방문자 리뷰</h3>
            </div>
          </div>

          <p v-if="reviewLoading" class="muted">리뷰를 불러오는 중입니다.</p>
          <p v-else-if="!reviews.length" class="muted">아직 등록된 리뷰가 없습니다.</p>

          <article v-for="review in reviews" v-else :key="review.id" class="review-card">
            <form v-if="editForm.id === review.id" class="review-edit-form" @submit.prevent="submitEditReview">
              <div class="review-form-row">
                <select v-model="editForm.rating" aria-label="수정 별점">
                  <option v-for="score in [5, 4, 3, 2, 1]" :key="score" :value="score">★ {{ score }}</option>
                </select>
                <input v-model="editForm.edit_password" required type="password" placeholder="비밀번호" />
              </div>
              <textarea v-model="editForm.content" required rows="3"></textarea>
              <div class="review-actions">
                <button class="text-button" type="button" @click="cancelEditReview">취소</button>
                <button class="primary-button compact-button" type="submit">저장</button>
              </div>
            </form>

            <template v-else>
              <div class="review-card-head">
                <div>
                  <strong>{{ review.nickname }}</strong>
                  <small>{{ new Date(review.created_at).toLocaleDateString("ko-KR") }}</small>
                </div>
                <span>★ {{ review.rating }}</span>
              </div>
              <p>{{ review.content }}</p>
              <div class="review-actions">
                <button class="text-button" type="button" @click="startEditReview(review)">수정</button>
                <button class="text-button danger" type="button" @click="removeReview(review)">삭제</button>
              </div>
            </template>
          </article>
        </section>
      </template>
    </aside>
  </main>
</template>
