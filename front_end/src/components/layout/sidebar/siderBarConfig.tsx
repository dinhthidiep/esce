import People from '@mui/icons-material/People'
import HomeIcon from '@mui/icons-material/Home'
import PostAddIcon from '@mui/icons-material/PostAdd'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import FeedIcon from '@mui/icons-material/Feed'
import HeadphonesIcon from '@mui/icons-material/Headphones'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import type { SideBarConfigType } from '~/types/menu'
export const sidebarConfig = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <HomeIcon />,
    badge: 0
  },
  {
    title: 'Quản lý Users',
    path: '/users',
    icon: <People />,
    badge: 2
  },
  {
    title: 'Bài viết',
    path: '/post',
    icon: <PostAddIcon />,
    badge: 0
  },
  
  {
    title: 'Chat',
    path: '/chat',
    icon: <ChatBubbleOutlineIcon />,
    badge: 5
  },
  {
    title: 'Tin tức',
    path: '/news',
    icon: <FeedIcon />,
    badge: 0
  },
  {
    title: 'Hỗ trợ',
    path: '/supports',
    icon: <HeadphonesIcon />,
    badge: 3
  },
  {
    title: 'Nâng cấp vai trò',
    path: '/role-upgrade',
    icon: <WorkspacePremiumIcon />,
    badge: 0
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: <AccountCircleIcon />,
    badge: 0
  }
  
] as SideBarConfigType[]
