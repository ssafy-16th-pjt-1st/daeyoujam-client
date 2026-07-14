<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useProfileStore } from '../stores/profile'
import { saveUser } from '../api/users'

const router = useRouter()
const profileStore = useProfileStore()
const error = ref('')
const categories = ['관광지', '문화시설', '축제공연행사', '여행코스', '레포츠', '숙박', '쇼핑', '음식점']
const cities = [
  { province: '대전광역시', city: '대전광역시', districts: ['유성구', '서구', '중구', '동구', '대덕구'] },
  { province: '세종특별자치시', city: '세종특별자치시', districts: [''] },
  { province: '충청북도', city: '청주시', districts: ['상당구', '서원구', '흥덕구', '청원구'] },
  { province: '충청북도', city: '옥천군', districts: [''] },
  { province: '충청남도', city: '공주시', districts: [''] },
  { province: '충청남도', city: '논산시', districts: [''] },
  { province: '충청남도', city: '계룡시', districts: [''] }
]
const travelStyles = ['힐링', '맛집 탐방', '문화생활', '사진 촬영', '액티비티', '축제', '쇼핑', '가족 나들이', '무관']
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

function toggleCategory(category) {
  const index = form.interests.indexOf(category)
  if (index >= 0) form.interests.splice(index, 1)
  else form.interests.push(category)
}

function cityOptions() {
  return cities.map((item) => item.city)
}

function districtOptions() {
  return cities.find((item) => item.city === form.city)?.districts || ['']
}

function syncCity() {
  const selected = cities.find((item) => item.city === form.city)
  if (!selected) return
  form.province = selected.province
  form.district = selected.districts[0] || ''
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
  profileStore.save({ ...form, preferredKeywords, nickname: form.nickname.trim() })
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
    // 서버 저장 실패는 온보딩을 막지 않는다. MVP에서는 localStorage가 기준이다.
  }
  router.push('/home')
}
</script>

<template>
  <main class="landing-shell">
    <section class="onboarding-card">
      <p class="eyebrow daeyoujam-logo logo-large">
        <span class="logo-dae">대<span class="logo-jeon">전</span></span><span>유잼</span>
      </p>
      <h1>오늘의 대전·충청, 유잼으로 골라봐요.</h1>
      <p class="lead">관심사, 동행, 여행 스타일을 저장하면 장소와 동네 게시물을 함께 추천해요.</p>

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
          <span>지역 콘텐츠 보기</span>
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
            <option>남성</option>
            <option>여성</option>
            <option>기타</option>
            <option>응답 안 함</option>
          </select>
        </label>
        <label>
          시·군
          <select v-model="form.city" @change="syncCity">
            <option v-for="city in cityOptions()" :key="city">{{ city }}</option>
          </select>
        </label>
        <label>
          구
          <select v-model="form.district">
            <option v-for="district in districtOptions()" :key="district" :value="district">{{ district || '해당 없음' }}</option>
          </select>
        </label>
        <label>
          닉네임
          <input v-model="form.nickname" placeholder="예: 여행자204" />
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
