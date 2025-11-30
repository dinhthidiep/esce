import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import ActivityCard from '~/components/common/ActivityCard'
import QuickStatic from '~/components/common/QuickStaticCard'
import PriorityTaskCard from '~/components/common/PriorityTaskCard'
import PopularPostCard from '~/components/common/PopularPostCard'
import { fetchDashboardData, type DashboardDto } from '~/api/instances/DashboardApi'
import type {
  QuickStaticFeedProps,
  QuickStaticCardProps,
  ActivityFeedProps,
  ActivityCardProps,
  PriorityTaskCardFeedProps,
  PriorityTaskCardProps,
  PopularPostFeedProps,
  PopularPostProps
} from '~/types/common'

export default function MainDashBoardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchDashboardData()
        console.log('Dashboard main data loaded:', data)
        setDashboardData(data)
      } catch (error) {
        console.error('Error loading dashboard:', error)
        setError(error instanceof Error ? error.message : 'Không thể tải dữ liệu')
        // Set fallback data
        setDashboardData({
          totalUsers: 0,
          userGrowth: '',
          totalPosts: 0,
          postGrowth: '',
          pendingSupports: 0,
          totalViews: 0,
          todayComments: 0,
          todayReactions: 0,
          todayChatMessages: 0,
          unreadNotifications: 0,
          activeTours: 0,
          todayBookings: 0,
          recentActivities: [],
          urgentSupports: 0,
          pendingUpgradeRequests: 0,
          unreadMessages: 0,
          popularPosts: []
        })
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <Box className="flex flex-col gap-[2.4rem]">
        <Box className="grid grid-cols-2 p-[2.4rem] gap-x-[2.4rem]">
          <Box sx={{ height: '300px', bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ color: 'grey.400' }}>Đang tải...</Box>
          </Box>
          <Box sx={{ height: '300px', bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ color: 'grey.400' }}>Đang tải...</Box>
          </Box>
        </Box>
        <Box className="grid grid-cols-3 gap-x-[2.4rem]">
          <Box sx={{ height: '300px', bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ color: 'grey.400' }}>Đang tải...</Box>
          </Box>
          <Box sx={{ height: '300px', bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ color: 'grey.400' }}>Đang tải...</Box>
          </Box>
          <Box sx={{ height: '300px', bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ color: 'grey.400' }}>Đang tải...</Box>
          </Box>
        </Box>
      </Box>
    )
  }

  if (!dashboardData) {
    return (
      <Box className="flex flex-col gap-[2.4rem] p-[2.4rem]">
        <Box sx={{ p: 3, bgcolor: 'error.light', borderRadius: 2, color: 'error.main' }}>
          {error || 'Không thể tải dữ liệu Dashboard. Vui lòng thử lại sau.'}
        </Box>
      </Box>
    )
  }

  // Quick Static Config
  const quickStaticFeeds: QuickStaticFeedProps[] = [
    {
      title: 'Comments hôm nay',
      value: dashboardData.todayComments.toString(),
      valueClassName: 'bg-yellow-500'
    },
    {
      title: 'Reactions hôm nay',
      value: dashboardData.todayReactions.toString(),
      valueClassName: 'bg-yellow-500'
    },
    {
      title: 'Chat messages',
      value: dashboardData.todayChatMessages.toString(),
      valueClassName: 'bg-yellow-500'
    },
    {
      title: 'Thông báo chưa đọc',
      value: dashboardData.unreadNotifications.toString(),
      valueClassName: 'bg-red-500'
    },
    {
      title: 'Tours active',
      value: dashboardData.activeTours.toString(),
      valueClassName: 'bg-green-500'
    },
    {
      title: 'Bookings hôm nay',
      value: dashboardData.todayBookings.toString(),
      valueClassName: 'bg-yellow-500'
    }
  ]

  const quickStaticConfig: QuickStaticCardProps = {
    title: 'Thống kê nhanh',
    data: quickStaticFeeds
  }

  // Activity Config
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-green-500'
      case 'post':
        return 'bg-blue-500'
      case 'support':
        return 'bg-orange-500'
      case 'news':
        return 'bg-purple-500'
      case 'upgrade':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const activityFeeds: ActivityFeedProps[] = dashboardData.recentActivities.map((activity) => ({
    desc: activity.description,
    time: activity.timeAgo,
    markColorClassName: getActivityColor(activity.type)
  }))

  const activityConfig: ActivityCardProps = {
    data: activityFeeds.length > 0 ? activityFeeds : [
      {
        desc: 'Chưa có hoạt động nào',
        time: '',
        markColorClassName: 'bg-gray-500'
      }
    ],
    title: 'Hoạt động gần đây',
    bgClassName: 'bg-white'
  }

  // Priority Task Config
  const priorityTaskFeeds: PriorityTaskCardFeedProps[] = [
    {
      title: `${dashboardData.urgentSupports} tickets hỗ trợ`,
      subTitle: 'Chờ xử lí',
      status: 'Urgent',
      titleClassName: 'text-red-800',
      bgClassName: 'bg-red-50 border-red-200! border! border-solid',
      subTitleClassName: 'text-red-600',
      statusClassName: 'bg-red-600 border! border-solid! border-red-200!'
    },
    {
      title: `${dashboardData.pendingUpgradeRequests} yêu cầu nâng cấp`,
      titleClassName: 'text-yellow-800',
      subTitle: 'Chờ duyệt',
      subTitleClassName: 'text-yellow-600',
      status: 'Medium',
      statusClassName: 'bg-green-600 border! border-solid! border-yellow-200!',
      bgClassName: 'bg-yellow-50 border-yellow-200! border! border-solid'
    },
    {
      title: `${dashboardData.unreadMessages} tin nhắn chat`,
      titleClassName: 'text-blue-800',
      subTitle: 'Chưa đọc',
      subTitleClassName: 'text-blue-600',
      status: 'Low',
      statusClassName: 'bg-white! border! border-solid! border-green-600! text-green-600!',
      bgClassName: 'bg-blue-50 border-blue-200! border! border-solid'
    }
  ]

  const priorityTaskConfig: PriorityTaskCardProps = {
    title: 'Cần xử lý ưu tiên',
    data: priorityTaskFeeds
  }

  // Popular Posts Config
  const popularPostFeeds: PopularPostFeedProps[] = dashboardData.popularPosts.length > 0
    ? dashboardData.popularPosts.map((post) => ({
        title: post.title,
        subtitle: `${post.commentsCount} comments`,
        value: (
          <span className="text-[1.4rem]! font-medium!">
            {post.reactionsCount} ❤️
          </span>
        )
      }))
    : [
        {
          title: 'Chưa có bài viết nào',
          subtitle: '',
          value: <span className="text-[1.4rem]! font-medium!">-</span>
        }
      ]

  const popularPostConfig: PopularPostProps = {
    data: popularPostFeeds,
    title: 'Bài viết phổ biến'
  }

  // User Activity Config (using recent active users - simplified)
  const userActivityFeeds: PopularPostFeedProps[] = dashboardData.popularPosts.length > 0
    ? dashboardData.popularPosts.slice(0, 3).map((post) => ({
        title: post.authorName,
        subtitle: 'Author',
        value: (
          <span className="text-white text-[1.2rem]! bg-yellow-500 rounded-xl p-[0.2rem_0.8rem]! font-medium!">
            Active
          </span>
        )
      }))
    : [
        {
          title: 'Chưa có user nào',
          subtitle: '',
          value: (
            <span className="text-white text-[1.2rem]! bg-gray-500 rounded-xl p-[0.2rem_0.8rem]! font-medium!">
              -
            </span>
          )
        }
      ]

  const userActivityConfig: PopularPostProps = {
    data: userActivityFeeds,
    title: 'Users hoạt động'
  }

  return (
    <Box className="flex flex-col gap-[2.4rem]">
      <Box className="grid grid-cols-2 p-[2.4rem] gap-x-[2.4rem]">
        <ActivityCard {...activityConfig} />
        <QuickStatic {...quickStaticConfig} />
      </Box>
      <Box className="grid grid-cols-3 gap-x-[2.4rem]">
        <PriorityTaskCard {...priorityTaskConfig} />
        <PopularPostCard {...popularPostConfig} />
        <PopularPostCard {...userActivityConfig} />
      </Box>
    </Box>
  )
}

