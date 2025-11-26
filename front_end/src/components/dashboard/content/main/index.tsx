import Box from '@mui/material/Box'
import ActivityCard from '~/components/common/ActivityCard'
import QuickStatic from '~/components/common/QuickStaticCard'
import { QuickStaticConfig } from './quickStaticConfig'
import PriorityTaskCard from '~/components/common/PriorityTaskCard'
import { PriorityTaskCardConfig } from './priorityTaskConfig'
import { PopularPostCardConfig } from './popularCardConfig'
import PopularPostCard from '~/components/common/PopularPostCard'
import { ActivityCardConfig } from './activityCardConfig'
import { UserActivityCardConfig } from './userActivityCardConfig'

export default function MainDashBoardContent() {
  return (
    <Box className="flex flex-col gap-[2.4rem]">
      <Box className="grid grid-cols-2 p-[2.4rem] gap-x-[2.4rem]">
        <ActivityCard {...ActivityCardConfig} />
        <QuickStatic {...QuickStaticConfig} />
      </Box>
      <Box className="grid grid-cols-3 gap-x-[2.4rem]">
        <PriorityTaskCard {...PriorityTaskCardConfig} />
        <PopularPostCard {...PopularPostCardConfig} />
        <PopularPostCard {...UserActivityCardConfig} />
      </Box>
    </Box>
  )
}
