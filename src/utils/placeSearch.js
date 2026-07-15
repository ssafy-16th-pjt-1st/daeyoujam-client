// 좌표가 유효한 장소만 지도 이동이 가능하다.
export function hasValidCoords(place) {
  const lat = Number(place.mapy);
  const lng = Number(place.mapx);
  return !Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0;
}

// 로드된 장소 배열을 제목(title) 기준으로 검색한다.
// 접두 일치를 먼저, 그다음 부분 일치 순으로 정렬한다.
export function filterPlaces(places, query, limit = 50) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  const prefix = [];
  const partial = [];

  for (const place of places) {
    if (!hasValidCoords(place)) {
      continue;
    }
    const title = (place.title ?? "").toLowerCase();
    const index = title.indexOf(q);
    if (index === 0) {
      prefix.push(place);
    } else if (index > 0) {
      partial.push(place);
    }
  }

  const merged = prefix.concat(partial);
  return Number.isFinite(limit) ? merged.slice(0, limit) : merged;
}
