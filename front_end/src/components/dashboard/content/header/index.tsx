import SummaryCard from '~/components/common/SummaryCard'
import headerDashboardConfig from './headerSummaryCardConfig'
import Box from '@mui/material/Box'
export default function HeaderDashBoardContent() {
  return (
    <Box className={'grid grid-cols-4 gap-[2.4rem]'}>
      {headerDashboardConfig.map((card) => (
        <SummaryCard {...card} />
      ))}
    </Box>
  )
}
