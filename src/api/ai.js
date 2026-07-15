import { http } from './http'

function getChatErrorMessage(error) {
  if (error.code === 'ECONNABORTED') {
    return 'AI 추천 응답이 지연되고 있어요. 잠시 후 다시 시도하거나 백엔드 로그에서 LLM 응답 시간을 확인해 주세요.'
  }

  if (!error.response) {
    return '백엔드 서버에 연결하지 못했어요. 서버가 켜져 있는지 확인한 뒤 http://127.0.0.1:8000/health 를 확인해 주세요.'
  }

  const { status, data } = error.response
  const detail = data?.detail

  if (status === 503) {
    return detail || 'AI 제공자 연결에 실패했어요. 백엔드 .env의 OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL 값을 확인하고 서버를 재시작해 주세요.'
  }

  if (status === 422) {
    return '요청 형식이 올바르지 않아요. 메시지를 짧게 다시 입력하거나 페이지를 새로고침해 주세요.'
  }

  if (status >= 500) {
    return '서버 내부 오류가 발생했어요. 백엔드 콘솔 로그를 확인한 뒤 다시 시도해 주세요.'
  }

  return detail || 'AI 추천 요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
}

export async function sendChatMessage(payload) {
  try {
    const { data } = await http.post('/api/ai/chat', payload, { timeout: 20000 })
    return data
  } catch (error) {
    const normalizedError = new Error(getChatErrorMessage(error))
    normalizedError.cause = error
    throw normalizedError
  }
}

export async function fetchChatHistory(guestId, sessionId) {
  const params = { guest_id: guestId }
  if (sessionId) params.session_id = sessionId
  const { data } = await http.get('/api/ai/chat/history', { params })
  return data
}

export async function clearChatHistory(guestId) {
  await http.delete('/api/ai/chat/history', { params: { guest_id: guestId } })
}
