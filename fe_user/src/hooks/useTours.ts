import { useState, useEffect, useCallback } from 'react'
import axiosInstance from '~/utils/axiosInstance'
import { API_ENDPOINTS } from '~/config/api'

interface Tour {
  Id?: number
  id?: number
  [key: string]: unknown
}

export const useTours = () => {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTours = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = API_ENDPOINTS.SERVICE_COMBO
      console.log('Đang gọi API:', url)

      const response = await axiosInstance.get(url)
      console.log('API Response:', response.data)

      if (response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          console.log(`Tìm thấy ${response.data.length} tour`)
          setTours(response.data)
        } else {
          console.warn('API trả về mảng rỗng')
          setTours([])
        }
      } else {
        console.warn('API response không phải là mảng:', response.data)
        setTours([])
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách tour:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
        // Server trả về response với status code lỗi
        console.error('Response status:', axiosError.response?.status)
        console.error('Response data:', axiosError.response?.data)
        setError(
          `Lỗi ${axiosError.response?.status}: ${axiosError.response?.data?.message || axiosError.message || 'Unknown error'}`
        )
      } else if (err && typeof err === 'object' && 'request' in err) {
        // Request đã được gửi nhưng không nhận được response
        console.error('Không nhận được response từ server')
        setError('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.')
      } else {
        // Lỗi khi setup request
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Lỗi setup request:', errorMessage)
        setError(errorMessage)
      }
      setTours([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTours()
  }, [fetchTours])

  return { tours, loading, error, refetch: fetchTours }
}

