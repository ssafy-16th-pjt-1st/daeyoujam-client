<template>
  <AppHeader />
  <main class="app-container page-stack">
    <section class="chat-page">
      <div class="chat-heading">
        <div class="chat-avatar" aria-hidden="true"></div>
        <div>
          <p class="eyebrow">AI 동네 가이드</p>
          <h1>대유잼 챗봇</h1>
          <p class="muted">{{ profileSummary }}를 반영해 대전·충청권 장소 데이터에서 추천해요.</p>
        </div>
      </div>

      <div class="chat-shell">
        <div class="chat-log" ref="chatLog">
          <article v-for="message in messages" :key="message.id" class="chat-turn" :class="message.role">
            <div class="chat-message">{{ message.text }}</div>
            <div v-if="message.places?.length" class="chat-place-grid">
              <article v-for="place in message.places" :key="place.id" class="chat-place-card">
                <img
                  :src="place.first_image || place.first_image2 || placeholder"
                  :alt="place.title"
                  @error="onImageError"
                />
                <div class="chat-place-body">
                  <span class="badge">{{ place.content_type || '장소' }}</span>
                  <h3>{{ place.title }}</h3>
                  <p class="meta">{{ place.addr1 || '주소 정보 없음' }}</p>
                  <p class="rating">별점 {{ place.average_rating || 0 }} · 리뷰 {{ place.review_count || 0 }}</p>
                  <p class="reason">{{ place.recommendation_reason }}</p>
                  <RouterLink class="detail-button" :to="`/map/${place.id}`">자세히 보기</RouterLink>
                </div>
              </article>
            </div>
          </article>
          <div v-if="loading" class="chat-turn bot">
            <div class="chat-message">장소 데이터를 검색하고 추천 근거를 정리하고 있어요.</div>
          </div>
        </div>

        <p v-if="error" class="notice">{{ error }}</p>

        <form class="chat-input-bar" @submit.prevent="submitMessage">
          <input
            v-model="draft"
            :disabled="loading"
            placeholder="예: 유성구에서 친구랑 갈 만한 실내 문화시설 추천해줘"
          />
          <button type="submit" :disabled="loading || !draft.trim()">전송</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'

import { sendChatMessage } from '../api/ai'
import AppHeader from '../components/common/AppHeader.vue'
import { useProfileStore } from '../stores/profile'

const profileStore = useProfileStore()
const draft = ref('')
const loading = ref(false)
const error = ref('')
const chatLog = ref(null)

const placeholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
    <rect width="640" height="420" fill="#f7f7f5"/>
    <text x="320" y="214" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="#d83b18">대유잼</text>
    <text x="266" y="232" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#008b72">전</text>
  </svg>`)

const profile = computed(() => profileStore.profile || {})
const profileSummary = computed(() => {
  const parts = []
  if (profile.value.district) parts.push(profile.value.district)
  if (profile.value.ageGroup) parts.push(profile.value.ageGroup)
  if (profile.value.interests?.length) parts.push(profile.value.interests.join(', '))
  return parts.length ? parts.join(' · ') : '사용자 정보'
})

const messages = ref([
  {
    id: crypto.randomUUID(),
    role: 'bot',
    text: '궁금한 지역, 분위기, 동행 유형을 알려주면 내 프로필과 장소 데이터를 함께 보고 추천해드릴게요.',
    places: []
  }
])

function onImageError(event) {
  event.target.src = placeholder
}

async function scrollToBottom() {
  await nextTick()
  if (chatLog.value) chatLog.value.scrollTop = chatLog.value.scrollHeight
}

async function submitMessage() {
  const text = draft.value.trim()
  if (!text || loading.value) return

  messages.value.push({ id: crypto.randomUUID(), role: 'user', text, places: [] })
  draft.value = ''
  loading.value = true
  error.value = ''
  await scrollToBottom()

  try {
    const response = await sendChatMessage({
      message: text,
      user_profile: {
        nickname: profile.value.nickname,
        age_group: profile.value.ageGroup,
        gender: profile.value.gender,
        district: profile.value.district,
        interests: profile.value.interests || []
      },
      limit: 4
    })
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'bot',
      text: response.answer,
      places: response.places || []
    })
  } catch {
    error.value = '챗봇 API 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해 주세요.'
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}
</script>
