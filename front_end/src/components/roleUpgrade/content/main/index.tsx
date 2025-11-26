import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import ChecklistIcon from '@mui/icons-material/Checklist'
import HistoryIcon from '@mui/icons-material/History'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import BlockIcon from '@mui/icons-material/Block'

type RequestStatus = 'pending' | 'approved' | 'rejected'

type HistoryStatus = 'submitted' | RequestStatus

type RequestHistoryEntry = {
  status: HistoryStatus
  timestamp: string
  note?: string
  reviewer?: string
}

type RoleUpgradeRequest = {
  id: number
  userId: number
  userName: string
  currentRole: string
  targetRole: string
  businessName: string
  businessAddress: string
  experience: string
  reason: string
  status: RequestStatus
  submittedAt: string
  reviewedAt?: string
  reviewerNote?: string
  history: RequestHistoryEntry[]
}

const mockRequests: RoleUpgradeRequest[] = [
  {
    id: 1,
    userId: 201,
    userName: 'Trần Thị B',
    currentRole: 'Tourist',
    targetRole: 'Travel agency',
    businessName: 'Travel Queen',
    businessAddress: '12 Nguyễn Huệ, Quận 1, TP.HCM',
    experience: '3 năm kinh nghiệm vận hành tour miền Nam',
    reason: 'Muốn quảng bá tour tự xây dựng trên nền tảng ESCE',
    status: 'approved',
    submittedAt: '2024-02-10 09:15',
    reviewedAt: '2024-02-12 14:20',
    reviewerNote: 'Đã xác minh giấy phép kinh doanh hợp lệ',
    history: [
      {
        status: 'submitted',
        timestamp: '2024-02-10 09:15',
        note: 'Người dùng gửi yêu cầu nâng cấp vai trò'
      },
      {
        status: 'approved',
        timestamp: '2024-02-12 14:20',
        note: 'Đã xác minh giấy phép kinh doanh hợp lệ',
        reviewer: 'Admin Hà'
      }
    ]
  },
  {
    id: 2,
    userId: 202,
    userName: 'Nguyễn Văn C',
    currentRole: 'Tourist',
    targetRole: 'Travel agency',
    businessName: 'GoExplore',
    businessAddress: '08 Lý Thường Kiệt, Hà Nội',
    experience: '5 năm tổ chức tour miền núi phía Bắc',
    reason: 'Cần quản lý booking tập trung và đồng bộ dữ liệu khách',
    status: 'pending',
    submittedAt: '2024-03-02 16:45',
    history: [
      {
        status: 'submitted',
        timestamp: '2024-03-02 16:45',
        note: 'Người dùng gửi yêu cầu và đính kèm giấy phép ĐKKD'
      }
    ]
  },
  {
    id: 3,
    userId: 203,
    userName: 'Phạm Gia Dũng',
    currentRole: 'Tourist',
    targetRole: 'Travel agency',
    businessName: 'Dũng Mekong Travel',
    businessAddress: '45 Lê Lợi, Cần Thơ',
    experience: '7 năm dẫn tour sông nước và ẩm thực miền Tây',
    reason: 'Cần kênh phân phối online để mở rộng thị trường quốc tế',
    status: 'pending',
    submittedAt: '2024-03-10 10:30',
    history: [
      {
        status: 'submitted',
        timestamp: '2024-03-10 10:30',
        note: 'Đã hoàn tất tờ khai đăng ký doanh nghiệp trên hệ thống'
      }
    ]
  },
  {
    id: 4,
    userId: 204,
    userName: 'Lê Thị Mai',
    currentRole: 'Tourist',
    targetRole: 'Host',
    businessName: 'Mai Homestay',
    businessAddress: '25 Đường Láng, Đống Đa, Hà Nội',
    experience: '2 năm kinh nghiệm quản lý homestay và tổ chức tour địa phương',
    reason: 'Muốn đăng ký homestay và tour trải nghiệm văn hóa địa phương',
    status: 'pending',
    submittedAt: '2024-03-15 11:20',
    history: [
      {
        status: 'submitted',
        timestamp: '2024-03-15 11:20',
        note: 'Người dùng gửi yêu cầu nâng cấp lên Host'
      }
    ]
  },
  {
    id: 5,
    userId: 205,
    userName: 'Hoàng Văn Đức',
    currentRole: 'Tourist',
    targetRole: 'Host',
    businessName: 'Đức Eco Lodge',
    businessAddress: '88 Phạm Văn Đồng, Đà Lạt',
    experience: '4 năm vận hành eco-lodge và tour trekking',
    reason: 'Cần nền tảng để quảng bá dịch vụ lưu trú và tour sinh thái',
    status: 'approved',
    submittedAt: '2024-03-01 08:30',
    reviewedAt: '2024-03-03 15:45',
    reviewerNote: 'Đã xác minh giấy phép kinh doanh và giấy phép lưu trú',
    history: [
      {
        status: 'submitted',
        timestamp: '2024-03-01 08:30',
        note: 'Người dùng gửi yêu cầu nâng cấp lên Host'
      },
      {
        status: 'approved',
        timestamp: '2024-03-03 15:45',
        note: 'Đã xác minh giấy phép kinh doanh và giấy phép lưu trú',
        reviewer: 'Admin Minh'
      }
    ]
  },
  {
    id: 6,
    userId: 206,
    userName: 'Võ Thị Lan',
    currentRole: 'Tourist',
    targetRole: 'Host',
    businessName: 'Lan Farmstay',
    businessAddress: '120 Quốc lộ 1A, Mỹ Tho, Tiền Giang',
    experience: '1 năm vận hành farmstay và tour nông nghiệp',
    reason: 'Muốn mở rộng kênh bán hàng và tiếp cận khách du lịch',
    status: 'rejected',
    submittedAt: '2024-02-25 14:00',
    reviewedAt: '2024-02-28 10:15',
    reviewerNote: 'Thiếu giấy phép kinh doanh và giấy chứng nhận an toàn thực phẩm',
    history: [
      {
        status: 'submitted',
        timestamp: '2024-02-25 14:00',
        note: 'Người dùng gửi yêu cầu nâng cấp lên Host'
      },
      {
        status: 'rejected',
        timestamp: '2024-02-28 10:15',
        note: 'Thiếu giấy phép kinh doanh và giấy chứng nhận an toàn thực phẩm',
        reviewer: 'Admin Hà'
      }
    ]
  }
]

const statusConfigs: Record<RequestStatus, { label: string; color: 'default' | 'primary' | 'success' | 'error'; helper: string }> = {
  pending: {
    label: 'Đang chờ duyệt',
    color: 'primary',
    helper: 'Admin sẽ phản hồi trong 1-3 ngày làm việc'
  },
  approved: {
    label: 'Đã phê duyệt',
    color: 'success',
    helper: 'Yêu cầu nâng cấp vai trò đã được phê duyệt'
  },
  rejected: {
    label: 'Bị từ chối',
    color: 'error',
    helper: 'Vui lòng bổ sung thông tin và gửi lại'
  }
}

const statusAccent: Record<RequestStatus, { border: string; background: string }> = {
  pending: {
    border: 'rgba(33, 150, 243, 0.35)',
    background: 'linear-gradient(120deg, rgba(33,150,243,0.04), rgba(33,150,243,0.12))'
  },
  approved: {
    border: 'rgba(76, 175, 80, 0.35)',
    background: 'linear-gradient(120deg, rgba(76,175,80,0.05), rgba(76,175,80,0.15))'
  },
  rejected: {
    border: 'rgba(244, 67, 54, 0.35)',
    background: 'linear-gradient(120deg, rgba(244,67,54,0.05), rgba(244,67,54,0.13))'
  }
}

const historyStatusConfigs: Record<HistoryStatus, { label: string; color: 'default' | 'primary' | 'success' | 'error' }> = {
  submitted: {
    label: 'Đã tiếp nhận',
    color: 'default'
  },
  pending: {
    label: 'Đang xử lý',
    color: 'primary'
  },
  approved: {
    label: 'Đã phê duyệt',
    color: 'success'
  },
  rejected: {
    label: 'Đã từ chối',
    color: 'error'
  }
}

const getReviewChecklist = (targetRole: string) => {
  if (targetRole === 'Host') {
    return [
      'Xác thực giấy phép kinh doanh dịch vụ lưu trú',
      'Đối chiếu thông tin người đại diện với CCCD',
      'Kiểm tra giấy chứng nhận an toàn thực phẩm (nếu có dịch vụ ăn uống)',
      'Xác minh địa chỉ kinh doanh và cơ sở vật chất',
      'Đảm bảo lý do nâng cấp phù hợp chính sách nền tảng'
    ]
  } else {
    return [
      'Xác thực giấy phép kinh doanh dịch vụ du lịch',
      'Đối chiếu thông tin người đại diện với CCCD',
      'Kiểm tra lịch sử hoạt động/đánh giá của doanh nghiệp',
      'Đảm bảo lý do nâng cấp phù hợp chính sách nền tảng'
    ]
  }
}

const escalationNotes = [
  'Phiếu chờ duyệt quá 3 ngày cần ưu tiên xử lý',
  'Khi thiếu giấy tờ, chủ động yêu cầu bổ sung qua email',
  'Từ chối nếu thông tin doanh nghiệp không thể xác minh'
]

export default function MainRoleUpgradeContent() {
  const [requests, setRequests] = useState<RoleUpgradeRequest[]>(mockRequests)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(mockRequests[0]?.id ?? null)
  const [reviewerNote, setReviewerNote] = useState('')
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? null,
    [requests, selectedRequestId]
  )

  useEffect(() => {
    if (!selectedRequest) {
      setReviewerNote('')
      return
    }
    setReviewerNote(selectedRequest.reviewerNote ?? '')
  }, [selectedRequest])

  const statusSummary = useMemo(() => {
    const pending = requests.filter((request) => request.status === 'pending').length
    const approved = requests.filter((request) => request.status === 'approved').length
    const rejected = requests.filter((request) => request.status === 'rejected').length

    return {
      total: requests.length,
      pending,
      approved,
      rejected
    }
  }, [requests])

  const handleStatusUpdate = (status: RequestStatus) => {
    if (!selectedRequest) {
      return
    }

    if (selectedRequest.status === status) {
      setAlertMessage({
        type: 'error',
        message: 'Phiếu đã ở trạng thái này.'
      })
      return
    }

    if (selectedRequest.status !== 'pending' && selectedRequest.status !== status) {
      setAlertMessage({
        type: 'error',
        message:
          selectedRequest.status === 'approved'
            ? 'Phiếu đã phê duyệt, không thể chuyển sang trạng thái khác.'
            : 'Phiếu đã từ chối, không thể phê duyệt lại.'
      })
      return
    }

    if (status === 'rejected' && !reviewerNote.trim()) {
      setAlertMessage({
        type: 'error',
        message: 'Vui lòng ghi chú lý do từ chối trước khi cập nhật.'
      })
      return
    }

    const updatedNote =
      reviewerNote.trim() ||
      (status === 'approved'
        ? `Đã phê duyệt yêu cầu trở thành ${selectedRequest.targetRole}.`
        : 'Đã cập nhật trạng thái phiếu.')

    const timestamp = new Date().toLocaleString('vi-VN')

    setRequests((prev) =>
      prev.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status,
              reviewerNote: updatedNote,
              reviewedAt: timestamp,
              history: [
                ...(request.history ?? []),
                {
                  status,
                  timestamp,
                  note: updatedNote,
                  reviewer: 'Trung tâm duyệt'
                }
              ]
            }
          : request
      )
    )

    setAlertMessage({
      type: 'success',
      message: status === 'approved' ? 'Đã phê duyệt phiếu.' : 'Đã từ chối phiếu.'
    })
  }

  const renderStatusChip = (status: RequestStatus) => {
    const config = statusConfigs[status]
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{
          fontSize: '1.1rem',
          height: 26
        }}
      />
    )
  }

  const renderHistoryIcon = (status: HistoryStatus) => {
    switch (status) {
      case 'approved':
        return <DoneAllIcon fontSize="small" />
      case 'rejected':
        return <BlockIcon fontSize="small" />
      case 'pending':
        return <HourglassEmptyIcon fontSize="small" />
      default:
        return <HistoryIcon fontSize="small" />
    }
  }

  return (
    <Box className="space-y-[2.8rem]">
      {alertMessage && (
        <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} sx={{ borderRadius: '1.2rem', fontSize: '1.4rem' }}>
          {alertMessage.message}
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: '2.8rem',
          boxShadow: '0px 20px 40px rgba(24, 94, 224, 0.25)',
          background: 'linear-gradient(135deg, #1d2671 0%, #7f5af0 55%, #21d4fd 100%)',
          color: 'common.white',
          overflow: 'hidden'
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={1.4}>
                <Typography className="text-[1.4rem]! uppercase! tracking-[0.3rem]! text-white/80!">
                  Trung tâm xét duyệt nâng cấp vai trò
                </Typography>
                <Typography className="text-[2.4rem]! font-semibold! leading-[1.3]!">
                  Theo dõi, xử lý và lưu vết toàn bộ phiếu nâng cấp từ Tourist lên Host hoặc Travel Agency.
                </Typography>
                <Typography className="text-[1.4rem]! text-white/80!">
                  Ưu tiên xử lý phiếu đủ hồ sơ trong vòng 24h để đảm bảo trải nghiệm doanh nghiệp.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip icon={<HourglassEmptyIcon sx={{ color: 'inherit' }} />} label={`Chờ duyệt: ${statusSummary.pending}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'common.white', fontSize: '1.2rem' }} />
                  <Chip icon={<DoneAllIcon sx={{ color: 'inherit' }} />} label={`Đã duyệt: ${statusSummary.approved}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'common.white', fontSize: '1.2rem' }} />
                  <Chip icon={<BlockIcon sx={{ color: 'inherit' }} />} label={`Từ chối: ${statusSummary.rejected}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'common.white', fontSize: '1.2rem' }} />
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {[
                  {
                    icon: <WorkspacePremiumIcon />,
                    label: 'Tổng phiếu',
                    value: statusSummary.total
                  },
                  {
                    icon: <HourglassEmptyIcon />,
                    label: 'Đang chờ',
                    value: statusSummary.pending
                  },
                  {
                    icon: <DoneAllIcon />,
                    label: 'Đã duyệt',
                    value: statusSummary.approved
                  },
                  {
                    icon: <BlockIcon />,
                    label: 'Đã từ chối',
                    value: statusSummary.rejected
                  }
                ].map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Box
                      sx={{
                        borderRadius: '1.6rem',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        p: 2,
                        border: '1px solid rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <Stack spacing={0.6}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.2)', width: 40, height: 40 }}>{item.icon}</Avatar>
                          <Typography className="text-[1.3rem]! font-medium! text-white/90!">{item.label}</Typography>
                        </Stack>
                        <Typography className="text-[2.4rem]! font-semibold!">{item.value}</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2.4}>
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: '2.4rem',
              boxShadow: 6,
              height: '100%',
              bgcolor: 'common.white'
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <HistoryIcon />
                </Avatar>
              }
              title={<Typography className="text-[1.8rem]! font-semibold!">Danh sách phiếu</Typography>}
              subheader={
                <Typography className="text-[1.3rem]! text-gray-500!">
                  Nhấn để xem chi tiết, ưu tiên xử lý phiếu chờ duyệt
                </Typography>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {requests.map((request) => {
                  const isSelected = request.id === selectedRequestId
                  return (
                    <Box
                      key={request.id}
                      onClick={() => setSelectedRequestId(request.id)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        p: 2.2,
                        borderRadius: '1.8rem',
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : statusAccent[request.status].border,
                        background: isSelected ? 'linear-gradient(135deg, rgba(125,111,255,0.1), rgba(93,231,255,0.18))' : statusAccent[request.status].background,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <Box className="flex items-center justify-between gap-[1.2rem] flex-wrap">
                        <Box>
                          <Typography className="font-semibold! text-[1.5rem]!">
                            {request.userName} • {request.businessName}
                          </Typography>
                          <Typography className="text-[1.3rem]! text-gray-600!">
                            {request.submittedAt} • {request.currentRole} → {request.targetRole}
                          </Typography>
                        </Box>
                        {renderStatusChip(request.status)}
                      </Box>
                      <Typography className="text-[1.3rem]! text-gray-700!">{request.reason}</Typography>
                      {request.experience && (
                        <Typography className="text-[1.2rem]! text-gray-600! italic!">{request.experience}</Typography>
                      )}
                      <Box className="flex items-center gap-[1rem] flex-wrap">
                        <Chip label={`Địa chỉ: ${request.businessAddress}`} size="small" sx={{ fontSize: '1.1rem', height: 24 }} />
                        <Tooltip title={statusConfigs[request.status].helper}>
                          <Typography className="text-[1.2rem]! text-gray-600!">
                            {statusConfigs[request.status].helper}
                          </Typography>
                        </Tooltip>
                      </Box>
                      {request.reviewerNote && (
                        <Alert
                          severity={request.status === 'approved' ? 'success' : 'warning'}
                          sx={{ borderRadius: '1rem', fontSize: '1.3rem', mt: 1 }}
                        >
                          Ghi chú Admin: {request.reviewerNote}
                          {request.reviewedAt ? ` • ${request.reviewedAt}` : ''}
                        </Alert>
                      )}
                    </Box>
                  )
                })}
                {requests.length === 0 && (
                  <Typography className="text-[1.4rem]! text-center! text-gray-500!">Chưa có phiếu nào được tạo.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card
            sx={{
              borderRadius: '2.4rem',
              boxShadow: 6,
              height: '100%',
              bgcolor: 'common.white'
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                  <WorkspacePremiumIcon />
                </Avatar>
              }
              title={<Typography className="text-[1.8rem]! font-semibold!">Chi tiết & hành động</Typography>}
              subheader={
                <Typography className="text-[1.3rem]! text-gray-500!">
                  Kiểm tra checklist, ghi chú và cập nhật trạng thái
                </Typography>
              }
            />
            <CardContent>
              {!selectedRequest ? (
                <Alert severity="info" sx={{ borderRadius: '1.2rem', fontSize: '1.4rem' }}>
                  Chưa có phiếu nào được chọn. Hãy chọn một phiếu trong danh sách.
                </Alert>
              ) : (
                <Stack spacing={2.4}>
                  <Box
                    sx={{
                      borderRadius: '1.6rem',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      p: 2,
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Stack spacing={0.6}>
                      <Typography className="text-[1.5rem]! font-semibold!">
                        {selectedRequest.userName} • {selectedRequest.businessName}
                      </Typography>
                      <Typography className="text-[1.3rem]! text-gray-600!">
                        {selectedRequest.currentRole} → {selectedRequest.targetRole}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                        <Chip icon={<HistoryIcon />} label={`Gửi: ${selectedRequest.submittedAt}`} size="small" sx={{ fontSize: '1.1rem', height: 28 }} />
                        {selectedRequest.reviewedAt && (
                          <Chip icon={<ChecklistIcon />} label={`Xử lý: ${selectedRequest.reviewedAt}`} size="small" sx={{ fontSize: '1.1rem', height: 28 }} />
                        )}
                        {renderStatusChip(selectedRequest.status)}
                      </Stack>
                    </Stack>
                  </Box>

                  <Divider textAlign="left">
                    <Typography className="text-[1.3rem]! text-gray-500! uppercase! tracking-[0.2rem]!">Thông tin doanh nghiệp</Typography>
                  </Divider>
                  <Stack spacing={1}>
                    <Typography className="text-[1.3rem]! text-gray-700!">
                      <strong>Địa chỉ:</strong> {selectedRequest.businessAddress}
                    </Typography>
                    {selectedRequest.experience && (
                      <Typography className="text-[1.3rem]! text-gray-700!">
                        <strong>Kinh nghiệm:</strong> {selectedRequest.experience}
                      </Typography>
                    )}
                    <Typography className="text-[1.3rem]! text-gray-700!">
                      <strong>Lý do:</strong> {selectedRequest.reason}
                    </Typography>
                  </Stack>

                  <Divider textAlign="left">
                    <Typography className="text-[1.3rem]! text-gray-500! uppercase! tracking-[0.2rem]!">
                      Checklist thẩm định ({selectedRequest.targetRole})
                    </Typography>
                  </Divider>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getReviewChecklist(selectedRequest.targetRole).map((item) => (
                      <Chip
                        key={item}
                        icon={<ChecklistIcon sx={{ fontSize: '1.6rem' }} />}
                        label={item}
                        variant="outlined"
                        sx={{ borderRadius: '2rem', fontSize: '1.2rem', borderColor: 'grey.200' }}
                      />
                    ))}
                  </Box>

                  <Divider textAlign="left">
                    <Typography className="text-[1.3rem]! text-gray-500! uppercase! tracking-[0.2rem]!">Ghi chú xử lý</Typography>
                  </Divider>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {escalationNotes.map((note) => (
                      <Chip
                        key={note}
                        color="warning"
                        variant="outlined"
                        label={note}
                        sx={{ borderRadius: '2rem', fontSize: '1.2rem', borderColor: 'warning.light' }}
                      />
                    ))}
                  </Box>

                  <Divider textAlign="left">
                    <Typography className="text-[1.3rem]! text-gray-500! uppercase! tracking-[0.2rem]!">
                      Lịch sử phê duyệt / từ chối
                    </Typography>
                  </Divider>
                  {selectedRequest.history.length === 0 ? (
                    <Typography className="text-[1.3rem]! text-gray-500!">Chưa ghi nhận lịch sử xử lý.</Typography>
                  ) : (
                    <Stack spacing={1.2}>
                      {selectedRequest.history.map((entry, index) => {
                        const config = historyStatusConfigs[entry.status]
                        return (
                          <Box
                            key={`${entry.status}-${entry.timestamp}-${index}`}
                            sx={{ borderRadius: '1rem', border: '1px dashed', borderColor: 'grey.200', p: 1.6, backgroundColor: 'grey.50' }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  icon={renderHistoryIcon(entry.status)}
                                  label={config.label}
                                  color={config.color}
                                  size="small"
                                  sx={{ fontSize: '1.1rem', height: 26 }}
                                />
                                <Typography className="text-[1.2rem]! text-gray-600!">{entry.timestamp}</Typography>
                              </Stack>
                              {entry.reviewer && (
                                <Typography className="text-[1.2rem]! text-gray-600! italic!">Reviewer: {entry.reviewer}</Typography>
                              )}
                            </Stack>
                            {entry.note && (
                              <Typography className="text-[1.3rem]! text-gray-700!" sx={{ mt: 0.6 }}>
                                {entry.note}
                              </Typography>
                            )}
                          </Box>
                        )
                      })}
                    </Stack>
                  )}

                  {selectedRequest.reviewedAt && selectedRequest.reviewerNote && (
                    <Alert severity="success" sx={{ borderRadius: '1rem', fontSize: '1.3rem' }}>
                      Ghi chú trước đó: {selectedRequest.reviewerNote} • {selectedRequest.reviewedAt}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={6}
                    label="Ghi chú cho người dùng"
                    placeholder="Tóm tắt lý do phê duyệt hoặc từ chối để gửi cho người dùng"
                    value={reviewerNote}
                    onChange={(event) => setReviewerNote(event.target.value)}
                    InputLabelProps={{ sx: { fontSize: '1.3rem' } }}
                    inputProps={{ style: { fontSize: '1.4rem' } }}
                  />

                  {selectedRequest.status !== 'pending' && (
                    <Alert severity="info" sx={{ borderRadius: '1rem', fontSize: '1.3rem' }}>
                      Phiếu đã được {selectedRequest.status === 'approved' ? 'phê duyệt' : 'từ chối'}. Không thể chuyển sang trạng thái khác.
                    </Alert>
                  )}

                  <Stack direction="row" spacing={1.2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      color="success"
                      disabled={selectedRequest.status !== 'pending'}
                      onClick={() => handleStatusUpdate('approved')}
                      sx={{ textTransform: 'none', fontSize: '1.4rem', borderRadius: '1rem', py: 1.2, px: 3 }}
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      disabled={selectedRequest.status !== 'pending'}
                      onClick={() => handleStatusUpdate('rejected')}
                      sx={{ textTransform: 'none', fontSize: '1.4rem', borderRadius: '1rem', py: 1.2, px: 3 }}
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => setReviewerNote('')}
                      sx={{ textTransform: 'none', fontSize: '1.4rem', borderRadius: '1rem', py: 1.2, px: 3 }}
                    >
                      Xoá ghi chú
                    </Button>
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
