import { http } from './http'

export async function saveUser(payload) {
  const { data } = await http.post('/api/v1/users', payload)
  return data
}
