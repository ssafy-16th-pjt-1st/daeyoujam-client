// 카테고리 → 색상 매핑. 개별 마커와 클러스터가 동일 색상을 공유하도록
// 이 파일을 단일 출처(single source of truth)로 사용한다.
// 카테고리 명칭은 CategoryChips.vue와 반드시 일치시킨다.

export const CATEGORY_COLORS = {
  관광지: '#e6482e',
  문화시설: '#2d7dd2',
  축제공연행사: '#f4a300',
  여행코스: '#7b2ff7',
  레포츠: '#12a150',
  숙박: '#d81b60',
  쇼핑: '#ff7a00',
  음식점: '#00897b',
}

// 매핑에 없는(혹은 content_type이 비어있는) 장소용 기본 색상.
export const DEFAULT_COLOR = '#6b7280'

// 범례/클러스터러 생성 순회에 쓰는 카테고리 목록.
export const CATEGORY_LIST = Object.keys(CATEGORY_COLORS)

export function colorOf(contentType) {
  return CATEGORY_COLORS[contentType] || DEFAULT_COLOR
}
