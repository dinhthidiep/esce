import BaseButton from '~/components/common/BaseButton'
import { pxToRem } from '~/utils/convert-px-to-unit.utils'
import MenuIcon from '@mui/icons-material/Menu'
import type { Dispatch, SetStateAction } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface SideBarHeaderProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}
const SideBarHeader = ({ open, setOpen }: SideBarHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: pxToRem(16),
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        position: 'sticky',
        top: 0,
        bgcolor: 'common.white',
        zIndex: 1,
        minHeight: pxToRem(64),
        // Khi mini → chỉ giữ icon, căn giữa
        ...(open
          ? {}
          : {
              justifyContent: 'center',
              padding: (theme) => theme.customLayout.closePaddingSideBar
            })
      }}
    >
      {/* === TITLE – chỉ hiện khi open === */}
      <Typography
        sx={{
          fontSize: pxToRem(20),
          fontWeight: 600,
          background: (theme) => theme.customBackgroundColor.main,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: open ? 1 : 0,
          width: open ? 'auto' : 0,
          transition: 'opacity 0.2s ease, width 0.2s ease',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        Admin Panel
      </Typography>

      {/* === TOGGLE BUTTON – luôn hiện, căn giữa khi mini === */}
      <BaseButton
        onClick={() => setOpen((o) => !o)}
        sx={{
          minWidth: pxToRem(40),
          width: pxToRem(40),
          height: pxToRem(40),
          padding: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          color: 'common.black',
          '&:hover': {
            background: (theme) => theme.customBackgroundColor.hoverListItemColor,
            '& svg': {
              color: (theme) => theme.palette.success.dark
            }
          }
        }}
      >
        <MenuIcon
          sx={{
            fontSize: pxToRem(20),
            color: 'common.black',
            transition: 'transform 0.3s ease, color 0.2s ease',
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        />
      </BaseButton>
    </Box>
  )
}

export default SideBarHeader
