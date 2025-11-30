import { fetchWithFallback, extractErrorMessage, getAuthToken } from './httpClient'

export interface PostLikeDto {
  postLikeId: string
  accountId: string
  fullName: string
  createdDate: string
  reactionType?: string
}

export interface PostDto {
  postId: number
  title: string
  content: string
  images: string[]
  authorId: number
  authorName: string
  authorAvatar?: string
  authorRole: string
  status: string
  rejectComment?: string
  createdAt?: string
  publicDate?: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  hashtags: string[]
  likes?: PostLikeDto[]
}

export interface CreatePostDto {
  title: string
  content: string
  images?: string[]
}

export interface UpdatePostDto {
  title?: string
  content?: string
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

const normalizePost = (payload: any): PostDto => {
  // Fast normalization - optimized like News
  const postId = parseInt(String(payload?.postId ?? payload?.PostId ?? payload?.id ?? 0), 10) || 0
  const title = payload?.title ?? payload?.Title ?? payload?.articleTitle ?? payload?.ArticleTitle ?? ''
  const content = payload?.content ?? payload?.Content ?? payload?.postContent ?? payload?.PostContent ?? ''
  
  // Image processing - same as News (supports |||IMAGE_SEPARATOR||| and comma)
  let images: string[] = []
  const imagesRaw = payload?.images ?? payload?.Images
  
  if (Array.isArray(imagesRaw)) {
    images = imagesRaw.filter((img: any) => img && typeof img === 'string' && img.trim().length > 10)
  } else if (typeof imagesRaw === 'string' && imagesRaw.trim()) {
    let parts: string[] = []
    
    // Backend uses "|||IMAGE_SEPARATOR|||" as delimiter (like News)
    if (imagesRaw.includes('|||IMAGE_SEPARATOR|||')) {
      parts = imagesRaw.split('|||IMAGE_SEPARATOR|||').map(p => p.trim()).filter(p => p)
    } else if (imagesRaw.includes(',')) {
      // Fallback to comma separator
      parts = imagesRaw.split(',').map(p => p.trim()).filter(p => p)
    } else {
      // Single image
      parts = [imagesRaw.trim()]
    }
    
    images = parts.filter(img => {
      const trimmed = img.trim()
      return trimmed !== '' && trimmed.length > 10 && (
        trimmed.startsWith('data:image/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        /^[A-Za-z0-9+/=]+$/.test(trimmed.replace(/\s/g, ''))
      )
    })
  }
  
  // Remove duplicates
  const validImages: string[] = []
  const seen = new Set<string>()
  for (const img of images) {
    const trimmed = img.trim()
    if (!seen.has(trimmed)) {
      validImages.push(trimmed)
      seen.add(trimmed)
    }
  }
  images = validImages
  
  // Fast author ID extraction
  const authorId = parseInt(String(
    payload?.authorId ?? 
    payload?.AuthorId ?? 
    payload?.posterId ?? 
    payload?.PosterId ?? 
    0
  ), 10) || 0
  
  // Count likes and comments from arrays (if provided)
  const likesArray = payload?.likes ?? payload?.Likes
  const commentsArray = payload?.comments ?? payload?.Comments
  const likesCount = Array.isArray(likesArray) ? likesArray.length : (payload?.likesCount ?? payload?.LikesCount ?? 0)
  const commentsCount = Array.isArray(commentsArray) ? commentsArray.length : (payload?.commentsCount ?? payload?.CommentsCount ?? 0)
  
  // Parse likes array
  const likes: PostLikeDto[] = Array.isArray(likesArray)
    ? likesArray.map((like: any) => ({
        postLikeId: String(like?.postLikeId ?? like?.PostLikeId ?? like?.id ?? like?.Id ?? ''),
        accountId: String(like?.accountId ?? like?.AccountId ?? like?.userId ?? like?.UserId ?? ''),
        fullName: like?.fullName ?? like?.FullName ?? like?.name ?? like?.Name ?? 'Người dùng',
        createdDate: like?.createdDate ?? like?.CreatedDate ?? like?.createdAt ?? like?.CreatedAt ?? new Date().toISOString(),
        reactionType: like?.reactionType ?? like?.ReactionType ?? 'like'
      }))
    : []
  
  return {
    postId,
    title,
    content,
    images,
    authorId,
    authorName: payload?.authorName ?? payload?.AuthorName ?? payload?.posterName ?? payload?.PosterName ?? '',
    authorAvatar: payload?.authorAvatar ?? payload?.AuthorAvatar ?? undefined,
    authorRole: payload?.authorRole ?? payload?.AuthorRole ?? payload?.posterRole ?? payload?.PosterRole ?? '',
    status: payload?.status ?? payload?.Status ?? 'Pending',
    rejectComment: payload?.rejectComment ?? payload?.RejectComment ?? undefined,
    createdAt: payload?.createdAt ?? payload?.CreatedAt ?? payload?.createdDate ?? payload?.CreatedDate ?? payload?.publicDate ?? payload?.PublicDate ?? undefined,
    publicDate: payload?.publicDate ?? payload?.PublicDate ?? undefined,
    likesCount,
    commentsCount,
    isLiked: payload?.isLiked ?? payload?.IsLiked ?? false,
    hashtags: Array.isArray(payload?.hashtags ?? payload?.Hashtags) 
      ? (payload.hashtags ?? payload.Hashtags) 
      : [],
    likes: likes.length > 0 ? likes : undefined
  }
}

export const fetchAllPosts = async (): Promise<PostDto[]> => {
  // Use fetchWithFallback for anonymous access (to get isLiked correctly)
  const token = getAuthToken()
  const response = await fetchWithFallback('/api/Post/GetAllPost', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  const normalized = Array.isArray(data) ? data.map(normalizePost) : []
  
  // Debug log
  console.log('Fetched posts with isLiked:', normalized.map(p => ({ 
    postId: p.postId, 
    isLiked: p.isLiked,
    likesCount: p.likesCount 
  })))
  
  return normalized
}

export const fetchPostById = async (postId: number): Promise<PostDto> => {
  const data = await authorizedRequest(`/api/Post/GetPostById?id=${postId}`, {
    method: 'GET'
  })
  return normalizePost(data)
}

export const createPost = async (dto: CreatePostDto): Promise<PostDto> => {
  const data = await authorizedRequest('/api/Post/CreatePost', {
    method: 'POST',
    body: JSON.stringify({
      PostContent: dto.content,
      ArticleTitle: dto.title,
      Images: dto.images || [],
      PosterName: '' // Will be set by backend from current user
    })
  })
  // Backend returns { message, post }
  const postData = data?.post ?? data
  // Reload to get full post data
  if (postData?.PostId || postData?.postId || postData?.id) {
    const postId = parseInt(String(postData.PostId ?? postData.postId ?? postData.id), 10)
    if (postId) {
      try {
        return await fetchPostById(postId)
      } catch {
        return normalizePost(postData)
      }
    }
  }
  return normalizePost(postData)
}

export const updatePost = async (postId: number, dto: UpdatePostDto): Promise<void> => {
  await authorizedRequest(`/api/Post/UpdatePost?id=${postId}`, {
    method: 'PUT',
    body: JSON.stringify({
      PostContent: dto.content,
      ArticleTitle: dto.title,
      Images: dto.images
    })
  })
}

export const deletePost = async (postId: number): Promise<void> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Vui lòng đăng nhập để tiếp tục.')
  }

  const response = await fetchWithFallback(`/api/Post/DeletePost?id=${postId}`, {
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

  // Handle 204 No Content or 200 OK
  if (response.status === 204 || response.status === 200) {
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
}

export const approvePost = async (postId: number): Promise<void> => {
  await authorizedRequest('/api/Post/approve', {
    method: 'PUT',
    body: JSON.stringify({
      PostId: String(postId)
    })
  })
}

export const rejectPost = async (postId: number, comment: string): Promise<void> => {
  await authorizedRequest('/api/Post/reject', {
    method: 'PUT',
    body: JSON.stringify({
      PostId: String(postId),
      Comment: comment
    })
  })
}

// Like/Unlike Post
export const toggleLikePost = async (postId: number): Promise<{ isLiked: boolean }> => {
  const data = await authorizedRequest(`/api/PostReaction/like/${postId}`, {
    method: 'POST'
  })
  return {
    isLiked: data?.isLiked ?? false
  }
}

// Comment interfaces
export interface PostComment {
  postCommentId?: string
  id?: number
  fullName?: string
  authorName?: string
  content: string
  images?: string[]
  image?: string
  createdDate?: string
  createdAt?: string
  likes?: PostCommentLike[]
  replies?: PostCommentReply[]
  authorId?: number
  authorID?: number
}

export interface PostCommentLike {
  postCommentLikeId: string
  accountId: string
  fullName: string
  createdDate: string
}

export interface PostCommentReply {
  replyPostCommentId: string
  fullName: string
  content: string
  createdDate: string
}

export interface CreateCommentDto {
  postId: string
  content: string
  images?: string[]
}

export interface UpdateCommentDto {
  content: string
  images?: string[]
}

// Get comments for a post (anonymous access)
export const fetchCommentsByPost = async (postId: number): Promise<PostComment[]> => {
  try {
    const response = await fetchWithFallback(`/api/Comment/post/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      return []
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json()
      return Array.isArray(json) ? json : []
    }
    
    return []
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

// Create comment
export const createComment = async (dto: CreateCommentDto): Promise<void> => {
  await authorizedRequest('/api/Comment', {
    method: 'POST',
    body: JSON.stringify({
      PostId: String(dto.postId),
      Content: dto.content,
      Images: dto.images || []
    })
  })
}

// Update comment
export const updateComment = async (commentId: number, dto: UpdateCommentDto): Promise<void> => {
  await authorizedRequest(`/api/Comment/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      Content: dto.content,
      Images: dto.images || []
    })
  })
}

// Delete comment
export const deleteComment = async (commentId: number): Promise<void> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Vui lòng đăng nhập để tiếp tục.')
  }

  const response = await fetchWithFallback(`/api/Comment/${commentId}`, {
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
}

