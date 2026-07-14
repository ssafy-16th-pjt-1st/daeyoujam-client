<script setup>
const props = defineProps({
  place: { type: Object, required: true }
})

const placeholder =
  'data:image/svg+xml;utf8,' +
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
