<script setup>
const props = defineProps({
  place: { type: Object, required: true }
})

const placeholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
    <rect width="640" height="420" fill="#ffe500"/>
    <path d="M115 282c62-98 128-136 199-112 96 32 134-58 217-24 53 22 69 77 36 125-40 58-126 72-240 72-98 0-170-20-212-61z" fill="#62f08d" stroke="#111" stroke-width="7"/>
    <circle cx="266" cy="210" r="55" fill="#ff91cb" stroke="#111" stroke-width="7"/>
    <rect x="342" y="185" width="122" height="92" rx="18" fill="#1f7aff" stroke="#111" stroke-width="7"/>
    <text x="320" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#111">대유잼</text>
  </svg>`)

function onImageError(event) {
  event.target.src = placeholder
}
</script>

<template>
  <RouterLink class="place-card" :to="`/map/${props.place.id}`">
    <img
      :src="props.place.first_image || props.place.first_image2 || placeholder"
      :alt="props.place.title"
      @error="onImageError"
    />
    <div class="place-card-body">
      <p class="meta">{{ props.place.content_type || '장소' }} · {{ props.place.addr1 || '주소 정보 없음' }}</p>
      <h3>{{ props.place.title }}</h3>
      <p class="rating">별점 {{ props.place.average_rating || 0 }} · 리뷰 {{ props.place.review_count || 0 }}</p>
      <p class="reason">{{ props.place.recommendation_reason || `${props.place.content_type || '지역'} 관심사를 반영한 추천이에요.` }}</p>
    </div>
  </RouterLink>
</template>
