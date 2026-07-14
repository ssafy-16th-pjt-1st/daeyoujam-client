import { http } from './http'

export async function fetchPlaces(params = {}) {
  const { data } = await http.get('/api/v1/places', { params })
  return data
}

export async function searchPlaces(params = {}) {
  const { data } = await http.get('/api/v1/places/search', { params })
  return data
}

export async function fetchPlace(placeId) {
  const { data } = await http.get(`/api/v1/places/${placeId}`)
  return data
}

