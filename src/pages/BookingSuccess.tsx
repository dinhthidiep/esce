import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface BookingSuccessState {
  bookingId: string
  tourTitle?: string
  date?: string
  total?: number
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as BookingSuccessState

  const { bookingId, tourTitle, date, total } = state

  return (
    <div className="min-h-screen bg-gray-50 flex items-center">
      <div className="max-w-2xl mx-auto w-full px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt tour thành công!</h1>
          <p className="text-gray-600 mb-6">Cảm ơn bạn đã đặt tour. Chúng tôi đã gửi thông tin xác nhận tới email của bạn.</p>

          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Mã đơn hàng</span>
              <span className="font-semibold text-gray-900">{bookingId || '—'}</span>
            </div>
            {tourTitle && (
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Tour</span>
                <span className="font-semibold text-gray-900">{tourTitle}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Ngày khởi hành</span>
                <span className="font-semibold text-gray-900">{new Date(date).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            {typeof total === 'number' && (
              <div className="flex items-center justify-between py-2 border-t border-gray-200 mt-2">
                <span className="text-gray-600">Tổng thanh toán</span>
                <span className="font-bold text-emerald-700">{formatPrice(total)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={() => navigate('/tours')}
            >
              Tiếp tục xem tour
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingSuccess



