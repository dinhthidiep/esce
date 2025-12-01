// Centralized Error Handling
export const logError = (error, context = '') => {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
  
  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { tags: { context } });
};

export const handleApiError = (error) => {
  logError(error, 'API');
  
  // Return user-friendly error message
  if (error.response) {
    // Server responded with error
    return `Lỗi từ server: ${error.response.status}`;
  } else if (error.request) {
    // Request made but no response
    return 'Không thể kết nối đến server. Vui lòng thử lại sau.';
  } else {
    // Something else happened
    return 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
  }
};










