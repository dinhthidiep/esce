const backend_url = "http://localhost:5002";

export const deleteServiceCombo = async (serviceComboId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${backend_url}/api/ServiceCombo/${serviceComboId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    let message = 'Failed to delete service combo';
    let errorDetails = null;
    
    try {
      const err = await response.json();
      console.error('Delete error response:', err);
      
      // Handle detailed error messages from backend
      if (err.message) {
        message = err.message;
      } else if (err.error) {
        message = err.error;
      } else if (typeof err === 'string') {
        message = err;
      } else {
        message = JSON.stringify(err);
      }
      
      // Store error details for debugging
      errorDetails = err;
    } catch (e) {
      console.error('Error parsing delete response:', e);
      // If JSON parsing fails, try to get text response
      try {
        const text = await response.text();
        message = text || message;
        console.error('Delete error text:', text);
      } catch (textError) {
        console.error('Error getting text response:', textError);
      }
    }

    // Handle specific HTTP status codes
    if (response.status === 401) {
      message = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
    } else if (response.status === 403) {
      message = 'Bạn không có quyền xóa combo dịch vụ này.';
    } else if (response.status === 404) {
      message = 'Không tìm thấy combo dịch vụ cần xóa.';
    } else if (response.status === 400) {
      // Bad request - might be foreign key constraint
      if (errorDetails && errorDetails.message) {
        message = errorDetails.message;
      }
    }

    const error = new Error(message);
    error.status = response.status;
    error.details = errorDetails;
    throw error;
  }

  return await response.json();
};
