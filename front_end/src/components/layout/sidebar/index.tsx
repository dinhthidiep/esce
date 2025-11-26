// import Box from "@mui/material/Box"
// import Typography from "@mui/material/Typography"
import { pxToRem } from '~/utils/convert-px-to-unit.utils'
import Drawer from '@mui/material/Drawer'
import { sidebarConfig } from './siderBarConfig'
import SideBarItem from './siderBarItem'
import List from '@mui/material/List'
import SideBarHeader from './sideBarHeader'
import { type Dispatch, type SetStateAction } from 'react'
import { useTheme } from '@mui/material/styles'
interface SideBarProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}
const SideBar = ({ open, setOpen }: SideBarProps) => {
  const theme = useTheme()
  return (
    <Drawer
      open={true}
      variant="persistent"
      anchor="left"
      sx={{
        width: open ? '100%' : theme.customLayout.closeSideBarSide,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? theme.customLayout.openSideBarSide : theme.customLayout.closeSideBarSide,
          transition: (theme) => theme.transitions.create('width'),
          overflowX: 'hidden',
          backgroundColor: 'common.white',
          borderRight: '1px solid',
          borderColor: 'grey.200'
        }
      }}
    >
      {/* HEADER */}
      <SideBarHeader open={open} setOpen={setOpen} />

      {/* LIST */}
      <List sx={{ px: pxToRem(16), pt: pxToRem(16) }}>
        {sidebarConfig.map((item) => (
          <SideBarItem key={item.path} data={item} open={open} />
        ))}
      </List>
    </Drawer>
  )
}

export default SideBar
