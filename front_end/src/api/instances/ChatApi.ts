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
  imageUrl?: string
  createdAt?: string
  isRead?: boolean
}

export type SendChatPayload = {
  receiverId: string
  content: string
  imageUrl?: string
}

const ensureToken = () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Vui lòng đăng nhập để tiếp tục trò chuyện.')
  }
  return token
}

const handleResponse = async (response: Response, endpoint: string) => {
  if (!response.ok) {
    const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`
    const errorMessage = await extractErrorMessage(response, fallbackMessage)
    console.error(`[ChatApi] Error at ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      error: errorMessage
    })
    throw new Error(errorMessage)
  }
  return response.json()
}

const normalizeChatUser = (payload: any): ChatUser => {
  try {
    return {
      userId: String(payload.userId ?? payload.UserId ?? ''),
      fullName: payload.fullName ?? payload.FullName ?? '',
      role: payload.role ?? payload.Role ?? '',
      roleId: Number(payload.roleId ?? payload.RoleId ?? 0),
      email: payload.email ?? payload.Email ?? ''
    }
  } catch (error) {
    console.warn('[ChatApi] Failed to normalize ChatUser:', payload, error)
    throw new Error('Dữ liệu người dùng không hợp lệ')
  }
}

const normalizeChatMessage = (payload: any): ChatMessage => {
  try {
    // Xử lý timestamp: đảm bảo là ISO string format
    let createdAt: string | undefined = payload.createdAt ?? payload.CreatedAt ?? undefined
    
    if (createdAt) {
      // Nếu là DateTime object từ JSON (có thể là string hoặc object)
      if (typeof createdAt === 'string') {
        // Đảm bảo có timezone indicator (Z cho UTC)
        if (!createdAt.includes('Z') && !createdAt.includes('+') && !createdAt.includes('-', 10)) {
          // Nếu không có timezone, thêm 'Z' để đánh dấu UTC
          createdAt = createdAt.endsWith('Z') ? createdAt : createdAt + 'Z'
        }
      } else {
        // Nếu là object hoặc number, convert sang ISO string
        createdAt = new Date(createdAt).toISOString()
      }
    }
    
    return {
      id: Number(payload.id ?? payload.Id ?? 0),
      senderId: Number(payload.senderId ?? payload.SenderId ?? 0),
      receiverId: Number(payload.receiverId ?? payload.ReceiverId ?? 0),
      content: payload.content ?? payload.Content ?? '',
      imageUrl: payload.imageUrl ?? payload.ImageUrl ?? payload.image ?? payload.Image ?? undefined,
      createdAt,
      isRead: payload.isRead ?? payload.IsRead ?? false
    }
  } catch (error) {
    console.warn('[ChatApi] Failed to normalize ChatMessage:', payload, error)
    throw new Error('Dữ liệu tin nhắn không hợp lệ')
  }
}

/**
 * Lấy danh sách tất cả người dùng có thể chat (trừ Admin và chính mình)
 * Endpoint: GET /api/chat/GetUserForChat
 * Requires: Authentication (Bearer token)
 */
export const getUsersForChat = async (): Promise<ChatUser[]> => {
  try {
    const token = ensureToken()
    const endpoint = '/api/chat/GetUserForChat'
    console.log('[ChatApi] Fetching users for chat')
    
    const response = await fetchWithFallback(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    
    const result = await handleResponse(response, endpoint)
    
    if (!Array.isArray(result)) {
      console.warn('[ChatApi] getUsersForChat: Response is not an array:', result)
      return []
    }
    
    const normalized = result.map(normalizeChatUser)
    console.log(`[ChatApi] Fetched ${normalized.length} users for chat`)
    return normalized
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể lấy danh sách người dùng'
    console.error('[ChatApi] getUsersForChat failed:', error)
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

/**
 * Lấy danh sách người dùng đã từng chat với user hiện tại
 * Endpoint: GET /api/chat/GetChattedUser
 * Requires: Authentication (Bearer token)
 */
export const getChattedUsers = async (): Promise<ChatUser[]> => {
  try {
    const token = ensureToken()
    const endpoint = '/api/chat/GetChattedUser'
    console.log('[ChatApi] Fetching chatted users')
    
    const response = await fetchWithFallback(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    
    const result = await handleResponse(response, endpoint)
    
    if (!Array.isArray(result)) {
      console.warn('[ChatApi] getChattedUsers: Response is not an array:', result)
      return []
    }
    
    const normalized = result.map(normalizeChatUser)
    console.log(`[ChatApi] Fetched ${normalized.length} chatted users`)
    return normalized
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể lấy danh sách người dùng đã chat'
    console.error('[ChatApi] getChattedUsers failed:', error)
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

/**
 * Lấy lịch sử chat với một người dùng cụ thể
 * Endpoint: GET /api/chat/GetHistory/{toUserId}
 * Requires: Authentication (Bearer token)
 * @param toUserId - ID của người dùng muốn xem lịch sử chat (string)
 */
export const getChatHistory = async (toUserId: string): Promise<ChatMessage[]> => {
  try {
    if (!toUserId || !toUserId.trim()) {
      throw new Error('ID người dùng không hợp lệ')
    }
    
    const token = ensureToken()
    const endpoint = `/api/chat/GetHistory/${toUserId}`
    console.log('[ChatApi] Fetching chat history:', { toUserId })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    
    const result = await handleResponse(response, endpoint)
    
    if (!Array.isArray(result)) {
      console.warn('[ChatApi] getChatHistory: Response is not an array:', result)
      return []
    }
    
    const normalized = result.map(normalizeChatMessage)
    console.log(`[ChatApi] Fetched ${normalized.length} messages for user ${toUserId}`)
    return normalized
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể lấy lịch sử chat'
    console.error('[ChatApi] getChatHistory failed:', { toUserId, error })
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

/**
 * Gửi tin nhắn qua SignalR ChatHub (realtime)
 * @param payload - { receiverId: string, content: string, imageUrl?: string }
 * @returns Promise<ChatMessage> - Tin nhắn đã gửi
 */
export const sendChatMessage = async (payload: SendChatPayload): Promise<ChatMessage> => {
  const { sendChatMessageViaSignalR } = await import('./chatSignalR')
  return sendChatMessageViaSignalR(payload.receiverId, payload.content, payload.imageUrl)
}
