import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import BadgeIcon from '@mui/icons-material/Badge'
import PhoneIcon from '@mui/icons-material/Phone'
import WcIcon from '@mui/icons-material/Wc'
import HomeIcon from '@mui/icons-material/Home'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { styled } from '@mui/material/styles'

interface UserInfo {
  id?: number
  name?: string
  fullName?: string
  email?: string
  role?: string
  roleName?: string
  avatar?: string
  phone?: string
  gender?: string
  address?: string
  dateOfBirth?: string
}

interface ViewProfileProps {
  onEdit: () => void
}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: '4px solid white',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  fontSize: '4rem',
  fontWeight: 600
}))

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1.6rem',
  padding: '1.6rem',
  borderRadius: '1.2rem',
  backgroundColor: '#f8f9fa',
  marginBottom: '1.6rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#e9ecef',
    transform: 'translateX(4px)'
  }
}))

export default function ViewProfile({ onEdit }: ViewProfileProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    role: 'Admin'
  })

  useEffect(() => {
    const getUserInfo = (): UserInfo => {
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
    setUserInfo(getUserInfo())
  }, [])

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  const getRoleDisplay = () => {
    if (userInfo.roleName) {
      return userInfo.roleName
    }
    if (userInfo.role) {
      return userInfo.role
    }
    return 'Admin'
  }

  const getGenderDisplay = () => {
    if (!userInfo.gender) return 'Chưa cập nhật'
    const gender = userInfo.gender.toLowerCase()
    if (gender === 'male' || gender === 'nam') return 'Nam'
    if (gender === 'female' || gender === 'nữ' || gender === 'nu') return 'Nữ'
    if (gender === 'other' || gender === 'khác' || gender === 'khac') return 'Khác'
    return userInfo.gender
  }

  const formatDateDisplay = (date?: string) => {
    if (!date) return 'Chưa cập nhật'
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
      return date
    }
    return parsedDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Box>
      <Card
        sx={{
          bgcolor: 'white',
          borderRadius: '2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header với gradient */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 6,
            px: 4,
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <StyledAvatar
                src={userInfo.avatar}
                alt={userInfo.name || userInfo.fullName || 'User'}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
              >
                {!userInfo.avatar && getInitials(userInfo.name || userInfo.fullName || 'User')}
              </StyledAvatar>
            </Box>
            <Typography
              sx={{
                fontSize: '2.8rem',
                fontWeight: 700,
                color: 'white',
                mb: 0.5,
                textAlign: 'center'
              }}
            >
              {userInfo.name || userInfo.fullName || 'Người dùng'}
            </Typography>
            <Typography
              sx={{
                fontSize: '1.6rem',
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center'
              }}
            >
              {getRoleDisplay()}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Nút chỉnh sửa */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <IconButton
              onClick={onEdit}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              <EditIcon sx={{ fontSize: '2.4rem' }} />
            </IconButton>
          </Box>

          {/* Thông tin chi tiết */}
          <Box>
            <InfoItem>
              <PersonIcon sx={{ color: 'primary.main', fontSize: '2.4rem' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    mb: 0.5
                  }}
                >
                  Tên người dùng
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {userInfo.name || userInfo.fullName || 'Chưa có tên'}
                </Typography>
              </Box>
            </InfoItem>

            <InfoItem>
              <EmailIcon sx={{ color: 'primary.main', fontSize: '2.4rem' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    mb: 0.5
                  }}
                >
                  Email
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {userInfo.email || 'Chưa có email'}
                </Typography>
              </Box>
            </InfoItem>

            <InfoItem>
              <BadgeIcon sx={{ color: 'primary.main', fontSize: '2.4rem' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    mb: 0.5
                  }}
                >
                  Vai trò
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {getRoleDisplay()}
                </Typography>
              </Box>
            </InfoItem>

            <InfoItem>
              <PhoneIcon sx={{ color: 'primary.main', fontSize: '2.4rem' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    mb: 0.5
                  }}
                >
                  Số điện thoại
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {userInfo.phone || 'Chưa cập nhật'}
                </Typography>
              </Box>
            </InfoItem>

            <InfoItem>
              <WcIcon sx={{ color: 'primary.main', fontSize: '2.4rem' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    mb: 0.5
                  }}
                >
                  Giới tính
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {getGenderDisplay()}
                </Typography>
              </Box>
            </InfoItem>

            <InfoItem>
              <HomeIcon sx={{ color: 'primary.main', fontSize: '2.4rem' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    mb: 0.5
                  }}
                >
                  Địa chỉ
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {userInfo.address || 'Chưa cập nhật'}
                </Typography>
              </Box>
            </InfoItem>

            <InfoItem>
              <CalendarTodayIcon sx={{ color: 'primary.main', fontSize: '2.4rem' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    mb: 0.5
                  }}
                >
                  Ngày sinh
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {formatDateDisplay(userInfo.dateOfBirth)}
                </Typography>
              </Box>
            </InfoItem>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

