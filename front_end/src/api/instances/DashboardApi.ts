import { fetchWithFallback, extractErrorMessage, getAuthToken } from './httpClient'

export interface DashboardDto {
  totalUsers: number
  userGrowth: string
  totalPosts: number
  postGrowth: string
  pendingSupports: number
  totalViews: number
  todayComments: number
  todayReactions: number
  todayChatMessages: number
  unreadNotifications: number
  activeTours: number
  todayBookings: number
  recentActivities: ActivityDto[]
  urgentSupports: number
  pendingUpgradeRequests: number
  unreadMessages: number
  popularPosts: PopularPostDto[]
}

export interface ActivityDto {
  description: string
  timeAgo: string
  type: string
}

export interface PopularPostDto {
  id: number
  title: string
  authorName: string
  reactionsCount: number
  commentsCount: number
  createdAt: string | null
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

const normalizeDashboard = (payload: any): DashboardDto => ({
  totalUsers: payload?.totalUsers ?? payload?.TotalUsers ?? 0,
  userGrowth: payload?.userGrowth ?? payload?.UserGrowth ?? '',
  totalPosts: payload?.totalPosts ?? payload?.TotalPosts ?? 0,
  postGrowth: payload?.postGrowth ?? payload?.PostGrowth ?? '',
  pendingSupports: payload?.pendingSupports ?? payload?.PendingSupports ?? 0,
  totalViews: payload?.totalViews ?? payload?.TotalViews ?? 0,
  todayComments: payload?.todayComments ?? payload?.TodayComments ?? 0,
  todayReactions: payload?.todayReactions ?? payload?.TodayReactions ?? 0,
  todayChatMessages: payload?.todayChatMessages ?? payload?.TodayChatMessages ?? 0,
  unreadNotifications: payload?.unreadNotifications ?? payload?.UnreadNotifications ?? 0,
  activeTours: payload?.activeTours ?? payload?.ActiveTours ?? 0,
  todayBookings: payload?.todayBookings ?? payload?.TodayBookings ?? 0,
  recentActivities: (payload?.recentActivities ?? payload?.RecentActivities ?? []).map((item: any) => ({
    description: item?.description ?? item?.Description ?? '',
    timeAgo: item?.timeAgo ?? item?.TimeAgo ?? '',
    type: item?.type ?? item?.Type ?? ''
  })),
  urgentSupports: payload?.urgentSupports ?? payload?.UrgentSupports ?? 0,
  pendingUpgradeRequests: payload?.pendingUpgradeRequests ?? payload?.PendingUpgradeRequests ?? 0,
  unreadMessages: payload?.unreadMessages ?? payload?.UnreadMessages ?? 0,
  popularPosts: (payload?.popularPosts ?? payload?.PopularPosts ?? []).map((item: any) => ({
    id: item?.id ?? item?.Id ?? 0,
    title: item?.title ?? item?.Title ?? '',
    authorName: item?.authorName ?? item?.AuthorName ?? '',
    reactionsCount: item?.reactionsCount ?? item?.ReactionsCount ?? 0,
    commentsCount: item?.commentsCount ?? item?.CommentsCount ?? 0,
    createdAt: item?.createdAt ?? item?.CreatedAt ?? null
  }))
})

export const fetchDashboardData = async (): Promise<DashboardDto> => {
  const data = await authorizedRequest('/api/dashboard', {
    method: 'GET'
  })
  return normalizeDashboard(data)
}

