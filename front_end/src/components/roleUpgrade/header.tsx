import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'

export default function HeaderRoleUpgrade() {
  return (
    <Box
      className="text-center! py-[3.2rem]!"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5
      }}
    >
      <WorkspacePremiumIcon
        sx={{
          fontSize: '4rem',
          color: 'common.white',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))'
        }}
      />
      <Typography
        component="h2"
        sx={{
          fontSize: '3.2rem',
          fontWeight: 800,
          color: 'common.white',
          textShadow: 'rgba(0, 0, 0, 0.45) 2px 2px 6px'
        }}
      >
        Nâng cấp vai trò
      </Typography>
      <Typography
        sx={{
          fontSize: '1.8rem',
          fontWeight: 600,
          color: 'common.white',
          maxWidth: 640,
          textShadow: 'rgba(0, 0, 0, 0.35) 1px 1px 4px'
        }}
      >
        Cho phép người dùng gửi phiếu yêu cầu đến Admin để nâng cấp vai trò lên Host hoặc Travel Agency
      </Typography>
    </Box>
  )
}






