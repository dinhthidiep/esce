const backend_url = "http://localhost:5002";

// Get Coupon by ID
export const getCouponById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`${backend_url}/api/Coupon/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let message = 'Failed to load coupon';
      try {
        const err = await response.json();
        message = err.message || message;
      } catch {}
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Get coupon failed:", error);
    throw error;
  }
};

// Update Coupon
export const updateCoupon = async (id, updateData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`${backend_url}/api/Coupon/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      let message = 'Failed to update coupon';
      let errorDetails = null;
      
      try {
        const err = await response.json();
        console.error('Update coupon error response:', err);
        message = err.message || err.error || message;
        errorDetails = err;
      } catch (e) {
        console.error('Error parsing update coupon response:', e);
        try {
          const text = await response.text();
          message = text || message;
        } catch (textError) {
          console.error('Error getting text response:', textError);
        }
      }

      // Handle specific HTTP status codes
      if (response.status === 401) {
        message = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      } else if (response.status === 400) {
        if (errorDetails && errorDetails.errors) {
          // Format validation errors
          const errorMessages = [];
          for (const [key, value] of Object.entries(errorDetails.errors)) {
            if (Array.isArray(value)) {
              errorMessages.push(`${key}: ${value.join(', ')}`);
            } else {
              errorMessages.push(`${key}: ${value}`);
            }
          }
          message = errorMessages.length > 0 
            ? `Validation errors: ${errorMessages.join('; ')}`
            : (errorDetails.message || message);
        } else if (errorDetails && errorDetails.message) {
          message = errorDetails.message;
        }
      } else if (response.status === 404) {
        message = 'Không tìm thấy coupon cần cập nhật.';
      }

      const error = new Error(message);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Update coupon failed:", error);
    throw error;
  }
};

