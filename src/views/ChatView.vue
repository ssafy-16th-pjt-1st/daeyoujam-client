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
          <button type="button" @click="usePrompt('성심당 어디있어?')">성심당 위치</button>
          <button type="button" @click="usePrompt('성심당 근처에서 같이 갈 만한 카페 추천해줘')">
            성심당 근처 카페
          </button>
          <button type="button" @click="usePrompt('유성구에서 산책하기 좋은 곳 알려줘')">유성구 산책</button>
        </div>
      </aside>

      <section class="chat-main-panel">
        <div class="chat-log" ref="chatLog">
          <article v-for="message in messages" :key="message.id" class="chat-turn" :class="message.role">
            <div class="chat-speaker">{{ message.role === "user" ? "나" : "대유잼 AI" }}</div>
            <div class="chat-message" :class="{ 'error-message': message.variant === 'error' }">
              <span v-if="message.variant === 'error'" class="chat-message-label">연결 확인 필요</span>
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
                    <RouterLink class="detail-button" :to="`/map/${place.id}`">자세히 보기</RouterLink>
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
          <input v-model="draft" :disabled="loading" placeholder="예: 성심당 어디있어?" />
          <button type="submit" :disabled="loading || !draft.trim()" aria-label="전송">
            <span aria-hidden="true"></span>
          </button>
        </form>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";

import { fetchChatHistory, sendChatMessage } from "../api/ai";
import AppHeader from "../components/common/AppHeader.vue";
import { DAEYUJAM_PLACEHOLDER_IMAGE } from "../constants/images";
import { useProfileStore } from "../stores/profile";

const profileStore = useProfileStore();
const draft = ref("");
const loading = ref(false);
const historyLoading = ref(false);
const chatLog = ref(null);
const sessionId = ref(null);

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
    text: "안녕하세요. 궁금한 지역, 장소, 분위기, 일정을 알려주면 장소 데이터를 함께 보고 추천해드릴게요.",
    places: [],
  },
]);

function defaultGreeting() {
  return {
    id: crypto.randomUUID(),
    role: "bot",
    text: "안녕하세요. 궁금한 지역, 장소, 분위기, 일정을 알려주면 장소 데이터를 함께 보고 추천해드릴게요.",
    places: [],
  };
}

function usePrompt(text) {
  draft.value = text;
}

function onImageError(event) {
  event.target.src = DAEYUJAM_PLACEHOLDER_IMAGE;
}

function plainText(text = "") {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^\s{0,3}[-*]\s+/gm, "")
    .trim();
}

async function scrollToBottom() {
  await nextTick();
  if (chatLog.value) chatLog.value.scrollTop = chatLog.value.scrollHeight;
}

async function loadChatHistory() {
  if (!profile.value.guestId) return;
  historyLoading.value = true;
  try {
    const history = await fetchChatHistory(profile.value.guestId);
    sessionId.value = history.session_id || null;
    if (history.messages?.length) {
      messages.value = history.messages.map((message) => ({
        id: `saved-${message.id}`,
        role: message.role,
        text: plainText(message.text),
        places: message.places || [],
      }));
    } else {
      messages.value = [defaultGreeting()];
    }
    await scrollToBottom();
  } catch {
    messages.value = [defaultGreeting()];
  } finally {
    historyLoading.value = false;
  }
}

async function submitMessage() {
  const text = draft.value.trim();
  if (!text || loading.value || historyLoading.value) return;

  messages.value.push({ id: crypto.randomUUID(), role: "user", text, places: [] });
  draft.value = "";
  loading.value = true;
  await scrollToBottom();

  try {
    const response = await sendChatMessage({
      guest_id: profile.value.guestId,
      session_id: sessionId.value,
      message: text,
      user_profile: {
        nickname: profile.value.nickname,
        guest_id: profile.value.guestId,
        age_group: profile.value.ageGroup,
        gender: profile.value.gender,
        district: profile.value.district,
        interests: profile.value.interests || [],
      },
      limit: 4,
    });
    sessionId.value = response.session_id || sessionId.value;
    messages.value.push({
      id: crypto.randomUUID(),
      role: "bot",
      text: plainText(response.answer),
      places: response.places || [],
    });
  } catch (chatError) {
    messages.value.push({
      id: crypto.randomUUID(),
      role: "bot",
      variant: "error",
      text: plainText(chatError.message || "AI 추천 요청을 처리하지 못했습니다. 백엔드 서버 설정을 확인해 주세요."),
      places: [],
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}

onMounted(loadChatHistory);
</script>
