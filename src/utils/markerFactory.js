// 색상 MarkerImage 생성 + 클러스터 스타일 생성 유틸.
// MarkerImage는 색상별로 캐싱하여 카테고리 수(최대 8~9개)만큼만 인스턴스를 만든다.

const MARKER_WIDTH = 28
const MARKER_HEIGHT = 40

// color -> kakao.maps.MarkerImage 캐시 (색상별 1개만 생성).
const markerImageCache = new Map()

function pinDataUri(color) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_WIDTH}" height="${MARKER_HEIGHT}" ` +
    `viewBox="0 0 28 40">` +
    `<path d="M14 0C6.27 0 0 6.05 0 13.53 0 23.6 14 40 14 40s14-16.4 14-26.47C28 6.05 21.73 0 14 0z" ` +
    `fill="${color}" stroke="#ffffff" stroke-width="1.5"/>` +
    `<circle cx="14" cy="13.5" r="5" fill="#ffffff"/>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// 카테고리 색상별 마커 이미지를 반환한다(캐시 재사용).
export function getMarkerImage(kakao, color) {
  const cached = markerImageCache.get(color)
  if (cached) {
    return cached
  }

  const image = new kakao.maps.MarkerImage(
    pinDataUri(color),
    new kakao.maps.Size(MARKER_WIDTH, MARKER_HEIGHT),
    // 좌표에 핀 끝(하단 중앙)이 오도록 offset 지정.
    { offset: new kakao.maps.Point(MARKER_WIDTH / 2, MARKER_HEIGHT) },
  )

  markerImageCache.set(color, image)
  return image
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// MarkerClusterer용 카테고리 색상 스타일(원형 배지).
// calculator 기본값[10, 100]에 맞춰 3단계 크기 스타일을 반환한다.
export function clusterStyles(color) {
  const base = {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
    background: hexToRgba(color, 0.9),
  }

  return [
    { ...base, width: '36px', height: '36px', lineHeight: '36px', fontSize: '12px' },
    { ...base, width: '46px', height: '46px', lineHeight: '46px', fontSize: '13px' },
    { ...base, width: '58px', height: '58px', lineHeight: '58px', fontSize: '14px' },
  ]
}
