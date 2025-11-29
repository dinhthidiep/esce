import { fetchWithFallback, extractErrorMessage, getAuthToken } from './httpClient'

type CertificateStatus = 'Pending' | 'Approved' | 'Rejected' | 'Review' | string | null | undefined

export type AgencyCertificate = {
  agencyId: number
  accountId: number
  companyName: string
  licenseFile: string
  phone: string
  email: string
  website?: string | null
  status?: CertificateStatus
  rejectComment?: string | null
  createdAt?: string
  updatedAt?: string
  userName?: string
  userEmail?: string
}

export type HostCertificate = {
  certificateId: number
  hostId: number
  businessLicenseFile: string
  businessName: string
  phone: string
  email: string
  status?: CertificateStatus
  rejectComment?: string | null
  createdAt?: string
  updatedAt?: string
  hostName?: string
  hostEmail?: string
}

export type CertificateType = 'Agency' | 'Host'

const ensureAuthHeaders = () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Vui lòng đăng nhập để tiếp tục.')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`
    throw new Error(await extractErrorMessage(response, fallbackMessage))
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

const normalizeAgencyCertificate = (payload: any): AgencyCertificate => ({
  agencyId: Number(payload?.agencyId ?? payload?.AgencyId ?? 0),
  accountId: Number(payload?.accountId ?? payload?.AccountId ?? 0),
  companyName: payload?.companyName ?? payload?.CompanyName ?? '',
  licenseFile: payload?.licenseFile ?? payload?.LicenseFile ?? '',
  phone: payload?.phone ?? payload?.Phone ?? '',
  email: payload?.email ?? payload?.Email ?? '',
  website: payload?.website ?? payload?.Website ?? null,
  status: payload?.status ?? payload?.Status ?? null,
  rejectComment: payload?.rejectComment ?? payload?.RejectComment ?? null,
  createdAt: payload?.createdAt ?? payload?.CreatedAt ?? null,
  updatedAt: payload?.updatedAt ?? payload?.UpdatedAt ?? null,
  userName: payload?.userName ?? payload?.UserName ?? '',
  userEmail: payload?.userEmail ?? payload?.UserEmail ?? ''
})

const normalizeHostCertificate = (payload: any): HostCertificate => ({
  certificateId: Number(payload?.certificateId ?? payload?.CertificateId ?? 0),
  hostId: Number(payload?.hostId ?? payload?.HostId ?? 0),
  businessLicenseFile: payload?.businessLicenseFile ?? payload?.BusinessLicenseFile ?? '',
  businessName: payload?.businessName ?? payload?.BusinessName ?? '',
  phone: payload?.phone ?? payload?.Phone ?? '',
  email: payload?.email ?? payload?.Email ?? '',
  status: payload?.status ?? payload?.Status ?? null,
  rejectComment: payload?.rejectComment ?? payload?.RejectComment ?? null,
  createdAt: payload?.createdAt ?? payload?.CreatedAt ?? null,
  updatedAt: payload?.updatedAt ?? payload?.UpdatedAt ?? null,
  hostName: payload?.hostName ?? payload?.HostName ?? '',
  hostEmail: payload?.hostEmail ?? payload?.HostEmail ?? ''
})

export const requestAgencyUpgrade = async (payload: {
  companyName: string
  licenseFile: string
  phone: string
  email: string
  website?: string
}) => {
  const response = await fetchWithFallback('/api/user/request-upgrade-to-agency', {
    method: 'POST',
    headers: ensureAuthHeaders(),
    body: JSON.stringify(payload)
  })
  await handleResponse(response)
}

export const requestHostUpgrade = async (payload: {
  businessName: string
  businessLicenseFile: string
  phone: string
  email: string
}) => {
  const response = await fetchWithFallback('/api/user/request-upgrade-to-host', {
    method: 'POST',
    headers: ensureAuthHeaders(),
    body: JSON.stringify(payload)
  })
  await handleResponse(response)
}

const buildQuery = (status?: string) => (status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '')

export const getAgencyCertificates = async (status?: string): Promise<AgencyCertificate[]> => {
  const response = await fetchWithFallback(`/api/user/agency-certificates${buildQuery(status)}`, {
    method: 'GET',
    headers: ensureAuthHeaders()
  })
  const result = await handleResponse<any[]>(response)
  return Array.isArray(result) ? result.map(normalizeAgencyCertificate) : []
}

export const getHostCertificates = async (status?: string): Promise<HostCertificate[]> => {
  const response = await fetchWithFallback(`/api/user/host-certificates${buildQuery(status)}`, {
    method: 'GET',
    headers: ensureAuthHeaders()
  })
  const result = await handleResponse<any[]>(response)
  return Array.isArray(result) ? result.map(normalizeHostCertificate) : []
}

export const getMyAgencyCertificate = async (): Promise<AgencyCertificate | null> => {
  const response = await fetchWithFallback('/api/user/my-agency-request', {
    method: 'GET',
    headers: ensureAuthHeaders()
  })
  const result = await handleResponse<any>(response)
  return result ? normalizeAgencyCertificate(result) : null
}

export const getMyHostCertificate = async (): Promise<HostCertificate | null> => {
  const response = await fetchWithFallback('/api/user/my-host-request', {
    method: 'GET',
    headers: ensureAuthHeaders()
  })
  const result = await handleResponse<any>(response)
  return result ? normalizeHostCertificate(result) : null
}

export const approveCertificate = async (payload: { certificateId: number; type: CertificateType }) => {
  const response = await fetchWithFallback('/api/user/approve-certificate', {
    method: 'PUT',
    headers: ensureAuthHeaders(),
    body: JSON.stringify({
      CertificateId: payload.certificateId,
      Type: payload.type
    })
  })
  await handleResponse(response)
}

export const rejectCertificate = async (payload: { certificateId: number; type: CertificateType; comment: string }) => {
  const response = await fetchWithFallback('/api/user/reject-certificate', {
    method: 'PUT',
    headers: ensureAuthHeaders(),
    body: JSON.stringify({
      CertificateId: payload.certificateId,
      Type: payload.type,
      Comment: payload.comment
    })
  })
  await handleResponse(response)
}

