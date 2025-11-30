import { useState, useRef, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import {
  Typography,
  Avatar,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Paper,
  Chip,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SearchIcon from '@mui/icons-material/Search'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import ImageIcon from '@mui/icons-material/Image'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import AddCommentIcon from '@mui/icons-material/AddComment'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import {
  getUsersForChat,
  getChattedUsers,
  getChatHistory,
  sendChatMessage,
  type ChatUser,
  type ChatMessage
} from '~/api/instances/ChatApi'

type Reaction = {
  emoji: string
  userId: number
  userName: string
}

type Message = {
  id: number
  senderId: number
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
  isRead: boolean
  reactions?: Reaction[]
  image?: string // Base64 image data
  createdAt?: string
  createdAtMs?: number
}

type Conversation = {
  id: number
  participantId: number
  participantName: string
  participantAvatar: string
  participantRole: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
  lastActivity: number
  isHistoryLoaded: boolean
}

const formatTimestamp = (value?: string) => {
  if (!value) return 'Vừa xong'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Vừa xong'

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / (60 * 1000))
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`

  return date.toLocaleString('vi-VN')
}

const mapChatMessage = (
  payload: ChatMessage,
  participantName: string,
  currentUserId: number,
  currentUserName: string
): Message => {
  const createdAt = payload.createdAt ?? new Date().toISOString()
  const createdAtMs = Date.parse(createdAt)

  return {
    id: payload.id,
    senderId: payload.senderId,
    senderName: payload.senderId === currentUserId ? currentUserName : participantName,
        senderAvatar: '',
    content: payload.content,
    timestamp: formatTimestamp(createdAt),
    isRead: payload.isRead ?? false,
    createdAt,
    createdAtMs: Number.isNaN(createdAtMs) ? Date.now() : createdAtMs
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

export default function ChatMainContent() {
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
      name: 'Admin',
      email: 'admin@example.com',
      role: 'Admin'
    }
  }

  const userInfo = getUserInfo()
  const currentUser = {
    id: Number(userInfo.id ?? userInfo.userId ?? 1),
    name: userInfo.name || userInfo.fullName || 'Admin',
    email: userInfo.email || 'admin@example.com'
  }

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')
  const [searchText, setSearchText] = useState('')
  const messagesStartRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef<number>(0)
  const [reactionAnchorEl, setReactionAnchorEl] = useState<{
    [key: number]: HTMLElement | null
  }>({})
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false)
  const [availableChatUsers, setAvailableChatUsers] = useState<ChatUser[]>([])
  const [selectedChatUser, setSelectedChatUser] = useState<ChatUser | null>(null)
  const [isLoadingChatUsers, setIsLoadingChatUsers] = useState(false)
  const [createChatError, setCreateChatError] = useState<string | null>(null)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [conversationError, setConversationError] = useState<string | null>(null)
  const [loadingHistoryFor, setLoadingHistoryFor] = useState<number | null>(null)
  const [initialMessage, setInitialMessage] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const mapApiMessageToUi = useCallback(
    (payload: ChatMessage, participantName: string) =>
      mapChatMessage(payload, participantName, currentUser.id, currentUser.name),
    [currentUser.id, currentUser.name]
  )

  const upsertConversationWithMessage = useCallback(
    (participantMeta: { id: number; name: string; role: string }, apiMessage: ChatMessage) => {
      setConversations((prev) => {
        const formatted = mapApiMessageToUi(apiMessage, participantMeta.name)
        let updated = false

        const next = prev.map((conv) => {
          if (conv.participantId !== participantMeta.id) {
            return conv
          }

          updated = true
          const messages = [...conv.messages, formatted]
          return {
            ...conv,
            participantName: participantMeta.name,
            participantRole: participantMeta.role,
            messages,
            lastMessage: formatted.content,
            lastMessageTime: formatted.timestamp,
            lastActivity: formatted.createdAtMs ?? Date.now(),
            unreadCount: 0,
            isHistoryLoaded: true
          }
        })

        if (updated) {
          return next
        }

        return [
          {
            id: participantMeta.id,
            participantId: participantMeta.id,
            participantName: participantMeta.name,
            participantAvatar: '',
            participantRole: participantMeta.role,
            lastMessage: formatted.content,
            lastMessageTime: formatted.timestamp,
            unreadCount: 0,
            messages: [formatted],
            lastActivity: formatted.createdAtMs ?? Date.now(),
            isHistoryLoaded: true
          },
          ...prev
        ]
      })
    },
    [mapApiMessageToUi]
  )

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    setConversationError(null)
    try {
      const users = await getChattedUsers()
      setConversations((prev) => {
        const prevMap = new Map(prev.map((conv) => [conv.participantId, conv]))
        const mapped = users.map((user) => {
          const participantId = Number(user.userId)
          const existing = prevMap.get(participantId)
          if (existing) {
            return {
              ...existing,
              participantName: user.fullName,
              participantRole: user.role
            }
          }
          return {
            id: participantId,
            participantId,
            participantName: user.fullName,
            participantAvatar: '',
            participantRole: user.role,
            lastMessage: 'Chưa có tin nhắn',
            lastMessageTime: '',
            unreadCount: 0,
            messages: [],
            lastActivity: 0,
            isHistoryLoaded: false
          }
        })

        const incomingIds = new Set(mapped.map((conv) => conv.participantId))
        const preserved = prev.filter((conv) => !incomingIds.has(conv.participantId))
        return [...mapped, ...preserved]
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách đoạn chat.'
      setConversationError(message)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const ensureConversationHistory = useCallback(
    async (participantId: number, participantName: string) => {
      setLoadingHistoryFor(participantId)
      try {
        const history = await getChatHistory(participantId.toString())
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.participantId !== participantId) {
              return conv
            }
            const messages = history.map((msg) => mapApiMessageToUi(msg, participantName))
            const lastMessage = messages[messages.length - 1]
            return {
              ...conv,
              messages,
              lastMessage: lastMessage?.content || 'Chưa có tin nhắn',
              lastMessageTime: lastMessage?.timestamp || '',
              lastActivity: lastMessage?.createdAtMs ?? conv.lastActivity,
              isHistoryLoaded: true
            }
          })
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải lịch sử chat.'
        setSnackbarSeverity('error')
        setSnackbarMessage(message)
      } finally {
        setLoadingHistoryFor((prev) => (prev === participantId ? null : prev))
      }
    },
    [mapApiMessageToUi]
  )

  const loadChatUsers = async () => {
    setIsLoadingChatUsers(true)
    setCreateChatError(null)
    try {
      const users = await getUsersForChat()
      setAvailableChatUsers(users)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách người dùng.'
      setCreateChatError(message)
      setSnackbarSeverity('error')
      setSnackbarMessage(message)
    } finally {
      setIsLoadingChatUsers(false)
    }
  }

  const handleOpenCreateChatDialog = () => {
    setCreateChatError(null)
    setSelectedChatUser(null)
    setInitialMessage('')
    setIsCreateChatOpen(true)
    if (!availableChatUsers.length) {
      loadChatUsers()
    }
  }

  const handleCloseCreateChatDialog = () => {
    setIsCreateChatOpen(false)
    setSelectedChatUser(null)
    setCreateChatError(null)
    setInitialMessage('')
  }

  const handleCreateChatConversation = async () => {
    if (!selectedChatUser) {
      setCreateChatError('Vui lòng chọn người dùng để bắt đầu đoạn chat.')
      return
    }

    if (!initialMessage.trim()) {
      setCreateChatError('Vui lòng nhập tin nhắn đầu tiên.')
      return
    }

    const participantId = Number(selectedChatUser.userId)
    if (Number.isNaN(participantId)) {
      setCreateChatError('ID người dùng không hợp lệ.')
      return
    }

    setIsCreatingChat(true)
    try {
      const apiMessage = await sendChatMessage({
        receiverId: selectedChatUser.userId,
        content: initialMessage.trim()
      })
      upsertConversationWithMessage(
        { id: participantId, name: selectedChatUser.fullName, role: selectedChatUser.role },
        apiMessage
      )
      setSelectedConversationId(participantId)
      setSnackbarSeverity('success')
      setSnackbarMessage(`Đã tạo đoạn chat với ${selectedChatUser.fullName}`)
      handleCloseCreateChatDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo đoạn chat.'
      setCreateChatError(message)
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarMessage(null)
  }

  // Common emoji reactions
  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏']

  // Emoji picker emojis
  const emojiPickerEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '😎',
    '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳',
    '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
    '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
    '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽',
    '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
    '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗',
    '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚',
    '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💥', '💫', '💦',
    '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋',
    '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟',
    '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
    '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
    '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
    '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'
  ]

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId)
  const isHistoryLoading =
    selectedConversation && loadingHistoryFor === selectedConversation.participantId
  const canSendMessage = Boolean(messageText.trim() || imagePreview) && !isSendingMessage

  // Reset scroll position when conversation changes
  useEffect(() => {
    if (messagesContainerRef.current && selectedConversation) {
      // Scroll to bottom (newest messages are at bottom)
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      prevMessagesLengthRef.current = selectedConversation.messages.length
    }
    // Reset image preview when conversation changes
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [selectedConversationId])

  // Scroll to bottom when new messages are added (newest messages are at bottom)
  useEffect(() => {
    const currentLength = selectedConversation?.messages.length || 0
    if (messagesContainerRef.current && currentLength > prevMessagesLengthRef.current) {
      // Scroll to bottom to show newest message
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
    prevMessagesLengthRef.current = currentLength
  }, [selectedConversation?.messages])

  const getConversationActivityScore = (conv: Conversation) => {
    if (conv.lastActivity) {
      return conv.lastActivity
    }
    const lastMessage = conv.messages[conv.messages.length - 1]
    return lastMessage ? lastMessage.createdAtMs ?? lastMessage.id : 0
  }

  const conversationUserIds = new Set(conversations.map((conv) => conv.participantId.toString()))

  // Filter conversations by search text and sort by last activity (newest first)
  const filteredConversations = conversations
    .filter((conv) => conv.participantName.toLowerCase().includes(searchText.toLowerCase().trim()))
    .sort((a, b) => getConversationActivityScore(b) - getConversationActivityScore(a))

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId)
    const selected = conversations.find((conv) => conv.id === conversationId)
    if (selected && !selected.isHistoryLoaded) {
      ensureConversationHistory(selected.participantId, selected.participantName)
    }
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map((msg) => ({ ...msg, isRead: true }))
          }
        }
        return conv
      })
    )
  }

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !imagePreview) || !selectedConversationId || isSendingMessage) return

    if (imagePreview) {
      setSnackbarSeverity('error')
      setSnackbarMessage('Tính năng gửi ảnh sẽ được cập nhật sau.')
      return
    }

    const selected = conversations.find((conv) => conv.id === selectedConversationId)
    if (!selected) return

    setIsSendingMessage(true)
    try {
      const apiMessage = await sendChatMessage({
        receiverId: selected.participantId.toString(),
        content: messageText.trim()
      })
      upsertConversationWithMessage(
        { id: selected.participantId, name: selected.participantName, role: selected.participantRole },
        apiMessage
      )
    setMessageText('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi tin nhắn.'
      setSnackbarSeverity('error')
      setSnackbarMessage(message)
    } finally {
      setIsSendingMessage(false)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSendingMessage) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiPickerAnchor(event.currentTarget)
  }

  const handleEmojiClose = () => {
    setEmojiPickerAnchor(null)
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessageText((prev) => prev + emoji)
    setEmojiPickerAnchor(null)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert('Kích thước file phải nhỏ hơn 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReactionClick = (messageId: number, event: React.MouseEvent<HTMLElement>) => {
    setReactionAnchorEl((prev) => ({
      ...prev,
      [messageId]: event.currentTarget
    }))
  }

  const handleReactionClose = (messageId: number) => {
    setReactionAnchorEl((prev) => ({
      ...prev,
      [messageId]: null
    }))
  }

  const handleAddReaction = (messageId: number, emoji: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: conv.messages.map((msg) => {
              if (msg.id === messageId) {
                const existingReactions = msg.reactions || []
                // Check if user already reacted with this emoji
                const existingReactionIndex = existingReactions.findIndex(
                  (r) => r.emoji === emoji && r.userId === currentUser.id
                )

                let newReactions: Reaction[]
                if (existingReactionIndex >= 0) {
                  // Remove reaction if already exists
                  newReactions = existingReactions.filter((_, index) => index !== existingReactionIndex)
                } else {
                  // Add new reaction
                  newReactions = [
                    ...existingReactions,
                    {
                      emoji,
                      userId: currentUser.id,
                      userName: currentUser.name
                    }
                  ]
                }

                return {
                  ...msg,
                  reactions: newReactions
                }
              }
              return msg
            })
          }
        }
        return conv
      })
    )

    handleReactionClose(messageId)
  }

  const getReactionCounts = (reactions: Reaction[] = []) => {
    const counts: { [key: string]: number } = {}
    reactions.forEach((reaction) => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1
    })
    return counts
  }

  return (
    <>
      <Box
        sx={{
          bgcolor: 'common.white',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
        }}
        className="rounded-3xl shadow-3xl overflow-hidden"
      >
        <Box className="flex h-[calc(100vh-20rem)]">
        {/* Conversations List */}
        <Box
          sx={{
            width: '40rem',
            borderRight: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.2), transparent)'
            }
          }}
        >
          {/* Search Bar */}
          <Box
            className="p-[1.6rem]!"
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 255, 0.9) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'column', md: 'row' }
              }}
            >
              <TextField
                fullWidth
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        fontSize="small"
                        sx={{
                          color: 'primary.main',
                          opacity: 0.7
                        }}
                      />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '1.2rem',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.4rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.08)',
                      borderWidth: '1.5px'
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                      '& fieldset': {
                        borderColor: 'primary.main'
                      }
                    },
                    '&.Mui-focused': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                      boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
                      '& fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: '2px'
                      }
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddCommentIcon />}
                onClick={handleOpenCreateChatDialog}
                disabled={isLoadingChatUsers}
                sx={{
                  minWidth: { xs: '100%', md: '18rem' },
                  borderRadius: '1.2rem',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)'
                  },
                  '&.Mui-disabled': {
                    background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                    boxShadow: 'none',
                    color: 'rgba(0,0,0,0.4)'
                  }
                }}
              >
                {isLoadingChatUsers ? 'Đang tải...' : 'Tạo đoạn chat'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.06)' }} />

          {/* Conversations */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.2)'
                }
              }
            }}
          >
            {isLoadingConversations ? (
              <Box className="p-[2.4rem]! flex justify-center!">
                <CircularProgress />
              </Box>
            ) : conversationError ? (
              <Box className="p-[2.4rem]!">
                <Alert severity="error">{conversationError}</Alert>
              </Box>
            ) : filteredConversations.length === 0 ? (
              <Box className="p-[2.4rem]! text-center!">
                <Typography
                  className="text-[1.4rem]!"
                  sx={{
                    color: 'text.secondary',
                    opacity: 0.7
                  }}
                >
                  Không tìm thấy cuộc trò chuyện nào
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    sx={{
                      cursor: 'pointer',
                      position: 'relative',
                      bgcolor:
                        selectedConversationId === conversation.id
                          ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(25, 118, 210, 0.08) 100%)'
                          : 'transparent',
                      '&::before': selectedConversationId === conversation.id
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            background: 'linear-gradient(180deg, #1976d2 0%, #42a5f5 100%)',
                            borderRadius: '0 4px 4px 0'
                          }
                        : {},
                      '&:hover': {
                        bgcolor:
                          selectedConversationId === conversation.id
                            ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.1) 100%)'
                            : 'rgba(25, 118, 210, 0.04)',
                        transform: 'translateX(2px)',
                        transition: 'all 0.2s ease'
                      },
                      borderBottom: '1px solid',
                      borderColor: 'rgba(0, 0, 0, 0.05)',
                      py: 1.5,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          border: '2px solid rgba(255, 255, 255, 0.8)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                          }
                        }}
                      >
                        {conversation.participantName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box className="flex items-center justify-between!">
                          <Typography
                            className="text-[1.4rem]! font-semibold!"
                            sx={{
                              color:
                                selectedConversationId === conversation.id
                                  ? 'primary.main'
                                  : 'text.primary',
                              fontWeight: conversation.unreadCount > 0 ? 700 : 600,
                              transition: 'color 0.2s ease'
                            }}
                          >
                            {conversation.participantName}
                          </Typography>
                          {conversation.unreadCount > 0 && (
                            <Chip
                              label={conversation.unreadCount}
                              size="small"
                              sx={{
                                height: '2.2rem',
                                fontSize: '1rem',
                                minWidth: '2.2rem',
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontWeight: 600,
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%, 100%': {
                                    opacity: 1
                                  },
                                  '50%': {
                                    opacity: 0.8
                                  }
                                }
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box className="flex items-center justify-between! mt-0.5!">
                          <Typography
                            className="text-[1.2rem]!"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '20rem',
                              fontWeight: conversation.unreadCount > 0 ? 500 : 400,
                              opacity: conversation.unreadCount > 0 ? 1 : 0.7
                            }}
                          >
                            {conversation.lastMessage}
                          </Typography>
                          <Typography
                            className="text-[1.1rem]!"
                            sx={{
                              color: 'text.secondary',
                              ml: 1,
                              opacity: 0.6,
                              fontWeight: 500
                            }}
                          >
                            {conversation.lastMessageTime}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Chat Interface */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'common.white',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(25, 118, 210, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(156, 39, 176, 0.03) 0%, transparent 50%)
              `,
              pointerEvents: 'none'
            }
          }}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2.5,
                  borderBottom: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  position: 'relative',
                  zIndex: 1
                }}
                className="flex items-center justify-between!"
              >
                <Box className="flex items-center gap-[1.2rem]!">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      border: '3px solid rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    {selectedConversation.participantName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography
                      className="text-[1.6rem]! font-semibold!"
                      sx={{
                        background: (theme) => theme.customBackgroundColor.main,
                        backgroundClip: 'text',
                        color: 'transparent',
                        mb: 0.5
                      }}
                    >
                      {selectedConversation.participantName}
                    </Typography>
                    <Chip
                      label={getRoleLabel(selectedConversation.participantRole)}
                      size="small"
                      color={getRoleColor(selectedConversation.participantRole) as any}
                      sx={{
                        height: '2.2rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Messages */}
              <Box
                ref={messagesContainerRef}
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 3,
                  position: 'relative',
                  zIndex: 0,
                  '&::-webkit-scrollbar': {
                    width: '6px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.2)'
                    }
                  }
                }}
              >
                <div ref={messagesStartRef} />
                {isHistoryLoading ? (
                  <Box className="flex justify-center items-center h-full">
                    <CircularProgress />
                  </Box>
                ) : selectedConversation.messages.length === 0 ? (
                  <Box className="flex justify-center items-center h-full">
                    <Typography
                      className="text-[1.4rem]!"
                      sx={{ color: 'text.secondary', opacity: 0.7 }}
                    >
                      Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện.
                    </Typography>
                  </Box>
                ) : (
                  selectedConversation.messages.map((message, index) => {
                  const isCurrentUser = message.senderId === currentUser.id
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        mb: 2.5,
                        animation: 'fadeIn 0.3s ease',
                        '@keyframes fadeIn': {
                          from: {
                            opacity: 0,
                            transform: 'translateY(10px)'
                          },
                          to: {
                            opacity: 1,
                            transform: 'translateY(0)'
                          }
                        },
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          gap: 1.5
                        }}
                      >
                        {!isCurrentUser && (
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                              border: '2px solid rgba(255, 255, 255, 0.9)'
                            }}
                          >
                            {message.senderName.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                        <Box
                          sx={{
                            position: 'relative',
                            '&:hover .reaction-button': {
                              opacity: 1
                            }
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              background: isCurrentUser
                                ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                                : 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                              color: isCurrentUser ? 'common.white' : 'text.primary',
                              borderRadius: '1.6rem',
                              borderTopLeftRadius: isCurrentUser ? '1.6rem' : '0.6rem',
                              borderTopRightRadius: isCurrentUser ? '0.6rem' : '1.6rem',
                              boxShadow: isCurrentUser
                                ? '0 4px 16px rgba(25, 118, 210, 0.3)'
                                : '0 2px 12px rgba(0, 0, 0, 0.08)',
                              border: isCurrentUser
                                ? 'none'
                                : '1px solid rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: isCurrentUser
                                  ? '0 6px 20px rgba(25, 118, 210, 0.4)'
                                  : '0 4px 16px rgba(0, 0, 0, 0.12)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            {!isCurrentUser && (
                              <Typography
                                className="text-[1.2rem]! font-semibold! mb-0.5!"
                                sx={{
                                  color: 'primary.main',
                                  mb: 0.5
                                }}
                              >
                                {message.senderName}
                              </Typography>
                            )}
                            {message.image && (
                              <Box
                                sx={{
                                  mb: message.content ? 1.5 : 0,
                                  borderRadius: '1.2rem',
                                  overflow: 'hidden',
                                  maxWidth: '100%',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                <img
                                  src={message.image}
                                  alt="Message attachment"
                                  style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    height: 'auto',
                                    display: 'block'
                                  }}
                                />
                              </Box>
                            )}
                            {message.content && (
                              <Typography
                                className="text-[1.4rem]! whitespace-pre-wrap!"
                                sx={{
                                  lineHeight: 1.6,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {message.content}
                              </Typography>
                            )}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                mt: 1.5,
                                gap: 1
                              }}
                            >
                              <Typography
                                className="text-[1rem]!"
                                sx={{
                                  color: isCurrentUser ? 'rgba(255,255,255,0.75)' : 'text.secondary',
                                  opacity: 0.8,
                                  fontSize: '1.1rem',
                                  fontWeight: 500
                                }}
                              >
                                {message.timestamp}
                              </Typography>
                              {!isCurrentUser && (
                                <Tooltip title="Thả cảm xúc" arrow>
                                  <IconButton
                                    className="reaction-button"
                                    size="small"
                                    onClick={(e) => handleReactionClick(message.id, e)}
                                    sx={{
                                      opacity: 0,
                                      transition: 'all 0.2s ease',
                                      color: 'primary.main',
                                      width: 28,
                                      height: 28,
                                      '&:hover': {
                                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                                        transform: 'scale(1.1)'
                                      }
                                    }}
                                  >
                                    <EmojiEmotionsIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Paper>

                          {/* Reactions Display */}
                          {!isCurrentUser && message.reactions && message.reactions.length > 0 && (
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 0.5,
                                mt: 0.5,
                                ml: 0.5,
                                flexWrap: 'wrap'
                              }}
                            >
                              {Object.entries(getReactionCounts(message.reactions)).map(([emoji, count]) => {
                                const hasUserReaction = message.reactions?.some(
                                  (r) => r.emoji === emoji && r.userId === currentUser.id
                                )
                                return (
                                  <Chip
                                    key={emoji}
                                    label={`${emoji} ${count}`}
                                    size="small"
                                    onClick={() => handleAddReaction(message.id, emoji)}
                                    sx={{
                                      height: '2.4rem',
                                      fontSize: '1.2rem',
                                      bgcolor: hasUserReaction
                                        ? 'rgba(25, 118, 210, 0.15)'
                                        : 'rgba(0, 0, 0, 0.06)',
                                      border: hasUserReaction
                                        ? '1.5px solid rgba(25, 118, 210, 0.3)'
                                        : '1px solid rgba(0, 0, 0, 0.1)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        bgcolor: hasUserReaction
                                          ? 'rgba(25, 118, 210, 0.25)'
                                          : 'rgba(0, 0, 0, 0.1)',
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                                      },
                                      '& .MuiChip-label': {
                                        px: 1,
                                        fontWeight: hasUserReaction ? 600 : 500
                                      }
                                    }}
                                  />
                                )
                              })}
                            </Box>
                          )}

                          {/* Reaction Picker Popover */}
                          {!isCurrentUser && (
                            <Popover
                              open={Boolean(reactionAnchorEl[message.id])}
                              anchorEl={reactionAnchorEl[message.id]}
                              onClose={() => handleReactionClose(message.id)}
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                              }}
                              transformOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left'
                              }}
                              PaperProps={{
                                sx: {
                                  p: 1,
                                  borderRadius: '1.6rem',
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 255, 0.98) 100%)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(0, 0, 0, 0.08)'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 0.5
                                }}
                              >
                                {commonReactions.map((emoji) => {
                                  const hasReaction = message.reactions?.some(
                                    (r) => r.emoji === emoji && r.userId === currentUser.id
                                  )
                                  return (
                                    <Tooltip key={emoji} title={hasReaction ? 'Gỡ cảm xúc' : 'Thả cảm xúc'} arrow>
                                      <IconButton
                                        onClick={() => handleAddReaction(message.id, emoji)}
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          fontSize: '2rem',
                                          bgcolor: hasReaction
                                            ? 'rgba(25, 118, 210, 0.15)'
                                            : 'transparent',
                                          border: hasReaction
                                            ? '2px solid rgba(25, 118, 210, 0.3)'
                                            : '1px solid transparent',
                                          transition: 'all 0.2s ease',
                                          '&:hover': {
                                            bgcolor: hasReaction
                                              ? 'rgba(25, 118, 210, 0.25)'
                                              : 'rgba(0, 0, 0, 0.05)',
                                            transform: 'scale(1.15)',
                                            borderColor: 'rgba(25, 118, 210, 0.4)'
                                          }
                                        }}
                                      >
                                        {emoji}
                                      </IconButton>
                                    </Tooltip>
                                  )
                                })}
                              </Box>
                            </Popover>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )
                  })
                )}
              </Box>

              {/* Message Input */}
              <Box
                sx={{
                  p: 2.5,
                  borderTop: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.04)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {/* Image Preview */}
                {imagePreview && (
                  <Box
                    sx={{
                      mb: 2,
                      position: 'relative',
                      display: 'inline-block',
                      borderRadius: '1.2rem',
                      overflow: 'hidden',
                      maxWidth: '300px'
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        maxHeight: '200px',
                        objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.8)'
                        }
                      }}
                    >
                      ×
                    </IconButton>
                  </Box>
                )}

                <Box className="flex items-center gap-[1.2rem]!">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <Tooltip title="Chọn ảnh" arrow>
                    <IconButton
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        color: 'primary.main',
                        width: 44,
                        height: 44,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <ImageIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chọn emoji" arrow>
                    <IconButton
                      onClick={handleEmojiClick}
                      sx={{
                        color: 'primary.main',
                        width: 44,
                        height: 44,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <InsertEmoticonIcon />
                    </IconButton>
                  </Tooltip>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Nhập tin nhắn..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '1.6rem',
                        fontSize: '1.4rem',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.08)',
                          borderWidth: '1.5px'
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 1)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                          '& fieldset': {
                            borderColor: 'primary.main'
                          }
                        },
                        '&.Mui-focused': {
                          bgcolor: 'rgba(255, 255, 255, 1)',
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!canSendMessage}
                    sx={{
                      background: canSendMessage
                        ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                        : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                      color: 'common.white',
                      width: 52,
                      height: 52,
                      boxShadow: canSendMessage ? '0 4px 16px rgba(25, 118, 210, 0.4)' : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: canSendMessage
                          ? 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)'
                          : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                        transform: 'scale(1.05)',
                        boxShadow: canSendMessage
                          ? '0 6px 20px rgba(25, 118, 210, 0.5)'
                          : 'none'
                      },
                      '&:active': {
                        transform: 'scale(0.95)'
                      },
                      '&.Mui-disabled': {
                        background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                        color: 'rgba(0, 0, 0, 0.4)'
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>

                {/* Emoji Picker Popover */}
                <Popover
                  open={Boolean(emojiPickerAnchor)}
                  anchorEl={emojiPickerAnchor}
                  onClose={handleEmojiClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                  }}
                  PaperProps={{
                    sx: {
                      p: 2,
                      borderRadius: '1.6rem',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 255, 0.98) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      maxWidth: '400px',
                      maxHeight: '400px',
                      overflow: 'auto'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gap: 1,
                      width: '100%'
                    }}
                  >
                    {emojiPickerEmojis.map((emoji, index) => (
                      <Tooltip key={index} title={emoji} arrow>
                        <IconButton
                          onClick={() => handleEmojiSelect(emoji)}
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: '2rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.1)',
                              transform: 'scale(1.2)'
                            }
                          }}
                        >
                          {emoji}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                </Popover>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                position: 'relative',
                zIndex: 0
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                      opacity: 1
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                      opacity: 0.8
                    }
                  }
                }}
              >
                <SearchIcon
                  sx={{
                    fontSize: 48,
                    color: 'primary.main',
                    opacity: 0.5
                  }}
                />
              </Box>
              <Typography
                className="text-[2rem]! font-semibold!"
                sx={{
                  background: (theme) => theme.customBackgroundColor.main,
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Chọn một cuộc trò chuyện để bắt đầu
              </Typography>
              <Typography
                className="text-[1.4rem]!"
                sx={{
                  color: 'text.secondary',
                  opacity: 0.7
                }}
              >
                Hoặc tìm kiếm cuộc trò chuyện trong danh sách bên trái
              </Typography>
            </Box>
          )}
        </Box>
        </Box>
      </Box>

      <Dialog
        open={isCreateChatOpen}
        onClose={handleCloseCreateChatDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="text-[2rem]! font-semibold!">
          Tạo đoạn chat mới
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            className="text-[1.4rem]!"
            sx={{ color: 'text.secondary', mb: 2 }}
          >
            Chọn người dùng trong hệ thống để bắt đầu trò chuyện riêng tư.
          </Typography>
          <Autocomplete
            options={availableChatUsers}
            loading={isLoadingChatUsers}
            value={selectedChatUser}
            onChange={(_, value) => {
              setCreateChatError(null)
              setSelectedChatUser(value)
            }}
            getOptionLabel={(option) => `${option.fullName} (${option.email})`}
            isOptionEqualToValue={(option, value) => option.userId === value?.userId}
            noOptionsText={isLoadingChatUsers ? 'Đang tải...' : 'Không tìm thấy người dùng'}
            renderOption={(props, option) => {
              const isExisting = conversationUserIds.has(option.userId)
              return (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography className="text-[1.4rem]! font-semibold!">
                      {option.fullName}
                    </Typography>
                    <Typography
                      className="text-[1.2rem]!"
                      sx={{ color: 'text.secondary' }}
                    >
                      {option.email}
                    </Typography>
                  </Box>
                  {isExisting && (
                    <Chip
                      label="Đã có đoạn chat"
                      size="small"
                      sx={{ fontSize: '1rem', fontWeight: 600 }}
                    />
                  )}
                </Box>
              )
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Người dùng"
                placeholder="Nhập tên hoặc email"
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingChatUsers ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
          <TextField
            label="Tin nhắn đầu tiên"
            placeholder="Nhập tin nhắn mở đầu"
            margin="normal"
            multiline
            minRows={2}
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
          />
          {createChatError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createChatError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseCreateChatDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreateChatConversation}
            disabled={isLoadingChatUsers || !selectedChatUser || isCreatingChat}
          >
            {isCreatingChat ? 'Đang tạo...' : 'Bắt đầu chat'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

