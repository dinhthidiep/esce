import { useState, useMemo, useEffect } from 'react'
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
  Alert,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import SendIcon from '@mui/icons-material/Send'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SearchIcon from '@mui/icons-material/Search'
import MoreVertIcon from '@mui/icons-material/MoreVert'

type ReactionType = 'like' | 'dislike' | 'haha' | 'sad' | 'angry' | null

// Mock data - sau này sẽ thay bằng API call
const mockNews = [
  {
    id: 1,
    author: {
      name: 'Nguyễn Văn A',
      avatar: '',
      role: 'Admin'
    },
    content: 'Tin tức mới: Chương trình khuyến mãi đặc biệt cho mùa du lịch hè 2024!',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ],
    likes: 24,
    createdAt: '2 giờ trước',
    isLiked: false,
    reaction: null as ReactionType
  },
  {
    id: 2,
    author: {
      name: 'Trần Thị B',
      avatar: '',
      role: 'Admin'
    },
    content: 'Thông báo: Hệ thống sẽ bảo trì vào cuối tuần này. Vui lòng lưu ý!',
    images: [],
    likes: 45,
    createdAt: '5 giờ trước',
    isLiked: true,
    reaction: 'like' as ReactionType
  }
]

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'Admin'
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
    case 'Admin':
      return 'primary'
    case 'Travel agency':
      return 'primary'
    case 'Host':
      return 'secondary'
    default:
      return 'default'
  }
}

export default function MainNewsContent() {
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
    return {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      role: 'Admin'
    }
  }

  const userInfo = getUserInfo()
  const currentUser = {
    id: userInfo.id || 1,
    name: userInfo.name || userInfo.fullName || 'Nguyễn Văn A',
    email: userInfo.email || 'nguyenvana@example.com',
    role: userInfo.role || userInfo.roleName || 'Admin'
  }

  const [news, setNews] = useState(mockNews)
  const [newNewsContent, setNewNewsContent] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const [canPost, setCanPost] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedNewsIdForEdit, setSelectedNewsIdForEdit] = useState<number | null>(null)
  const [editNewsContent, setEditNewsContent] = useState('')
  const [editNewsImages, setEditNewsImages] = useState<string[]>([])
  const [editNewsNewImagePreviews, setEditNewsNewImagePreviews] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNewsIdForDelete, setSelectedNewsIdForDelete] = useState<number | null>(null)

  // Logic phân quyền: Kiểm tra xem user hiện tại có quyền đăng tin không
  useEffect(() => {
    const NEWS_ACTIVE_USER_KEY = 'newsActiveUserId'
    const NEWS_ACTIVE_USER_NAME_KEY = 'newsActiveUserName'
    
    // Lấy userId đang "chiếm" phần tin tức
    const activeUserId = localStorage.getItem(NEWS_ACTIVE_USER_KEY)
    
    if (!activeUserId) {
      // Chưa có ai chiếm, user hiện tại sẽ chiếm
      localStorage.setItem(NEWS_ACTIVE_USER_KEY, String(currentUser.id))
      localStorage.setItem(NEWS_ACTIVE_USER_NAME_KEY, currentUser.name)
      setCanPost(true)
    } else if (activeUserId === String(currentUser.id)) {
      // User hiện tại đang chiếm, cập nhật tên (phòng trường hợp tên thay đổi)
      localStorage.setItem(NEWS_ACTIVE_USER_NAME_KEY, currentUser.name)
      setCanPost(true)
    } else {
      // Có user khác đang chiếm
      setCanPost(false)
    }

    // Cleanup: Khi component unmount, có thể xóa hoặc giữ lại tùy yêu cầu
    // Ở đây tôi sẽ giữ lại để user khác biết ai đang chiếm
    // Nếu muốn tự động giải phóng khi rời trang, uncomment dòng dưới:
    // return () => {
    //   if (activeUserId === String(currentUser.id)) {
    //     localStorage.removeItem(NEWS_ACTIVE_USER_KEY)
    //     localStorage.removeItem(NEWS_ACTIVE_USER_NAME_KEY)
    //   }
    // }
  }, [currentUser.id, currentUser.name])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectedImages((prev) => [...prev, ...fileArray])
      
      // Create previews
      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...previews])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmitNews = () => {
    if (!canPost) {
      return
    }

    if (!newNewsContent.trim() && selectedImages.length === 0) {
      return
    }

    const newNewsItem = {
      id: news.length + 1,
      author: {
        name: currentUser.name,
        avatar: '',
        role: currentUser.role
      },
      content: newNewsContent,
      images: imagePreviews,
      likes: 0,
      createdAt: 'Vừa xong',
      isLiked: false,
      reaction: null as ReactionType
    }

    setNews([newNewsItem, ...news])
    setNewNewsContent('')
    setSelectedImages([])
    setImagePreviews([])
  }

  const handleToggleLike = (newsId: number) => {
    setNews((prevNews) =>
      prevNews.map((item) =>
        item.id === newsId
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
              reaction: item.isLiked ? null : 'like'
            }
          : item
      )
    )
  }

  // Helper functions
  const isNewsAuthor = (newsItem: typeof mockNews[0]) => {
    return newsItem.author.name === currentUser.name
  }

  const isAdmin = () => {
    return currentUser.role === 'Admin'
  }

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, newsId: number) => {
    setMenuAnchor((prev) => ({ ...prev, [newsId]: event.currentTarget }))
  }

  const handleMenuClose = (newsId: number) => {
    setMenuAnchor((prev) => ({ ...prev, [newsId]: null }))
  }

  // Delete handlers
  const handleOpenDeleteDialog = (newsId: number) => {
    setSelectedNewsIdForDelete(newsId)
    setDeleteDialogOpen(true)
    handleMenuClose(newsId)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedNewsIdForDelete(null)
  }

  const handleDeleteNews = () => {
    if (!selectedNewsIdForDelete) {
      return
    }

    setNews((prevNews) => prevNews.filter((item) => item.id !== selectedNewsIdForDelete))

    // TODO: Gửi API request để xóa tin tức
    console.log(`Xóa tin tức ${selectedNewsIdForDelete}`)
    
    handleCloseDeleteDialog()
  }

  // Edit handlers
  const handleOpenEditDialog = (newsId: number) => {
    const newsItem = news.find((n) => n.id === newsId)
    if (newsItem) {
      setSelectedNewsIdForEdit(newsId)
      setEditNewsContent(newsItem.content)
      setEditNewsImages([...newsItem.images])
      setEditNewsNewImagePreviews([])
      setEditDialogOpen(true)
      handleMenuClose(newsId)
    }
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setSelectedNewsIdForEdit(null)
    setEditNewsContent('')
    setEditNewsImages([])
    setEditNewsNewImagePreviews([])
  }

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      
      // Create previews
      const previews = fileArray.map((file) => URL.createObjectURL(file))
      setEditNewsNewImagePreviews((prev) => [...prev, ...previews])
    }
  }

  const removeEditImage = (index: number, isNew: boolean) => {
    if (isNew) {
      setEditNewsNewImagePreviews((prev) => {
        URL.revokeObjectURL(prev[index])
        return prev.filter((_, i) => i !== index)
      })
    } else {
      setEditNewsImages((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSaveEditNews = () => {
    if (!selectedNewsIdForEdit) {
      return
    }

    // Combine existing images with new image previews
    const allImages = [...editNewsImages, ...editNewsNewImagePreviews]

    setNews((prevNews) =>
      prevNews.map((item) =>
        item.id === selectedNewsIdForEdit
          ? {
              ...item,
              content: editNewsContent,
              images: allImages
            }
          : item
      )
    )

    // TODO: Gửi API request để cập nhật tin tức
    console.log(`Chỉnh sửa tin tức ${selectedNewsIdForEdit}`)
    
    handleCloseEditDialog()
  }

  const filteredNews = useMemo(() => {
    if (!searchText.trim()) {
      return news
    }
    return news.filter(
      (item) =>
        item.content.toLowerCase().includes(searchText.toLowerCase()) ||
        item.author.name.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [news, searchText])

  // Lấy thông tin user đang chiếm để hiển thị thông báo
  const getActiveUserInfo = () => {
    const NEWS_ACTIVE_USER_KEY = 'newsActiveUserId'
    const NEWS_ACTIVE_USER_NAME_KEY = 'newsActiveUserName'
    const activeUserId = localStorage.getItem(NEWS_ACTIVE_USER_KEY)
    const activeUserName = localStorage.getItem(NEWS_ACTIVE_USER_NAME_KEY)
    
    if (!activeUserId || activeUserId === String(currentUser.id)) {
      return null
    }

    // Lấy tên user đang chiếm từ localStorage
    return {
      id: parseInt(activeUserId),
      name: activeUserName || `User ID: ${activeUserId}`
    }
  }

  const activeUserInfo = getActiveUserInfo()

  return (
    <Box className="flex flex-col gap-[2.4rem]">
      {/* Thông báo nếu không có quyền đăng tin */}
      {!canPost && activeUserInfo && (
        <Alert severity="warning" sx={{ borderRadius: '1.2rem' }}>
          <Typography sx={{ fontSize: '1.4rem' }}>
            Hiện tại chỉ có <strong>{activeUserInfo.name}</strong> mới được đăng tin tức. 
            Bạn chỉ có thể xem và tương tác với các tin tức hiện có.
          </Typography>
        </Alert>
      )}

      {/* Form đăng tin tức */}
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
          Tạo tin tức mới
        </Typography>

        <Box className="flex gap-[1.2rem] mb-[1.6rem]">
          <Avatar sx={{ width: 48, height: 48 }}>
            {currentUser.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box className="flex-1">
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={canPost ? "Bạn muốn đăng tin tức gì?" : "Bạn không có quyền đăng tin tức"}
              value={newNewsContent}
              onChange={(e) => setNewNewsContent(e.target.value)}
              disabled={!canPost}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '1.2rem',
                  bgcolor: 'grey.50'
                }
              }}
            />
          </Box>
        </Box>

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
                    disabled={!canPost}
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
          <label htmlFor="news-image-upload">
            <input
              id="news-image-upload"
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
              disabled={!canPost}
            />
            <Button
              component="span"
              startIcon={<ImageIcon />}
              disabled={!canPost}
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
            endIcon={<SendIcon />}
            onClick={handleSubmitNews}
            disabled={(!newNewsContent.trim() && selectedImages.length === 0) || !canPost}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Đăng tin
          </Button>
        </Box>
      </Box>

      {/* Search Section */}
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
          Tìm kiếm tin tức
        </Typography>

        <TextField
          fullWidth
          placeholder="Tìm kiếm tin tức..."
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
              bgcolor: 'grey.50'
            }
          }}
        />
      </Box>

      {/* Danh sách tin tức */}
      <Box className="flex flex-col gap-[2.4rem]">
        {filteredNews.length === 0 ? (
          <Card
            sx={{
              bgcolor: 'common.white',
              borderRadius: '2.4rem',
              boxShadow: 3
            }}
          >
            <CardContent>
              <Typography className="text-center! text-[1.6rem]! py-[3.2rem]!">
                {searchText ? 'Không tìm thấy tin tức nào' : 'Chưa có tin tức nào'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          filteredNews.map((item) => (
            <Card
              key={item.id}
              sx={{
                bgcolor: 'common.white',
                borderRadius: '2.4rem',
                boxShadow: 3
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {item.author.name.charAt(0).toUpperCase()}
                  </Avatar>
                }
                action={
                  (isNewsAuthor(item) || isAdmin()) && (
                    <>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, item.id)}
                        aria-label="more options"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[item.id]}
                        open={Boolean(menuAnchor[item.id])}
                        onClose={() => handleMenuClose(item.id)}
                        PaperProps={{
                          sx: {
                            borderRadius: '1.2rem',
                            mt: 1,
                            minWidth: 180
                          }
                        }}
                      >
                        {/* Menu cho tác giả: Chỉnh sửa tin tức */}
                        {isNewsAuthor(item) && (
                          <MenuItem
                            onClick={() => handleOpenEditDialog(item.id)}
                            sx={{
                              fontSize: '1.4rem',
                              py: 1.5
                            }}
                          >
                            Chỉnh sửa tin tức
                          </MenuItem>
                        )}
                        
                        {/* Menu cho Admin hoặc tác giả: Xóa tin tức */}
                        {(isAdmin() || isNewsAuthor(item)) && (
                          <MenuItem
                            onClick={() => handleOpenDeleteDialog(item.id)}
                            sx={{
                              fontSize: '1.4rem',
                              py: 1.5,
                              color: 'error.main'
                            }}
                          >
                            Xóa tin tức
                          </MenuItem>
                        )}
                      </Menu>
                    </>
                  )
                }
                title={
                  <Box className="flex items-center gap-[0.8rem]">
                    <Typography className="font-semibold! text-[1.4rem]!">
                      {item.author.name}
                    </Typography>
                    <Chip
                      label={getRoleLabel(item.author.role)}
                      size="small"
                      color={getRoleColor(item.author.role) as 'primary' | 'secondary' | 'default'}
                      sx={{ height: 20, fontSize: '1rem' }}
                    />
                  </Box>
                }
                subheader={
                  <Typography className="text-[1.2rem]! text-gray-500">
                    {item.createdAt}
                  </Typography>
                }
              />
              <CardContent>
                <Typography className="text-[1.4rem]! mb-[1.6rem]! whitespace-pre-wrap">
                  {item.content}
                </Typography>

                {item.images.length > 0 && (
                  <Box className="mb-[1.6rem]">
                    <Box className="grid grid-cols-3 gap-[1.2rem]">
                      {item.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`News ${item.id} - ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '1.2rem'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider className="my-[1.6rem]!" />

                <Box className="flex items-center gap-[2.4rem]">
                  <IconButton
                    onClick={() => handleToggleLike(item.id)}
                    sx={{ color: item.isLiked ? 'error.main' : 'inherit' }}
                  >
                    {item.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography className="text-[1.2rem]!">
                    {item.likes} lượt thích
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Dialog chỉnh sửa tin tức */}
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
          Chỉnh sửa tin tức
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập nội dung tin tức..."
            value={editNewsContent}
            onChange={(e) => setEditNewsContent(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '1.2rem',
                bgcolor: 'grey.50',
                fontSize: '1.4rem'
              }
            }}
          />

          {/* Hiển thị hình ảnh hiện có */}
          {editNewsImages.length > 0 && (
            <Box className="mt-[1.6rem]">
              <Typography className="text-[1.4rem]! mb-[1.2rem]! font-semibold!">
                Hình ảnh hiện có:
              </Typography>
              <Box className="grid grid-cols-3 gap-[1.2rem]">
                {editNewsImages.map((image, index) => (
                  <Box
                    key={index}
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
          {editNewsNewImagePreviews.length > 0 && (
            <Box className="mt-[1.6rem]">
              <Typography className="text-[1.4rem]! mb-[1.2rem]! font-semibold!">
                Hình ảnh mới:
              </Typography>
              <Box className="grid grid-cols-3 gap-[1.2rem]">
                {editNewsNewImagePreviews.map((preview, index) => (
                  <Box
                    key={index}
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
          <label htmlFor="edit-news-image-upload">
            <input
              id="edit-news-image-upload"
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
                fontSize: '1.4rem',
                mt: 2
              }}
            >
              Thêm hình ảnh
            </Button>
          </label>
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
            onClick={handleSaveEditNews}
            variant="contained"
            disabled={!editNewsContent.trim() && editNewsImages.length === 0 && editNewsNewImagePreviews.length === 0}
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

      {/* Dialog xác nhận xóa tin tức */}
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
          Xác nhận xóa tin tức
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: '1.4rem',
              color: 'text.primary'
            }}
          >
            Bạn có chắc chắn muốn xóa tin tức này? Hành động này không thể hoàn tác.
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
            onClick={handleDeleteNews}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Xóa tin tức
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

