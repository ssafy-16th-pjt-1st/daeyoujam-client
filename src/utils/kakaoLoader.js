// Kakao Maps SDK loader (clusterer 라이브러리 포함).
// - 중복 로드 방지: 단일 Promise를 모듈 스코프에 캐싱해 재사용한다.
// - MarkerClusterer가 이미 준비돼 있으면 즉시 resolve 한다.
// - 앱키는 .env(VITE_KAKAO_MAP_KEY)에서만 주입하며 하드코딩하지 않는다.

const SDK_URL = '//dapi.kakao.com/v2/maps/sdk.js'

let loadPromise = null

export function loadKakaoMaps() {
  // clusterer까지 올라온 상태면 재로딩 없이 그대로 사용한다.
  if (window.kakao?.maps?.MarkerClusterer) {
    return Promise.resolve(window.kakao)
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const appkey = import.meta.env.VITE_KAKAO_MAP_KEY
    if (!appkey) {
      loadPromise = null
      reject(new Error('VITE_KAKAO_MAP_KEY가 설정되지 않았습니다.'))
      return
    }

    // autoload=false 이므로 스크립트 로드 후 kakao.maps.load()로 초기화한다.
    const initialize = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }

    const existing = document.querySelector('script[data-kakao-clusterer-sdk="true"]')
    if (existing) {
      if (window.kakao?.maps) {
        initialize()
      } else {
        existing.addEventListener('load', initialize, { once: true })
        existing.addEventListener('error', reject, { once: true })
      }
      return
    }

    const script = document.createElement('script')
    script.src = `${SDK_URL}?appkey=${appkey}&autoload=false&libraries=clusterer`
    script.async = true
    script.defer = true
    script.dataset.kakaoClustererSdk = 'true'
    script.onload = initialize
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Kakao Maps SDK(clusterer) 로드에 실패했습니다.'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
