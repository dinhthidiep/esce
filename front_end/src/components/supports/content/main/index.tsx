import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import {
  Typography,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  TextField,
  Button,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import SendIcon from '@mui/icons-material/Send'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import PersonIcon from '@mui/icons-material/Person'

// Mock data - sau này sẽ thay bằng API call
type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'closed'

type Message = {
  id: number
  sender: {
    name: string
    role: string
  }
  content: string
  createdAt: string
  isAdmin: boolean
}

type SupportTicket = {
  id: number
  user: {
    name: string
    role: 'Tourist' | 'Host' | 'Travel agency'
    avatar?: string
  }
  subject: string
  content: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
  messages: Message[]
}

const mockTickets: SupportTicket[] = [
  {
    id: 1,
    user: {
      name: 'Nguyễn Văn A',
      role: 'Tourist'
    },
    subject: 'Không thể đăng nhập vào tài khoản',
    content: 'Tôi đã quên mật khẩu và không thể đăng nhập vào tài khoản. Tôi đã thử reset mật khẩu nhưng không nhận được email.',
    status: 'pending',
    createdAt: '2024-01-15 10:30',
    updatedAt: '2024-01-15 10:30',
    messages: []
  },
  {
    id: 2,
    user: {
      name: 'Trần Thị B',
      role: 'Host'
    },
    subject: 'Cần hỗ trợ về thanh toán',
    content: 'Tôi muốn hỏi về cách thức thanh toán cho các booking. Có thể thanh toán qua thẻ tín dụng không?',
    status: 'in_progress',
    createdAt: '2024-01-14 14:20',
    updatedAt: '2024-01-15 09:15',
    messages: [
      {
        id: 1,
        sender: {
          name: 'Admin',
          role: 'Admin'
        },
        content: 'Chào bạn, chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, chuyển khoản ngân hàng và ví điện tử.',
        createdAt: '2024-01-15 09:15',
        isAdmin: true
      }
    ]
  },
  {
    id: 3,
    user: {
      name: 'Lê Văn C',
      role: 'Travel agency'
    },
    subject: 'Vấn đề về hiển thị tour',
    content: 'Tour của tôi không hiển thị đúng trên trang chủ. Có thể kiểm tra giúp tôi không?',
    status: 'resolved',
    createdAt: '2024-01-13 16:45',
    updatedAt: '2024-01-14 11:30',
    messages: [
      {
        id: 1,
        sender: {
          name: 'Admin',
          role: 'Admin'
        },
        content: 'Chúng tôi đã kiểm tra và sửa lỗi hiển thị. Tour của bạn đã hiển thị đúng trên trang chủ.',
        createdAt: '2024-01-14 11:30',
        isAdmin: true
      },
      {
        id: 2,
        sender: {
          name: 'Lê Văn C',
          role: 'Travel agency'
        },
        content: 'Cảm ơn bạn đã hỗ trợ!',
        createdAt: '2024-01-14 12:00',
        isAdmin: false
      }
    ]
  },
  {
    id: 4,
    user: {
      name: 'Phạm Thị D',
      role: 'Tourist'
    },
    subject: 'Hỏi về chính sách hủy tour',
    content: 'Tôi muốn hủy tour đã đặt nhưng không biết chính sách hủy như thế nào. Có thể hoàn tiền không?',
    status: 'pending',
    createdAt: '2024-01-15 08:00',
    updatedAt: '2024-01-15 08:00',
    messages: []
  }
]

const getStatusLabel = (status: TicketStatus) => {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý'
    case 'in_progress':
      return 'Đang xử lý'
    case 'resolved':
      return 'Đã giải quyết'
    case 'closed':
      return 'Đã đóng'
    default:
      return status
  }
}

const getStatusColor = (status: TicketStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'in_progress':
      return 'info'
    case 'resolved':
      return 'success'
    case 'closed':
      return 'default'
    default:
      return 'default'
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'Tourist':
      return 'Tourist'
    case 'Host':
      return 'Chủ nhà'
    case 'Travel agency':
      return 'Đại lý du lịch'
    default:
      return role
  }
}

export default function MainSupportsContent() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets)
  const [searchText, setSearchText] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')

  const filteredTickets = useMemo(() => {
    if (!searchText.trim()) {
      return tickets
    }
    const searchLower = searchText.toLowerCase()
    return tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.content.toLowerCase().includes(searchLower) ||
        ticket.user.name.toLowerCase().includes(searchLower)
    )
  }, [tickets, searchText])

  const handleOpenDetail = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setDetailDialogOpen(true)
    setReplyMessage('')
  }

  const handleCloseDetail = () => {
    setDetailDialogOpen(false)
    setSelectedTicket(null)
    setReplyMessage('')
  }

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) {
      return
    }

    const newMessage: Message = {
      id: selectedTicket.messages.length + 1,
      sender: {
        name: 'Admin',
        role: 'Admin'
      },
      content: replyMessage.trim(),
      createdAt: new Date().toLocaleString('vi-VN'),
      isAdmin: true
    }

    // Update ticket with new message
    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      status: selectedTicket.status === 'pending' ? 'in_progress' : selectedTicket.status,
      updatedAt: new Date().toLocaleString('vi-VN')
    }

    // Update tickets list
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => (ticket.id === selectedTicket.id ? updatedTicket : ticket))
    )

    // Update selected ticket
    setSelectedTicket(updatedTicket)
    setReplyMessage('')

    // TODO: Gửi API request để lưu tin nhắn phản hồi
    console.log(`Gửi phản hồi cho ticket ${selectedTicket.id}`)
  }

  return (
    <Box>
      {/* Search Bar */}
      <Box className="mb-[2.4rem]">
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo chủ đề, nội dung hoặc tên người dùng..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'grey.500' }} />
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '1.2rem',
              bgcolor: 'common.white',
              fontSize: '1.4rem'
            }
          }}
        />
      </Box>

      {/* Tickets List */}
      <Box className="space-y-[1.6rem]">
        {filteredTickets.length === 0 ? (
          <Card
            sx={{
              bgcolor: 'common.white',
              borderRadius: '2.4rem',
              boxShadow: 3,
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography className="text-[1.6rem]! text-gray-500">
              Không tìm thấy phiếu hỗ trợ nào
            </Typography>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              onClick={() => handleOpenDetail(ticket)}
              sx={{
                bgcolor: 'common.white',
                borderRadius: '2.4rem',
                boxShadow: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                    {ticket.user.name.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title={
                  <Box className="flex items-center gap-[0.8rem] flex-wrap">
                    <Typography className="font-semibold! text-[1.4rem]!">
                      {ticket.user.name}
                    </Typography>
                    <Chip
                      label={getRoleLabel(ticket.user.role)}
                      size="small"
                      sx={{ height: 20, fontSize: '1rem' }}
                    />
                    <Chip
                      label={getStatusLabel(ticket.status)}
                      size="small"
                      color={getStatusColor(ticket.status)}
                      sx={{ height: 20, fontSize: '1rem' }}
                    />
                  </Box>
                }
                subheader={
                  <Typography className="text-[1.2rem]! text-gray-500">
                    {ticket.createdAt}
                  </Typography>
                }
              />
              <CardContent>
                <Typography className="font-semibold! text-[1.6rem]! mb-[0.8rem]!">
                  {ticket.subject}
                </Typography>
                <Typography
                  className="text-[1.4rem]! text-gray-600! line-clamp-2!"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {ticket.content}
                </Typography>
                {ticket.messages.length > 0 && (
                  <Box className="mt-[1.2rem]! flex items-center gap-[0.8rem]!">
                    <SupportAgentIcon sx={{ fontSize: '1.6rem', color: 'primary.main' }} />
                    <Typography className="text-[1.2rem]! text-primary!">
                      {ticket.messages.length} phản hồi
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.8rem',
            fontWeight: 600,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          Chi tiết phiếu hỗ trợ
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTicket && (
            <Box>
              {/* Ticket Info */}
              <Box className="mb-[2.4rem]">
                <Box className="flex items-center gap-[1.2rem] mb-[1.6rem]">
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                    {selectedTicket.user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box className="flex-1">
                    <Box className="flex items-center gap-[0.8rem] flex-wrap mb-[0.4rem]">
                      <Typography className="font-semibold! text-[1.6rem]!">
                        {selectedTicket.user.name}
                      </Typography>
                      <Chip
                        label={getRoleLabel(selectedTicket.user.role)}
                        size="small"
                        sx={{ height: 22, fontSize: '1.1rem' }}
                      />
                      <Chip
                        label={getStatusLabel(selectedTicket.status)}
                        size="small"
                        color={getStatusColor(selectedTicket.status)}
                        sx={{ height: 22, fontSize: '1.1rem' }}
                      />
                    </Box>
                    <Typography className="text-[1.2rem]! text-gray-500">
                      Tạo lúc: {selectedTicket.createdAt}
                    </Typography>
                    {selectedTicket.updatedAt !== selectedTicket.createdAt && (
                      <Typography className="text-[1.2rem]! text-gray-500">
                        Cập nhật: {selectedTicket.updatedAt}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Typography className="font-semibold! text-[1.8rem]! mb-[1.2rem]!">
                  {selectedTicket.subject}
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: '1.2rem',
                    mb: 2
                  }}
                >
                  <Typography className="text-[1.4rem]! whitespace-pre-wrap">
                    {selectedTicket.content}
                  </Typography>
                </Paper>
              </Box>

              <Divider className="my-[2.4rem]!" />

              {/* Messages */}
              <Typography className="font-semibold! text-[1.6rem]! mb-[1.6rem]!">
                Tin nhắn phản hồi ({selectedTicket.messages.length})
              </Typography>

              {selectedTicket.messages.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    bgcolor: 'grey.50',
                    borderRadius: '1.2rem'
                  }}
                >
                  <Typography className="text-[1.4rem]! text-gray-500">
                    Chưa có phản hồi nào
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2} className="mb-[2.4rem]!">
                  {selectedTicket.messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        flexDirection: message.isAdmin ? 'row-reverse' : 'row'
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: message.isAdmin ? 'primary.main' : 'grey.400'
                        }}
                      >
                        {message.isAdmin ? (
                          <SupportAgentIcon />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.isAdmin ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: message.isAdmin ? 'primary.main' : 'grey.200',
                            color: message.isAdmin ? 'white' : 'text.primary',
                            borderRadius: '1.2rem',
                            maxWidth: '80%'
                          }}
                        >
                          <Typography
                            className="text-[1.3rem]! font-semibold! mb-[0.4rem]!"
                            sx={{ color: message.isAdmin ? 'white' : 'text.primary' }}
                          >
                            {message.sender.name}
                          </Typography>
                          <Typography
                            className="text-[1.4rem]! whitespace-pre-wrap"
                            sx={{ color: message.isAdmin ? 'white' : 'text.primary' }}
                          >
                            {message.content}
                          </Typography>
                        </Paper>
                        <Typography
                          className="text-[1.1rem]! mt-[0.4rem]! text-gray-500"
                          sx={{ textAlign: message.isAdmin ? 'right' : 'left' }}
                        >
                          {message.createdAt}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Reply Input */}
              <Divider className="my-[2.4rem]!" />
              <Box>
                <Typography className="font-semibold! text-[1.6rem]! mb-[1.2rem]!">
                  Phản hồi
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Nhập phản hồi của bạn..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '1.2rem',
                      bgcolor: 'grey.50',
                      fontSize: '1.4rem'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '1.2rem',
                    px: 3,
                    fontSize: '1.4rem'
                  }}
                >
                  Gửi phản hồi
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Button
            onClick={handleCloseDetail}
            sx={{
              textTransform: 'none',
              fontSize: '1.4rem',
              borderRadius: '1.2rem',
              px: 2
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}






