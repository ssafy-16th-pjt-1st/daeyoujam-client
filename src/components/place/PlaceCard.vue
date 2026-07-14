<script setup>
import { DAEYUJAM_PLACEHOLDER_IMAGE } from '../../constants/images'

const props = defineProps({
  place: { type: Object, required: true }
})

function onImageError(event) {
  event.target.src = DAEYUJAM_PLACEHOLDER_IMAGE
}
</script>

<template>
  <RouterLink class="place-card" :to="`/map/${props.place.id}`">
    <img
      :src="props.place.first_image || props.place.first_image2 || DAEYUJAM_PLACEHOLDER_IMAGE"
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
