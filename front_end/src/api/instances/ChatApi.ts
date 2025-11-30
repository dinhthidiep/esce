import { fetchWithFallback, extractErrorMessage, getAuthToken } from './httpClient'

export type ChatUser = {
  userId: string
  fullName: string
  role: string
  roleId: number
  email: string
}

export type ChatMessage = {
  id: number
  senderId: number
  receiverId: number
  content: string
  createdAt?: string
  isRead?: boolean
}

export type SendChatPayload = {
  receiverId: string
  content: string
}

const ensureToken = () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Vui lòng đăng nhập để tiếp tục trò chuyện.')
  }
  return token
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`
    throw new Error(await extractErrorMessage(response, fallbackMessage))
  }
  return response.json()
}

const normalizeChatUser = (payload: any): ChatUser => ({
  userId: String(payload.userId ?? payload.UserId ?? ''),
  fullName: payload.fullName ?? payload.FullName ?? '',
  role: payload.role ?? payload.Role ?? '',
  roleId: Number(payload.roleId ?? payload.RoleId ?? 0),
  email: payload.email ?? payload.Email ?? ''
})

const normalizeChatMessage = (payload: any): ChatMessage => ({
  id: Number(payload.id ?? payload.Id ?? 0),
  senderId: Number(payload.senderId ?? payload.SenderId ?? 0),
  receiverId: Number(payload.receiverId ?? payload.ReceiverId ?? 0),
  content: payload.content ?? payload.Content ?? '',
  createdAt: payload.createdAt ?? payload.CreatedAt ?? undefined,
  isRead: payload.isRead ?? payload.IsRead ?? false
})

export const getUsersForChat = async (): Promise<ChatUser[]> => {
  const token = ensureToken()
  const response = await fetchWithFallback('/api/chat/GetUserForChat', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  const result = await handleResponse(response)
  return Array.isArray(result) ? result.map(normalizeChatUser) : []
}

export const getChattedUsers = async (): Promise<ChatUser[]> => {
  const token = ensureToken()
  const response = await fetchWithFallback('/api/chat/GetChattedUser', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  const result = await handleResponse(response)
  return Array.isArray(result) ? result.map(normalizeChatUser) : []
}

export const getChatHistory = async (toUserId: string): Promise<ChatMessage[]> => {
  const token = ensureToken()
  const response = await fetchWithFallback(`/api/chat/GetHistory/${toUserId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  const result = await handleResponse(response)
  return Array.isArray(result) ? result.map(normalizeChatMessage) : []
}

export const sendChatMessage = async (payload: SendChatPayload): Promise<ChatMessage> => {
  const token = ensureToken()
  const response = await fetchWithFallback('/api/chat/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  const result = await handleResponse(response)
  return normalizeChatMessage(result)
}
