<script setup>
const props = defineProps({
  place: { type: Object, required: true }
})

const placeholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
    <rect width="640" height="420" fill="#f7f7f5"/>
    <text x="320" y="214" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="#d83b18">대유잼</text>
    <text x="266" y="232" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#008b72">전</text>
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
      <p class="meta">{{ props.place.content_type }} · {{ props.place.addr1 || '주소 정보 없음' }}</p>
      <h3>{{ props.place.title }}</h3>
      <p class="rating">별점 {{ props.place.average_rating || 0 }} · 리뷰 {{ props.place.review_count || 0 }}</p>
      <p class="reason">{{ props.place.recommendation_reason || `${props.place.content_type} 관심사를 반영한 추천이에요.` }}</p>
    </div>
  </RouterLink>
</template>
