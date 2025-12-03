// Backend mới chạy trên port 5002 (HTTP) hoặc 7267 (HTTPS)
// Sử dụng biến môi trường VITE_API_URL nếu có, nếu không dùng default
const getBaseUrl = (useHttps = false) => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Nếu có env URL, xử lý để lấy base URL (bỏ /api nếu có)
    let baseUrl = envUrl.replace('/api', '');
    // Nếu env URL là HTTPS và cần HTTP, hoặc ngược lại
    if (!useHttps && baseUrl.startsWith('https://')) {
      baseUrl = baseUrl.replace('https://', 'http://');
      // Thay port 7267 thành 5002 cho HTTP
      baseUrl = baseUrl.replace(':7267', ':5002');
    } else if (useHttps && baseUrl.startsWith('http://')) {
      baseUrl = baseUrl.replace('http://', 'https://');
      // Thay port 5002 thành 7267 cho HTTPS
      baseUrl = baseUrl.replace(':5002', ':7267');
    }
    return baseUrl;
  }
  // Default: dùng HTTP port 5002 hoặc HTTPS port 7267
  return useHttps ? 'https://localhost:7267' : 'http://localhost:5002';
};

const backend_url_https = getBaseUrl(true)
const backend_url_http = getBaseUrl(false)

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


