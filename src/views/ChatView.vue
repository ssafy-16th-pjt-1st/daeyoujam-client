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
        <p>{{ profileSummary }} 정보를 바탕으로 장소 데이터를 함께 보고 추천해요.</p>
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
            <div class="chat-message" :class="{ 'error-message': message.variant === 'error' }">
              <span v-if="message.variant === 'error'" class="chat-message-label"
                >연결 확인 필요</span
              >
              {{ message.text }}
            </div>
            <div v-if="message.places?.length" class="chat-place-grid">
              <article v-for="place in message.places" :key="place.id" class="chat-place-card">
                <img
                  :src="place.first_image || place.first_image2 || DAEYUJAM_PLACEHOLDER_IMAGE"
                  :alt="place.title"
                  @error="onImageError"
                />
                <div class="chat-place-body">
                  <div class="chat-place-topline">
                    <span class="badge">{{ place.content_type || "장소" }}</span>
                    <span class="chat-place-score">★ {{ place.average_rating || "0.0" }}</span>
                  </div>
                  <h3>{{ place.title }}</h3>
                  <p class="meta">{{ place.addr1 || "주소 정보 없음" }}</p>
                  <div class="chat-place-actions">
                    <span class="chat-place-review">리뷰 {{ place.review_count || 0 }}</span>
                    <RouterLink class="detail-button" :to="`/map/${place.id}`"
                      >자세히 보기</RouterLink
                    >
                  </div>
                </div>
              </article>
            </div>
          </article>
          <div v-if="loading" class="chat-turn bot">
            <div class="chat-speaker">대유잼 AI</div>
            <div class="chat-message typing-message"><span></span><span></span><span></span></div>
          </div>
        </div>

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
import { DAEYUJAM_PLACEHOLDER_IMAGE } from "../constants/images";
import { useProfileStore } from "../stores/profile";

const profileStore = useProfileStore();
const draft = ref("");
const loading = ref(false);
const chatLog = ref(null);

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
    text: "안녕하세요! 대유잼 AI 입니다. 궁금한 지역, 분위기, 일정을 알려주면 장소 데이터를 함께 보고 추천해드릴게요.",
    places: [],
  },
]);

function usePrompt(text) {
  draft.value = text;
}

function onImageError(event) {
  event.target.src = DAEYUJAM_PLACEHOLDER_IMAGE;
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
  } catch (chatError) {
    messages.value.push({
      id: crypto.randomUUID(),
      role: "bot",
      variant: "error",
      text:
        chatError.message ||
        "AI 추천 요청을 처리하지 못했어요. 백엔드 서버와 LLM 설정을 확인해 주세요.",
      places: [],
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}
</script>
