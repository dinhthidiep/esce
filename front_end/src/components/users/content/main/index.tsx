import { useState, useMemo, useEffect, useRef } from 'react'
import { getAllUsers, banAccount, unbanAccount, updateUserByAdmin, sendNotificationToUser, deleteUser } from '~/api/instances/AdminManaUser'
import Box from '@mui/material/Box'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  Alert,
  Card,
  CardContent,
  Pagination,
  Stack
} from '@mui/material'
import type { ChipProps } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import BadgeIcon from '@mui/icons-material/Badge'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PhoneIcon from '@mui/icons-material/Phone'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import WcIcon from '@mui/icons-material/Wc'
import HomeIcon from '@mui/icons-material/Home'
import ImageIcon from '@mui/icons-material/Image'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import MessageIcon from '@mui/icons-material/Message'

type RoleType = 'Admin' | 'Host' | 'Agency' | 'Customer'
type ChipColor = NonNullable<ChipProps['color']>

// Type definition
type User = {
  id: number
  name: string
  email: string
  avatar: string | null
  phone: string | null
  dob: string | null
  gender: string | null
  address: string | null
  role: RoleType
  roleId?: number
  status: 'active' | 'blocked'
  joinDate: string
  verified: boolean
}

const DEFAULT_ROLE: RoleType = 'Customer'

const ROLE_LABELS: Record<RoleType, string> = {
  Admin: 'Admin',
  Host: 'Host',
  Agency: 'Agency',
  Customer: 'Customer'
}

const ROLE_FILTER_OPTIONS: { value: RoleType; label: string }[] = [
  { value: 'Host', label: ROLE_LABELS.Host },
  { value: 'Agency', label: ROLE_LABELS.Agency },
  { value: 'Customer', label: ROLE_LABELS.Customer }
]

const ROLE_CHIP_COLOR_MAP: Record<RoleType, ChipColor> = {
  Admin: 'warning',
  Host: 'secondary',
  Agency: 'primary',
  Customer: 'default'
}

const ROLE_ID_MAP: Record<number, RoleType> = {
  1: 'Admin',
  2: 'Host',
  3: 'Agency',
  4: 'Customer'
}

const ROLE_TO_ID_MAP: Record<RoleType, number> = {
  'Admin': 1,
  'Host': 2,
  'Agency': 3,
  'Customer': 4
}

const ROLE_NAME_MAP: Record<string, RoleType> = {
  admin: 'Admin',
  host: 'Host',
  agency: 'Agency',
  'travel agency': 'Agency',
  travelagency: 'Agency',
  customer: 'Customer',
  tourist: 'Customer'
}

// Helper function to map backend user data to frontend format
const mapBackendUserToFrontend = (backendUser: any): User => {
  // Back-end đang trả PascalCase (Name, Email, Role, ...), nhưng cũng giữ fallback cho camelCase
  const rolePayload = backendUser.Role ?? backendUser.role ?? {}
  const rawRoleName =
    rolePayload?.Name ??
    rolePayload?.name ??
    backendUser.RoleName ??
    backendUser.roleName ??
    (typeof backendUser.Role === 'string' ? backendUser.Role : null) ??
    (typeof backendUser.role === 'string' ? backendUser.role : null) ??
    null

  const rawRoleId =
    backendUser.RoleId ??
    backendUser.roleId ??
    rolePayload?.Id ??
    rolePayload?.id ??
    (typeof backendUser.RoleId === 'number' ? backendUser.RoleId : null)

  const normalizedRoleName =
    typeof rawRoleName === 'string' ? rawRoleName.trim().toLowerCase() : null

  const parsedRoleId =
    typeof rawRoleId === 'string'
      ? Number.parseInt(rawRoleId, 10)
      : typeof rawRoleId === 'number'
        ? rawRoleId
        : undefined

  const normalizedRoleId =
    typeof parsedRoleId === 'number' && !Number.isNaN(parsedRoleId)
      ? parsedRoleId
      : undefined

  const roleFromName = normalizedRoleName ? ROLE_NAME_MAP[normalizedRoleName] : undefined
  const roleFromId = typeof normalizedRoleId === 'number' ? ROLE_ID_MAP[normalizedRoleId] : undefined
  const resolvedRole: RoleType = roleFromName ?? roleFromId ?? DEFAULT_ROLE

  const isBanned = backendUser.IsBanned ?? backendUser.isBanned ?? false
  const isActive = backendUser.IsActive ?? backendUser.isActive ?? true

  const rawCreatedAt = backendUser.CreatedAt ?? backendUser.createdAt
  const joinDate = rawCreatedAt
    ? new Date(rawCreatedAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const rawId =
    backendUser.Id ??
    backendUser.id ??
    backendUser.AccountId ??
    backendUser.accountId ??
    0

  const parsedId =
    typeof rawId === 'string' ? Number.parseInt(rawId, 10) : rawId

  const normalizedId =
    typeof parsedId === 'number' && !Number.isNaN(parsedId) ? parsedId : 0

  const rawDob = backendUser.Dob ?? backendUser.dob ?? backendUser.DOB ?? null
  const dob = rawDob ? (typeof rawDob === 'string' ? rawDob : new Date(rawDob).toISOString().split('T')[0]) : null

  return {
    id: normalizedId,
    name: backendUser.Name ?? backendUser.name ?? '',
    email: backendUser.Email ?? backendUser.email ?? '',
    avatar: backendUser.Avatar ?? backendUser.avatar ?? null,
    phone: backendUser.Phone ?? backendUser.phone ?? null,
    dob: dob,
    gender: backendUser.Gender ?? backendUser.gender ?? null,
    address: backendUser.Address ?? backendUser.address ?? null,
    role: resolvedRole,
    roleId: normalizedRoleId,
    status: isBanned ? 'blocked' : isActive ? 'active' : 'blocked',
    joinDate,
    verified: Boolean(isActive && !isBanned)
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'blocked':
      return 'error'
    default:
      return 'default'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Hoạt động'
    case 'blocked':
      return 'Khóa'
    default:
      return status
  }
}

const getRoleLabel = (role: RoleType) => ROLE_LABELS[role] ?? role

export default function MainUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Action loading states
  const [actionLoading, setActionLoading] = useState(false)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(5)
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banReason, setBanReason] = useState('')
  const [unbanReason, setUnbanReason] = useState('')
  
  // Edit form state
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [editMessage, setEditMessage] = useState('')

  const resolvedName = editForm.name ?? selectedUser?.name ?? ''
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to reload users from API (only when necessary)
  const reloadUsersFromAPI = async (silent = false): Promise<boolean> => {
    try {
      if (!silent) setLoading(true)
      const data = await getAllUsers()
      
      if (!Array.isArray(data)) {
        console.warn('Reload returned non-array data:', typeof data)
        return false
      }
      
      if (data.length === 0) {
        console.warn('Reload returned empty array')
        return false
      }
      
      // Map each user individually to avoid losing all users if one fails
      const mappedUsers: User[] = []
      let hasErrors = false
      
      for (let i = 0; i < data.length; i++) {
        try {
          const mappedUser = mapBackendUserToFrontend(data[i])
          mappedUsers.push(mappedUser)
        } catch (mapErr: any) {
          console.error(`Failed to map user at index ${i}:`, mapErr)
          hasErrors = true
        }
      }
      
      if (mappedUsers.length > 0) {
        setUsers(mappedUsers)
        if (hasErrors) {
          console.warn(`Successfully mapped ${mappedUsers.length} out of ${data.length} users. Some users were skipped.`)
        }
        return true
      }
      
      return false
    } catch (err: any) {
      console.error('Failed to reload users:', err)
      if (!silent) {
        setError(err.message || 'Không thể tải lại danh sách người dùng')
      }
      return false
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllUsers()
        
        // Validate data is an array
        if (!Array.isArray(data)) {
          console.error('Invalid data format from API:', typeof data, data)
          setError('Dữ liệu từ server không hợp lệ. Vui lòng thử lại sau.')
          setUsers([])
          return
        }
        
        // Map users data - map each user individually to avoid losing all users if one fails
        const mappedUsers: User[] = []
        let hasErrors = false
        
        for (let i = 0; i < data.length; i++) {
          try {
            const mappedUser = mapBackendUserToFrontend(data[i])
            mappedUsers.push(mappedUser)
          } catch (mapErr: any) {
            console.error(`Failed to map user at index ${i}:`, mapErr, data[i])
            hasErrors = true
            // Continue mapping other users instead of stopping
          }
        }
        
        if (mappedUsers.length > 0) {
        setUsers(mappedUsers)
          if (hasErrors) {
            console.warn(`Successfully mapped ${mappedUsers.length} out of ${data.length} users. Some users were skipped due to mapping errors.`)
          }
        } else {
          // If no users could be mapped, show error
          console.error('No users could be mapped from API response')
          setError('Không thể xử lý dữ liệu người dùng. Vui lòng thử lại sau.')
          setUsers([])
        }
      } catch (err: any) {
        console.error('Failed to load users:', err)
        setError(err.message || 'Không thể tải danh sách người dùng')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Filter users based on search text (by name and email) and selected role
  const filteredUsers = useMemo(() => {
    const searchLower = searchText.toLowerCase().trim()
    
    return users.filter((user) => {
      // Always exclude Admin users from the list
      if (user.role === 'Admin') {
        return false
      }
      
      // Search by name or email
      const matchesSearch = searchLower === '' || 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)

      // Filter by role
      const matchesRole = selectedRole === null || user.role === selectedRole

      return matchesSearch && matchesRole
    })
  }, [users, searchText, selectedRole])

  // Calculate statistics from filtered users
  const statistics = useMemo(() => {
    const totalUsers = filteredUsers.length
    const verifiedUsers = filteredUsers.filter(u => u.verified).length
    const blockedUsers = filteredUsers.filter(u => u.status === 'blocked').length
    
    // Users mới: trong 30 ngày gần đây
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newUsers = filteredUsers.filter(u => {
      const joinDate = new Date(u.joinDate)
      return joinDate >= thirtyDaysAgo
    }).length

    return {
      total: totalUsers,
      new: newUsers,
      verified: verifiedUsers,
      blocked: blockedUsers
    }
  }, [filteredUsers])

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, page, rowsPerPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage)

  // Reset page when filter changes
  useEffect(() => {
    // Reset to page 1 when search or role filter changes
    setPage(1)
  }, [searchText, selectedRole])

  const handleRoleFilter = (role: RoleType) => {
    const newRole = role === selectedRole ? null : role
    setSelectedRole(newRole)
    // Page will reset automatically via useEffect
  }

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    // Page will reset automatically via useEffect
  }

  // Edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      role: user.role,
      status: user.status,
      verified: user.verified
    })
    // Set avatar preview if avatar exists
    setAvatarPreview(user.avatar || null)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setEditDialogOpen(true)
  }

  // Convert image to base64 (no compression, keep original quality)
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Handle avatar file upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh')
        return
      }

      try {
        // Convert image to base64 without compression - keep original quality
        const base64 = await convertImageToBase64(file)
        setAvatarPreview(base64)
        setEditForm({ ...editForm, avatar: base64 })
        setError(null)
      } catch (err: any) {
        console.error('Failed to process image:', err)
        setError('Không thể xử lý ảnh. Vui lòng thử lại.')
      }
    }
  }

  // Handle remove avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setEditForm({ ...editForm, avatar: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle close edit dialog
  const handleCloseEditDialog = () => {
    if (actionLoading) return // Prevent closing during action
    setEditDialogOpen(false)
    setAvatarPreview(null)
    setEditMessage('')
    setError(null) // Clear any errors when closing
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    // Validation
    const nameValue = editForm.name?.trim()
    if (nameValue !== undefined && nameValue.length < 2) {
      setError('Tên người dùng phải có ít nhất 2 ký tự')
      return
    }

    setActionLoading(true)
    setError(null)

    try {
      // Logic: verified và status phải đồng bộ
      // - Nếu verified = true thì status phải = active (và isBanned = false)
      // - Nếu verified = false thì có thể là blocked hoặc active nhưng chưa verify
      // - Trong edit form, verified được dùng để control status
      const verifiedValue = editForm.verified !== undefined 
        ? editForm.verified 
        : selectedUser.verified
      
      // Nếu verified = true, status phải là active
      // Nếu verified = false, giữ nguyên status hiện tại (có thể là active nhưng chưa verify, hoặc blocked)
      const resolvedStatus = verifiedValue 
        ? 'active' 
        : (editForm.status ?? selectedUser.status)
      
      const resolvedIsBanned = resolvedStatus === 'blocked'
      const resolvedRole = editForm.role ?? selectedUser.role
      const roleId = ROLE_TO_ID_MAP[resolvedRole]

      // Build payload with correct API format
      const payload: any = {
        isBanned: resolvedIsBanned
      }

      // Chỉ gửi các field đã thay đổi
      if (editForm.name !== undefined) {
        payload.name = nameValue || null
      }

      if (roleId !== undefined) {
        payload.roleId = roleId
      }

      if (editForm.avatar !== undefined) {
        payload.avatar = editForm.avatar === '' ? null : editForm.avatar
      }
      if (editForm.phone !== undefined) {
        payload.phone = editForm.phone === '' ? null : editForm.phone?.trim()
      }
      if (editForm.dob !== undefined) {
        payload.dob = editForm.dob === '' ? null : editForm.dob
      }
      if (editForm.gender !== undefined) {
        payload.gender = editForm.gender === '' ? null : editForm.gender?.trim()
      }
      if (editForm.address !== undefined) {
        payload.address = editForm.address === '' ? null : editForm.address?.trim()
      }

      await updateUserByAdmin(selectedUser.id, payload)

      // Optimistic update - update local state immediately
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name: editForm.name !== undefined ? (nameValue || user.name) : user.name,
                avatar: editForm.avatar !== undefined ? editForm.avatar : user.avatar,
                phone: editForm.phone !== undefined ? editForm.phone : user.phone,
                dob: editForm.dob !== undefined ? editForm.dob : user.dob,
                gender: editForm.gender !== undefined ? editForm.gender : user.gender,
                address: editForm.address !== undefined ? editForm.address : user.address,
                role: resolvedRole,
                roleId: roleId,
                status: resolvedStatus,
                verified: verifiedValue && resolvedStatus === 'active'
              }
            : user
        )
      )

      // Send notification if message is provided
      if (editMessage.trim()) {
        try {
          await sendNotificationToUser(
            selectedUser.id,
            editMessage.trim()
          )
        } catch (err: any) {
          console.error('Failed to send notification:', err)
          // Don't throw error, just log it - user update was successful
        }
      }

      // Close dialog and reset state
      setEditDialogOpen(false)
      setSelectedUser(null)
      setEditForm({})
      setEditMessage('')
      setAvatarPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // No need to reload - optimistic update is sufficient
      // Only reload if we suspect data inconsistency (optional)
    } catch (err: any) {
      console.error('Failed to update user:', err)
      setError(err.message || 'Không thể cập nhật người dùng')
      // On error, reload to get correct state from backend
      await reloadUsersFromAPI(true)
    } finally {
      setActionLoading(false)
    }
  }

  // Delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    // Store user data for potential rollback
    const userToDelete = selectedUser
    
    setActionLoading(true)
    setError(null)
      
    // Optimistic UI update: Close dialog and remove user from list immediately
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      
    // Update local state - remove deleted user from list immediately
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== userToDelete.id)
    )

    // Call API in background
    try {
      await deleteUser(userToDelete.id)
      // Success - user already removed from UI
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      // Rollback: Add user back to list if delete failed
      setUsers((prevUsers) => [...prevUsers, userToDelete])
      setError(err.message || 'Không thể xóa người dùng')
    } finally {
      setActionLoading(false)
    }
  }

  // Ban account (khóa tài khoản) - mở dialog
  const handleBanAccount = (user: User) => {
    setSelectedUser(user)
    setBanReason('')
    setBanDialogOpen(true)
  }

  // Confirm ban account
  const handleConfirmBan = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    setError(null)

    try {
      const reason = banReason.trim() || 'Tài khoản bị khóa bởi admin'
      await banAccount(selectedUser.id, reason)
      
      // Optimistic update - update local state immediately
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              status: 'blocked' as const,
              verified: false // Blocked users cannot be verified
            }
          }
          return user
        })
      })

      // Close dialog and reset state
      setBanDialogOpen(false)
      setSelectedUser(null)
      setBanReason('')
      
      // No need to reload - optimistic update is sufficient
    } catch (err: any) {
      console.error('Failed to ban account:', err)
      setError(err.message || 'Không thể khóa tài khoản')
      // On error, reload to get correct state from backend
      await reloadUsersFromAPI(true)
    } finally {
      setActionLoading(false)
    }
  }

  // Unban account (mở khóa tài khoản - hoạt động) - mở dialog
  const handleUnbanAccount = (user: User) => {
    setSelectedUser(user)
    setUnbanReason('')
    setUnbanDialogOpen(true)
  }

  // Confirm unban account
  const handleConfirmUnban = async () => {
    if (!selectedUser) return

    setActionLoading(true)
      setError(null)

    try {
      const reason = unbanReason.trim() || 'Tài khoản đã được mở khóa bởi admin'
      await unbanAccount(selectedUser.id, reason)
      
      // Optimistic update - update local state immediately
      // Note: Unbanning makes account active, but verified status depends on IsActive from backend
      // We'll set verified based on the original logic: active && !banned
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              status: 'active' as const,
              verified: true // Unbanned accounts are active, assume verified (backend will confirm)
            }
          }
          return user
        })
      })
      
      // Close dialog and reset state
      setUnbanDialogOpen(false)
      setSelectedUser(null)
      setUnbanReason('')
      
      // No need to reload - optimistic update is sufficient
    } catch (err: any) {
      console.error('Failed to unban account:', err)
      setError(err.message || 'Không thể mở khóa tài khoản')
      // On error, reload to get correct state from backend
      await reloadUsersFromAPI(true)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Box
      sx={{
        bgcolor: 'common.white'
      }}
      className="p-[2.4rem]! rounded-3xl shadow-3xl"
    >
      <Box className="flex items-center justify-start mb-[2.4rem]">
        <Typography
          sx={{
            background: (theme) => theme.customBackgroundColor.main,
            backgroundClip: 'text',
            color: 'transparent'
          }}
          className="text-[1.6rem]!"
        >
          Danh sách User
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2, borderRadius: '1.2rem' }}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box className="flex justify-center items-center py-[4.8rem]">
          <Typography className="text-[1.6rem]! text-gray-500">
            Đang tải danh sách người dùng...
          </Typography>
        </Box>
      )}

      {/* Statistics Cards */}
      <Box className="grid grid-cols-4 gap-[1.6rem] mb-[2.4rem]">
        <Card
          sx={{
            borderRadius: '1.6rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 0.5
                  }}
                >
                  Tổng số User
                </Typography>
                <Typography
                  sx={{
                    fontSize: '2.4rem',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {statistics.total}
                </Typography>
              </Box>
              <PeopleIcon
                sx={{
                  fontSize: '4rem',
                  color: 'rgba(255, 255, 255, 0.3)'
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: '1.6rem',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(245, 87, 108, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(245, 87, 108, 0.4)'
            }
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 0.5
                  }}
                >
                  Users mới
                </Typography>
                <Typography
                  sx={{
                    fontSize: '2.4rem',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {statistics.new}
                </Typography>
              </Box>
              <PersonAddIcon
                sx={{
                  fontSize: '4rem',
                  color: 'rgba(255, 255, 255, 0.3)'
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: '1.6rem',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(79, 172, 254, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(79, 172, 254, 0.4)'
            }
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 0.5
                  }}
                >
                  Đã xác thực
                </Typography>
                <Typography
                  sx={{
                    fontSize: '2.4rem',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {statistics.verified}
                </Typography>
              </Box>
              <CheckCircleIcon
                sx={{
                  fontSize: '4rem',
                  color: 'rgba(255, 255, 255, 0.3)'
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: '1.6rem',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(250, 112, 154, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(250, 112, 154, 0.4)'
            }
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 0.5
                  }}
                >
                  Đã khóa
                </Typography>
                <Typography
                  sx={{
                    fontSize: '2.4rem',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {statistics.blocked}
                </Typography>
              </Box>
              <LockIcon
                sx={{
                  fontSize: '4rem',
                  color: 'rgba(255, 255, 255, 0.3)'
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search and Filter Section */}
      <Box className="flex flex-col gap-[1.6rem] mb-[2.4rem]">
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
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
            Lọc theo vai trò:
          </Typography>
          <ButtonGroup variant="outlined" size="medium">
            {ROLE_FILTER_OPTIONS.map((option) => (
            <Button
                key={option.value}
                onClick={() => handleRoleFilter(option.value)}
                variant={selectedRole === option.value ? 'contained' : 'outlined'}
              sx={{
                borderRadius: '0.8rem',
                textTransform: 'none',
                px: 2
              }}
            >
                {option.label}
            </Button>
            ))}
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

      {!loading && (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell className="font-semibold!">User</TableCell>
              <TableCell className="font-semibold!">Email</TableCell>
              <TableCell className="font-semibold!">Vai trò</TableCell>
              <TableCell className="font-semibold!">Trạng thái</TableCell>
              <TableCell className="font-semibold!">Ngày tham gia</TableCell>
              <TableCell className="font-semibold!">Xác thực</TableCell>
              <TableCell className="font-semibold! text-center!">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" className="py-[3.2rem]!">
                  <Typography className="text-gray-500">
                    Không tìm thấy User nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box className="flex items-center gap-[1.2rem]">
                      <Avatar 
                        src={user.avatar || undefined}
                        sx={{ width: 40, height: 40 }}
                        onError={(e) => {
                          // Fallback to initial if image fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                      <Typography className="font-medium!">{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      size="small"
                      color={ROLE_CHIP_COLOR_MAP[user.role]}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(user.status)}
                      size="small"
                      color={getStatusColor(user.status) as 'success' | 'default' | 'error'}
                    />
                  </TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                      size="small"
                      color={user.verified ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center justify-center gap-[0.8rem]">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        title="Chỉnh sửa"
                        onClick={() => handleEditUser(user)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {user.status === 'blocked' ? (
                        <IconButton 
                          size="small" 
                          color="success" 
                          title="Mở khóa (Hoạt động)"
                          onClick={() => handleUnbanAccount(user)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'success.light',
                              color: 'white'
                            }
                          }}
                        >
                          <LockOpenIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton 
                          size="small" 
                          color="warning" 
                          title="Khóa tài khoản"
                          onClick={() => handleBanAccount(user)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'warning.light',
                              color: 'white'
                            }
                          }}
                        >
                          <LockIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        color="error" 
                        title="Xóa"
                        onClick={() => handleDeleteUser(user)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <Box className="flex justify-center mt-[2.4rem]">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1.4rem',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                    }
                  }
                }
              }}
            />
          </Stack>
        </Box>
      )}

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2.4rem',
            overflow: 'hidden'
          }
        }}
      >
        {/* Header với gradient background */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            position: 'relative'
          }}
        >
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-[1.6rem]">
              {selectedUser && (
                <>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      fontSize: '2.4rem',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {selectedUser.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        mb: 0.5,
                        color: 'white'
                      }}
                    >
                      Chỉnh sửa người dùng
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1.4rem',
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            <IconButton
              onClick={handleCloseEditDialog}
              size="small"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 4, bgcolor: 'grey.50' }}>
          <Box className="space-y-[3.6rem]">
            {/* Tên người dùng */}
            <Box>
              <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                <PersonIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.6
                  }}
                >
                  Thông tin cá nhân
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Tên người dùng"
                value={resolvedName}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'grey.400', fontSize: '2rem' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '1.2rem',
                    py: 0.5,
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      fontSize: '1.4rem',
                      lineHeight: 1.6
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.4rem',
                    lineHeight: 1.6
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main'
                  }
                }}
              />
            </Box>

            {/* Email */}
            <Box>
              <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                <EmailIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.6
                  }}
                >
                  Email
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Email"
                value={editForm.email || ''}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'grey.400', fontSize: '2rem' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  bgcolor: 'grey.100',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '1.2rem',
                    py: 0.5,
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      fontSize: '1.4rem',
                      lineHeight: 1.6
                    },
                    '& fieldset': {
                      borderColor: 'grey.300'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.4rem',
                    lineHeight: 1.6
                  }
                }}
              />
            </Box>

            {/* Avatar */}
              <Box>
                <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                <ImageIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.6
                    }}
                  >
                  Avatar
                  </Typography>
              </Box>

              {/* Avatar Preview */}
              {avatarPreview && (
                <Box
                    sx={{
                    mb: 2,
                    position: 'relative',
                    display: 'inline-block'
                    }}
                  >
                  <Avatar
                    src={avatarPreview}
                    alt="Avatar preview"
                    sx={{
                      width: 120,
                      height: 120,
                      border: '2px solid',
                        borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveAvatar}
                  sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.dark'
                    },
                      width: 32,
                      height: 32
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
            </Box>
              )}

              {/* Upload Button */}
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                  id="avatar-upload-input"
                />
                <label htmlFor="avatar-upload-input">
          <Button
                    component="span"
            variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
            sx={{
              borderRadius: '1.2rem',
                      py: 1.5,
              textTransform: 'none',
              fontSize: '1.4rem',
                      borderColor: 'primary.main',
                      color: 'primary.main',
              '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.light',
                        color: 'white'
              }
            }}
          >
                    {avatarPreview ? 'Thay đổi ảnh đại diện' : 'Tải ảnh đại diện lên'}
          </Button>
                </label>
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    textAlign: 'center'
                  }}
                >
                  Chọn file ảnh từ máy tính của bạn
                </Typography>
          </Box>
        </Box>

            {/* Phone và DOB - 2 cột */}
            <Box className="grid grid-cols-2 gap-[2.4rem]">
            <Box>
              <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                  <PhoneIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.6
                  }}
                >
                    Số điện thoại
                </Typography>
              </Box>
              <TextField
                fullWidth
                  label="Số điện thoại"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                        <PhoneIcon sx={{ color: 'grey.400', fontSize: '2rem' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '1.2rem',
                    py: 0.5,
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      fontSize: '1.4rem',
                      lineHeight: 1.6
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.4rem',
                    lineHeight: 1.6
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main'
                  }
                }}
              />
            </Box>

            <Box>
              <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                  <CalendarTodayIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.6
                  }}
                >
                    Ngày sinh
                </Typography>
              </Box>
              <TextField
                fullWidth
                  type="date"
                  label="Ngày sinh"
                  value={editForm.dob || ''}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  InputLabelProps={{
                    shrink: true
                  }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ color: 'grey.400', fontSize: '2rem' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '1.2rem',
                    py: 0.5,
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      fontSize: '1.4rem',
                      lineHeight: 1.6
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.4rem',
                    lineHeight: 1.6
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main'
                  }
                }}
              />
              </Box>
            </Box>

            {/* Gender và Address - 2 cột */}
            <Box className="grid grid-cols-2 gap-[2.4rem]">
              <Box>
                <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                  <WcIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.6
                    }}
                  >
                    Giới tính
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <Select
                    value={editForm.gender || ''}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value || null })}
                    displayEmpty
                  sx={{
                    bgcolor: 'white',
                      borderRadius: '1.2rem',
                      py: 0.5,
                      '& .MuiSelect-select': {
                        py: 1.5,
                        fontSize: '1.4rem',
                        lineHeight: 1.6
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                      fontSize: '1.4rem',
                            py: 1.2,
                      lineHeight: 1.6
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Không chọn</MenuItem>
                    <MenuItem value="Male">Nam</MenuItem>
                    <MenuItem value="Female">Nữ</MenuItem>
                    <MenuItem value="Other">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                  <HomeIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.6
                    }}
                  >
                    Địa chỉ
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ color: 'grey.400', fontSize: '2rem' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '1.2rem',
                      py: 0.5,
                      '& .MuiInputBase-input': {
                        py: 1.5,
                        fontSize: '1.4rem',
                        lineHeight: 1.6
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.4rem',
                      lineHeight: 1.6
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'primary.main'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Vai trò và Trạng thái - 2 cột */}
            <Box className="grid grid-cols-2 gap-[2.4rem]">
              <Box>
                <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                  <BadgeIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.6
                    }}
                  >
                    Vai trò
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <Select
                    value={editForm.role || DEFAULT_ROLE}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value as User['role'] })
                    }
                    sx={{
                      bgcolor: 'white',
                      borderRadius: '1.2rem',
                      py: 0.5,
                      '& .MuiSelect-select': {
                        py: 1.5,
                        fontSize: '1.4rem',
                        lineHeight: 1.6
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            fontSize: '1.4rem',
                            py: 1.2,
                            lineHeight: 1.6
                          }
                        }
                      }
                    }}
                  >
                    {ROLE_FILTER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

            </Box>

            {/* Xác thực */}
              <Box>
                <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                <VerifiedUserIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.6
                    }}
                  >
                  Trạng thái xác thực
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <Select
                  value={editForm.verified !== undefined 
                    ? (editForm.verified ? 'true' : 'false') 
                    : (selectedUser?.verified ? 'true' : 'false')}
                  onChange={(e) => {
                    const newVerified = e.target.value === 'true'
                    // Logic: Nếu verified = true thì status phải là active
                    // Nếu verified = false, giữ nguyên status hiện tại
                    setEditForm({ 
                      ...editForm, 
                      verified: newVerified,
                      status: newVerified ? 'active' : (editForm.status ?? selectedUser?.status ?? 'active')
                    })
                  }}
                    sx={{
                      bgcolor: 'white',
                      borderRadius: '1.2rem',
                      py: 0.5,
                      '& .MuiSelect-select': {
                        py: 1.5,
                        fontSize: '1.4rem',
                        lineHeight: 1.6
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            fontSize: '1.4rem',
                            py: 1.2,
                            lineHeight: 1.6
                          }
                        }
                      }
                    }}
                  >
                  <MenuItem value="true">Đã xác thực (Tài khoản hoạt động)</MenuItem>
                  <MenuItem value="false">Chưa xác thực</MenuItem>
                  </Select>
                </FormControl>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: '1.2rem',
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                Lưu ý: Tài khoản đã xác thực sẽ tự động được đặt trạng thái "Hoạt động"
              </Typography>
              </Box>

            {/* Tin nhắn gửi đến người dùng */}
            <Box>
              <Box className="flex items-center gap-[1.2rem] mb-[2rem]">
                <MessageIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.6
                  }}
                >
                  Tin nhắn gửi đến người dùng
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Nhập tin nhắn (tùy chọn)"
                placeholder="Nhập tin nhắn để gửi đến người dùng này..."
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '1.2rem',
                    bgcolor: 'white'
                  }
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            py: 3,
            gap: 1.5,
            bgcolor: 'white',
            borderTop: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Button
            onClick={handleCloseEditDialog}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 4,
              py: 1.2,
              fontSize: '1.4rem',
              fontWeight: 600,
              borderColor: 'grey.300',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'grey.50'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={actionLoading}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 4,
              py: 1.2,
              fontSize: '1.4rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
              },
              '&:disabled': {
                background: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            {actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!actionLoading) {
            setDeleteDialogOpen(false)
            setSelectedUser(null)
            setError(null)
          }
        }}
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
          Xác nhận xóa người dùng
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '1.2rem' }}>
                Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.
              </Alert>
              <Box className="flex items-center gap-[1.2rem] p-[1.6rem] bg-gray-50 rounded-[1.2rem]">
                <Avatar sx={{ width: 56, height: 56 }}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography className="font-semibold! text-[1.6rem]!">
                    {selectedUser.name}
                  </Typography>
                  <Typography className="text-[1.4rem]! text-gray-600">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              setSelectedUser(null)
              setError(null)
            }}
            disabled={actionLoading}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={actionLoading}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            {actionLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban Account Dialog */}
      <Dialog
        open={banDialogOpen}
        onClose={() => {
          if (!actionLoading) {
            setBanDialogOpen(false)
            setBanReason('')
            setSelectedUser(null)
            setError(null)
          }
        }}
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
          Khóa tài khoản
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '1.2rem' }}>
                Bạn có chắc chắn muốn khóa tài khoản này không? Người dùng sẽ nhận được thông báo về lý do khóa.
              </Alert>
              <Box className="flex items-center gap-[1.2rem] p-[1.6rem] bg-gray-50 rounded-[1.2rem] mb-[2rem]">
                <Avatar sx={{ width: 56, height: 56 }}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography className="font-semibold! text-[1.6rem]!">
                    {selectedUser.name}
                  </Typography>
                  <Typography className="text-[1.4rem]! text-gray-600">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Lý do khóa tài khoản"
                placeholder="Nhập lý do khóa tài khoản (sẽ được gửi đến người dùng)..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '1.2rem'
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => {
              setBanDialogOpen(false)
              setBanReason('')
              setSelectedUser(null)
              setError(null)
            }}
            disabled={actionLoading}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmBan}
            variant="contained"
            color="warning"
            disabled={actionLoading}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            {actionLoading ? 'Đang khóa...' : 'Khóa tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unban Account Dialog */}
      <Dialog
        open={unbanDialogOpen}
        onClose={() => {
          if (!actionLoading) {
            setUnbanDialogOpen(false)
            setUnbanReason('')
            setSelectedUser(null)
            setError(null)
          }
        }}
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
          Mở khóa tài khoản
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Alert severity="info" sx={{ mb: 2, borderRadius: '1.2rem' }}>
                Bạn có chắc chắn muốn mở khóa tài khoản này không? Tài khoản sẽ được kích hoạt lại và người dùng có thể đăng nhập bình thường.
              </Alert>
              <Box className="flex items-center gap-[1.2rem] p-[1.6rem] bg-gray-50 rounded-[1.2rem] mb-[2rem]">
                <Avatar sx={{ width: 56, height: 56 }}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography className="font-semibold! text-[1.6rem]!">
                    {selectedUser.name}
                  </Typography>
                  <Typography className="text-[1.4rem]! text-gray-600">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Lý do mở khóa tài khoản"
                placeholder="Nhập lý do mở khóa tài khoản (sẽ được gửi đến người dùng)..."
                value={unbanReason}
                onChange={(e) => setUnbanReason(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '1.2rem'
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => {
              setUnbanDialogOpen(false)
              setUnbanReason('')
              setSelectedUser(null)
              setError(null)
            }}
            disabled={actionLoading}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmUnban}
            variant="contained"
            color="success"
            disabled={actionLoading}
            sx={{
              textTransform: 'none',
              borderRadius: '1.2rem',
              px: 3
            }}
          >
            {actionLoading ? 'Đang mở khóa...' : 'Mở khóa tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

