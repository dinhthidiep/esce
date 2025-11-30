import { fetchWithFallback, extractErrorMessage, getAuthToken } from './httpClient'

export interface NewsDto {
  newsId: number
  content: string
  images: string[]
  socialMediaLink?: string
  createdDate?: string
  authorId: number
  authorName: string
  authorAvatar?: string
  authorRole: string
  likesCount: number
  isLiked: boolean
}

export interface CreateNewsDto {
  content: string
  socialMediaLink?: string
  images?: string[]
}

export interface UpdateNewsDto {
  content?: string
  socialMediaLink?: string
  images?: string[]
}

const authorizedRequest = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Vui lòng đăng nhập để tiếp tục.')
  }

  const response = await fetchWithFallback(input as string, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {})
    }
  })

  if (!response.ok) {
    const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`
    throw new Error(await extractErrorMessage(response, fallbackMessage))
  }

  return response.json()
}

const normalizeNews = (payload: any): NewsDto => {
  // Backend returns NewsId (PascalCase) in NewsDto
  const newsId = payload?.newsId ?? payload?.NewsId ?? 0
  const content = payload?.content ?? payload?.Content ?? ''
  let images = payload?.images ?? payload?.Images ?? []
  
  // Ensure images is an array
  if (!Array.isArray(images)) {
    // If images is a string (serialized), split it
    if (typeof images === 'string' && images.trim() !== '') {
      // Backend now uses "|||IMAGE_SEPARATOR|||" as delimiter
      // But also support old format with ";" for backward compatibility
      let parts: string[] = []
      
      if (images.includes('|||IMAGE_SEPARATOR|||')) {
        // New format: use safe delimiter
        parts = images.split('|||IMAGE_SEPARATOR|||').map(p => p.trim()).filter(p => p)
      } else {
        // Old format: split by semicolon (for backward compatibility)
        // Need to reconstruct data URLs that were broken
        const semicolonParts = images.split(';').map(p => p.trim()).filter(p => p)
        const reconstructed: string[] = []
        
        for (let i = 0; i < semicolonParts.length; i++) {
          const part = semicolonParts[i]
          
          // If this part starts with 'base64,', it's likely a continuation
          if (part.startsWith('base64,') && reconstructed.length > 0) {
            const lastIndex = reconstructed.length - 1
            const lastPart = reconstructed[lastIndex]
            if (lastPart.startsWith('data:image/') && !lastPart.includes('base64,')) {
              reconstructed[lastIndex] = lastPart + ';' + part
              continue
            }
          }
          
          // If this part starts with 'data:image/', it's a data URL
          if (part.startsWith('data:image/')) {
            reconstructed.push(part)
          } else if (part.startsWith('base64,')) {
            reconstructed.push(`data:image/jpeg;${part}`)
          } else {
            // Regular base64 string (without prefix)
            if (part.length > 50 && /^[A-Za-z0-9+/=]+$/.test(part)) {
              reconstructed.push(`data:image/jpeg;base64,${part}`)
            } else if (reconstructed.length > 0) {
              // Might be continuation
              const lastPart = reconstructed[reconstructed.length - 1]
              if (lastPart.startsWith('data:image/') && !lastPart.includes('base64,')) {
                reconstructed[reconstructed.length - 1] = lastPart + ';base64,' + part
              } else {
                reconstructed.push(part)
              }
            } else {
              reconstructed.push(part)
            }
          }
        }
        
        parts = reconstructed
      }
      
      images = parts.filter(img => {
        const trimmed = img.trim()
        return trimmed !== '' && trimmed.length > 10
      })
    } else {
      images = []
    }
  }
  
  // Remove duplicates and empty strings, validate format
  const validImages: string[] = []
  const seen = new Set<string>()
  
  for (const img of images) {
    if (!img || typeof img !== 'string') continue
    
    const trimmed = img.trim()
    if (trimmed === '' || trimmed.length < 10) continue
    
    // Skip if already seen (duplicate)
    if (seen.has(trimmed)) continue
    
    // Validate: must be base64-like or data URL or HTTP(S) URL
    const isValid = 
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      /^[A-Za-z0-9+/=]+$/.test(trimmed) // Base64 pattern (without prefix)
    
    if (isValid) {
      validImages.push(trimmed)
      seen.add(trimmed)
    } else {
      console.warn('Invalid image format detected:', trimmed.substring(0, 50))
    }
  }
  
  return {
    newsId,
    content,
    images: validImages,
    socialMediaLink: payload?.socialMediaLink ?? payload?.SocialMediaLink ?? undefined,
    createdDate: payload?.createdDate ?? payload?.CreatedDate ?? undefined,
    authorId: payload?.authorId ?? payload?.AuthorId ?? 0,
    authorName: payload?.authorName ?? payload?.AuthorName ?? '',
    authorAvatar: payload?.authorAvatar ?? payload?.AuthorAvatar ?? undefined,
    authorRole: payload?.authorRole ?? payload?.AuthorRole ?? '',
    likesCount: payload?.likesCount ?? payload?.LikesCount ?? 0,
    isLiked: payload?.isLiked ?? payload?.IsLiked ?? false
  }
}

export const fetchAllNews = async (): Promise<NewsDto[]> => {
  const data = await authorizedRequest('/api/news', {
    method: 'GET'
  })
  return Array.isArray(data) ? data.map(normalizeNews) : []
}

export const fetchNewsById = async (newsId: number): Promise<NewsDto> => {
  const data = await authorizedRequest(`/api/news/${newsId}`, {
    method: 'GET'
  })
  return normalizeNews(data)
}

export const createNews = async (dto: CreateNewsDto): Promise<NewsDto> => {
  const data = await authorizedRequest('/api/news', {
    method: 'POST',
    body: JSON.stringify({
      Content: dto.content,
      SocialMediaLink: dto.socialMediaLink,
      Images: dto.images
    })
  })
  return normalizeNews(data)
}

export const updateNews = async (newsId: number, dto: UpdateNewsDto): Promise<NewsDto> => {
  const data = await authorizedRequest(`/api/news/${newsId}`, {
    method: 'PUT',
    body: JSON.stringify({
      Content: dto.content,
      SocialMediaLink: dto.socialMediaLink,
      Images: dto.images
    })
  })
  return normalizeNews(data)
}

export const deleteNews = async (newsId: number): Promise<void> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Vui lòng đăng nhập để tiếp tục.')
  }

  const response = await fetchWithFallback(`/api/news/${newsId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`
    throw new Error(await extractErrorMessage(response, fallbackMessage))
  }

  // Handle 204 No Content response (no body to parse)
  if (response.status === 204 || response.status === 200) {
    // Success, no need to parse JSON
    return
  }

  // For other success statuses, try to parse if there's content
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text()
    if (text) {
      try {
        return JSON.parse(text)
      } catch {
        // If parsing fails, it's okay for delete operations
        return
      }
    }
  }
}

export const toggleLikeNews = async (newsId: number): Promise<{ liked: boolean; likesCount: number }> => {
  const data = await authorizedRequest(`/api/news/${newsId}/like`, {
    method: 'POST'
  })
  return {
    liked: data?.liked ?? data?.Liked ?? false,
    likesCount: data?.likesCount ?? data?.LikesCount ?? 0
  }
}

