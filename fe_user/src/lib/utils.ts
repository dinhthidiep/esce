// Utility functions

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

// Tạo slug từ name (Vietnamese to slug)
export const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

// Xử lý đường dẫn ảnh từ database
// Database có thể trả về đường dẫn public URL (/img/xxx.jpg) hoặc null/empty
// Function này sẽ đảm bảo đường dẫn ảnh luôn hợp lệ
export const getImageUrl = (imagePath: string | null | undefined, fallbackImage: string | null = null): string | null => {
  // Nếu không có đường dẫn, trả về fallback
  if (!imagePath || imagePath.trim() === '') {
    return fallbackImage
  }

  // Trim whitespace
  const trimmedPath = imagePath.trim()

  // Nếu đường dẫn đã là URL đầy đủ (http/https), trả về nguyên
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath
  }

  // Nếu đường dẫn bắt đầu bằng / (public URL), trả về nguyên
  // React sẽ tự động serve từ public folder
  if (trimmedPath.startsWith('/')) {
    return trimmedPath
  }

  // Nếu đường dẫn không có / ở đầu, thêm / để đảm bảo là public URL
  return `/${trimmedPath}`
}

