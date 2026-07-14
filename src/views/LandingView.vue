<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { saveUser } from '../api/users'
import { useProfileStore } from '../stores/profile'

const router = useRouter()
const profileStore = useProfileStore()
const error = ref('')

const REGION_DATA = {
  대전광역시: {
    대전광역시: ['동구', '중구', '서구', '유성구', '대덕구']
  },
  충청북도: {
    청주시: ['상당구', '서원구', '흥덕구', '청원구'],
    충주시: [],
    제천시: [],
    보은군: [],
    옥천군: [],
    영동군: [],
    증평군: [],
    진천군: [],
    괴산군: [],
    음성군: [],
    단양군: []
  },
  충청남도: {
    천안시: ['동남구', '서북구'],
    공주시: [],
    보령시: [],
    아산시: [],
    서산시: [],
    논산시: [],
    계룡시: [],
    당진시: [],
    금산군: [],
    부여군: [],
    서천군: [],
    청양군: [],
    홍성군: [],
    예산군: [],
    태안군: []
  },
  세종특별자치시: {
    세종특별자치시: []
  }
}

const categories = ['관광지', '문화시설', '축제공연행사', '여행코스', '레포츠', '숙박', '쇼핑', '음식점']
const travelStyles = ['느긋한 산책', '맛집 탐방', '문화생활', '사진 촬영', '액티비티', '축제', '쇼핑', '가족 나들이', '무관']
const companionTypes = ['혼자', '친구', '연인', '가족', '아이 동반', '반려동물', '무관']

const form = reactive({
  interests: [],
  preferredKeywordsText: '',
  ageGroup: '응답 안 함',
  gender: '응답 안 함',
  province: '대전광역시',
  city: '대전광역시',
  district: '유성구',
  travelStyle: '무관',
  companionType: '무관',
  nickname: ''
})

const provinceOptions = computed(() => Object.keys(REGION_DATA))
const cityOptions = computed(() => Object.keys(REGION_DATA[form.province] || {}))
const districtOptions = computed(() => REGION_DATA[form.province]?.[form.city] || [])

function toggleCategory(category) {
  const index = form.interests.indexOf(category)
  if (index >= 0) form.interests.splice(index, 1)
  else form.interests.push(category)
}

function syncProvince() {
  form.city = cityOptions.value[0] || ''
  form.district = districtOptions.value[0] || ''
}

function syncCity() {
  form.district = districtOptions.value[0] || ''
}

async function submit() {
  if (!form.interests.length) {
    error.value = '관심 카테고리를 하나 이상 선택해 주세요.'
    return
  }
  if (!form.nickname.trim()) {
    error.value = '닉네임을 입력해 주세요.'
    return
  }

  const preferredKeywords = form.preferredKeywordsText
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)
  const district = form.district || ''

  profileStore.save({ ...form, district, preferredKeywords, nickname: form.nickname.trim() })

  try {
    await saveUser({
      guest_id: profileStore.profile.guestId,
      nickname: profileStore.profile.nickname,
      age_group: profileStore.profile.ageGroup,
      gender: profileStore.profile.gender,
      province: profileStore.profile.province,
      city: profileStore.profile.city,
      district: profileStore.profile.district,
      interests: profileStore.profile.interests,
      preferred_keywords: profileStore.profile.preferredKeywords,
      travel_style: profileStore.profile.travelStyle,
      companion_type: profileStore.profile.companionType
    })
  } catch {
    // 서버 저장 실패가 온보딩 진행을 막지는 않는다. MVP에서는 localStorage 프로필을 기준으로 동작한다.
  }
  router.push('/home')
}
</script>

<template>
  <main class="landing-shell">
    <section class="onboarding-card landing-card">
      <div class="landing-intro">
        <p class="eyebrow daeyoujam-logo logo-large">
          <span class="logo-dae">대<span class="logo-jeon">전</span></span><span>유잼</span>
        </p>
        <h1>오늘의 대전을 취향대로 골라보세요.</h1>
        <p class="lead">관심사, 사는 곳, 동행 스타일을 저장하면 대전과 충청권 장소 추천부터 AI 챗봇, 게시판까지 이어서 사용할 수 있어요.</p>
      </div>

      <div class="landing-visual" aria-hidden="true">
        <span class="visual-map"></span>
        <span class="visual-pin visual-pin-main"></span>
        <span class="visual-pin visual-pin-sub"></span>
      </div>

      <div class="category-grid">
        <button
          v-for="category in categories"
          :key="category"
          class="category-tile"
          :class="{ selected: form.interests.includes(category) }"
          type="button"
          @click="toggleCategory(category)"
        >
          <strong>{{ category }}</strong>
          <span>추천에 반영</span>
        </button>
      </div>

      <form class="profile-form" @submit.prevent="submit">
        <label>
          나이대
          <select v-model="form.ageGroup">
            <option>10대</option>
            <option>20대</option>
            <option>30대</option>
            <option>40대</option>
            <option>50대</option>
            <option>60대 이상</option>
            <option>응답 안 함</option>
          </select>
        </label>
        <label>
          성별
          <select v-model="form.gender">
            <option>여성</option>
            <option>남성</option>
            <option>기타</option>
            <option>응답 안 함</option>
          </select>
        </label>
        <label>
          시/도
          <select v-model="form.province" @change="syncProvince">
            <option v-for="province in provinceOptions" :key="province">{{ province }}</option>
          </select>
        </label>
        <label>
          시/군/구
          <select v-model="form.city" @change="syncCity">
            <option v-for="city in cityOptions" :key="city">{{ city }}</option>
          </select>
        </label>
        <label>
          구
          <select v-model="form.district" :disabled="!districtOptions.length">
            <option v-if="!districtOptions.length" value="">해당 없음</option>
            <option v-for="district in districtOptions" :key="district" :value="district">{{ district }}</option>
          </select>
        </label>
        <label>
          닉네임
          <input v-model="form.nickname" placeholder="예: 유성산책러" />
        </label>
        <label>
          선호 키워드
          <input v-model="form.preferredKeywordsText" placeholder="예: 카페, 야경, 산책" />
        </label>
        <label>
          여행 스타일
          <select v-model="form.travelStyle">
            <option v-for="style in travelStyles" :key="style">{{ style }}</option>
          </select>
        </label>
        <label>
          동행 유형
          <select v-model="form.companionType">
            <option v-for="type in companionTypes" :key="type">{{ type }}</option>
          </select>
        </label>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button class="primary-button" type="submit">시작하기</button>
      </form>
    </section>
  </main>
</template>
