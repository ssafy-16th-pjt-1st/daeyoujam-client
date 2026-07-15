import { http } from './http'

export async function fetchReviews(placeId) {
  const { data } = await http.get(`/api/v1/places/${placeId}/reviews`)
  return data
}

export async function createReview(placeId, payload) {
  const { data } = await http.post(`/api/v1/places/${placeId}/reviews`, payload)
  return data
}

export async function updateReview(placeId, reviewId, payload) {
  const { data } = await http.put(`/api/v1/places/${placeId}/reviews/${reviewId}`, payload)
  return data
}

export async function deleteReview(placeId, reviewId, editPassword) {
  await http.delete(`/api/v1/places/${placeId}/reviews/${reviewId}`, {
    data: { edit_password: editPassword }
  })
}

export async function fetchRating(placeId) {
  const { data } = await http.get(`/api/v1/places/${placeId}/rating`)
  return data
}

export async function summarizeReviews(placeId) {
  const { data } = await http.post(`/api/ai/reviews/${placeId}/summary`, {}, { timeout: 20000 })
  return data
}
