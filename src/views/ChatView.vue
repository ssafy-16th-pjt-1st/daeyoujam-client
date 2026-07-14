<template>
  <AppHeader />
  <main class="app-container chat-container">
    <section class="chat-page ai-chat-page">
      <aside class="chat-side-panel">
        <div class="chat-orb" aria-hidden="true">
          <span class="chat-bubble-mark"></span>
        </div>
        <p class="eyebrow">DAEYUJAM AI</p>
        <h1>당신의 취향을 읽는<br />AI 여행 가이드</h1>
        <p>{{ profileSummary }} 정보를 바탕으로 장소와 이유를 함께 추천해요.</p>
        <div class="prompt-chip-row">
          <button type="button" @click="usePrompt('성심당 근처에서 같이 갈 만한 카페 추천해줘')">
            성심당 근처 카페
          </button>
          <button
            type="button"
            @click="usePrompt('비 오는 날 대전에서 갈 만한 실내 장소 추천해줘')"
          >
            비 오는 날
          </button>
          <button type="button" @click="usePrompt('유성구에서 저녁 산책하기 좋은 곳 알려줘')">
            저녁 산책
          </button>
        </div>
      </aside>

      <section class="chat-main-panel">
        <div class="chat-log" ref="chatLog">
          <article
            v-for="message in messages"
            :key="message.id"
            class="chat-turn"
            :class="message.role"
          >
            <div class="chat-speaker">{{ message.role === "user" ? "나" : "대유잼 AI" }}</div>
            <div class="chat-message">{{ message.text }}</div>
            <div v-if="message.places?.length" class="chat-place-grid">
              <article v-for="place in message.places" :key="place.id" class="chat-place-card">
                <img
                  :src="place.first_image || place.first_image2 || placeholder"
                  :alt="place.title"
                  @error="onImageError"
                />
                <div class="chat-place-body">
                  <span class="badge">{{ place.content_type || "장소" }}</span>
                  <h3>{{ place.title }}</h3>
                  <p class="meta">{{ place.addr1 || "주소 정보 없음" }}</p>
                  <p class="rating">
                    별점 {{ place.average_rating || 0 }} · 리뷰 {{ place.review_count || 0 }}
                  </p>
                  <p class="reason">{{ place.recommendation_reason }}</p>
                  <RouterLink class="detail-button" :to="`/map/${place.id}`"
                    >자세히 보기</RouterLink
                  >
                </div>
              </article>
            </div>
          </article>
          <div v-if="loading" class="chat-turn bot">
            <div class="chat-speaker">대유잼 AI</div>
            <div class="chat-message typing-message"><span></span><span></span><span></span></div>
          </div>
        </div>

        <p v-if="error" class="notice">{{ error }}</p>

        <form class="chat-input-bar ai-chat-input" @submit.prevent="submitMessage">
          <input
            v-model="draft"
            :disabled="loading"
            placeholder="예: 유성구에서 친구와 갈 만한 실내 문화시설 추천해줘"
          />
          <button type="submit" :disabled="loading || !draft.trim()" aria-label="전송">
            <span aria-hidden="true"></span>
          </button>
        </form>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";

import { sendChatMessage } from "../api/ai";
import AppHeader from "../components/common/AppHeader.vue";
import { useProfileStore } from "../stores/profile";

const profileStore = useProfileStore();
const draft = ref("");
const loading = ref(false);
const error = ref("");
const chatLog = ref(null);

const placeholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
    <rect width="640" height="420" fill="#ffffff"/>
    <g transform="translate(216 154)">
      <rect x="0" y="0" width="72" height="72" rx="22" fill="#ff385c" transform="rotate(-6 36 36)"/>
      <text x="36" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="45" font-weight="900" fill="#ffffff">대</text>
      <circle cx="75" cy="71" r="16" fill="#ffffff" stroke="#ff385c" stroke-width="5"/>
      <text x="75" y="79" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#ff385c">전</text>
      <text x="128" y="54" font-family="Arial, sans-serif" font-size="45" font-weight="900" fill="#222222">유잼</text>
    </g>
  </svg>`);

const profile = computed(() => profileStore.profile || {});
const profileSummary = computed(() => {
  const parts = [];
  if (profile.value.district) parts.push(profile.value.district);
  if (profile.value.ageGroup) parts.push(profile.value.ageGroup);
  if (profile.value.interests?.length) parts.push(profile.value.interests.join(", "));
  return parts.length ? parts.join(" · ") : "사용자";
});

const messages = ref([
  {
    id: crypto.randomUUID(),
    role: "bot",
    text: "궁금한 지역, 분위기, 동행 유형을 알려주면 대전 로컬 장소 데이터를 함께 보고 추천해드릴게요.",
    places: [],
  },
]);

function usePrompt(text) {
  draft.value = text;
}

function onImageError(event) {
  event.target.src = placeholder;
}

async function scrollToBottom() {
  await nextTick();
  if (chatLog.value) chatLog.value.scrollTop = chatLog.value.scrollHeight;
}

async function submitMessage() {
  const text = draft.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ id: crypto.randomUUID(), role: "user", text, places: [] });
  draft.value = "";
  loading.value = true;
  error.value = "";
  await scrollToBottom();

  try {
    const response = await sendChatMessage({
      message: text,
      user_profile: {
        nickname: profile.value.nickname,
        age_group: profile.value.ageGroup,
        gender: profile.value.gender,
        district: profile.value.district,
        interests: profile.value.interests || [],
      },
      limit: 4,
    });
    messages.value.push({
      id: crypto.randomUUID(),
      role: "bot",
      text: response.answer,
      places: response.places || [],
    });
  } catch {
    error.value = "챗봇 API 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해 주세요.";
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}
</script>
