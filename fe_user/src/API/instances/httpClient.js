const backend_url_https = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7267'
const backend_url_http = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7267'

export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || ''
}

export const fetchWithFallback = async (url, options = {}, useHttps = true) => {
  const baseUrl = useHttps ? backend_url_https : backend_url_http
  const fullUrl = `${baseUrl}${url}`

  try {
    return await fetch(fullUrl, options)
  } catch (error) {
    if (
      useHttps &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError'))
    ) {
      console.warn('HTTPS failed, trying HTTP fallback...')
      return fetchWithFallback(url, options, false)
    }
    throw error
  }
}

export const extractErrorMessage = async (response, fallbackMessage) => {
  try {
    const bodyText = await response.text()
    if (!bodyText) {
      return fallbackMessage
    }

    try {
      const parsed = JSON.parse(bodyText)

      if (typeof parsed === 'string') {
        return parsed
      }

      if (parsed?.errors && typeof parsed.errors === 'object') {
        const fieldNameMap = {
          Fullname: 'Họ và tên',
          FullName: 'Họ và tên',
          Name: 'Họ và tên',
          UserEmail: 'Email',
          Phone: 'Số điện thoại',
          Avatar: 'Ảnh đại diện',
          DOB: 'Ngày sinh',
          Gender: 'Giới tính',
          Address: 'Địa chỉ',
          Password: 'Mật khẩu',
          RoleId: 'Vai trò',
          AccountId: 'ID tài khoản',
        }

        const collected = Object.entries(parsed.errors).flatMap(
          ([field, messages]) => {
            const displayField = fieldNameMap[field] || field

            if (Array.isArray(messages)) {
              return messages.map((msg) =>
                displayField ? `${displayField}: ${msg}` : msg
              )
            }

            return displayField ? `${displayField}: ${messages}` : messages
          }
        )

        if (collected.length) {
          return collected.join('\n')
        }
      }

      if (parsed?.message) {
        return parsed.message
      }

      if (parsed?.title) {
        return parsed.title
      }

      return fallbackMessage
    } catch {
      return bodyText
    }
  } catch (err) {
    console.warn('Failed to parse error body:', err)
    return fallbackMessage
  }
}

