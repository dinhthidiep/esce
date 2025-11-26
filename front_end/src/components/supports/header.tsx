import Box from '@mui/material/Box'

export default function HeaderSupports() {
  return (
    <>
      <Box className="text-center! py-[3.2rem]!">
        <h2 className="text-[3.6rem]! font-bold! text-white! drop-shadow-2xl! mb-2!">
          Quản lý Hỗ trợ
        </h2>

        <p
          className="text-[2rem]! font-semibold! text-white! drop-shadow-xl!"
          style={{
            textShadow: 'rgba(0, 0, 0, 0.7) 1px 1px 3px, rgba(234, 179, 8, 0.4) 0px 0px 8px'
          }}
        >
          Xem và phản hồi các phiếu hỗ trợ từ người dùng
        </p>
      </Box>
    </>
  )
}






