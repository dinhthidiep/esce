import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Box from '@mui/material/Box'
import {
  Typography,
  Avatar,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Alert,
  InputAdornment,
  ButtonGroup
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import SendIcon from '@mui/icons-material/Send'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CommentIcon from '@mui/icons-material/Comment'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import {
  getAllPosts,
  createPost as createPostApi,
  likePost as likePostApi,
  unlikePost as unlikePostApi
} from '../../../../api/instances/PostApi'

type ReactionType = 'like' | 'dislike' | 'haha' | 'sad' | 'angry' | null

type Comment = {
  id: number
  author: {
    name: string
    avatar: string
  }
  content: string
  createdAt: string
  isLocked?: boolean
}

type ReactionUser = {
  id: number
  name: string
  avatar: string
  reaction: ReactionType
  postReactionId?: number
}

type PostAuthor = {
  id: number
  name: string
  avatar: string
  role: string
}

type PostFeedItem = {
  id: number
  author: PostAuthor
  content: string
  images: string[]
  likes: number
  comments: number
  shares: number
  createdAt: string
  isLiked: boolean
  reaction: ReactionType
  isLocked: boolean
  status?: string
  currentUserReactionId?: number
}

type PostLikeApiResponse = {
  PostLikeId: string
  AccountId: string
  FullName: string
  CreatedDate?: string
  ReactionType?: string | null
}

type PostCommentApiResponse = {
  PostCommentId: string
  FullName: string
  Content: string
  Images?: string[]
  CreatedDate?: string
}

type PostApiResponse = {
  PostId: string
  PostContent: string
  Images: string[]
  PosterId: string
  PosterRole: string
  PosterName: string
  Status: string
  RejectComment: string
  PosterApproverId: string
  PosterApproverName: string
  PublicDate: string
  ArticleTitle: string
  Likes?: PostLikeApiResponse[]
  Comments?: PostCommentApiResponse[]
  Hashtags?: string[]
}

type PagedPostsApiResponse = {
  items?: PostApiResponse[]
  Items?: PostApiResponse[]
  totalItems?: number
  TotalItems?: number
  pageNumber?: number
  PageNumber?: number
  pageSize?: number
  PageSize?: number
  totalPages?: number
  TotalPages?: number
}

const POSTS_PAGE_SIZE = 10

const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return 'Đang cập nhật'
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString('vi-VN')
  }

  return value
}

const convertToNumber = (value: string | number | undefined, fallback: number) => {
  if (value === undefined || value === null) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

const restoreImageSource = (value: string) => {
  if (!value) {
    return value
  }

  if (value.startsWith('data:') && value.includes('base64|')) {
    return value.replace('base64|', 'base64,')
  }

  return value
}

const normalizeReactionType = (value?: string | null): ReactionType => {
  if (!value) {
    return 'like'
  }

  const lower = value.toLowerCase()
  const reactionMap: Record<string, ReactionType> = {
    like: 'like',
    dislike: 'dislike',
    haha: 'haha',
    sad: 'sad',
    angry: 'angry'
  }

  return reactionMap[lower] ?? 'like'
}

const buildCommentsFromApi = (apiComments: PostCommentApiResponse[] = []): Comment[] => {
  return apiComments.map((comment, index) => ({
    id: convertToNumber(comment.PostCommentId, Date.now() + index),
    author: {
      name: comment.FullName || 'Ẩn danh',
      avatar: ''
    },
    content: comment.Content || '',
    createdAt: comment.CreatedDate ? formatDisplayDate(comment.CreatedDate) : 'Vừa xong',
    isLocked: false
  }))
}

const buildReactionsFromApi = (likes: PostLikeApiResponse[] = []): ReactionUser[] => {
  return likes.map((like, index) => ({
    id: convertToNumber(like.AccountId, Date.now() + index),
    name: like.FullName || 'Người dùng',
    avatar: '',
    reaction: normalizeReactionType(like.ReactionType),
    postReactionId: convertToNumber(like.PostLikeId, Date.now() + index)
  }))
}

const normalizePostFromApi = (apiPost: PostApiResponse, currentUserId: string | number) => {
  const numericId = convertToNumber(apiPost.PostId, Date.now())
  const likes = apiPost.Likes ?? []
  const comments = apiPost.Comments ?? []
  const reactions = buildReactionsFromApi(likes)
  const mappedComments = buildCommentsFromApi(comments)
  const currentUserIdStr = currentUserId?.toString?.() ?? ''
  const currentUserLike = likes.find((like) => like.AccountId === currentUserIdStr)
  const currentUserReactionId = currentUserLike
    ? convertToNumber(currentUserLike.PostLikeId, Date.now())
    : undefined
  const currentUserReactionType = currentUserLike
    ? normalizeReactionType(currentUserLike.ReactionType)
    : null
  const isLiked = Boolean(currentUserLike)
  const lockedStatuses = ['Locked', 'Rejected']
  const images = (apiPost.Images || [])
    .filter((image) => !!image?.trim())
    .map((image) => restoreImageSource(image.trim()))

  const post: PostFeedItem = {
    id: numericId,
    author: {
      id: convertToNumber(apiPost.PosterId, 0),
      name: apiPost.PosterName || 'Ẩn danh',
      avatar: '',
      role: apiPost.PosterRole || 'User'
    },
    content: apiPost.PostContent || '',
    images,
    likes: likes.length,
    comments: comments.length,
    shares: 0,
    createdAt: formatDisplayDate(apiPost.PublicDate),
    isLiked,
    reaction: currentUserReactionType,
    isLocked: apiPost.Status ? lockedStatuses.includes(apiPost.Status) : false,
    status: apiPost.Status,
    currentUserReactionId
  }

  return {
    post,
    comments: mappedComments,
    reactions
  }
}


const getRoleLabel = (role: string) => {
  switch (role) {
    case 'Travel agency':
      return 'Travel Agency'
    case 'Host':
      return 'Host'
    case 'Tourist':
      return 'Tourist'
    default:
      return role
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Travel agency':
      return 'primary'
    case 'Host':
      return 'secondary'
    default:
      return 'default'
  }
}

export default function MainPostsContent() {
  // Lấy thông tin user từ localStorage
  const getUserInfo = () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        return JSON.parse(userInfoStr)
      }
    } catch (error) {
      console.error('Error parsing userInfo:', error)
    }
    // Fallback nếu không có userInfo trong localStorage
    return {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      role: 'Admin' // Mock role cho testing
    }
  }

  const userInfo = getUserInfo()
  const currentUser = {
    id: userInfo.id || 1,
    name: userInfo.name || userInfo.fullName || 'Nguyễn Văn A',
    email: userInfo.email || 'nguyenvana@example.com',
    role: userInfo.role || userInfo.roleName || 'Admin'
  }

  const [posts, setPosts] = useState<PostFeedItem[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null)
  const [openedCommentsPostId, setOpenedCommentsPostId] = useState<number | null>(null)
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<number, string>>({})
  const [reactionsDialogOpen, setReactionsDialogOpen] = useState(false)
  const [selectedPostIdForReactions, setSelectedPostIdForReactions] = useState<number | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({})
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [selectedPostIdForLock, setSelectedPostIdForLock] = useState<number | null>(null)
  const [lockReason, setLockReason] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPostIdForDelete, setSelectedPostIdForDelete] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPostIdForEdit, setSelectedPostIdForEdit] = useState<number | null>(null)
  const [editPostContent, setEditPostContent] = useState('')
  const [editPostImages, setEditPostImages] = useState<string[]>([])
  const [editPostNewImagePreviews, setEditPostNewImagePreviews] = useState<string[]>([])
  const [commentMenuAnchor, setCommentMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({})
  const [editCommentDialogOpen, setEditCommentDialogOpen] = useState(false)
  const [selectedCommentForEdit, setSelectedCommentForEdit] = useState<{ postId: number; commentId: number } | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  const [lockCommentDialogOpen, setLockCommentDialogOpen] = useState(false)
  const [selectedCommentForLock, setSelectedCommentForLock] = useState<{ postId: number; commentId: number } | null>(null)
  const [lockCommentReason, setLockCommentReason] = useState('')
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false)
  const [selectedCommentForDelete, setSelectedCommentForDelete] = useState<{ postId: number; commentId: number } | null>(null)
  const [searchText, setSearchText] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [createPostError, setCreatePostError] = useState<string | null>(null)
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const hasFetchedPostsRef = useRef(false)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: POSTS_PAGE_SIZE,
    totalPages: 1,
    totalItems: 0
  })
  const [reactionsByPost, setReactionsByPost] = useState<Record<number, ReactionUser[]>>({})

  const fetchPostsFromApi = useCallback(
    async (pageNumber = 1, append = false) => {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoadingPosts(true)
      }
      setPostsError(null)
      try {
        const response = await getAllPosts({
          pageNumber,
          pageSize: POSTS_PAGE_SIZE
        })
        const pagedResponse = Array.isArray(response)
          ? undefined
          : (response as PagedPostsApiResponse | undefined)
        const apiPosts = Array.isArray(response) 
          ? response 
          : (pagedResponse?.items ?? pagedResponse?.Items ?? [])

        // Chỉ throw error nếu response không phải array và không có items/Items
        if (!Array.isArray(apiPosts)) {
          // Nếu response là object nhưng không có items/Items, vẫn xử lý như mảng rỗng
          console.warn('Response không phải array, sử dụng mảng rỗng:', response)
          if (append) {
            setIsLoadingMore(false)
          } else {
            setIsLoadingPosts(false)
          }
          return
        }

        const normalizedPosts: PostFeedItem[] = []
        const normalizedComments: Record<number, Comment[]> = {}
        const normalizedReactions: Record<number, ReactionUser[]> = {}

        apiPosts.forEach((apiPost: PostApiResponse) => {
          const normalized = normalizePostFromApi(apiPost, currentUser.id)
          normalizedPosts.push(normalized.post)
          normalizedComments[normalized.post.id] = normalized.comments
          normalizedReactions[normalized.post.id] = normalized.reactions
        })

        const derivedTotalPages =
          pagedResponse?.totalPages ?? pagedResponse?.TotalPages ??
          (apiPosts.length < POSTS_PAGE_SIZE ? pageNumber : pageNumber + 1)

        if (append) {
          setPosts((prev) => [...prev, ...normalizedPosts])
          setComments((prev) => ({ ...prev, ...normalizedComments }))
          setReactionsByPost((prev) => ({ ...prev, ...normalizedReactions }))
        } else {
          setPosts(normalizedPosts)
          setComments(normalizedComments)
          setReactionsByPost(normalizedReactions)
          hasFetchedPostsRef.current = true
        }

        setPagination((prev) => ({
          pageNumber,
          pageSize: POSTS_PAGE_SIZE,
          totalPages: derivedTotalPages,
          totalItems: pagedResponse?.totalItems ?? pagedResponse?.TotalItems ?? (append ? prev.totalItems + apiPosts.length : apiPosts.length)
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải bài viết.'
        setPostsError(message)
      } finally {
        if (append) {
          setIsLoadingMore(false)
        } else {
          setIsLoadingPosts(false)
        }
      }
    },
    [currentUser.id]
  )

  useEffect(() => {
    void fetchPostsFromApi()
  }, [fetchPostsFromApi])

  // Filter posts based on search text (by author name) and selected role
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = searchText.trim() === '' || 
        post.author.name.toLowerCase().includes(searchText.toLowerCase().trim())

      const matchesRole = selectedRole === null || post.author.role === selectedRole

      return matchesSearch && matchesRole
    })
  }, [posts, searchText, selectedRole])

  const handleRoleFilter = (role: string | null) => {
    setSelectedRole(role === selectedRole ? null : role)
  }

  const hasMorePosts = pagination.pageNumber < pagination.totalPages

  const handleLoadMorePosts = () => {
    if (!hasMorePosts || isLoadingMore) {
      return
    }

    const nextPage = pagination.pageNumber + 1
    void fetchPostsFromApi(nextPage, true)
  }

  // Kiểm tra xem người dùng hiện tại có phải là tác giả của bài viết không
  const isPostAuthor = (post: PostFeedItem) => {
    return post.author.name === currentUser.name
  }

  // Kiểm tra xem người dùng hiện tại có phải là Admin không
  const isAdmin = () => {
    return currentUser.role === 'Admin' || currentUser.role === 'admin'
  }

  // Kiểm tra xem người dùng hiện tại có phải là tác giả của bình luận không
  const isCommentAuthor = (comment: Comment) => {
    return comment.author.name === currentUser.name || comment.author.name === 'Bạn'
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectedImages((prev) => [...prev, ...fileArray])
      
      // Create previews
      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...previews])

      if (createPostError) {
        setCreatePostError(null)
      }
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const getReactionEmoji = (reaction: ReactionType) => {
    switch (reaction) {
      case 'like':
        return '👍'
      case 'dislike':
        return '👎'
      case 'haha':
        return '😂'
      case 'sad':
        return '😢'
      case 'angry':
        return '😠'
      default:
        return null
    }
  }

  const getReactionLabel = (reaction: ReactionType) => {
    switch (reaction) {
      case 'like':
        return 'Thích'
      case 'dislike':
        return 'Không thích'
      case 'haha':
        return 'Haha'
      case 'sad':
        return 'Buồn'
      case 'angry':
        return 'Phẫn nộ'
      default:
        return 'Thích'
    }
  }

  const handleReaction = async (postId: number, reactionType: ReactionType) => {
    const targetPost = posts.find((post) => post.id === postId)
    if (!targetPost) {
      return
    }

    const currentUserIdNumber = convertToNumber(currentUser.id, Date.now())

    try {
      setPostsError(null)

      if (!targetPost.isLiked) {
        const response = await likePostApi(postId)
        const reaction = response?.reaction
        const reactionId = convertToNumber(reaction?.PostLikeId, Date.now())
        const normalizedType = normalizeReactionType(reaction?.ReactionType || reactionType)

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: post.likes + 1,
                  isLiked: true,
                  reaction: normalizedType,
                  currentUserReactionId: reactionId
                }
              : post
          )
        )

        setReactionsByPost((prev) => {
          const existing = prev[postId] || []
          const filtered = existing.filter((user) => user.id !== currentUserIdNumber)
          const updatedList: ReactionUser[] = [
            ...filtered,
            {
              id: currentUserIdNumber,
              name: currentUser.name,
              avatar: '',
              reaction: normalizedType,
              postReactionId: reactionId
            }
          ]

          return { ...prev, [postId]: updatedList }
        })
      } else {
        const reactionIdToRemove =
          targetPost.currentUserReactionId ??
          reactionsByPost[postId]?.find((user) => user.id === currentUserIdNumber)?.postReactionId

        if (!reactionIdToRemove) {
          throw new Error('Không tìm thấy lượt thích để hủy.')
        }

        await unlikePostApi(reactionIdToRemove)

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: Math.max(post.likes - 1, 0),
                  isLiked: false,
                  reaction: null,
                  currentUserReactionId: undefined
                }
              : post
          )
        )

        setReactionsByPost((prev) => {
          const existing = prev[postId] || []
          return {
            ...prev,
            [postId]: existing.filter((user) => user.id !== currentUserIdNumber)
          }
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật cảm xúc.'
      setPostsError(message)
    }
  }

  const handleToggleComments = (postId: number) => {
    setOpenedCommentsPostId(openedCommentsPostId === postId ? null : postId)
  }

  const handleSubmitComment = (postId: number) => {
    const commentText = newComment[postId]?.trim()
    if (!commentText) return

    const newCommentObj: Comment = {
      id: Date.now(),
      author: { name: 'Bạn', avatar: '' },
      content: commentText,
      createdAt: 'Vừa xong',
      isLocked: false
    }

    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj]
    }))

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    )

    setNewComment((prev) => ({ ...prev, [postId]: '' }))
  }

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        if (!result) {
          reject(new Error('Không thể đọc hình ảnh.'))
          return
        }

        const sanitized = result.replace('base64,', 'base64|')
        resolve(sanitized)
      }
      reader.onerror = () => reject(new Error('Không thể đọc hình ảnh.'))
      reader.readAsDataURL(file)
    })

  const handleSubmitPost = async () => {
    const trimmedContent = newPostContent.trim()
    if (!trimmedContent && selectedImages.length === 0) {
      setCreatePostError('Bài viết phải có nội dung hoặc ít nhất một hình ảnh.')
      return
    }

    setCreatePostError(null)

    try {
      setIsSubmittingPost(true)
      const imagesPayload =
        selectedImages.length > 0
          ? await Promise.all(selectedImages.map((file) => fileToBase64(file)))
          : []

      await createPostApi({
        PostContent: trimmedContent,
        Images: imagesPayload,
        PosterName: currentUser.name,
        Hashtags: [],
        ArticleTitle: null
      })

      setNewPostContent('')
      setSelectedImages([])
      setImagePreviews((prev) => {
        prev.forEach((preview) => URL.revokeObjectURL(preview))
        return []
      })

      await fetchPostsFromApi()
    } catch (error) {
      setCreatePostError(
        error instanceof Error ? error.message : 'Không thể đăng bài viết.'
      )
    } finally {
      setIsSubmittingPost(false)
    }
  }

  const handleOpenReactionsDialog = (postId: number) => {
    setSelectedPostIdForReactions(postId)
    setReactionsDialogOpen(true)
  }

  const handleCloseReactionsDialog = () => {
    setReactionsDialogOpen(false)
    setSelectedPostIdForReactions(null)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: number) => {
    setMenuAnchor((prev) => ({ ...prev, [postId]: event.currentTarget }))
  }

  const handleMenuClose = (postId: number) => {
    setMenuAnchor((prev) => ({ ...prev, [postId]: null }))
  }

  const handleOpenLockDialog = (postId: number) => {
    setSelectedPostIdForLock(postId)
    setLockDialogOpen(true)
    handleMenuClose(postId)
  }

  const handleCloseLockDialog = () => {
    setLockDialogOpen(false)
    setSelectedPostIdForLock(null)
    setLockReason('')
  }

  const handleLockPost = () => {
    if (!selectedPostIdForLock || !lockReason.trim()) {
      return
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === selectedPostIdForLock
          ? { ...post, isLocked: true }
          : post
      )
    )

    // TODO: Gửi API request để khóa bài viết và gửi tin nhắn cho chủ bài viết
    console.log(`Khóa bài viết ${selectedPostIdForLock} với lý do: ${lockReason}`)
    
    handleCloseLockDialog()
  }

  const handleUnlockPost = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, isLocked: false }
          : post
      )
    )

    // TODO: Gửi API request để mở khóa bài viết
    console.log(`Mở khóa bài viết ${postId}`)
    
    handleMenuClose(postId)
  }

  const handleOpenDeleteDialog = (postId: number) => {
    setSelectedPostIdForDelete(postId)
    setDeleteDialogOpen(true)
    handleMenuClose(postId)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedPostIdForDelete(null)
  }

  const handleDeletePost = () => {
    if (!selectedPostIdForDelete) {
      return
    }

    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== selectedPostIdForDelete))
    setComments((prev) => {
      const newComments = { ...prev }
      delete newComments[selectedPostIdForDelete]
      return newComments
    })

    // TODO: Gửi API request để xóa bài viết
    console.log(`Xóa bài viết ${selectedPostIdForDelete}`)
    
    handleCloseDeleteDialog()
  }

  const handleOpenEditDialog = (postId: number) => {
    const post = posts.find((p) => p.id === postId)
    if (post) {
      setSelectedPostIdForEdit(postId)
      setEditPostContent(post.content)
      setEditPostImages([...post.images])
      setEditPostNewImagePreviews([])
      setEditDialogOpen(true)
      handleMenuClose(postId)
    }
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setSelectedPostIdForEdit(null)
    setEditPostContent('')
    setEditPostImages([])
    setEditPostNewImagePreviews([])
  }

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      
      // Create previews
      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setEditPostNewImagePreviews((prev) => [...prev, ...previews])
    }
  }

  const removeEditImage = (index: number, isNew: boolean) => {
    if (isNew) {
      setEditPostNewImagePreviews((prev) => {
        URL.revokeObjectURL(prev[index])
        return prev.filter((_, i) => i !== index)
      })
    } else {
      setEditPostImages((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSaveEditPost = () => {
    if (!selectedPostIdForEdit) {
      return
    }

    // Combine existing images with new image previews
    const allImages = [...editPostImages, ...editPostNewImagePreviews]

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === selectedPostIdForEdit
          ? {
              ...post,
              content: editPostContent,
              images: allImages
            }
          : post
      )
    )

    // TODO: Gửi API request để cập nhật bài viết
    console.log(`Chỉnh sửa bài viết ${selectedPostIdForEdit}`)
    
    handleCloseEditDialog()
  }

  // Handler functions cho bình luận
  const handleCommentMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: number, commentId: number) => {
    const key = `${postId}-${commentId}`
    setCommentMenuAnchor((prev) => ({ ...prev, [key]: event.currentTarget }))
  }

  const handleCommentMenuClose = (postId: number, commentId: number) => {
    const key = `${postId}-${commentId}`
    setCommentMenuAnchor((prev) => ({ ...prev, [key]: null }))
  }

  const handleOpenEditCommentDialog = (postId: number, commentId: number) => {
    const comment = comments[postId]?.find((c) => c.id === commentId)
    if (comment) {
      setSelectedCommentForEdit({ postId, commentId })
      setEditCommentContent(comment.content)
      setEditCommentDialogOpen(true)
      handleCommentMenuClose(postId, commentId)
    }
  }

  const handleCloseEditCommentDialog = () => {
    setEditCommentDialogOpen(false)
    setSelectedCommentForEdit(null)
    setEditCommentContent('')
  }

  const handleSaveEditComment = () => {
    if (!selectedCommentForEdit || !editCommentContent.trim()) {
      return
    }

    setComments((prev) => ({
      ...prev,
      [selectedCommentForEdit.postId]: (prev[selectedCommentForEdit.postId] || []).map((comment) =>
        comment.id === selectedCommentForEdit.commentId
          ? { ...comment, content: editCommentContent }
          : comment
      )
    }))

    // TODO: Gửi API request để cập nhật bình luận
    console.log(`Chỉnh sửa bình luận ${selectedCommentForEdit.commentId} trong bài viết ${selectedCommentForEdit.postId}`)
    
    handleCloseEditCommentDialog()
  }

  const handleOpenLockCommentDialog = (postId: number, commentId: number) => {
    setSelectedCommentForLock({ postId, commentId })
    setLockCommentDialogOpen(true)
    handleCommentMenuClose(postId, commentId)
  }

  const handleCloseLockCommentDialog = () => {
    setLockCommentDialogOpen(false)
    setSelectedCommentForLock(null)
    setLockCommentReason('')
  }

  const handleLockComment = () => {
    if (!selectedCommentForLock || !lockCommentReason.trim()) {
      return
    }

    setComments((prev) => ({
      ...prev,
      [selectedCommentForLock.postId]: (prev[selectedCommentForLock.postId] || []).map((comment) =>
        comment.id === selectedCommentForLock.commentId
          ? { ...comment, isLocked: true }
          : comment
      )
    }))

    // TODO: Gửi API request để khóa bình luận và gửi tin nhắn cho chủ bình luận
    console.log(`Khóa bình luận ${selectedCommentForLock.commentId} với lý do: ${lockCommentReason}`)
    
    handleCloseLockCommentDialog()
  }

  const handleUnlockComment = (postId: number, commentId: number) => {
    setComments((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).map((comment) =>
        comment.id === commentId
          ? { ...comment, isLocked: false }
          : comment
      )
    }))

    // TODO: Gửi API request để mở khóa bình luận
    console.log(`Mở khóa bình luận ${commentId} trong bài viết ${postId}`)
    
    handleCommentMenuClose(postId, commentId)
  }

  const handleOpenDeleteCommentDialog = (postId: number, commentId: number) => {
    setSelectedCommentForDelete({ postId, commentId })
    setDeleteCommentDialogOpen(true)
    handleCommentMenuClose(postId, commentId)
  }

  const handleCloseDeleteCommentDialog = () => {
    setDeleteCommentDialogOpen(false)
    setSelectedCommentForDelete(null)
  }

  const handleDeleteComment = () => {
    if (!selectedCommentForDelete) {
      return
    }

    setComments((prev) => ({
      ...prev,
      [selectedCommentForDelete.postId]: (prev[selectedCommentForDelete.postId] || []).filter(
        (comment) => comment.id !== selectedCommentForDelete.commentId
      )
    }))

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === selectedCommentForDelete.postId
          ? { ...post, comments: Math.max(0, post.comments - 1) }
          : post
      )
    )

    // TODO: Gửi API request để xóa bình luận
    console.log(`Xóa bình luận ${selectedCommentForDelete.commentId} trong bài viết ${selectedCommentForDelete.postId}`)
    
    handleCloseDeleteCommentDialog()
  }

  return (
    <Box className="flex flex-col gap-[2.4rem]">
      {/* Form đăng bài viết */}
      <Box
        sx={{
          bgcolor: 'common.white'
        }}
        className="p-[2.4rem]! rounded-3xl shadow-3xl"
      >
        <Typography
          sx={{
            background: (theme) => theme.customBackgroundColor.main,
            backgroundClip: 'text',
            color: 'transparent'
          }}
          className="text-[1.6rem]! mb-[1.6rem]! font-semibold!"
        >
          Tạo bài viết mới
        </Typography>

        <Box className="flex gap-[1.2rem] mb-[1.6rem]">
          <Avatar sx={{ width: 48, height: 48 }}>B</Avatar>
          <Box className="flex-1">
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Bạn đang nghĩ gì?"
              value={newPostContent}
              onChange={(e) => {
                setNewPostContent(e.target.value)
                if (createPostError) {
                  setCreatePostError(null)
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '1.2rem',
                  bgcolor: 'grey.50'
                }
              }}
            />
          </Box>
        </Box>

        {createPostError && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '1.2rem',
              fontSize: '1.3rem'
            }}
          >
            {createPostError}
          </Alert>
        )}

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <Box className="mb-[1.6rem]">
            <Box className="grid grid-cols-3 gap-[1.2rem]">
              {imagePreviews.map((preview, index) => (
                <Box
                  key={index}
                  sx={{ position: 'relative', borderRadius: '1.2rem', overflow: 'hidden' }}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                  <IconButton
                    onClick={() => removeImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                    size="small"
                  >
                    ×
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Divider className="mb-[1.6rem]!" />

        <Box className="flex items-center justify-between">
          <label htmlFor="image-upload">
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
            <Button
              component="span"
              startIcon={<ImageIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: '1.2rem',
                px: 2
              }}
            >
              Thêm hình ảnh
            </Button>
          </label>

          <Button
            variant="contained"
            endIcon={!isSubmittingPost ? <SendIcon /> : undefined}
            onClick={handleSubmitPost}
            disabled={isSubmittingPost || (!newPostContent.trim() && selectedImages.length === 0)}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            {isSubmittingPost ? 'Đang đăng...' : 'Đăng bài'}
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <Box
        sx={{
          bgcolor: 'common.white'
        }}
        className="p-[2.4rem]! rounded-3xl shadow-3xl"
      >
        <Typography
          sx={{
            background: (theme) => theme.customBackgroundColor.main,
            backgroundClip: 'text',
            color: 'transparent'
          }}
          className="text-[1.6rem]! mb-[2.4rem]!"
        >
          Tìm kiếm và lọc bài viết
        </Typography>

        <Box className="flex flex-col gap-[1.6rem]">
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder=" người dùng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '1.2rem',
                bgcolor: 'grey.50',
                fontSize: '1.4rem',
                '& fieldset': {
                  borderColor: 'grey.300'
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main'
                }
              },
              '& .MuiInputBase-input': {
                fontSize: '1.4rem',
                py: 1.5
              }
            }}
          />

          {/* Role Filter Buttons */}
          <Box className="flex items-center gap-[1.2rem]">
            <Typography className="text-[1.4rem]! font-medium! text-gray-600">
              Lọc theo chức năng:
            </Typography>
            <ButtonGroup variant="outlined" size="medium">
              <Button
                onClick={() => handleRoleFilter('Travel agency')}
                variant={selectedRole === 'Travel agency' ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: '0.8rem',
                  textTransform: 'none',
                  px: 2
                }}
              >
                Travel Agency
              </Button>
              <Button
                onClick={() => handleRoleFilter('Host')}
                variant={selectedRole === 'Host' ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: '0.8rem',
                  textTransform: 'none',
                  px: 2
                }}
              >
                Host
              </Button>
              <Button
                onClick={() => handleRoleFilter('Tourist')}
                variant={selectedRole === 'Tourist' ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: '0.8rem',
                  textTransform: 'none',
                  px: 2
                }}
              >
                Tourist
              </Button>
            </ButtonGroup>
            {selectedRole && (
              <Button
                onClick={() => setSelectedRole(null)}
                size="small"
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary'
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Feed bài viết */}
      <Box className="flex flex-col gap-[2.4rem]">
        {postsError && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  void fetchPostsFromApi()
                }}
              >
                Thử lại
              </Button>
            }
            sx={{
              borderRadius: '1.2rem'
            }}
          >
            {postsError}
          </Alert>
        )}

        {isLoadingPosts ? (
          <Box
            sx={{
              bgcolor: 'common.white'
            }}
            className="p-[2.4rem]! rounded-3xl shadow-3xl text-center! py-[3.2rem]!"
          >
            <Typography className="text-gray-500 text-[1.4rem]!">
              Đang tải bài viết...
            </Typography>
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Box
            sx={{
              bgcolor: 'common.white'
            }}
            className="p-[2.4rem]! rounded-3xl shadow-3xl text-center! py-[3.2rem]!"
          >
            <Typography className="text-gray-500 text-[1.4rem]!">
              Không tìm thấy bài viết nào
            </Typography>
          </Box>
        ) : (
          <>
            {filteredPosts.map((post) => (
          <Card
            key={post.id}
            sx={{
              borderRadius: '2.4rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              bgcolor: 'common.white'
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ width: 48, height: 48 }}>
                  {post.author.name.charAt(0)}
                </Avatar>
              }
              action={
                <>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, post.id)}
                    aria-label="more options"
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor[post.id]}
                    open={Boolean(menuAnchor[post.id])}
                    onClose={() => handleMenuClose(post.id)}
                    PaperProps={{
                      sx: {
                        borderRadius: '1.2rem',
                        mt: 1,
                        minWidth: 180
                      }
                    }}
                  >
                    {/* Menu cho tác giả: Chỉnh sửa bài viết */}
                    {isPostAuthor(post) && (
                      <MenuItem
                        onClick={() => handleOpenEditDialog(post.id)}
                        sx={{
                          fontSize: '1.4rem',
                          py: 1.5
                        }}
                      >
                        Chỉnh sửa bài viết
                      </MenuItem>
                    )}
                    
                    {/* Menu cho Admin khi là tác giả: Xóa bài viết */}
                    {isAdmin() && isPostAuthor(post) && (
                      <MenuItem
                        onClick={() => handleOpenDeleteDialog(post.id)}
                        sx={{
                          fontSize: '1.4rem',
                          py: 1.5,
                          color: 'error.main'
                        }}
                      >
                        Xóa bài viết
                      </MenuItem>
                    )}
                    
                    {/* Menu cho Admin khi không phải tác giả, hoặc không phải Admin (dù là tác giả hay không): Khóa/Mở khóa */}
                    {(isAdmin() && !isPostAuthor(post)) || !isAdmin() ? (
                      <>
                        {post.isLocked ? (
                          <MenuItem
                            onClick={() => handleUnlockPost(post.id)}
                            sx={{
                              fontSize: '1.4rem',
                              py: 1.5
                            }}
                          >
                            Mở khóa bài viết
                          </MenuItem>
                        ) : (
                          <MenuItem
                            onClick={() => handleOpenLockDialog(post.id)}
                            sx={{
                              fontSize: '1.4rem',
                              py: 1.5,
                              color: 'error.main'
                            }}
                          >
                            Khóa bài viết
                          </MenuItem>
                        )}
                      </>
                    ) : null}
                  </Menu>
                </>
              }
              title={
                <Box className="flex items-center gap-[0.8rem]">
                  <Typography className="font-semibold! text-[1.4rem]!">
                    {post.author.name}
                  </Typography>
                  <Chip
                    label={getRoleLabel(post.author.role)}
                    size="small"
                    color={getRoleColor(post.author.role) as 'primary' | 'secondary' | 'default'}
                    sx={{ height: 20, fontSize: '1rem' }}
                  />
                </Box>
              }
              subheader={
                <Typography className="text-[1.2rem]! text-gray-500">
                  {post.createdAt}
                </Typography>
              }
            />
            <CardContent>
              {/* Hiển thị note nếu bài viết bị khóa */}
              {post.isLocked && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    borderRadius: '1.2rem',
                    fontSize: '1.3rem',
                    '& .MuiAlert-icon': {
                      fontSize: '2rem'
                    }
                  }}
                >
                  Bài viết đang bị khóa
                </Alert>
              )}

              <Typography className="text-[1.4rem]! mb-[1.6rem]! whitespace-pre-wrap">
                {post.content}
              </Typography>

              {/* Images */}
              {post.images.length > 0 && (
                <Box className="mb-[1.6rem]">
                  {post.images.length === 1 ? (
                    <img
                      src={post.images[0]}
                      alt="Post"
                      style={{
                        width: '100%',
                        borderRadius: '1.2rem',
                        maxHeight: '500px',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box className="grid grid-cols-2 gap-[0.8rem]">
                      {post.images.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '200px',
                            borderRadius: '1.2rem',
                            objectFit: 'cover'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <Divider className="mb-[1.2rem]!" />

              {/* Actions */}
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-[2.4rem]">
                  {/* Reaction Button with Menu */}
                  <Box
                    sx={{ 
                      position: 'relative',
                      display: 'inline-block'
                    }}
                    onMouseEnter={() => setHoveredPostId(post.id)}
                    onMouseLeave={() => setHoveredPostId(null)}
                  >
                    <IconButton
                      onClick={() => handleReaction(post.id, post.reaction || 'like')}
                      sx={{
                        color: post.reaction ? 'error.main' : 'inherit',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      <Box className="flex items-center gap-[0.4rem]">
                        {post.reaction ? (
                          <Typography className="text-[1.8rem]!">
                            {getReactionEmoji(post.reaction)}
                          </Typography>
                        ) : (
                          post.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />
                        )}
                        <Typography 
                          className="text-[1.3rem]!"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (post.likes > 0) {
                              handleOpenReactionsDialog(post.id)
                            }
                          }}
                          sx={{
                            cursor: post.likes > 0 ? 'pointer' : 'default',
                            '&:hover': post.likes > 0 ? {
                              textDecoration: 'underline',
                              color: 'primary.main'
                            } : {}
                          }}
                        >
                          {post.likes}
                        </Typography>
                      </Box>
                    </IconButton>

                    {/* Reaction Menu */}
                    {hoveredPostId === post.id && (
                      <Box
                        onMouseEnter={() => setHoveredPostId(post.id)}
                        onMouseLeave={() => setHoveredPostId(null)}
                        sx={{
                          position: 'absolute',
                          bottom: 'calc(100% + 0.2rem)',
                          left: 0,
                          bgcolor: 'common.white',
                          borderRadius: '2.4rem',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          p: 1,
                          pb: 1.5, // Thêm padding bottom để tạo vùng đệm
                          display: 'flex',
                          gap: 0.5,
                          zIndex: 1000,
                          opacity: 1,
                          transform: 'translateY(0)',
                          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                          pointerEvents: 'auto',
                          // Tạo vùng đệm vô hình phía dưới menu
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-0.6rem',
                            left: '-0.5rem',
                            right: '-0.5rem',
                            height: '0.6rem',
                            bgcolor: 'transparent'
                          }
                        }}
                      >
                        {(['like', 'dislike', 'haha', 'sad', 'angry'] as ReactionType[]).map(
                          (reaction) => (
                            <IconButton
                              key={reaction}
                              onClick={() => handleReaction(post.id, reaction)}
                              sx={{
                                p: 1,
                                '&:hover': {
                                  transform: 'scale(1.2)',
                                  transition: 'transform 0.2s'
                                },
                                transition: 'transform 0.2s'
                              }}
                              title={getReactionLabel(reaction)}
                            >
                              <Typography
                                sx={{
                                  fontSize: '2.4rem',
                                  cursor: 'pointer',
                                  filter: post.reaction === reaction ? 'none' : 'grayscale(0.3)',
                                  '&:hover': {
                                    filter: 'none',
                                    transform: 'scale(1.2)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                {getReactionEmoji(reaction)}
                              </Typography>
                            </IconButton>
                          )
                        )}
                      </Box>
                    )}
                  </Box>

                  <IconButton 
                    onClick={() => handleToggleComments(post.id)}
                    sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <CommentIcon />
                    <Typography className="ml-[0.8rem]! text-[1.3rem]!">
                      {comments[post.id]?.length || 0}
                    </Typography>
                  </IconButton>
                </Box>
              </Box>

              {/* Comments Section */}
              {openedCommentsPostId === post.id && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  {/* Comments List */}
                  {comments[post.id] && comments[post.id].length > 0 && (
                    <Box className="mb-[1.6rem] max-h-[400px] overflow-y-auto">
                      {comments[post.id].map((comment) => {
                        const commentKey = `${post.id}-${comment.id}`
                        return (
                          <Box key={comment.id} className="mb-[1.2rem] flex gap-[1.2rem]">
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {comment.author.name.charAt(0)}
                            </Avatar>
                            <Box className="flex-1">
                              <Box
                                sx={{
                                  bgcolor: 'grey.100',
                                  borderRadius: '1.2rem',
                                  p: 1.5,
                                  mb: 0.5,
                                  position: 'relative'
                                }}
                              >
                                <Box className="flex items-center justify-between mb-[0.4rem]">
                                  <Typography className="font-semibold! text-[1.2rem]!">
                                    {comment.author.name}
                                  </Typography>
                                  {isCommentAuthor(comment) && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleCommentMenuOpen(e, post.id, comment.id)}
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                                      }}
                                    >
                                      <MoreVertIcon sx={{ fontSize: '1.6rem' }} />
                                    </IconButton>
                                  )}
                                </Box>
                                
                                {comment.isLocked && (
                                  <Alert
                                    severity="warning"
                                    sx={{
                                      mb: 1,
                                      borderRadius: '0.8rem',
                                      fontSize: '1.1rem',
                                      py: 0.5,
                                      '& .MuiAlert-icon': {
                                        fontSize: '1.6rem'
                                      }
                                    }}
                                  >
                                    Bình luận đang bị khóa
                                  </Alert>
                                )}
                                
                                <Typography className="text-[1.3rem]!">
                                  {comment.content}
                                </Typography>
                              </Box>
                              <Typography className="text-[1.1rem]! text-gray-500">
                                {comment.createdAt}
                              </Typography>
                              
                              {/* Menu cho bình luận */}
                              {isCommentAuthor(comment) && (
                                <Menu
                                  anchorEl={commentMenuAnchor[commentKey]}
                                  open={Boolean(commentMenuAnchor[commentKey])}
                                  onClose={() => handleCommentMenuClose(post.id, comment.id)}
                                  PaperProps={{
                                    sx: {
                                      borderRadius: '1.2rem',
                                      mt: 1,
                                      minWidth: 180
                                    }
                                  }}
                                >
                                  <MenuItem
                                    onClick={() => handleOpenEditCommentDialog(post.id, comment.id)}
                                    sx={{
                                      fontSize: '1.4rem',
                                      py: 1.5
                                    }}
                                  >
                                    Chỉnh sửa bình luận
                                  </MenuItem>
                                  {comment.isLocked ? (
                                    <MenuItem
                                      onClick={() => handleUnlockComment(post.id, comment.id)}
                                      sx={{
                                        fontSize: '1.4rem',
                                        py: 1.5
                                      }}
                                    >
                                      Mở khóa bình luận
                                    </MenuItem>
                                  ) : (
                                    <MenuItem
                                      onClick={() => handleOpenLockCommentDialog(post.id, comment.id)}
                                      sx={{
                                        fontSize: '1.4rem',
                                        py: 1.5,
                                        color: 'error.main'
                                      }}
                                    >
                                      Khóa bình luận
                                    </MenuItem>
                                  )}
                                  <MenuItem
                                    onClick={() => handleOpenDeleteCommentDialog(post.id, comment.id)}
                                    sx={{
                                      fontSize: '1.4rem',
                                      py: 1.5,
                                      color: 'error.main'
                                    }}
                                  >
                                    Xóa bình luận
                                  </MenuItem>
                                </Menu>
                              )}
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  )}

                  {/* Comment Input */}
                  <Box className="flex gap-[1.2rem]">
                    <Avatar sx={{ width: 32, height: 32 }}>B</Avatar>
                    <Box className="flex-1">
                      <TextField
                        fullWidth
                        placeholder="Viết bình luận..."
                        value={newComment[post.id] || ''}
                        onChange={(e) =>
                          setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmitComment(post.id)
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '1.2rem',
                            bgcolor: 'grey.50',
                            fontSize: '1.3rem'
                          }
                        }}
                        multiline
                        maxRows={4}
                      />
                    </Box>
                    <IconButton
                      onClick={() => handleSubmitComment(post.id)}
                      disabled={!newComment[post.id]?.trim()}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&.Mui-disabled': {
                          bgcolor: 'grey.300',
                          color: 'grey.500'
                        }
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
            ))}

            {hasMorePosts && (
              <Box className="text-center mt-[1.6rem]">
                <Button
                  variant="outlined"
                  onClick={handleLoadMorePosts}
                  disabled={isLoadingMore}
                  sx={{
                    borderRadius: '999px',
                    px: '2.4rem',
                    py: '0.8rem',
                    textTransform: 'none',
                    fontSize: '1.4rem'
                  }}
                >
                  {isLoadingMore ? 'Đang tải thêm...' : 'Tải thêm bài viết'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Dialog hiển thị danh sách người thả cảm xúc */}
      <Dialog
        open={reactionsDialogOpen}
        onClose={handleCloseReactionsDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.8rem',
            fontWeight: 600,
            pb: 1
          }}
        >
          Người đã thả cảm xúc
        </DialogTitle>
        <DialogContent dividers>
          {selectedPostIdForReactions && reactionsByPost[selectedPostIdForReactions] ? (
            <List sx={{ pt: 0 }}>
              {reactionsByPost[selectedPostIdForReactions].map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    px: 0,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderRadius: '1.2rem'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box className="flex items-center gap-[0.8rem]">
                        <Typography className="font-semibold! text-[1.4rem]!">
                          {user.name}
                        </Typography>
                        <Typography className="text-[2rem]!">
                          {getReactionEmoji(user.reaction)}
                        </Typography>
                        <Typography 
                          className="text-[1.2rem]! text-gray-500"
                          sx={{ ml: 'auto' }}
                        >
                          {getReactionLabel(user.reaction)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography className="text-center! text-[1.4rem]! text-gray-500 py-[2rem]!">
              Chưa có ai thả cảm xúc
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog nhập lý do khóa bài viết */}
      <Dialog
        open={lockDialogOpen}
        onClose={handleCloseLockDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.8rem',
            fontWeight: 600,
            pb: 1
          }}
        >
          Khóa bài viết
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: '1.4rem',
              mb: 2,
              color: 'text.primary'
            }}
          >
            Vui lòng nhập lý do khóa bài viết này. Lý do này sẽ được gửi tới chủ của bài viết.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập lý do khóa bài viết..."
            value={lockReason}
            onChange={(e) => setLockReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '1.2rem',
                fontSize: '1.4rem'
              }
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1
          }}
        >
          <Button
            onClick={handleCloseLockDialog}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 2
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleLockPost}
            variant="contained"
            disabled={!lockReason.trim()}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Khóa bài viết
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa bài viết */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.8rem',
            fontWeight: 600,
            pb: 1
          }}
        >
          Xóa bài viết
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: '1.4rem',
              color: 'text.primary'
            }}
          >
            Bạn chắc chắn muốn Xóa?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1
          }}
        >
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 2
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeletePost}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa bài viết */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.8rem',
            fontWeight: 600,
            pb: 1
          }}
        >
          Chỉnh sửa bài viết
        </DialogTitle>
        <DialogContent>
          <Box className="flex flex-col gap-[1.6rem]">
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Bạn đang nghĩ gì?"
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '1.2rem',
                  bgcolor: 'grey.50',
                  fontSize: '1.4rem'
                }
              }}
            />

            {/* Hiển thị hình ảnh hiện có */}
            {editPostImages.length > 0 && (
              <Box>
                <Typography className="text-[1.4rem]! font-semibold! mb-[1.2rem]!">
                  Hình ảnh hiện có
                </Typography>
                <Box className="grid grid-cols-3 gap-[1.2rem]">
                  {editPostImages.map((image, index) => (
                    <Box
                      key={`existing-${index}`}
                      sx={{ position: 'relative', borderRadius: '1.2rem', overflow: 'hidden' }}
                    >
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        onClick={() => removeEditImage(index, false)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                        size="small"
                      >
                        ×
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Hiển thị hình ảnh mới */}
            {editPostNewImagePreviews.length > 0 && (
              <Box>
                <Typography className="text-[1.4rem]! font-semibold! mb-[1.2rem]!">
                  Hình ảnh mới
                </Typography>
                <Box className="grid grid-cols-3 gap-[1.2rem]">
                  {editPostNewImagePreviews.map((preview, index) => (
                    <Box
                      key={`new-${index}`}
                      sx={{ position: 'relative', borderRadius: '1.2rem', overflow: 'hidden' }}
                    >
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        onClick={() => removeEditImage(index, true)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                        size="small"
                      >
                        ×
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Nút thêm hình ảnh */}
            <label htmlFor="edit-image-upload">
              <input
                id="edit-image-upload"
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleEditImageSelect}
              />
              <Button
                component="span"
                startIcon={<ImageIcon />}
                sx={{
                  textTransform: 'none',
                  borderRadius: '1.2rem',
                  px: 2,
                  fontSize: '1.4rem'
                }}
              >
                Thêm hình ảnh
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1
          }}
        >
          <Button
            onClick={handleCloseEditDialog}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 2
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveEditPost}
            variant="contained"
            disabled={!editPostContent.trim() && editPostImages.length === 0 && editPostNewImagePreviews.length === 0}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa bình luận */}
      <Dialog
        open={editCommentDialogOpen}
        onClose={handleCloseEditCommentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.8rem',
            fontWeight: 600,
            pb: 1
          }}
        >
          Chỉnh sửa bình luận
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập nội dung bình luận..."
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '1.2rem',
                bgcolor: 'grey.50',
                fontSize: '1.4rem'
              }
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1
          }}
        >
          <Button
            onClick={handleCloseEditCommentDialog}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 2
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveEditComment}
            variant="contained"
            disabled={!editCommentContent.trim()}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog nhập lý do khóa bình luận */}
      <Dialog
        open={lockCommentDialogOpen}
        onClose={handleCloseLockCommentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.8rem',
            fontWeight: 600,
            pb: 1
          }}
        >
          Khóa bình luận
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: '1.4rem',
              mb: 2,
              color: 'text.primary'
            }}
          >
            Vui lòng nhập lý do khóa bình luận này. Lý do này sẽ được gửi tới chủ của bình luận.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập lý do khóa bình luận..."
            value={lockCommentReason}
            onChange={(e) => setLockCommentReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '1.2rem',
                fontSize: '1.4rem'
              }
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1
          }}
        >
          <Button
            onClick={handleCloseLockCommentDialog}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 2
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleLockComment}
            variant="contained"
            disabled={!lockCommentReason.trim()}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Khóa bình luận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa bình luận */}
      <Dialog
        open={deleteCommentDialogOpen}
        onClose={handleCloseDeleteCommentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.8rem',
            fontWeight: 600,
            pb: 1
          }}
        >
          Xóa bình luận
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: '1.4rem',
              color: 'text.primary'
            }}
          >
            Bạn chắc chắn muốn xóa bình luận này?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1
          }}
        >
          <Button
            onClick={handleCloseDeleteCommentDialog}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 2
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteComment}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

