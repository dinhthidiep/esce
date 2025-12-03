/**
 * SupportApi.ts
 * 
 * ⚠️ LƯU Ý: Backend hiện tại CHƯA có Controller/Service cho Support.
 * Backend chỉ có Models: RequestSupport và SupportResponse.
 * 
 * API này được tạo dựa trên cấu trúc Models và các API tương tự khác.
 * Các endpoints dưới đây là dự đoán dựa trên best practices RESTful API.
 * 
 * Khi backend implement SupportController, các endpoints có thể là:
 * - GET    /api/support              - Lấy tất cả (Admin)
 * - GET    /api/support/{id}         - Lấy theo ID
 * - GET    /api/support/my-requests  - Lấy của user hiện tại
 * - POST   /api/support              - Tạo mới
 * - PUT    /api/support/{id}         - Cập nhật
 * - DELETE /api/support/{id}         - Xóa
 * - GET    /api/support/{id}/responses - Lấy phản hồi
 * - POST   /api/support/{id}/responses - Tạo phản hồi
 * - DELETE /api/support/responses/{id} - Xóa phản hồi
 */

import { fetchWithFallback, extractErrorMessage, getAuthToken } from './httpClient'

export type SupportStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Closed' | string | null | undefined

export type SupportType = string | null | undefined

export interface RequestSupportDto {
  id: number
  userId: number
  comboId?: number | null
  supportType?: SupportType
  content: string
  image?: string | null
  status?: SupportStatus
  createdAt?: string | null
  updatedAt?: string | null
  userName?: string
  userEmail?: string
  comboName?: string | null
  responsesCount?: number
}

export interface SupportResponseDto {
  id: number
  supportId: number
  responderId: number
  content: string
  image?: string | null
  createdAt?: string | null
  responderName?: string
  responderEmail?: string
  responderRole?: string
}

export interface CreateSupportRequestDto {
  comboId?: number | null
  supportType?: string
  content: string
  image?: string | null
}

export interface CreateSupportResponseDto {
  content: string
  image?: string | null
}

export interface UpdateSupportRequestDto {
  status?: SupportStatus
  supportType?: string
  content?: string
  image?: string | null
}

const ensureAuthHeaders = () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Vui lòng đăng nhập để tiếp tục.')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

const handleResponse = async <T>(response: Response, endpoint: string): Promise<T> => {
  if (!response.ok) {
    const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`
    const errorMessage = await extractErrorMessage(response, fallbackMessage)
    console.error(`[SupportApi] Error at ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      error: errorMessage
    })
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

const normalizeRequestSupport = (payload: any): RequestSupportDto => {
  try {
    return {
      id: Number(payload?.id ?? payload?.Id ?? 0),
      userId: Number(payload?.userId ?? payload?.UserId ?? 0),
      comboId: payload?.comboId !== undefined && payload?.comboId !== null 
        ? Number(payload.comboId ?? payload.ComboId ?? null) 
        : null,
      supportType: payload?.supportType ?? payload?.SupportType ?? null,
      content: payload?.content ?? payload?.Content ?? '',
      image: payload?.image ?? payload?.Image ?? null,
      status: payload?.status ?? payload?.Status ?? 'Pending',
      createdAt: payload?.createdAt ?? payload?.CreatedAt ?? null,
      updatedAt: payload?.updatedAt ?? payload?.UpdatedAt ?? null,
      userName: payload?.userName ?? payload?.UserName ?? '',
      userEmail: payload?.userEmail ?? payload?.UserEmail ?? '',
      comboName: payload?.comboName ?? payload?.ComboName ?? null,
      responsesCount: payload?.responsesCount ?? payload?.ResponsesCount ?? 0
    }
  } catch (error) {
    console.warn('[SupportApi] Failed to normalize RequestSupport:', payload, error)
    throw new Error('Dữ liệu yêu cầu hỗ trợ không hợp lệ')
  }
}

const normalizeSupportResponse = (payload: any): SupportResponseDto => {
  try {
    return {
      id: Number(payload?.id ?? payload?.Id ?? 0),
      supportId: Number(payload?.supportId ?? payload?.SupportId ?? 0),
      responderId: Number(payload?.responderId ?? payload?.ResponderId ?? 0),
      content: payload?.content ?? payload?.Content ?? '',
      image: payload?.image ?? payload?.Image ?? null,
      createdAt: payload?.createdAt ?? payload?.CreatedAt ?? null,
      responderName: payload?.responderName ?? payload?.ResponderName ?? '',
      responderEmail: payload?.responderEmail ?? payload?.ResponderEmail ?? '',
      responderRole: payload?.responderRole ?? payload?.ResponderRole ?? ''
    }
  } catch (error) {
    console.warn('[SupportApi] Failed to normalize SupportResponse:', payload, error)
    throw new Error('Dữ liệu phản hồi hỗ trợ không hợp lệ')
  }
}

/**
 * Lấy tất cả yêu cầu hỗ trợ (Admin)
 * Endpoint: GET /api/support?status={status}
 * Requires: Authentication + Admin role
 * @param status - Lọc theo trạng thái (Pending, InProgress, Resolved, Closed) hoặc undefined để lấy tất cả
 */
export const getAllSupportRequests = async (status?: string): Promise<RequestSupportDto[]> => {
  try {
    const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : ''
    const endpoint = `/api/support${query}`
    console.log('[SupportApi] Fetching all support requests:', { status })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'GET',
      headers: ensureAuthHeaders()
    })
    
    // Nếu response không ok, kiểm tra xem có phải lỗi do không có dữ liệu không
    if (!response.ok) {
      // Nếu là lỗi 404 hoặc lỗi liên quan đến null/empty, trả về mảng rỗng
      if (response.status === 404 || response.status === 400) {
        try {
          const errorText = await response.text()
          if (errorText.includes('null') || errorText.includes('Value cannot be null') || errorText.includes('Parameter \'json\'')) {
            console.warn('[SupportApi] Backend returned null/empty error, returning empty array')
            return []
          }
        } catch {
          // Nếu không đọc được error text, vẫn trả về mảng rỗng
          console.warn('[SupportApi] Could not read error text, returning empty array')
          return []
        }
      }
      // Nếu là lỗi network, throw error
      if (response.status === 0 || response.status >= 500) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
      }
      // Với các lỗi khác (400, 401, 403), cũng trả về mảng rỗng để hiển thị "chưa có yêu cầu"
      console.warn('[SupportApi] Response not ok, returning empty array to show "no requests" message')
      return []
    }
    
    const result = await handleResponse<any[]>(response, endpoint)
    
    // Nếu result là null hoặc undefined, trả về mảng rỗng
    if (result == null) {
      console.warn('[SupportApi] getAllSupportRequests: Response is null/undefined, returning empty array')
      return []
    }
    
    if (!Array.isArray(result)) {
      console.warn('[SupportApi] getAllSupportRequests: Response is not an array:', result)
      return []
    }
    
    const normalized = result.map(normalizeRequestSupport)
    console.log(`[SupportApi] Fetched ${normalized.length} support requests`)
    return normalized
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể lấy danh sách yêu cầu hỗ trợ'
    console.error('[SupportApi] Error fetching all support requests:', error)
    
    // Nếu lỗi liên quan đến null hoặc empty data, trả về mảng rỗng thay vì throw
    if (errorMessage.includes('Value cannot be null') || 
        errorMessage.includes('Parameter \'json\'') ||
        errorMessage.includes('null') ||
        errorMessage.includes('404') ||
        errorMessage.includes('Not Found')) {
      console.warn('[SupportApi] Error related to null/empty data or 404, returning empty array')
      return []
    }
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    // Với các lỗi khác, cũng trả về mảng rỗng để không hiển thị lỗi cho user
    // (vì có thể là do chưa có dữ liệu)
    console.warn('[SupportApi] Unknown error, returning empty array to show "no requests" message')
    return []
  }
}

/**
 * Lấy yêu cầu hỗ trợ theo ID
 * Endpoint: GET /api/support/{id}
 * Requires: Authentication
 * @param id - ID của yêu cầu hỗ trợ
 */
export const getSupportRequestById = async (id: number): Promise<RequestSupportDto> => {
  try {
    const validId = parseInt(String(id), 10)
    if (!validId || isNaN(validId) || validId <= 0) {
      throw new Error('ID yêu cầu hỗ trợ không hợp lệ')
    }
    
    const endpoint = `/api/support/${validId}`
    console.log('[SupportApi] Fetching support request by ID:', { id: validId })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'GET',
      headers: ensureAuthHeaders()
    })
    
    const result = await handleResponse<any>(response, endpoint)
    return normalizeRequestSupport(result)
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể lấy yêu cầu hỗ trợ'
    console.error(`[SupportApi] Error fetching support request ${id}:`, error)
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

/**
 * Lấy yêu cầu hỗ trợ của user hiện tại
 * Endpoint: GET /api/support/my-requests
 * Requires: Authentication
 */
export const getMySupportRequests = async (): Promise<RequestSupportDto[]> => {
  try {
    const endpoint = '/api/support/my-requests'
    console.log('[SupportApi] Fetching my support requests')
    
    const response = await fetchWithFallback(endpoint, {
      method: 'GET',
      headers: ensureAuthHeaders()
    })
    
    // Nếu response không ok, kiểm tra xem có phải lỗi do không có dữ liệu không
    if (!response.ok) {
      // Nếu là lỗi 404 hoặc lỗi liên quan đến null/empty, trả về mảng rỗng
      if (response.status === 404 || response.status === 400) {
        try {
          const errorText = await response.text()
          if (errorText.includes('null') || errorText.includes('Value cannot be null') || errorText.includes('Parameter \'json\'')) {
            console.warn('[SupportApi] Backend returned null/empty error, returning empty array')
            return []
          }
        } catch {
          // Nếu không đọc được error text, vẫn trả về mảng rỗng
          console.warn('[SupportApi] Could not read error text, returning empty array')
          return []
        }
      }
      // Nếu là lỗi network, throw error
      if (response.status === 0 || response.status >= 500) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
      }
      // Với các lỗi khác (400, 401, 403), cũng trả về mảng rỗng để hiển thị "chưa có yêu cầu"
      console.warn('[SupportApi] Response not ok, returning empty array to show "no requests" message')
      return []
    }
    
    const result = await handleResponse<any[]>(response, endpoint)
    
    // Nếu result là null hoặc undefined, trả về mảng rỗng
    if (result == null) {
      console.warn('[SupportApi] getMySupportRequests: Response is null/undefined, returning empty array')
      return []
    }
    
    if (!Array.isArray(result)) {
      console.warn('[SupportApi] getMySupportRequests: Response is not an array:', result)
      return []
    }
    
    const normalized = result.map(normalizeRequestSupport)
    console.log(`[SupportApi] Fetched ${normalized.length} my support requests`)
    return normalized
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể lấy yêu cầu hỗ trợ của tôi'
    console.error('[SupportApi] Error fetching my support requests:', error)
    
    // Nếu lỗi liên quan đến null hoặc empty data, trả về mảng rỗng thay vì throw
    if (errorMessage.includes('Value cannot be null') || 
        errorMessage.includes('Parameter \'json\'') ||
        errorMessage.includes('null') ||
        errorMessage.includes('404') ||
        errorMessage.includes('Not Found')) {
      console.warn('[SupportApi] Error related to null/empty data or 404, returning empty array')
      return []
    }
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    // Với các lỗi khác, cũng trả về mảng rỗng để không hiển thị lỗi cho user
    // (vì có thể là do chưa có dữ liệu)
    console.warn('[SupportApi] Unknown error, returning empty array to show "no requests" message')
    return []
  }
}

/**
 * Tạo yêu cầu hỗ trợ mới
 * Endpoint: POST /api/support
 * Requires: Authentication
 * @param dto - Dữ liệu yêu cầu hỗ trợ
 */
export const createSupportRequest = async (dto: CreateSupportRequestDto): Promise<RequestSupportDto> => {
  try {
    // Validate input
    if (!dto.content || !dto.content.trim()) {
      throw new Error('Nội dung yêu cầu hỗ trợ không được để trống')
    }
    
    if (dto.content.trim().length > 1000) {
      throw new Error('Nội dung yêu cầu hỗ trợ tối đa 1000 ký tự')
    }

    const endpoint = '/api/support'
    console.log('[SupportApi] Creating support request:', { 
      hasContent: !!dto.content, 
      hasImage: !!dto.image,
      comboId: dto.comboId,
      supportType: dto.supportType
    })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'POST',
      headers: ensureAuthHeaders(),
      body: JSON.stringify({
        ComboId: dto.comboId ?? null,
        SupportType: dto.supportType ?? null,
        Content: dto.content.trim(),
        Image: dto.image ?? null
      })
    })
    
    const result = await handleResponse<any>(response, endpoint)
    console.log('[SupportApi] Support request created successfully')
    return normalizeRequestSupport(result)
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể tạo yêu cầu hỗ trợ'
    console.error('[SupportApi] Error creating support request:', error)
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

/**
 * Cập nhật yêu cầu hỗ trợ (Admin hoặc chủ sở hữu)
 * Endpoint: PUT /api/support/{id}
 * Requires: Authentication
 * @param id - ID của yêu cầu hỗ trợ
 * @param dto - Dữ liệu cập nhật
 */
export const updateSupportRequest = async (id: number, dto: UpdateSupportRequestDto): Promise<RequestSupportDto> => {
  try {
    const validId = parseInt(String(id), 10)
    if (!validId || isNaN(validId) || validId <= 0) {
      throw new Error('ID yêu cầu hỗ trợ không hợp lệ')
    }
    
    if (dto.content && dto.content.trim().length > 1000) {
      throw new Error('Nội dung yêu cầu hỗ trợ tối đa 1000 ký tự')
    }

    const endpoint = `/api/support/${validId}`
    console.log('[SupportApi] Updating support request:', { id: validId, hasStatus: !!dto.status })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'PUT',
      headers: ensureAuthHeaders(),
      body: JSON.stringify({
        Status: dto.status ?? undefined,
        SupportType: dto.supportType ?? undefined,
        Content: dto.content?.trim() ?? undefined,
        Image: dto.image ?? undefined
      })
    })
    
    const result = await handleResponse<any>(response, endpoint)
    console.log('[SupportApi] Support request updated successfully')
    return normalizeRequestSupport(result)
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể cập nhật yêu cầu hỗ trợ'
    console.error(`[SupportApi] Error updating support request ${id}:`, error)
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

/**
 * Xóa yêu cầu hỗ trợ (Admin hoặc chủ sở hữu)
 * Endpoint: DELETE /api/support/{id}
 * Requires: Authentication
 * @param id - ID của yêu cầu hỗ trợ
 */
export const deleteSupportRequest = async (id: number): Promise<void> => {
  try {
    const validId = parseInt(String(id), 10)
    if (!validId || isNaN(validId) || validId <= 0) {
      throw new Error('ID yêu cầu hỗ trợ không hợp lệ')
    }

    const endpoint = `/api/support/${validId}`
    console.log('[SupportApi] Deleting support request:', { id: validId })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'DELETE',
      headers: ensureAuthHeaders()
    })

    if (!response.ok) {
      const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`
      const errorMessage = await extractErrorMessage(response, fallbackMessage)
      console.error('[SupportApi] deleteSupportRequest failed:', {
        id: validId,
        status: response.status,
        statusText: response.statusText,
        error: errorMessage
      })
      throw new Error(errorMessage)
    }

    if (response.status === 204 || response.status === 200) {
      console.log(`[SupportApi] Successfully deleted support request ${validId}`)
      return
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      if (text) {
        try {
          return JSON.parse(text)
        } catch {
          return
        }
      }
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể xóa yêu cầu hỗ trợ'
    console.error(`[SupportApi] Error deleting support request ${id}:`, error)
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

/**
 * Lấy tất cả phản hồi của một yêu cầu hỗ trợ
 * Endpoint: GET /api/support/{supportId}/responses
 * Requires: Authentication
 * @param supportId - ID của yêu cầu hỗ trợ
 */
export const getSupportResponses = async (supportId: number): Promise<SupportResponseDto[]> => {
  try {
    const validId = parseInt(String(supportId), 10)
    if (!validId || isNaN(validId) || validId <= 0) {
      throw new Error('ID yêu cầu hỗ trợ không hợp lệ')
    }
    
    const endpoint = `/api/support/${validId}/responses`
    console.log('[SupportApi] Fetching support responses:', { supportId: validId })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'GET',
      headers: ensureAuthHeaders()
    })
    
    // Nếu response không ok, kiểm tra xem có phải lỗi do không có dữ liệu không
    if (!response.ok) {
      // Nếu là lỗi 404 hoặc lỗi liên quan đến null/empty, trả về mảng rỗng
      if (response.status === 404 || response.status === 400) {
        try {
          const errorText = await response.text()
          if (errorText.includes('null') || errorText.includes('Value cannot be null') || errorText.includes('Parameter \'json\'')) {
            console.warn('[SupportApi] Backend returned null/empty error, returning empty array')
            return []
          }
        } catch {
          // Nếu không đọc được error text, vẫn trả về mảng rỗng
          console.warn('[SupportApi] Could not read error text, returning empty array')
          return []
        }
      }
      // Nếu là lỗi network, throw error
      if (response.status === 0 || response.status >= 500) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
      }
      // Với các lỗi khác (400, 401, 403), cũng trả về mảng rỗng để hiển thị "chưa có phản hồi"
      console.warn('[SupportApi] Response not ok, returning empty array to show "no responses" message')
      return []
    }
    
    const result = await handleResponse<any[]>(response, endpoint)
    
    // Nếu result là null hoặc undefined, trả về mảng rỗng
    if (result == null) {
      console.warn('[SupportApi] getSupportResponses: Response is null/undefined, returning empty array')
      return []
    }
    
    if (!Array.isArray(result)) {
      console.warn('[SupportApi] getSupportResponses: Response is not an array:', result)
      return []
    }
    
    const normalized = result.map(normalizeSupportResponse)
    console.log(`[SupportApi] Fetched ${normalized.length} support responses for support ${validId}`)
    return normalized
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể lấy phản hồi hỗ trợ'
    console.error(`[SupportApi] Error fetching support responses for ${supportId}:`, error)
    
    // Nếu lỗi liên quan đến null hoặc empty data, trả về mảng rỗng thay vì throw
    if (errorMessage.includes('Value cannot be null') || 
        errorMessage.includes('Parameter \'json\'') ||
        errorMessage.includes('null') ||
        errorMessage.includes('404') ||
        errorMessage.includes('Not Found')) {
      console.warn('[SupportApi] Error related to null/empty data or 404, returning empty array')
      return []
    }
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    // Với các lỗi khác, cũng trả về mảng rỗng để không hiển thị lỗi cho user
    // (vì có thể là do chưa có dữ liệu)
    console.warn('[SupportApi] Unknown error, returning empty array to show "no responses" message')
    return []
  }
}

/**
 * Tạo phản hồi cho yêu cầu hỗ trợ
 * Endpoint: POST /api/support/{supportId}/responses
 * Requires: Authentication
 * @param supportId - ID của yêu cầu hỗ trợ
 * @param dto - Dữ liệu phản hồi
 */
export const createSupportResponse = async (supportId: number, dto: CreateSupportResponseDto): Promise<SupportResponseDto> => {
  try {
    const validId = parseInt(String(supportId), 10)
    if (!validId || isNaN(validId) || validId <= 0) {
      throw new Error('ID yêu cầu hỗ trợ không hợp lệ')
    }
    
    if (!dto.content || !dto.content.trim()) {
      throw new Error('Nội dung phản hồi không được để trống')
    }

    const endpoint = `/api/support/${validId}/responses`
    console.log('[SupportApi] Creating support response:', { supportId: validId, hasContent: !!dto.content })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'POST',
      headers: ensureAuthHeaders(),
      body: JSON.stringify({
        Content: dto.content.trim(),
        Image: dto.image ?? null
      })
    })
    
    const result = await handleResponse<any>(response, endpoint)
    console.log('[SupportApi] Support response created successfully')
    return normalizeSupportResponse(result)
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể tạo phản hồi hỗ trợ'
    console.error(`[SupportApi] Error creating support response for ${supportId}:`, error)
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

/**
 * Xóa phản hồi hỗ trợ
 * Endpoint: DELETE /api/support/responses/{responseId}
 * Requires: Authentication
 * @param responseId - ID của phản hồi
 */
export const deleteSupportResponse = async (responseId: number): Promise<void> => {
  try {
    const validId = parseInt(String(responseId), 10)
    if (!validId || isNaN(validId) || validId <= 0) {
      throw new Error('ID phản hồi không hợp lệ')
    }

    const endpoint = `/api/support/responses/${validId}`
    console.log('[SupportApi] Deleting support response:', { responseId: validId })
    
    const response = await fetchWithFallback(endpoint, {
      method: 'DELETE',
      headers: ensureAuthHeaders()
    })

    if (!response.ok) {
      const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`
      const errorMessage = await extractErrorMessage(response, fallbackMessage)
      console.error('[SupportApi] deleteSupportResponse failed:', {
        responseId: validId,
        status: response.status,
        statusText: response.statusText,
        error: errorMessage
      })
      throw new Error(errorMessage)
    }

    if (response.status === 204 || response.status === 200) {
      console.log(`[SupportApi] Successfully deleted support response ${validId}`)
      return
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      if (text) {
        try {
          return JSON.parse(text)
        } catch {
          return
        }
      }
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Không thể xóa phản hồi hỗ trợ'
    console.error(`[SupportApi] Error deleting support response ${responseId}:`, error)
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?')
    }
    
    throw error
  }
}

