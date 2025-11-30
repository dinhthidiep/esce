import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
  ImageList,
  ImageListItem,
  DialogContentText,
  Select,
  FormControl,
  InputLabel,
  Snackbar
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Send as SendIcon
} from '@mui/icons-material'
import {
  fetchAllPosts,
  createPost,
  updatePost,
  deletePost,
  approvePost,
  rejectPost,
  toggleLikePost,
  fetchCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  type PostDto,
  type PostLikeDto,
  type CreatePostDto,
  type UpdatePostDto,
  type PostComment,
  type CreateCommentDto,
  type UpdateCommentDto
} from '~/api/instances/PostsApi'

const getRoleColor = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'primary'
    case 'travel agency':
    case 'agency':
      return 'info'
    case 'host':
      return 'secondary'
    default:
      return 'default'
  }
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'error'
    default:
      return 'default'
  }
}

const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return 'Vừa xong'
  
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
    if (diffDays < 30) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
  } catch {
    return 'Vừa xong'
  }
}

// Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      if (result && result.startsWith('data:image/')) {
        resolve(result)
      } else {
        reject(new Error('Invalid image format'))
      }
    }
    reader.onerror = (error) => {
      console.error('FileReader error:', error)
      reject(error)
    }
  })
}

export default function PostsManagement() {
  const [posts, setPosts] = useState<PostDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '' })
  
  // Likes Dialog State
  const [likesDialogOpen, setLikesDialogOpen] = useState(false)
  const [selectedPostLikes, setSelectedPostLikes] = useState<PostDto['likes']>([])
  const [selectedPostTitle, setSelectedPostTitle] = useState('')
  
  // Create Post State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  // Edit Post State
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<PostDto | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editImages, setEditImages] = useState<string[]>([])
  const [editNewImages, setEditNewImages] = useState<File[]>([])
  const [editNewImagePreviews, setEditNewImagePreviews] = useState<string[]>([])
  const [updating, setUpdating] = useState(false)

  // Delete Post State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPost, setDeletingPost] = useState<PostDto | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Approve/Reject State
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [reviewingPost, setReviewingPost] = useState<PostDto | null>(null)
  const [rejectComment, setRejectComment] = useState('')
  const [reviewing, setReviewing] = useState(false)

  // Menu State
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({})

  // Like State
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set())

  // Comment State
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const [postComments, setPostComments] = useState<{ [postId: number]: PostComment[] }>({})
  const [commentTexts, setCommentTexts] = useState<{ [postId: number]: string }>({})
  const [editingComments, setEditingComments] = useState<{ [commentId: string]: string }>({})
  const [creatingComment, setCreatingComment] = useState<{ [postId: number]: boolean }>({})
  const [updatingComment, setUpdatingComment] = useState<Set<string>>(new Set())
  const [deletingComment, setDeletingComment] = useState<Set<string>>(new Set())

  // Get current user
  const getCurrentUser = () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        return JSON.parse(userInfoStr)
      }
    } catch (error) {
      console.error('Error parsing userInfo:', error)
    }
    return null
  }

  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.roleName === 'Admin' || currentUser?.Role === 'Admin' || currentUser?.roleId === 1
  const isAuthenticated = !!currentUser
  
  // Debug: Log current user info
  useEffect(() => {
    if (currentUser) {
      console.log('Current User Info:', {
        id: currentUser.id,
        Id: currentUser.Id,
        userId: currentUser.userId,
        UserId: currentUser.UserId,
        ID: currentUser.ID,
        allKeys: Object.keys(currentUser)
      })
    }
  }, [currentUser])

  // Load Posts
  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAllPosts()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách bài viết')
      console.error('Error loading posts:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  // Filter Posts - optimized
  const filteredPosts = useMemo(() => {
    if (posts.length === 0) return []
    
    let filtered = posts

    // Filter by status (fast)
    if (statusFilter !== 'All') {
      const statusLower = statusFilter.toLowerCase()
      filtered = filtered.filter(post => {
        const postStatus = post.status?.toLowerCase() ?? ''
        return postStatus === statusLower
      })
    }

    // Filter by search text (fast)
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase()
      filtered = filtered.filter((item) => {
        const title = (item.title ?? '').toLowerCase()
        const content = (item.content ?? '').toLowerCase()
        const author = (item.authorName ?? '').toLowerCase()
        return title.includes(lowerSearch) || content.includes(lowerSearch) || author.includes(lowerSearch)
      })
    }

    return filtered
  }, [posts, searchText, statusFilter])

  // Create Post Handlers
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true)
    setNewTitle('')
    setNewContent('')
    setNewImages([])
    setNewImagePreviews([])
  }

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false)
    setNewTitle('')
    setNewContent('')
    setNewImages([])
    setNewImagePreviews([])
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'))
      
      if (fileArray.length === 0) return
      
      setNewImages((prev) => {
        const existingNames = new Set(prev.map(f => f.name))
        const newFiles = fileArray.filter(f => !existingNames.has(f.name))
        return [...prev, ...newFiles]
      })
      
      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setNewImagePreviews((prev) => [...prev, ...previews])
      e.target.value = ''
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleCreatePost = async () => {
    if (!newTitle.trim() && !newContent.trim() && newImages.length === 0) {
      return
    }

    try {
      setCreating(true)
      
      const imageBase64s: string[] = []
      const processedFiles = new Set<string>()
      
      for (const file of newImages) {
        if (processedFiles.has(file.name)) continue
        
        try {
          const base64 = await fileToBase64(file)
          if (base64 && base64.startsWith('data:image/')) {
            imageBase64s.push(base64)
            processedFiles.add(file.name)
          }
        } catch (fileError) {
          console.error(`Error converting file ${file.name}:`, fileError)
        }
      }

      if (imageBase64s.length === 0 && newImages.length > 0) {
        setError('Không thể xử lý ảnh. Vui lòng thử lại với ảnh khác.')
        setCreating(false)
        return
      }

      const dto: CreatePostDto = {
        title: newTitle.trim(),
        content: newContent.trim(),
        images: imageBase64s.length > 0 ? imageBase64s : undefined
      }

      await createPost(dto)
      await loadPosts()
      handleCloseCreateDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo bài viết')
      console.error('Error creating post:', err)
    } finally {
      setCreating(false)
    }
  }

  // Edit Post Handlers
  const handleOpenEditDialog = (post: PostDto) => {
    setEditingPost(post)
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditImages([...post.images])
    setEditNewImages([])
    setEditNewImagePreviews([])
    setEditDialogOpen(true)
    handleMenuClose(post.postId)
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setEditingPost(null)
    setEditTitle('')
    setEditContent('')
    setEditImages([])
    setEditNewImages([])
    setEditNewImagePreviews([])
  }

  const handleEditImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'))
      setEditNewImages((prev) => [...prev, ...fileArray])
      
      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setEditNewImagePreviews((prev) => [...prev, ...previews])
      e.target.value = ''
    }
  }

  const removeEditImage = (index: number, isNew: boolean) => {
    if (isNew) {
      setEditNewImages((prev) => prev.filter((_, i) => i !== index))
      setEditNewImagePreviews((prev) => {
        URL.revokeObjectURL(prev[index])
        return prev.filter((_, i) => i !== index)
      })
    } else {
      setEditImages((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleUpdatePost = async () => {
    if (!editingPost) return

    try {
      setUpdating(true)
      
      const newImageBase64s: string[] = []
      for (const file of editNewImages) {
        const base64 = await fileToBase64(file)
        newImageBase64s.push(base64)
      }

      const allImages = [...editImages, ...newImageBase64s]

      const dto: UpdatePostDto = {
        title: editTitle.trim() || undefined,
        content: editContent.trim() || undefined,
        images: allImages.length > 0 ? allImages : undefined
      }

      await updatePost(editingPost.postId, dto)
      await loadPosts()
      handleCloseEditDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật bài viết')
      console.error('Error updating post:', err)
    } finally {
      setUpdating(false)
    }
  }

  // Delete Post Handlers
  const handleOpenDeleteDialog = (post: PostDto) => {
    setDeletingPost(post)
    setDeleteDialogOpen(true)
    handleMenuClose(post.postId)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDeletingPost(null)
  }

  const handleDeletePost = async () => {
    if (!deletingPost) return

    try {
      setDeleting(true)
      await deletePost(deletingPost.postId)
      
      // Remove from local state immediately for better UX
      setPosts(prev => prev.filter(p => p.postId !== deletingPost.postId))
      
      // Reload to ensure sync with backend
      await loadPosts()
      
      handleCloseDeleteDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa bài viết')
      console.error('Error deleting post:', err)
      // Reload on error to ensure state is correct
      await loadPosts()
    } finally {
      setDeleting(false)
    }
  }

  // Approve/Reject Handlers
  const handleOpenApproveDialog = (post: PostDto) => {
    setReviewingPost(post)
    setApproveDialogOpen(true)
    handleMenuClose(post.postId)
  }

  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false)
    setReviewingPost(null)
  }

  const handleApprovePost = async () => {
    if (!reviewingPost) return

    try {
      setReviewing(true)
      await approvePost(reviewingPost.postId)
      await loadPosts()
      handleCloseApproveDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể duyệt bài viết')
      console.error('Error approving post:', err)
    } finally {
      setReviewing(false)
    }
  }

  const handleOpenRejectDialog = (post: PostDto) => {
    setReviewingPost(post)
    setRejectComment('')
    setRejectDialogOpen(true)
    handleMenuClose(post.postId)
  }

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false)
    setReviewingPost(null)
    setRejectComment('')
  }

  const handleRejectPost = async () => {
    if (!reviewingPost || !rejectComment.trim()) return

    try {
      setReviewing(true)
      await rejectPost(reviewingPost.postId, rejectComment.trim())
      await loadPosts()
      handleCloseRejectDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể từ chối bài viết')
      console.error('Error rejecting post:', err)
    } finally {
      setReviewing(false)
    }
  }

  // Menu Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: number) => {
    setMenuAnchor((prev) => ({ ...prev, [postId]: event.currentTarget }))
  }

  const handleMenuClose = (postId: number) => {
    setMenuAnchor((prev) => ({ ...prev, [postId]: null }))
  }

  const canEditOrDelete = (post: PostDto) => {
    // Admin can edit/delete any post, or user can edit/delete their own posts
    if (isAdmin) return true
    
    if (!currentUser) return false
    
    // Check multiple possible user ID fields from currentUser
    const userId = currentUser?.id ?? currentUser?.Id ?? currentUser?.userId ?? currentUser?.UserId ?? currentUser?.ID ?? 0
    const postAuthorId = post.authorId ?? 0
    
    // Convert to numbers for comparison (handle both string and number)
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId)
    const authorIdNum = typeof postAuthorId === 'string' ? parseInt(String(postAuthorId), 10) : Number(postAuthorId)
    
    // Debug log (remove in production)
    if (userIdNum > 0 && authorIdNum > 0) {
      console.log('canEditOrDelete check:', {
        userId: userIdNum,
        authorId: authorIdNum,
        match: userIdNum === authorIdNum,
        currentUser: currentUser,
        postAuthorId: post.authorId
      })
    }
    
    return userIdNum === authorIdNum && userIdNum > 0
  }

  // Like/Unlike Handlers
  const handleToggleLike = async (post: PostDto) => {
    // Double check authentication - show immediate feedback
    if (!isAuthenticated || !currentUser) {
      const message = 'Vui lòng đăng nhập để thích bài viết'
      setError(message)
      setSnackbar({ open: true, message, severity: 'warning' })
      console.log('Not authenticated - cannot like post', { isAuthenticated, currentUser })
      return
    }

    try {
      setLikingPosts(prev => new Set(prev).add(post.postId))
      const result = await toggleLikePost(post.postId)
      
      // Reload posts to get updated likes list
      await loadPosts()
      
      // Update post in state (fallback if reload fails)
      setPosts(prev => prev.map(p => 
        p.postId === post.postId 
          ? { 
              ...p, 
              isLiked: result.isLiked,
              likesCount: result.isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
            }
          : p
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể thích bài viết'
      
      // Check if it's an authentication error
      if (errorMessage.includes('đăng nhập') || errorMessage.includes('login') || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        const message = 'Vui lòng đăng nhập để thích bài viết'
        setError(message)
        setSnackbar({ open: true, message })
      } else {
        setError(errorMessage)
        setSnackbar({ open: true, message: errorMessage })
      }
      
      console.error('Error toggling like:', err)
    } finally {
      setLikingPosts(prev => {
        const next = new Set(prev)
        next.delete(post.postId)
        return next
      })
    }
  }

  // Comment Handlers
  const handleToggleComments = async (postId: number) => {
    const isExpanded = expandedComments.has(postId)
    
    if (isExpanded) {
      setExpandedComments(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    } else {
      setExpandedComments(prev => new Set(prev).add(postId))
      // Load comments if not already loaded
      if (!postComments[postId]) {
        try {
          const comments = await fetchCommentsByPost(postId)
          setPostComments(prev => ({ ...prev, [postId]: comments }))
        } catch (err) {
          console.error('Error loading comments:', err)
          setPostComments(prev => ({ ...prev, [postId]: [] }))
        }
      }
    }
  }

  const handleCreateComment = async (postId: number) => {
    const content = commentTexts[postId]?.trim()
    if (!content || !isAuthenticated) return

    try {
      setCreatingComment(prev => ({ ...prev, [postId]: true }))
      await createComment({
        postId: String(postId),
        content
      })
      
      // Reload comments
      const comments = await fetchCommentsByPost(postId)
      setPostComments(prev => ({ ...prev, [postId]: comments }))
      
      // Clear comment text
      setCommentTexts(prev => ({ ...prev, [postId]: '' }))
      
      // Update post comment count
      setPosts(prev => prev.map(p => 
        p.postId === postId 
          ? { ...p, commentsCount: p.commentsCount + 1 }
          : p
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo bình luận')
      console.error('Error creating comment:', err)
    } finally {
      setCreatingComment(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleStartEditComment = (commentId: string, currentContent: string) => {
    setEditingComments(prev => ({ ...prev, [commentId]: currentContent }))
  }

  const handleCancelEditComment = (commentId: string) => {
    setEditingComments(prev => {
      const next = { ...prev }
      delete next[commentId]
      return next
    })
  }

  const handleUpdateComment = async (commentId: string, postId: number) => {
    const content = editingComments[commentId]?.trim()
    if (!content) return

    try {
      setUpdatingComment(prev => new Set(prev).add(commentId))
      await updateComment(parseInt(commentId, 10), { content })
      
      // Reload comments
      const comments = await fetchCommentsByPost(postId)
      setPostComments(prev => ({ ...prev, [postId]: comments }))
      
      // Clear editing state
      handleCancelEditComment(commentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật bình luận')
      console.error('Error updating comment:', err)
    } finally {
      setUpdatingComment(prev => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
    }
  }

  const handleDeleteComment = async (commentId: string, postId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return

    try {
      setDeletingComment(prev => new Set(prev).add(commentId))
      await deleteComment(parseInt(commentId, 10))
      
      // Reload comments
      const comments = await fetchCommentsByPost(postId)
      setPostComments(prev => ({ ...prev, [postId]: comments }))
      
      // Update post comment count
      setPosts(prev => prev.map(p => 
        p.postId === postId 
          ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) }
          : p
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa bình luận')
      console.error('Error deleting comment:', err)
    } finally {
      setDeletingComment(prev => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
    }
  }

  const canEditOrDeleteComment = (comment: PostComment) => {
    if (!isAuthenticated) return false
    // User can edit/delete their own comments
    const commentAuthorId = comment.authorId ?? comment.authorID ?? 0
    const userId = currentUser?.id ?? currentUser?.userId ?? 0
    return commentAuthorId === userId
  }

  const getCommentId = (comment: PostComment): string => {
    return comment.postCommentId ?? String(comment.id ?? 0)
  }

  const getCommentAuthorName = (comment: PostComment): string => {
    return comment.fullName ?? comment.authorName ?? 'Người dùng'
  }

  const getCommentDate = (comment: PostComment): string => {
    return comment.createdDate ?? comment.createdAt ?? ''
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        sx={{ 
          bgcolor: 'white',
          p: 2,
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Quản lý Bài viết
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ 
              borderRadius: 2,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            Tạo bài viết mới
          </Button>
        )}
      </Box>

      {/* Search and Filter */}
      <Box mb={3} display="flex" gap={2}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm bài viết..."
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
            borderRadius: 2,
            bgcolor: 'white',
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main'
              }
            }
          }}
        />
        {isAdmin && (
          <FormControl sx={{ minWidth: 150, bgcolor: 'white' }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">Tất cả</MenuItem>
              <MenuItem value="Pending">Đang chờ</MenuItem>
              <MenuItem value="Approved">Đã duyệt</MenuItem>
              <MenuItem value="Rejected">Đã từ chối</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
          <CardContent>
            <Typography textAlign="center" color="text.secondary" py={4}>
              {searchText || statusFilter !== 'All' ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {filteredPosts.map((post) => (
            <Card 
              key={post.postId} 
              sx={{ 
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" gap={2} alignItems="center">
                    <Avatar 
                      src={post.authorAvatar} 
                      sx={{ 
                        width: 56, 
                        height: 56,
                        bgcolor: 'primary.main',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {post.authorName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary" mb={0.5}>
                        {post.authorName}
                      </Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          label={post.authorRole}
                          size="small"
                          color={getRoleColor(post.authorRole)}
                          sx={{ fontWeight: 'medium' }}
                        />
                        <Chip
                          label={post.status}
                          size="small"
                          color={getStatusColor(post.status)}
                          sx={{ fontWeight: 'medium' }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {formatTimeAgo(post.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {canEditOrDelete(post) && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, post.postId)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>

                {/* Title */}
                {post.title && (
                  <Typography variant="h6" fontWeight="bold" color="text.primary" mb={1}>
                    {post.title}
                  </Typography>
                )}

                {/* Content */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 2, 
                    whiteSpace: 'pre-wrap',
                    color: 'text.primary',
                    lineHeight: 1.7,
                    fontSize: '1rem'
                  }}
                >
                  {post.content}
                </Typography>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <Box mb={2}>
                    <ImageList cols={3} gap={8} sx={{ mb: 0 }}>
                      {post.images
                        .filter((img) => {
                          if (!img || typeof img !== 'string') return false
                          const trimmed = img.trim()
                          return trimmed !== '' && trimmed.length > 10
                        })
                        .map((image, index) => {
                          let imageSrc = image.trim()
                          
                          // If it's already a data URL or HTTP(S) URL, use as is
                          if (imageSrc.startsWith('data:image/')) {
                            // Validate it has base64 data
                            if (!imageSrc.includes('base64,')) {
                              return null
                            }
                          } else if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
                            // HTTP(S) URL, use as is
                          } else {
                            // Assume it's base64 without prefix
                            const base64Pattern = /^[A-Za-z0-9+/=\s]+$/
                            const cleaned = imageSrc.replace(/\s/g, '')
                            
                            if (base64Pattern.test(cleaned) && cleaned.length > 50) {
                              imageSrc = `data:image/jpeg;base64,${cleaned}`
                            } else {
                              return null
                            }
                          }
                          
                          return (
                            <ImageListItem key={`${post.postId}-img-${index}`}>
                              <img
                                src={imageSrc}
                                alt={`Post ${post.postId} - ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '200px',
                                  objectFit: 'cover',
                                  borderRadius: '12px',
                                  border: '2px solid #e0e0e0',
                                  backgroundColor: '#f5f5f5'
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                                loading="lazy"
                              />
                            </ImageListItem>
                          )
                        })
                        .filter(Boolean)}
                    </ImageList>
                  </Box>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
                    {post.hashtags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={`#${tag}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: 2, bgcolor: 'grey.200' }} />

                <Divider sx={{ my: 2, bgcolor: 'grey.200' }} />

                {/* Actions */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!isAuthenticated || !currentUser) {
                        const message = 'Vui lòng đăng nhập để thích bài viết'
                        setError(message)
                        setSnackbar({ open: true, message })
                        return
                      }
                      handleToggleLike(post)
                    }}
                    disabled={likingPosts.has(post.postId)}
                    title={!isAuthenticated ? 'Vui lòng đăng nhập để thích bài viết' : (post.isLiked ? 'Bỏ thích' : 'Thích')}
                    sx={{ 
                      color: post.isLiked ? 'error.main' : 'text.secondary',
                      opacity: !isAuthenticated ? 0.5 : 1,
                      cursor: !isAuthenticated ? 'not-allowed' : 'pointer',
                      '&:hover': {
                        bgcolor: post.isLiked ? 'error.light' : 'grey.100',
                        color: post.isLiked ? 'error.dark' : 'error.main'
                      },
                      '&.Mui-disabled': {
                        opacity: 0.3
                      }
                    }}
                  >
                    {post.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    fontWeight="medium"
                    onClick={() => {
                      if (post.likesCount > 0) {
                        setSelectedPostLikes(post.likes || [])
                        setSelectedPostTitle(post.title || 'Bài viết')
                        setLikesDialogOpen(true)
                      }
                    }}
                    sx={{
                      cursor: post.likesCount > 0 ? 'pointer' : 'default',
                      '&:hover': post.likesCount > 0 ? {
                        textDecoration: 'underline',
                        color: 'primary.main'
                      } : {}
                    }}
                  >
                    {post.likesCount} lượt thích
                  </Typography>
                  
                  <IconButton
                    onClick={() => handleToggleComments(post.postId)}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <CommentIcon />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {post.commentsCount} bình luận
                  </Typography>
                </Box>

                {/* Comments Section */}
                {expandedComments.has(post.postId) && (
                  <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                    {/* Comment Input */}
                    {isAuthenticated && (
                      <Box display="flex" gap={1} mb={2}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Viết bình luận..."
                          value={commentTexts[post.postId] || ''}
                          onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.postId]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleCreateComment(post.postId)
                            }
                          }}
                          sx={{ bgcolor: 'background.default' }}
                        />
                        <IconButton
                          color="primary"
                          onClick={() => handleCreateComment(post.postId)}
                          disabled={!commentTexts[post.postId]?.trim() || creatingComment[post.postId]}
                        >
                          {creatingComment[post.postId] ? <CircularProgress size={20} /> : <SendIcon />}
                        </IconButton>
                      </Box>
                    )}

                    {/* Comments List */}
                    {postComments[post.postId] && postComments[post.postId].length > 0 ? (
                      <Box display="flex" flexDirection="column" gap={2}>
                        {postComments[post.postId].map((comment) => {
                          const commentId = getCommentId(comment)
                          const isEditing = editingComments[commentId] !== undefined
                          const canEdit = canEditOrDeleteComment(comment)
                          
                          return (
                            <Box key={commentId} sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 1 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                    {getCommentAuthorName(comment)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTimeAgo(getCommentDate(comment))}
                                  </Typography>
                                </Box>
                                {canEdit && !isEditing && (
                                  <Box display="flex" gap={0.5}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleStartEditComment(commentId, comment.content)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteComment(commentId, post.postId)}
                                      disabled={deletingComment.has(commentId)}
                                      sx={{ color: 'error.main' }}
                                    >
                                      {deletingComment.has(commentId) ? (
                                        <CircularProgress size={16} />
                                      ) : (
                                        <DeleteIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Box>
                                )}
                              </Box>
                              
                              {isEditing ? (
                                <Box display="flex" gap={1} alignItems="flex-start">
                                  <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    value={editingComments[commentId]}
                                    onChange={(e) => setEditingComments(prev => ({ ...prev, [commentId]: e.target.value }))}
                                    sx={{ bgcolor: 'white' }}
                                  />
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleUpdateComment(commentId, post.postId)}
                                    disabled={updatingComment.has(commentId)}
                                  >
                                    {updatingComment.has(commentId) ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <CheckCircleIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCancelEditComment(commentId)}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {comment.content}
                                </Typography>
                              )}
                            </Box>
                          )
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                        Chưa có bình luận nào
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>

              {/* Menu */}
              <Menu
                anchorEl={menuAnchor[post.postId]}
                open={Boolean(menuAnchor[post.postId])}
                onClose={() => handleMenuClose(post.postId)}
              >
                {isAdmin && post.status === 'Pending' && (
                  <>
                    <MenuItem onClick={() => handleOpenApproveDialog(post)}>
                      <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" color="success" />
                      Duyệt bài viết
                    </MenuItem>
                    <MenuItem onClick={() => handleOpenRejectDialog(post)}>
                      <CancelIcon sx={{ mr: 1 }} fontSize="small" color="error" />
                      Từ chối
                    </MenuItem>
                    <Divider />
                  </>
                )}
                {canEditOrDelete(post) && (
                  <>
                    <MenuItem onClick={() => handleOpenEditDialog(post)}>
                      <EditIcon sx={{ mr: 1 }} fontSize="small" />
                      Chỉnh sửa
                    </MenuItem>
                    <MenuItem onClick={() => handleOpenDeleteDialog(post)} sx={{ color: 'error.main' }}>
                      <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                      Xóa
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCloseCreateDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
          Tạo bài viết mới
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', pt: 3 }}>
          <TextField
            fullWidth
            label="Tiêu đề"
            placeholder="Nhập tiêu đề bài viết..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{ 
              mb: 2,
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Nội dung"
            placeholder="Nhập nội dung bài viết..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            sx={{ 
              mb: 2,
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />
          <Box mb={2}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="create-image-upload"
              type="file"
              multiple
              onChange={handleImageSelect}
            />
            <label htmlFor="create-image-upload">
              <Button 
                variant="outlined" 
                component="span" 
                startIcon={<ImageIcon />}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                Thêm hình ảnh
              </Button>
            </label>
          </Box>
          {newImagePreviews.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {newImagePreviews.map((preview, index) => (
                <Box 
                  key={index} 
                  position="relative" 
                  sx={{ 
                    width: 120, 
                    height: 120,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: 'primary.light'
                  }}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeNewImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'error.dark',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.default', px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseCreateDialog}
            sx={{ color: 'text.secondary' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            disabled={creating || (!newTitle.trim() && !newContent.trim() && newImages.length === 0)}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&:disabled': {
                bgcolor: 'grey.300'
              }
            }}
          >
            {creating ? <CircularProgress size={20} color="inherit" /> : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }}>
          Chỉnh sửa bài viết
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', pt: 3 }}>
          <TextField
            fullWidth
            label="Tiêu đề"
            placeholder="Nhập tiêu đề bài viết..."
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ 
              mb: 2,
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'secondary.main'
                }
              }
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Nội dung"
            placeholder="Nhập nội dung bài viết..."
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            sx={{ 
              mb: 2,
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'secondary.main'
                }
              }
            }}
          />
          <Box mb={2}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="edit-image-upload"
              type="file"
              multiple
              onChange={handleEditImageSelect}
            />
            <label htmlFor="edit-image-upload">
              <Button 
                variant="outlined" 
                component="span" 
                startIcon={<ImageIcon />}
                sx={{
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    bgcolor: 'secondary.light',
                    color: 'white'
                  }
                }}
              >
                Thêm hình ảnh mới
              </Button>
            </label>
          </Box>
          {(editImages.length > 0 || editNewImagePreviews.length > 0) && (
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {editImages.map((image, index) => (
                <Box 
                  key={`existing-${index}`} 
                  position="relative" 
                  sx={{ 
                    width: 120, 
                    height: 120,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: 'secondary.light'
                  }}
                >
                  <img
                    src={image.startsWith('data:image/') || image.startsWith('http') ? image : `data:image/jpeg;base64,${image}`}
                    alt={`Existing ${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeEditImage(index, false)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'error.dark',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {editNewImagePreviews.map((preview, index) => (
                <Box 
                  key={`new-${index}`} 
                  position="relative" 
                  sx={{ 
                    width: 120, 
                    height: 120,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: 'primary.light'
                  }}
                >
                  <img
                    src={preview}
                    alt={`New ${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeEditImage(index, true)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'error.dark',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.default', px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseEditDialog}
            sx={{ color: 'text.secondary' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdatePost}
            variant="contained"
            disabled={updating || (!editTitle.trim() && !editContent.trim() && editImages.length === 0 && editNewImages.length === 0)}
            sx={{
              bgcolor: 'secondary.main',
              '&:hover': {
                bgcolor: 'secondary.dark'
              },
              '&:disabled': {
                bgcolor: 'grey.300'
              }
            }}
          >
            {updating ? <CircularProgress size={20} color="inherit" /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 'bold' }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', pt: 3 }}>
          <DialogContentText sx={{ color: 'text.primary', fontSize: '1rem' }}>
            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.default', px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{ color: 'text.secondary' }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDeletePost} 
            variant="contained" 
            disabled={deleting}
            sx={{
              bgcolor: 'error.main',
              '&:hover': {
                bgcolor: 'error.dark'
              },
              '&:disabled': {
                bgcolor: 'grey.300'
              }
            }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog 
        open={approveDialogOpen} 
        onClose={handleCloseApproveDialog}
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 'bold' }}>
          Duyệt bài viết
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', pt: 3 }}>
          <DialogContentText sx={{ color: 'text.primary', fontSize: '1rem' }}>
            Bạn có chắc chắn muốn duyệt bài viết này?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.default', px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseApproveDialog}
            sx={{ color: 'text.secondary' }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleApprovePost} 
            variant="contained" 
            disabled={reviewing}
            sx={{
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark'
              },
              '&:disabled': {
                bgcolor: 'grey.300'
              }
            }}
          >
            {reviewing ? <CircularProgress size={20} color="inherit" /> : 'Duyệt'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={handleCloseRejectDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 'bold' }}>
          Từ chối bài viết
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', pt: 3 }}>
          <DialogContentText sx={{ color: 'text.primary', fontSize: '1rem', mb: 2 }}>
            Vui lòng nhập lý do từ chối:
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập lý do từ chối..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            sx={{ 
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'error.main'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.default', px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseRejectDialog}
            sx={{ color: 'text.secondary' }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleRejectPost} 
            variant="contained" 
            disabled={reviewing || !rejectComment.trim()}
            sx={{
              bgcolor: 'error.main',
              '&:hover': {
                bgcolor: 'error.dark'
              },
              '&:disabled': {
                bgcolor: 'grey.300'
              }
            }}
          >
            {reviewing ? <CircularProgress size={20} color="inherit" /> : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Likes Dialog */}
      <Dialog
        open={likesDialogOpen}
        onClose={() => setLikesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Người đã thích bài viết
            </Typography>
            <IconButton
              onClick={() => setLikesDialogOpen(false)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', pt: 2 }}>
          {selectedPostLikes && selectedPostLikes.length > 0 ? (
            <Box>
              {selectedPostLikes.map((like, index) => (
                <Box
                  key={like.postLikeId || index}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  py={1.5}
                  sx={{
                    borderBottom: index < selectedPostLikes.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {like.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {like.fullName || 'Người dùng'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(like.createdDate)}
                    </Typography>
                  </Box>
                  <FavoriteIcon sx={{ color: 'error.main', fontSize: 20 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <FavoriteBorderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Chưa có ai thích bài viết này
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

