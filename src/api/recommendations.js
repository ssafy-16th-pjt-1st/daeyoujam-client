import { http } from './http'

export async function fetchRecommendations(payload) {
  const { data } = await http.post('/api/v1/recommendations', payload)
  return data
}

export async function fetchRecommendedPosts(payload) {
  const { data } = await http.post('/api/v1/recommendations/posts', payload)
  return data
}
