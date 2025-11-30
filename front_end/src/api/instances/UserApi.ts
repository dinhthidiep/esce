import { fetchWithFallback, extractErrorMessage, getAuthToken } from './httpClient'

export type UserProfile = {
  id: number
  name: string
  email: string
  avatar?: string
  phone?: string
  gender?: string
  address?: string
  dob?: string | null
  roleId?: number
  roleName?: string
}

export type UpdateProfilePayload = {
  Name: string
  Phone: string
  Avatar: string
  Gender: string
  Address: string
  DOB: string
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

const normalizeProfile = (payload: any): UserProfile => ({
  id: Number(payload?.id ?? payload?.Id ?? 0),
  name: payload?.name ?? payload?.Name ?? '',
  email: payload?.email ?? payload?.Email ?? '',
  avatar: payload?.avatar ?? payload?.Avatar ?? undefined,
  phone: payload?.phone ?? payload?.Phone ?? undefined,
  gender: payload?.gender ?? payload?.Gender ?? undefined,
  address: payload?.address ?? payload?.Address ?? undefined,
  dob:
    payload?.dob ??
    payload?.Dob ??
    payload?.dateOfBirth ??
    payload?.DateOfBirth ??
    (payload?.user?.dob ?? payload?.user?.Dob ?? null),
  roleId: payload?.roleId ?? payload?.RoleId ?? undefined,
  roleName: payload?.roleName ?? payload?.RoleName ?? undefined
})

export const fetchProfile = async () => {
  const result = await authorizedRequest('/api/user/profile', {
    method: 'GET'
  })
  return normalizeProfile(result)
}

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const result = await authorizedRequest('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  const normalizedUser = normalizeProfile(result?.user ?? result)
  return {
    message: result?.message ?? 'Cập nhật hồ sơ thành công',
    user: normalizedUser
  }
}

