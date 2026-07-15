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

// 전체 장소를 모두 가져온다. 목록 API는 size가 최대 100으로 제한되므로
// 첫 페이지로 total을 파악한 뒤 나머지 페이지를 병렬로 요청해 합친다.
export async function fetchAllPlaces(params = {}) {
  const size = 100
  const first = await fetchPlaces({ ...params, page: 1, size })
  const total = first.total ?? first.items.length
  const pageCount = Math.ceil(total / size)

  if (pageCount <= 1) {
    return first.items
  }

  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      fetchPlaces({ ...params, page: index + 2, size }).then((response) => response.items),
    ),
  )

  return first.items.concat(...rest)
}

