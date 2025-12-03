import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '~/components/Header'
import Footer from '~/components/Footer'
import LoadingSpinner from '~/components/LoadingSpinner'
import LazyImage from '~/components/LazyImage'
import {
  HeartIcon,
  CommentIcon,
  BookmarkIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  XIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  ImageIcon,
  UploadIcon,
} from '~/components/icons'
import axiosInstance from '~/utils/axiosInstance'
import { API_ENDPOINTS } from '~/config/api'
import { getImageUrl } from '~/lib/utils'
import './ForumPage.css'

interface UserInfo {
  Id?: number
  id?: number
  Email?: string
  email?: string
  Name?: string
  name?: string
  RoleId?: number
  roleId?: number
  [key: string]: unknown
}

interface PostImage {
  url: string
}

interface PostLike {
  PostLikeId: string
  AccountId: string
  FullName: string
  CreatedDate: string
  ReactionType?: string // Like, Love, Haha, Wow, Sad, Angry
}

interface PostComment {
  PostCommentId: string
  FullName: string
  Content: string
  Images?: string[]
  CreatedDate?: string
  Likes: any[]
  Replies: any[]
}

interface Post {
  PostId?: string
  Id?: number
  PostContent?: string
  Content?: string
  Images?: string[]
  Image?: string
  PosterId?: string
  AuthorId?: number
  PosterRole?: string
  PosterName?: string
  Author?: {
    Name?: string
    Role?: {
      Name?: string
    }
  }
  Status: string
  PublicDate?: string
  CreatedAt?: string
  ArticleTitle?: string
  Title?: string
  Likes?: PostLike[]
  Postreactions?: Array<{
    Id: number
    UserId: number
    User?: {
      Name?: string
    }
    CreatedAt?: string
  }>
  Comments?: PostComment[]
  Comment?: Array<{
    Id: number
    Author?: {
      Name?: string
    }
    Content: string
    Image?: string
    CreatedAt?: string
  }>
  Hashtags?: string[]
  isLiked?: boolean
  isSaved?: boolean
  userReactionId?: number
  Postsaves?: Array<{
    AccountId: number
  }>
}

const ForumPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'featured' | 'saved'>('featured')
  const [posts, setPosts] = useState<Post[]>([])
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [userReactions, setUserReactions] = useState<Record<string, number>>({}) // postId -> reactionTypeId
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [createPostData, setCreatePostData] = useState({
    ArticleTitle: '',
    PostContent: '',
    Images: [] as string[],
  })
  const [submittingPost, setSubmittingPost] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState<Record<string, boolean>>({})
  const [reactionPickerTimeout, setReactionPickerTimeout] = useState<Record<string, NodeJS.Timeout>>({})
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showPostMenu, setShowPostMenu] = useState<Record<string, boolean>>({})
  const [deletingPost, setDeletingPost] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    checkUserInfo()
    fetchPosts()
  }, [])

  useEffect(() => {
    if (activeTab === 'saved' && userInfo) {
      // Khi chuyển sang tab saved, fetch từ localStorage (không preserve state)
      // Vì đây là lần đầu load tab, cần lấy từ nguồn dữ liệu chính xác
      fetchSavedPosts(false)
    }
  }, [activeTab, userInfo])

  const checkUserInfo = () => {
    const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr) as UserInfo
        setUserInfo(user)
      } catch (error) {
        console.error('Error parsing userInfo:', error)
      }
    }
  }

  // Reaction types: 1=Like, 2=Love, 3=Haha, 4=Wow, 5=Sad, 6=Angry
  const REACTION_TYPES = [
    { id: 1, name: 'Like', emoji: '👍' },
    { id: 2, name: 'Love', emoji: '❤️' },
    { id: 3, name: 'Haha', emoji: '😂' },
    { id: 4, name: 'Wow', emoji: '😮' },
    { id: 5, name: 'Sad', emoji: '😢' },
    { id: 6, name: 'Angry', emoji: '😠' },
  ]

  // Map reaction type name to ID
  const getReactionTypeId = (reactionTypeName: string): number => {
    const reaction = REACTION_TYPES.find(r => r.name === reactionTypeName)
    return reaction ? reaction.id : 1 // Default to Like
  }

  // Map reaction type ID to name
  const getReactionTypeName = (reactionTypeId: number): string => {
    const reaction = REACTION_TYPES.find(r => r.id === reactionTypeId)
    return reaction ? reaction.name : 'Like'
  }

  const normalizePost = (post: Post): Post => {
    // PostResponseDto từ GetAllPost đã có format sẵn, chỉ cần normalize một số field
    const postId = post.PostId || String(post.Id || '')
    const content = post.PostContent || post.Content || ''
    
    // Xử lý ảnh: filter và trim các giá trị rỗng, sử dụng getImageUrl để xử lý URL
    let images: string[] = []
    const fallbackImage = '/img/banahills.jpg'
    
    if (post.Images && Array.isArray(post.Images) && post.Images.length > 0) {
      images = post.Images
        .map(img => getImageUrl(img, fallbackImage))
        .filter((img): img is string => {
          // Chỉ giữ lại ảnh hợp lệ và không phải fallback
          return img !== null && 
                 img !== undefined && 
                 img.trim().length > 0 && 
                 img !== fallbackImage
        })
    } else if (post.Image && typeof post.Image === 'string' && post.Image.trim().length > 0) {
      images = post.Image.split(',')
        .map(img => getImageUrl(img.trim(), fallbackImage))
        .filter((img): img is string => {
          // Chỉ giữ lại ảnh hợp lệ và không phải fallback
          return img !== null && 
                 img !== undefined && 
                 img.trim().length > 0 && 
                 img !== fallbackImage
        })
    }
    
    const posterName = post.PosterName || post.Author?.Name || 'Người dùng'
    const posterId = post.PosterId || String(post.AuthorId || '')
    const title = post.ArticleTitle || post.Title || ''
    const publicDate = post.PublicDate || post.CreatedAt || ''
    
    // PostResponseDto đã có Likes và Comments format sẵn, chỉ cần convert nếu là Post model
    let likes: PostLike[] = []
    if (post.Likes && Array.isArray(post.Likes) && post.Likes.length > 0) {
      // Đã là PostLikeResponseDto format từ GetAllPost
      likes = post.Likes.map((like: any) => ({
        PostLikeId: like.PostLikeId || String(like.Id || ''),
        AccountId: String(like.AccountId || ''),
        FullName: like.FullName || 'Người dùng',
        CreatedDate: like.CreatedDate 
          ? (typeof like.CreatedDate === 'string' 
              ? like.CreatedDate 
              : like.CreatedDate instanceof Date
                ? like.CreatedDate.toISOString()
                : new Date(like.CreatedDate).toISOString())
          : '',
        ReactionType: like.ReactionType || 'Like', // Lấy ReactionType từ backend
      }))
    } else if (post.Postreactions && Array.isArray(post.Postreactions)) {
      // Convert từ Post model (nếu dùng /approved endpoint)
      post.Postreactions.forEach((reaction) => {
        likes.push({
          PostLikeId: String(reaction.Id),
          AccountId: String(reaction.UserId),
          FullName: reaction.User?.Name || 'Người dùng',
          CreatedDate: reaction.CreatedAt || '',
        })
      })
    }
    
      // Convert Comments format
      let comments: PostComment[] = []
      if (post.Comments && Array.isArray(post.Comments) && post.Comments.length > 0) {
        // Đã là PostCommentResponseDto format từ GetAllPost
        comments = post.Comments.map((comment: any) => ({
          PostCommentId: comment.PostCommentId || String(comment.Id || ''),
          FullName: comment.FullName || 'Người dùng',
          Content: comment.Content || '',
          Images: comment.Images && Array.isArray(comment.Images) && comment.Images.length > 0
            ? comment.Images.map((img: string) => getImageUrl(img, '/img/banahills.jpg')).filter((img): img is string => img !== null)
            : undefined,
          CreatedDate: comment.CreatedDate 
            ? (typeof comment.CreatedDate === 'string' 
                ? comment.CreatedDate 
                : comment.CreatedDate instanceof Date
                  ? comment.CreatedDate.toISOString()
                  : comment.CreatedDate ? new Date(comment.CreatedDate).toISOString() : undefined)
            : undefined,
          Likes: comment.Likes || [],
          Replies: comment.Replies || [],
        }))
      } else if (post.Comment && Array.isArray(post.Comment)) {
        // Convert từ Post model (nếu dùng /approved endpoint)
        post.Comment.forEach((comment) => {
          comments.push({
            PostCommentId: String(comment.Id),
            FullName: comment.Author?.Name || 'Người dùng',
            Content: comment.Content,
            Images: comment.Image ? [getImageUrl(comment.Image, '/img/banahills.jpg')].filter((img): img is string => img !== null) : undefined,
            CreatedDate: comment.CreatedAt,
            Likes: [],
            Replies: [],
          })
        })
      }
    
    return {
      ...post,
      PostId: postId,
      PostContent: content,
      Images: images,
      PosterName: posterName,
      PosterId: posterId,
      ArticleTitle: title,
      PublicDate: publicDate,
      Likes: likes,
      Comments: comments,
    }
  }

  const fetchPosts = async (preserveSavedState = false) => {
    try {
      setLoading(true)
      setError(null)
      // Dùng GetAllPost và filter theo Status = "Approved" để lấy PostResponseDto đã format sẵn
      const response = await axiosInstance.get<Post[]>(`${API_ENDPOINTS.POST}/GetAllPost`)
      
      // Filter chỉ lấy posts đã approved
      const approvedPosts = (response.data || []).filter(post => post.Status === 'Approved')
      
      // Normalize posts và kiểm tra user đã like/save chưa
      const savedPostIds = getSavedPostIds()
      const newUserReactions: Record<string, number> = {}
      
      // Nếu preserveSavedState = true, giữ lại isSaved từ state hiện tại
      const currentPostsMap = preserveSavedState 
        ? new Map(posts.map(p => [p.PostId || '', p.isSaved]))
        : new Map<string, boolean>()
      
      const postsWithUserStatus = approvedPosts.map((post) => {
        const normalized = normalizePost(post)
        const postId = normalized.PostId || ''
        
        if (userInfo) {
          const userId = userInfo.Id || userInfo.id
          const userReaction = normalized.Likes?.find(
            (like) => like.AccountId === String(userId)
          )
          
          // Nếu preserveSavedState và có state hiện tại, giữ lại state đó
          // Nếu không, lấy từ localStorage
          const isSaved = preserveSavedState && currentPostsMap.has(postId)
            ? currentPostsMap.get(postId)!
            : savedPostIds.includes(postId)
          
          const userReactionId = userReaction ? parseInt(userReaction.PostLikeId) : undefined
          
          // Lấy reaction type từ backend (ReactionType field)
          if (userReaction && userReaction.ReactionType) {
            const reactionTypeId = getReactionTypeId(userReaction.ReactionType)
            newUserReactions[postId] = reactionTypeId
          } else if (userReactionId) {
            // Fallback: nếu không có ReactionType, giữ lại từ state hoặc mặc định là Like (1)
            newUserReactions[postId] = userReactions[postId] || 1
          }
          
          return {
            ...normalized,
            isLiked: !!userReaction, // Giữ lại để tương thích
            isSaved: isSaved,
            userReactionId: userReactionId,
          }
        }
        const isSaved = preserveSavedState && currentPostsMap.has(postId)
          ? currentPostsMap.get(postId)!
          : savedPostIds.includes(postId)
        return { ...normalized, isSaved }
      })
      
      setUserReactions((prev) => ({ ...prev, ...newUserReactions }))
      setPosts(postsWithUserStatus)
    } catch (err: any) {
      console.error('Error fetching posts:', err)
      setError(err.response?.data?.message || 'Không thể tải bài viết. Vui lòng thử lại sau.')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedPosts = async (preserveState = false) => {
    if (!userInfo) {
      setSavedPosts([])
      return
    }
    
    try {
      // Lấy tất cả posts
      const response = await axiosInstance.get<Post[]>(`${API_ENDPOINTS.POST}/GetAllPost`)
      
      // Filter chỉ lấy posts đã approved
      const approvedPosts = (response.data || []).filter(post => post.Status === 'Approved')
      
      // Nếu preserveState = true, lấy từ state hiện tại thay vì localStorage
      // Điều này tránh race condition khi unsave
      const savedPostIds = preserveState 
        ? savedPosts.map(p => p.PostId || '').filter(id => id)
        : getSavedPostIds()
      
      // Normalize và filter những bài đã save
      const saved = approvedPosts
        .map((post) => normalizePost(post))
        .filter((post) => savedPostIds.includes(post.PostId || ''))
      
      // Kiểm tra user đã like chưa
      const userId = userInfo.Id || userInfo.id
      const savedWithUserStatus = saved.map((post) => {
        const userReaction = post.Likes?.find(
          (like) => like.AccountId === String(userId)
        )
        
        // Lấy reaction type từ backend
        let reactionTypeId: number | undefined
        if (userReaction && userReaction.ReactionType) {
          reactionTypeId = getReactionTypeId(userReaction.ReactionType)
        } else if (userReaction) {
          reactionTypeId = userReactions[post.PostId || ''] || 1
        }
        
        return {
          ...post,
          isLiked: !!userReaction,
          isSaved: true,
          userReactionId: userReaction ? parseInt(userReaction.PostLikeId) : undefined,
        }
      })
      
      // Update user reactions for saved posts
      savedWithUserStatus.forEach((post) => {
        const userReaction = post.Likes?.find(
          (like) => like.AccountId === String(userId)
        )
        if (userReaction && userReaction.ReactionType && post.PostId) {
          setUserReactions((prev) => ({
            ...prev,
            [post.PostId]: getReactionTypeId(userReaction.ReactionType || 'Like'),
          }))
        }
      })
      
      setSavedPosts(savedWithUserStatus)
    } catch (err: any) {
      console.error('Error fetching saved posts:', err)
      setSavedPosts([])
    }
  }

  const getSavedPostIds = (): string[] => {
    try {
      const saved = localStorage.getItem('savedPostIds')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const savePostId = (postId: string) => {
    const saved = getSavedPostIds()
    if (!saved.includes(postId)) {
      saved.push(postId)
      localStorage.setItem('savedPostIds', JSON.stringify(saved))
    }
  }

  const removePostId = (postId: string) => {
    const saved = getSavedPostIds()
    const filtered = saved.filter((id) => id !== postId)
    localStorage.setItem('savedPostIds', JSON.stringify(filtered))
  }

  const handleReaction = async (postId: string, reactionTypeId: number, currentReactionId?: number) => {
    if (!userInfo) {
      // Yêu cầu đăng nhập - redirect trực tiếp không hiển thị alert
      navigate('/login', { state: { returnUrl: '/forum' } })
      return
    }

    const userId = userInfo.Id || userInfo.id
    const userName = userInfo.Name || userInfo.name || 'Bạn'
    
    // Lưu state trước khi thay đổi để revert nếu có lỗi
    const previousPosts = posts
    const previousSavedPosts = savedPosts
    const previousUserReactions = { ...userReactions }

    try {
      // Nếu đã có reaction và chọn lại cùng loại, thì unlike
      if (currentReactionId && userReactions[postId] === reactionTypeId) {
        // Kiểm tra xem currentReactionId có phải là temporary ID không (timestamp)
        const isTemporaryId = String(currentReactionId).length > 10 // Temporary ID thường là timestamp dài
        
        if (isTemporaryId) {
          // Nếu là temporary ID, cần fetch lại để lấy reactionId thực sự
          // Fetch một cách im lặng (không hiển thị loading)
          try {
            const response = await axiosInstance.get<Post[]>(`${API_ENDPOINTS.POST}/GetAllPost`)
            const approvedPosts = (response.data || []).filter(post => post.Status === 'Approved')
            const postData = approvedPosts.find(p => String(p.PostId || p.Id) === postId)
            
            if (postData) {
              const normalized = normalizePost(postData)
              const userReaction = normalized.Likes?.find(
                (like) => like.AccountId === String(userId)
              )
              
              if (userReaction && userReaction.PostLikeId) {
                const realReactionId = parseInt(userReaction.PostLikeId)
                await axiosInstance.delete(`${API_ENDPOINTS.POST_REACTION}/unlike/${realReactionId}`)
              } else {
                // Không tìm thấy reaction, có thể đã bị xóa
                throw new Error('Reaction không tồn tại')
              }
            } else {
              throw new Error('Không tìm thấy bài viết')
            }
          } catch (fetchErr: any) {
            // Nếu fetch thất bại, vẫn thử unlike với ID hiện tại
            await axiosInstance.delete(`${API_ENDPOINTS.POST_REACTION}/unlike/${currentReactionId}`)
          }
        } else {
          // Có reactionId thực sự, unlike trực tiếp
          await axiosInstance.delete(`${API_ENDPOINTS.POST_REACTION}/unlike/${currentReactionId}`)
        }
        
        // Optimistic update - cập nhật state ngay lập tức
        setUserReactions((prev) => {
          const newReactions = { ...prev }
          delete newReactions[postId]
          return newReactions
        })
        
        setPosts((prev) =>
          prev.map((post) => {
            if (post.PostId === postId) {
              const newLikes = post.Likes?.filter((like) => like.PostLikeId !== String(currentReactionId)) || []
              return {
                ...post,
                isLiked: false,
                userReactionId: undefined,
                Likes: newLikes,
              }
            }
            return post
          })
        )
        
        setSavedPosts((prev) =>
          prev.map((post) => {
            if (post.PostId === postId) {
              const newLikes = post.Likes?.filter((like) => like.PostLikeId !== String(currentReactionId)) || []
              return {
                ...post,
                isLiked: false,
                userReactionId: undefined,
                Likes: newLikes,
              }
            }
            return post
          })
        )
        
        // Không refresh, chỉ dùng optimistic update
      } else {
        // Thêm hoặc thay đổi reaction
        await axiosInstance.post(`${API_ENDPOINTS.POST_REACTION}/${postId}/${reactionTypeId}`)
        
        // Optimistic update - cập nhật state ngay lập tức
        setUserReactions((prev) => ({
          ...prev,
          [postId]: reactionTypeId,
        }))
        
        const reactionType = REACTION_TYPES.find(r => r.id === reactionTypeId)
        const reactionTypeName = reactionType?.name || 'Like'
        
        // Cập nhật posts
        setPosts((prev) =>
          prev.map((post) => {
            if (post.PostId === postId) {
              const existingLike = post.Likes?.find((like) => like.AccountId === String(userId))
              
              // Nếu đã có reaction, thay thế; nếu chưa có, thêm mới
              const newLikes = existingLike
                ? post.Likes?.map((like) => 
                    like.AccountId === String(userId)
                      ? { ...like, ReactionType: reactionTypeName }
                      : like
                  ) || []
                : [
                    ...(post.Likes || []),
                    {
                      PostLikeId: String(Date.now()), // Temporary ID, sẽ được cập nhật khi cần
                      AccountId: String(userId),
                      FullName: userName,
                      CreatedDate: new Date().toISOString(),
                      ReactionType: reactionTypeName,
                    },
                  ]
              
              return {
                ...post,
                isLiked: true,
                userReactionId: existingLike ? parseInt(existingLike.PostLikeId) : undefined,
                Likes: newLikes,
              }
            }
            return post
          })
        )
        
        // Cập nhật savedPosts
        setSavedPosts((prev) =>
          prev.map((post) => {
            if (post.PostId === postId) {
              const existingLike = post.Likes?.find((like) => like.AccountId === String(userId))
              
              const newLikes = existingLike
                ? post.Likes?.map((like) => 
                    like.AccountId === String(userId)
                      ? { ...like, ReactionType: reactionTypeName }
                      : like
                  ) || []
                : [
                    ...(post.Likes || []),
                    {
                      PostLikeId: String(Date.now()),
                      AccountId: String(userId),
                      FullName: userName,
                      CreatedDate: new Date().toISOString(),
                      ReactionType: reactionTypeName,
                    },
                  ]
              
              return {
                ...post,
                isLiked: true,
                userReactionId: existingLike ? parseInt(existingLike.PostLikeId) : undefined,
                Likes: newLikes,
              }
            }
            return post
          })
        )
        
        // Không refresh, chỉ dùng optimistic update
        // ReactionId thực sự sẽ được lấy khi cần (khi unlike)
      }
      
      // Đóng reaction picker
      setShowReactionPicker((prev) => ({
        ...prev,
        [postId]: false,
      }))
    } catch (err: any) {
      console.error('Error reacting to post:', err)
      
      // Revert optimistic update on error
      setPosts(previousPosts)
      setSavedPosts(previousSavedPosts)
      setUserReactions(previousUserReactions)
      
      // Chỉ refresh khi có lỗi để đảm bảo đồng bộ
      await fetchPosts(true)
      if (activeTab === 'saved') {
        await fetchSavedPosts(true)
      }
      
      console.error('Error reacting to post:', err.response?.data?.message || err.message)
    }
  }

  const handleReactionPickerToggle = (postId: string, show: boolean) => {
    // Clear existing timeout
    if (reactionPickerTimeout[postId]) {
      clearTimeout(reactionPickerTimeout[postId])
    }

    if (show) {
      setShowReactionPicker((prev) => ({
        ...prev,
        [postId]: true,
      }))
    } else {
      // Delay hiding để user có thể di chuyển chuột
      const timeout = setTimeout(() => {
        setShowReactionPicker((prev) => {
          const newState = { ...prev }
          delete newState[postId]
          return newState
        })
      }, 200)
      setReactionPickerTimeout((prev) => ({
        ...prev,
        [postId]: timeout,
      }))
    }
  }

  const validatePostForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!createPostData.PostContent.trim()) {
      errors.PostContent = 'Vui lòng nhập nội dung bài viết'
    } else if (createPostData.PostContent.trim().length < 10) {
      errors.PostContent = 'Nội dung bài viết phải có ít nhất 10 ký tự'
    }
    
    // Validate images
    const invalidImages: string[] = []
    createPostData.Images.forEach((img, idx) => {
      if (img.trim() && !img.trim().match(/\.(jpg|jpeg|png|gif|webp)$/i) && !img.trim().startsWith('http')) {
        invalidImages.push(`Ảnh ${idx + 1}`)
      }
    })
    if (invalidImages.length > 0) {
      errors.Images = `URL ảnh không hợp lệ: ${invalidImages.join(', ')}`
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setCreatePostData({
      ArticleTitle: post.ArticleTitle || '',
      PostContent: post.PostContent || post.Content || '',
      Images: post.Images || [],
    })
    // For editing, images are URLs, not files
    setImageFiles([])
    setImagePreviewUrls(post.Images?.slice(0, 10) || [])
    setFormErrors({})
    setShowCreatePostModal(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!userInfo) return

    try {
      setDeletingPost(postId)
      await axiosInstance.delete(`${API_ENDPOINTS.POST}/DeletePost?id=${postId}`)
      
      // Remove from state
      setPosts((prev) => prev.filter((post) => post.PostId !== postId))
      setSavedPosts((prev) => prev.filter((post) => post.PostId !== postId))
      removePostId(postId)
    } catch (err: any) {
      console.error('Error deleting post:', err)
      // Revert deletion on error
      await fetchPosts()
      if (activeTab === 'saved') {
        await fetchSavedPosts()
      }
    } finally {
      setDeletingPost(null)
      setShowPostMenu((prev) => {
        const newState = { ...prev }
        delete newState[postId]
        return newState
      })
    }
  }

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInfo || !editingPost) {
      return
    }

    if (!validatePostForm()) {
      return
    }

    try {
      setSubmittingPost(true)
      setFormErrors({})
      const postData = {
        PostContent: createPostData.PostContent.trim(),
        ArticleTitle: createPostData.ArticleTitle.trim() || undefined,
        Images: createPostData.Images.filter(img => img.trim()),
        PosterName: userInfo.Name || userInfo.name || 'Người dùng',
        Hashtags: [],
      }

      await axiosInstance.put(`${API_ENDPOINTS.POST}/UpdatePost?id=${editingPost.PostId || editingPost.Id}`, postData)
      
      // Reset form
      setCreatePostData({
        ArticleTitle: '',
        PostContent: '',
        Images: [],
      })
      setImageFiles([])
      setImagePreviewUrls([])
      setFormErrors({})
      setEditingPost(null)
      setShowCreatePostModal(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Refresh posts
      await fetchPosts()
      if (activeTab === 'saved') {
        await fetchSavedPosts()
      }
    } catch (err: any) {
      console.error('Error updating post:', err)
      setFormErrors({ submit: err.response?.data?.message || 'Không thể cập nhật bài viết. Vui lòng thử lại.' })
    } finally {
      setSubmittingPost(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInfo) {
      return
    }

    if (!validatePostForm()) {
      return
    }

    try {
      setSubmittingPost(true)
      setFormErrors({})
      const postData = {
        PostContent: createPostData.PostContent.trim(),
        ArticleTitle: createPostData.ArticleTitle.trim() || undefined,
        Images: createPostData.Images.filter(img => img.trim()),
        PosterName: userInfo.Name || userInfo.name || 'Người dùng',
        Hashtags: [],
      }

      await axiosInstance.post(`${API_ENDPOINTS.POST}/CreatePost`, postData)
      
      // Reset form
      setCreatePostData({
        ArticleTitle: '',
        PostContent: '',
        Images: [],
      })
      setImageFiles([])
      setImagePreviewUrls([])
      setFormErrors({})
      setEditingPost(null)
      setShowCreatePostModal(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Refresh posts
      await fetchPosts()
    } catch (err: any) {
      console.error('Error creating post:', err)
      setFormErrors({ submit: err.response?.data?.message || 'Không thể đăng bài viết. Vui lòng thử lại.' })
    } finally {
      setSubmittingPost(false)
    }
  }

  // Convert File to base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles: File[] = []
    const maxFiles = 10
    const maxSize = 5 * 1024 * 1024 // 5MB per file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    for (let i = 0; i < Math.min(files.length, maxFiles - imageFiles.length); i++) {
      const file = files[i]
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          Images: `File ${file.name} không phải là ảnh hợp lệ (chỉ chấp nhận JPG, PNG, GIF, WEBP)`
        }))
        continue
      }

      // Validate file size
      if (file.size > maxSize) {
        setFormErrors((prev) => ({
          ...prev,
          Images: `File ${file.name} quá lớn (tối đa 5MB)`
        }))
        continue
      }

      newFiles.push(file)
    }

    if (newFiles.length === 0) return

    // Add to imageFiles
    const updatedFiles = [...imageFiles, ...newFiles].slice(0, maxFiles)
    setImageFiles(updatedFiles)

    // Generate preview URLs
    const previewPromises = updatedFiles.map(file => fileToBase64(file))
    const previewUrls = await Promise.all(previewPromises)
    setImagePreviewUrls(previewUrls)

    // Convert to base64 data URLs for backend
    const base64Promises = updatedFiles.map(file => fileToBase64(file))
    const base64Urls = await Promise.all(base64Promises)
    setCreatePostData({ ...createPostData, Images: base64Urls })
  }

  // Remove image
  const handleRemoveImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    setImageFiles(newFiles)

    if (newFiles.length === 0) {
      setImagePreviewUrls([])
      setCreatePostData({ ...createPostData, Images: [] })
    } else {
      // Regenerate previews
      const previewPromises = newFiles.map(file => fileToBase64(file))
      Promise.all(previewPromises).then(urls => {
        setImagePreviewUrls(urls)
        setCreatePostData({ ...createPostData, Images: urls })
      })
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleSave = async (postId: string, isCurrentlySaved: boolean) => {
    if (!userInfo || !postId) {
      return
    }

    const postIdNum = parseInt(postId)
    if (isNaN(postIdNum)) {
      console.error('Invalid postId:', postId)
      return
    }

    // Lưu state trước khi thay đổi để revert nếu có lỗi
    const previousSavedState = isCurrentlySaved
    const previousSavedPostIds = getSavedPostIds()
    
    // Optimistic update - update UI immediately
    if (isCurrentlySaved) {
      // Optimistically remove from saved
      removePostId(postId)
      setPosts((prev) =>
        prev.map((post) => {
          if (post.PostId === postId) {
            return { ...post, isSaved: false }
          }
          return post
        })
      )
      setSavedPosts((prev) => prev.filter((post) => post.PostId !== postId))
    } else {
      // Optimistically add to saved
      savePostId(postId)
      setPosts((prev) =>
        prev.map((post) => {
          if (post.PostId === postId) {
            return { ...post, isSaved: true }
          }
          return post
        })
      )
      // Nếu đang ở tab saved, thêm vào savedPosts ngay lập tức
      if (activeTab === 'saved') {
        // Tìm post trong posts để thêm vào savedPosts
        const postToAdd = posts.find(p => p.PostId === postId)
        if (postToAdd) {
          setSavedPosts((prev) => {
            // Kiểm tra xem đã có chưa để tránh duplicate
            if (prev.some(p => p.PostId === postId)) {
              return prev
            }
            return [...prev, { ...postToAdd, isSaved: true }]
          })
        }
      }
    }

    try {
      if (isCurrentlySaved) {
        // Unsave: xóa khỏi saved
        await axiosInstance.delete(`${API_ENDPOINTS.POST_SAVE}/unsave/${postIdNum}`)
        // Không refresh gì cả, optimistic update đã xử lý rồi
        // State đã được cập nhật đúng: localStorage đã xóa, posts đã cập nhật isSaved=false, savedPosts đã filter ra
      } else {
        // Save: thêm vào saved
        await axiosInstance.post(`${API_ENDPOINTS.POST_SAVE}/save/${postIdNum}`)
        // Nếu đang ở tab saved và chưa có trong savedPosts, fetch lại
        if (activeTab === 'saved') {
          const postExists = savedPosts.some(p => p.PostId === postId)
          if (!postExists) {
            // Fetch lại để đảm bảo có đầy đủ thông tin từ server
            await fetchSavedPosts(false)
          }
        }
      }
    } catch (err: any) {
      console.error('Error saving post:', err)
      
      // Kiểm tra error message từ backend
      const errorMessage = err.response?.data?.message || err.message || ''
      const isAlreadyUnsaved = errorMessage.includes('Bài viết chưa được lưu') || errorMessage.includes('chưa được lưu')
      const isAlreadySaved = errorMessage.includes('đã lưu bài viết này rồi') || errorMessage.includes('đã lưu')
      
      // Nếu unsave nhưng backend báo chưa được lưu, thì coi như thành công (đã unsave rồi)
      if (previousSavedState && isAlreadyUnsaved) {
        // Không cần revert, vì post đã không được lưu trong database
        // Chỉ cần đảm bảo UI đã được cập nhật đúng (đã làm ở optimistic update)
        console.log('Post was already unsaved in database, keeping UI state')
        return
      }
      
      // Nếu save nhưng backend báo đã lưu rồi, thì coi như thành công (đã save rồi)
      if (!previousSavedState && isAlreadySaved) {
        // Không cần revert, vì post đã được lưu trong database
        // Chỉ cần đảm bảo UI đã được cập nhật đúng (đã làm ở optimistic update)
        console.log('Post was already saved in database, keeping UI state')
        return
      }
      
      // Revert optimistic update on error (các lỗi khác)
      if (previousSavedState) {
        // Revert unsave: restore previous state
        // Restore localStorage
        localStorage.setItem('savedPostIds', JSON.stringify(previousSavedPostIds))
        // Restore posts state
        setPosts((prev) =>
          prev.map((post) => {
            if (post.PostId === postId) {
              return { ...post, isSaved: true }
            }
            return post
          })
        )
        // Restore savedPosts - fetch lại từ localStorage
        if (activeTab === 'saved') {
          await fetchSavedPosts(false)
        } else {
          // Nếu không ở tab saved, chỉ cần thêm lại vào savedPosts nếu có
          const postToRestore = posts.find(p => p.PostId === postId)
          if (postToRestore) {
            setSavedPosts((prev) => {
              if (prev.some(p => p.PostId === postId)) {
                return prev
              }
              return [...prev, { ...postToRestore, isSaved: true }]
            })
          }
        }
      } else {
        // Revert save: remove from saved
        removePostId(postId)
        setPosts((prev) =>
          prev.map((post) => {
            if (post.PostId === postId) {
              return { ...post, isSaved: false }
            }
            return post
          })
        )
        setSavedPosts((prev) => prev.filter((post) => post.PostId !== postId))
      }
    }
  }

  const handleComment = async (postId: string) => {
    if (!userInfo) {
      // Yêu cầu đăng nhập - redirect trực tiếp không hiển thị alert
      navigate('/login', { state: { returnUrl: '/forum' } })
      return
    }

    const commentText = commentInputs[postId]?.trim()
    if (!commentText) return

    try {
      setSubmittingComment(postId)
      await axiosInstance.post(API_ENDPOINTS.COMMENT, {
        PostId: parseInt(postId),
        Content: commentText,
        Images: null, // Không có ảnh trong comment input hiện tại
        ParentCommentId: null, // Không phải reply
      })
      
      // Optimistic update
      const userId = userInfo.Id || userInfo.id
      const userName = userInfo.Name || userInfo.name || 'Bạn'
      setPosts((prev) =>
        prev.map((post) => {
          if (post.PostId === postId) {
            const newComment: PostComment = {
              PostCommentId: String(Date.now()),
              FullName: userName,
              Content: commentText,
              CreatedDate: new Date().toISOString(),
              Likes: [],
              Replies: [],
            }
            return {
              ...post,
              Comments: [...(post.Comments || []), newComment],
            }
          }
          return post
        })
      )
      
      setCommentInputs((prev) => {
        const newInputs = { ...prev }
        delete newInputs[postId]
        return newInputs
      })
      
      // Refresh posts để lấy comment mới từ server nhưng giữ lại isSaved state
      await fetchPosts(true)
    } catch (err: any) {
      console.error('Error commenting:', err)
      // Revert optimistic update
      await fetchPosts(true)
    } finally {
      setSubmittingComment(null)
    }
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Vừa xong'
      if (diffMins < 60) return `${diffMins} phút trước`
      if (diffHours < 24) return `${diffHours} giờ trước`
      if (diffDays < 7) return `${diffDays} ngày trước`
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const displayPosts = activeTab === 'featured' ? posts : savedPosts

  // Post Card Skeleton Component
  const PostCardSkeleton = () => {
    return (
      <article className="forum-skeleton-card">
        <div className="forum-post-header">
          <div className="forum-post-author">
            <div className="forum-skeleton-avatar"></div>
            <div className="forum-post-author-info" style={{ flex: 1 }}>
              <div className="forum-skeleton-line short"></div>
              <div className="forum-skeleton-line" style={{ width: '40%', marginTop: '0.5rem' }}></div>
            </div>
          </div>
        </div>
        <div className="forum-post-content" style={{ marginTop: '1rem' }}>
          <div className="forum-skeleton-line medium" style={{ marginBottom: '0.75rem' }}></div>
          <div className="forum-skeleton-line" style={{ marginBottom: '0.5rem' }}></div>
          <div className="forum-skeleton-line short"></div>
        </div>
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
          <div className="forum-skeleton-line" style={{ width: '100px', height: '2rem' }}></div>
          <div className="forum-skeleton-line" style={{ width: '100px', height: '2rem' }}></div>
          <div className="forum-skeleton-line" style={{ width: '80px', height: '2rem' }}></div>
        </div>
      </article>
    )
  }

  return (
    <div className="forum-page">
      <Header />

      <main className="forum-main">
        {/* Page Header */}
        <section className="forum-page-header">
          <div className="forum-header-container">
            <h1 className="forum-page-title">Diễn đàn</h1>
            <p className="forum-page-subtitle">
              Chia sẻ và kết nối với cộng đồng
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="forum-content-section">
          <div className="forum-content-container">
            {/* Tabs and Create Post Button */}
            <div className="forum-tabs-container">
              <div className="forum-tabs">
                <button
                  className={`forum-tab ${activeTab === 'featured' ? 'active' : ''}`}
                  onClick={() => setActiveTab('featured')}
                >
                  Nổi bật
                </button>
                <button
                  className={`forum-tab ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                >
                  Bài viết yêu thích
                </button>
              </div>
              {userInfo && (
                <button
                  className="forum-create-post-btn"
                  onClick={() => setShowCreatePostModal(true)}
                >
                  <PlusIcon className="forum-create-post-icon" />
                  Đăng bài
                </button>
              )}
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="forum-posts-list">
                {[...Array(3)].map((_, idx) => (
                  <PostCardSkeleton key={idx} />
                ))}
              </div>
            ) : error ? (
              <div className="forum-error-container" role="alert">
                <h3>❌ Lỗi tải dữ liệu</h3>
                <p className="error-message">{error}</p>
                <button
                  className="forum-retry-btn"
                  onClick={() => fetchPosts(false)}
                  style={{ marginTop: '1rem' }}
                >
                  Thử lại
                </button>
              </div>
            ) : displayPosts.length === 0 ? (
              <div className="forum-empty-state">
                <p className="empty-state-title">
                  {activeTab === 'saved'
                    ? 'Chưa có bài viết yêu thích nào'
                    : 'Chưa có bài viết nào'}
                </p>
                <p className="empty-state-description">
                  {activeTab === 'saved'
                    ? 'Lưu các bài viết bạn yêu thích để xem lại sau.'
                    : 'Hiện tại chưa có bài viết nào được đăng. Vui lòng quay lại sau.'}
                </p>
              </div>
            ) : (
              <div className="forum-posts-list">
                {displayPosts.map((post) => (
                  <PostCard
                    key={post.PostId}
                    post={post}
                    userInfo={userInfo}
                    userReactionTypeId={userReactions[post.PostId || '']}
                    onReaction={handleReaction}
                    onSave={handleSave}
                    onComment={handleComment}
                    expandedComments={expandedComments}
                    toggleComments={toggleComments}
                    commentInputs={commentInputs}
                    setCommentInputs={setCommentInputs}
                    submittingComment={submittingComment}
                    showReactionPicker={showReactionPicker[post.PostId || '']}
                    setShowReactionPicker={(show: boolean) => handleReactionPickerToggle(post.PostId || '', show)}
                    formatDate={formatDate}
                    reactionTypes={REACTION_TYPES}
                    getReactionTypeId={getReactionTypeId}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                    showPostMenu={showPostMenu[post.PostId || '']}
                    setShowPostMenu={(show: boolean) => setShowPostMenu(prev => ({ ...prev, [post.PostId || '']: show }))}
                    deletingPost={deletingPost === post.PostId}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="forum-modal-overlay" onClick={() => setShowCreatePostModal(false)}>
          <div className="forum-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="forum-modal-header">
              <h2 className="forum-modal-title">
                {editingPost ? 'Chỉnh sửa bài viết' : 'Đăng bài viết mới'}
              </h2>
              <button
                className="forum-modal-close"
                onClick={() => {
                  setShowCreatePostModal(false)
                  setEditingPost(null)
                  setCreatePostData({ ArticleTitle: '', PostContent: '', Images: [] })
                  setImageFiles([])
                  setImagePreviewUrls([])
                  setFormErrors({})
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                aria-label="Đóng"
              >
                <XIcon />
              </button>
            </div>

            <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="forum-form">
              <div className="forum-form-group">
                <label htmlFor="post-title" className="forum-form-label">
                  Tiêu đề (tùy chọn)
                </label>
                <input
                  id="post-title"
                  type="text"
                  className="forum-form-input"
                  value={createPostData.ArticleTitle}
                  onChange={(e) => setCreatePostData({ ...createPostData, ArticleTitle: e.target.value })}
                  placeholder="Nhập tiêu đề bài viết"
                />
              </div>

              <div className="forum-form-group">
                <label htmlFor="post-content" className="forum-form-label">
                  Nội dung <span className="required">*</span>
                  <span className="forum-form-char-count">
                    {createPostData.PostContent.length}/5000
                  </span>
                </label>
                <textarea
                  id="post-content"
                  className={`forum-form-textarea ${formErrors.PostContent ? 'error' : ''}`}
                  rows={8}
                  value={createPostData.PostContent}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 5000) // Giới hạn 5000 ký tự
                    setCreatePostData({ ...createPostData, PostContent: value })
                    if (formErrors.PostContent) {
                      setFormErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.PostContent
                        return newErrors
                      })
                    }
                  }}
                  placeholder="Chia sẻ suy nghĩ của bạn... (tối thiểu 10 ký tự)"
                  required
                  maxLength={5000}
                />
                {formErrors.PostContent && (
                  <span className="forum-form-error-text">{formErrors.PostContent}</span>
                )}
              </div>

              <div className="forum-form-group">
                <label className="forum-form-label">
                  Hình ảnh (tối đa 10 ảnh, mỗi ảnh tối đa 5MB)
                </label>
                
                {/* Drag & Drop Area */}
                <div
                  className={`forum-upload-area ${isDragging ? 'dragging' : ''} ${formErrors.Images ? 'error' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="post-images"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    className="forum-file-input"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  <div className="forum-upload-content">
                    <ImageIcon className="forum-upload-icon" />
                    <p className="forum-upload-text">
                      Kéo thả ảnh vào đây hoặc <span className="forum-upload-link">chọn từ máy tính</span>
                    </p>
                    <p className="forum-upload-hint">
                      Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 5MB/ảnh)
                    </p>
                  </div>
                </div>

                {formErrors.Images && (
                  <span className="forum-form-error-text">{formErrors.Images}</span>
                )}

                {/* Image Preview Grid */}
                {imagePreviewUrls.length > 0 && (
                  <div className="forum-image-preview-grid">
                    {imagePreviewUrls.map((url, idx) => (
                      <div key={idx} className="forum-image-preview-item">
                        <LazyImage
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="forum-image-preview"
                          fallbackSrc="/img/banahills.jpg"
                        />
                        <button
                          type="button"
                          className="forum-image-remove-btn"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label="Xóa ảnh"
                        >
                          <XIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {formErrors.PostContent && (
                <div className="forum-form-error-message">
                  {formErrors.PostContent}
                </div>
              )}
              
              {formErrors.submit && (
                <div className="forum-form-error-message">
                  {formErrors.submit}
                </div>
              )}

              <div className="forum-form-actions">
                <button
                  type="button"
                  className="forum-form-btn forum-form-btn-cancel"
                  onClick={() => {
                    setShowCreatePostModal(false)
                    setEditingPost(null)
                    setCreatePostData({ ArticleTitle: '', PostContent: '', Images: [] })
                    setImageFiles([])
                    setImagePreviewUrls([])
                    setFormErrors({})
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  disabled={submittingPost}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="forum-form-btn forum-form-btn-submit"
                  disabled={submittingPost}
                >
                  {submittingPost ? (editingPost ? 'Đang cập nhật...' : 'Đang đăng...') : (editingPost ? 'Cập nhật' : 'Đăng bài')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

// Post Card Component
interface PostCardProps {
  post: Post
  userInfo: UserInfo | null
  userReactionTypeId?: number
  onReaction: (postId: string, reactionTypeId: number, reactionId?: number) => void
  onSave: (postId: string, isSaved: boolean) => void
  onComment: (postId: string) => void
  expandedComments: Set<string>
  toggleComments: (postId: string) => void
  commentInputs: Record<string, string>
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
  submittingComment: string | null
  showReactionPicker: boolean
  setShowReactionPicker: (show: boolean) => void
  formatDate: (date: string) => string
  reactionTypes: Array<{ id: number; name: string; emoji: string }>
  getReactionTypeId: (reactionTypeName: string) => number
  onEdit?: (post: Post) => void
  onDelete?: (postId: string) => void
  showPostMenu?: boolean
  setShowPostMenu?: (show: boolean) => void
  deletingPost?: boolean
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  userInfo,
  userReactionTypeId,
  onReaction,
  onSave,
  onComment,
  expandedComments,
  toggleComments,
  commentInputs,
  setCommentInputs,
  submittingComment,
  showReactionPicker,
  setShowReactionPicker,
  formatDate,
  reactionTypes,
  getReactionTypeId,
  onEdit,
  onDelete,
  showPostMenu = false,
  setShowPostMenu,
  deletingPost = false,
}) => {
  const isCommentsExpanded = expandedComments.has(post.PostId || '')
  const reactionCount = post.Likes?.length || 0
  const commentCount = post.Comments?.length || 0
  const currentReaction = userReactionTypeId 
    ? reactionTypes.find(r => r.id === userReactionTypeId)
    : null

  // Tính toán các loại cảm xúc để hiển thị icon
  const reactionCountsByType = useMemo(() => {
    const counts: Record<number, number> = {}
    post.Likes?.forEach((like) => {
      if (like.ReactionType) {
        const typeId = getReactionTypeId(like.ReactionType)
        counts[typeId] = (counts[typeId] || 0) + 1
      } else {
        // Mặc định là Like nếu không có ReactionType
        counts[1] = (counts[1] || 0) + 1
      }
    })
    return counts
  }, [post.Likes])

  // Lấy các icon cảm xúc đã có (tối đa 2-3 icon đầu tiên)
  const reactionIcons = useMemo(() => {
    const icons: Array<{ id: number; emoji: string; count: number }> = []
    // Sắp xếp theo thứ tự ưu tiên: Like, Love, Haha, Wow, Sad, Angry
    const priorityOrder = [1, 2, 3, 4, 5, 6]
    priorityOrder.forEach((typeId) => {
      if (reactionCountsByType[typeId] && reactionCountsByType[typeId] > 0) {
        const reaction = reactionTypes.find(r => r.id === typeId)
        if (reaction) {
          icons.push({ id: typeId, emoji: reaction.emoji, count: reactionCountsByType[typeId] })
        }
      }
    })
    return icons.slice(0, 3) // Chỉ hiển thị tối đa 3 icon
  }, [reactionCountsByType, reactionTypes])

  // Check if current user is the author
  const isAuthor = userInfo && (
    String(post.PosterId) === String(userInfo.Id || userInfo.id) ||
    String(post.AuthorId) === String(userInfo.Id || userInfo.id)
  )

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (setShowPostMenu) {
      setShowPostMenu(!showPostMenu)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(post)
      if (setShowPostMenu) {
        setShowPostMenu(false)
      }
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && post.PostId) {
      onDelete(post.PostId)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showPostMenu && setShowPostMenu) {
        const target = e.target as HTMLElement
        if (!target.closest('.forum-post-menu-wrapper')) {
          setShowPostMenu(false)
        }
      }
    }
    if (showPostMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPostMenu, setShowPostMenu])

  return (
    <article className="forum-post-card">
      <div className="forum-post-header">
        <div className="forum-post-author">
          <div className="forum-post-avatar">
            {post.PosterName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="forum-post-author-info">
            <div className="forum-post-author-name">{post.PosterName || 'Người dùng'}</div>
            <div className="forum-post-meta">
              <ClockIcon className="forum-meta-icon" />
              <span>{formatDate(post.PublicDate)}</span>
            </div>
          </div>
        </div>
        {isAuthor && (
          <div className="forum-post-menu-wrapper">
            <button
              className="forum-post-menu-btn"
              onClick={handleMenuToggle}
              aria-label="Tùy chọn"
              disabled={deletingPost}
            >
              <MoreVerticalIcon className="forum-post-menu-icon" />
            </button>
            {showPostMenu && (
              <div className="forum-post-menu">
                <button
                  className="forum-post-menu-item"
                  onClick={handleEditClick}
                  disabled={deletingPost}
                >
                  <EditIcon className="forum-post-menu-item-icon" />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  className="forum-post-menu-item forum-post-menu-item-danger"
                  onClick={handleDeleteClick}
                  disabled={deletingPost}
                >
                  <TrashIcon className="forum-post-menu-item-icon" />
                  <span>{deletingPost ? 'Đang xóa...' : 'Xóa'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="forum-post-content">
        {post.ArticleTitle && (
          <h3 className="forum-post-title">{post.ArticleTitle}</h3>
        )}
        <p className="forum-post-text">{post.PostContent}</p>
        
        {post.Images && post.Images.length > 0 && (
          <div className="forum-post-images">
            {(() => {
              // Lọc các ảnh hợp lệ (không phải fallback)
              const validImages = post.Images.filter(img => img && img.trim() && img !== '/img/banahills.jpg')
              
              if (validImages.length === 0) {
                return null
              }
              
              if (validImages.length === 1) {
                return (
                  <LazyImage
                    src={validImages[0]}
                    alt="Post image"
                    className="forum-post-image-single"
                    fallbackSrc="/img/banahills.jpg"
                  />
                )
              }
              
              return (
                <div className="forum-post-images-grid">
                  {validImages.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="forum-post-image-wrapper">
                      <LazyImage
                        src={img}
                        alt={`Post image ${idx + 1}`}
                        className="forum-post-image"
                        fallbackSrc="/img/banahills.jpg"
                      />
                      {idx === 3 && validImages.length > 4 && (
                        <div className="forum-post-image-overlay">
                          +{validImages.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Reaction summary - hiển thị icon cảm xúc + số lượng */}
      {reactionCount > 0 && (
        <div className="forum-reaction-summary">
          <div className="forum-reaction-icons">
            {reactionIcons.map((icon) => (
              <span key={icon.id} className="forum-reaction-icon" role="img" aria-label={reactionTypes.find(r => r.id === icon.id)?.name}>
                {icon.emoji}
              </span>
            ))}
          </div>
          <span className="forum-reaction-count">{reactionCount}</span>
        </div>
      )}

      <div className="forum-post-actions">
        <div className="forum-reaction-wrapper">
          {currentReaction ? (
            // Nếu đã có reaction, click vào icon để unlike
            <button
              className="forum-action-btn forum-reaction-btn has-reaction"
              onClick={(e) => {
                e.stopPropagation()
                // Unlike: click vào icon cảm xúc hiện tại
                // handleReaction sẽ kiểm tra userInfo và yêu cầu đăng nhập nếu cần
                onReaction(post.PostId || '', userReactionTypeId || 1, post.userReactionId)
              }}
              onMouseEnter={() => userInfo && setShowReactionPicker(true)}
              onMouseLeave={() => {
                setTimeout(() => {
                  if (!document.querySelector('.forum-reaction-picker:hover')) {
                    setShowReactionPicker(false)
                  }
                }, 100)
              }}
              title={userInfo ? `Bỏ ${currentReaction.name}` : 'Bạn cần đăng nhập để bỏ cảm xúc'}
              aria-label={userInfo ? `Bỏ ${currentReaction.name}` : 'Bạn cần đăng nhập để bỏ cảm xúc'}
            >
              <span className="forum-reaction-emoji" role="img" aria-label={currentReaction.name}>
                {currentReaction.emoji}
              </span>
              <span>Thích</span>
            </button>
          ) : (
            // Nếu chưa có reaction, click để hiện picker hoặc yêu cầu đăng nhập
            <button
              className="forum-action-btn forum-reaction-btn"
              onClick={(e) => {
                e.stopPropagation()
                if (userInfo) {
                  setShowReactionPicker(!showReactionPicker)
                } else {
                  // Nếu chưa đăng nhập, gọi onReaction để yêu cầu đăng nhập
                  // onReaction sẽ kiểm tra userInfo và yêu cầu đăng nhập
                  onReaction(post.PostId || '', 1, undefined)
                }
              }}
              onMouseEnter={() => userInfo && setShowReactionPicker(true)}
              onMouseLeave={() => {
                setTimeout(() => {
                  if (!document.querySelector('.forum-reaction-picker:hover')) {
                    setShowReactionPicker(false)
                  }
                }, 100)
              }}
              title={userInfo ? 'Bày tỏ cảm xúc' : 'Bạn cần đăng nhập để thả cảm xúc'}
              aria-label={userInfo ? 'Bày tỏ cảm xúc' : 'Bạn cần đăng nhập để thả cảm xúc'}
            >
              <HeartIcon className="forum-action-icon" />
              <span>Thích</span>
            </button>
          )}
          {showReactionPicker && userInfo && (
            <div 
              className="forum-reaction-picker"
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
              role="menu"
              aria-label="Chọn cảm xúc"
            >
              {reactionTypes.map((reaction) => (
                <button
                  key={reaction.id}
                  className={`forum-reaction-option ${userReactionTypeId === reaction.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Chỉ click mới chọn reaction
                    onReaction(post.PostId || '', reaction.id, post.userReactionId)
                    setShowReactionPicker(false)
                  }}
                  title={reaction.name}
                  aria-label={reaction.name}
                  role="menuitem"
                >
                  <span className="forum-reaction-emoji-large" role="img" aria-label={reaction.name}>
                    {reaction.emoji}
                  </span>
                  <span className="forum-reaction-name">{reaction.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="forum-action-btn"
          onClick={() => toggleComments(post.PostId || '')}
        >
          <CommentIcon className="forum-action-icon" />
          <span>{commentCount} bình luận</span>
        </button>
        {userInfo && (
          <button
            className={`forum-action-btn ${post.isSaved ? 'saved' : ''}`}
            onClick={() => {
              const currentSavedState = !!post.isSaved
              onSave(post.PostId || '', currentSavedState)
            }}
          >
            <BookmarkIcon className="forum-action-icon" filled={!!post.isSaved} />
            <span>{post.isSaved ? 'Đã lưu' : 'Lưu'}</span>
          </button>
        )}
      </div>

      {/* Comments Section */}
      {isCommentsExpanded && (
        <div className="forum-post-comments">
          {/* Comment Input */}
          {userInfo && (
            <div className="forum-comment-input-wrapper">
              <input
                type="text"
                className="forum-comment-input"
                placeholder="Viết bình luận..."
                value={commentInputs[post.PostId] || ''}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [post.PostId]: e.target.value,
                  }))
                }
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    onComment(post.PostId)
                  }
                }}
              />
              <button
                className="forum-comment-submit-btn"
                onClick={() => onComment(post.PostId || '')}
                disabled={!commentInputs[post.PostId || '']?.trim() || submittingComment === post.PostId}
                aria-label="Gửi bình luận"
              >
                {submittingComment === post.PostId ? (
                  <>
                    <span className="forum-comment-submit-spinner"></span>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi'
                )}
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="forum-comments-list">
            {post.Comments && post.Comments.length > 0 ? (
              post.Comments.map((comment) => (
                <div key={comment.PostCommentId} className="forum-comment-item">
                  <div className="forum-comment-avatar">
                    {comment.FullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="forum-comment-content">
                    <div className="forum-comment-header">
                      <span className="forum-comment-author">{comment.FullName}</span>
                      {comment.CreatedDate && (
                        <span className="forum-comment-date">
                          {formatDate(comment.CreatedDate)}
                        </span>
                      )}
                    </div>
                    <p className="forum-comment-text">{comment.Content}</p>
                    {comment.Images && comment.Images.length > 0 && (
                      <div className="forum-comment-images">
                        {comment.Images.map((img, idx) => (
                          <LazyImage
                            key={idx}
                            src={img}
                            alt={`Comment image ${idx + 1}`}
                            className="forum-comment-image"
                            fallbackSrc="/img/banahills.jpg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="forum-no-comments">Chưa có bình luận nào</p>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export default ForumPage

