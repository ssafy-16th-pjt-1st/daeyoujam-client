import { http } from './http'

export async function sendChatMessage(payload) {
  const { data } = await http.post('/api/ai/chat', payload)
  return data
}
