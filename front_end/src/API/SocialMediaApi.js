const backend_url = "http://localhost:5002";

// Get comments by post ID API
export const getCommentsByPostId = async (postId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`${backend_url}/api/Comment/post/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let message = 'Failed to load comments';
      let errorDetails = null;

      const contentType = response.headers.get('content-type');
      let responseText = '';

      try {
        responseText = await response.text();

        if (contentType && contentType.includes('application/json') && responseText) {
          try {
            const err = JSON.parse(responseText);
            console.error('Get comments error response:', err);
            message = err.message || err.error || message;
            errorDetails = err;
          } catch (parseError) {
            message = responseText || message;
          }
        } else if (responseText) {
          message = responseText || message;
        }
      } catch (e) {
        console.error('Error reading response:', e);
      }

      if (response.status === 401) {
        message = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      } else if (response.status === 404) {
        // 404 means no comments found, return empty array instead of throwing
        return [];
      } else if (response.status === 500) {
        message = 'Lỗi server. Vui lòng thử lại sau.';
      }

      // Only throw error for non-404 status codes
      if (response.status !== 404) {
        const error = new Error(message);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }
      
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && text.trim()) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error('Error parsing successful response:', parseError);
          return [];
        }
      }
      return [];
    }
    return [];
  } catch (error) {
    console.error("Get comments failed:", error);
    throw error;
  }
};

// Get current user profile API
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // Return null instead of throwing - component will use localStorage
      return null;
    }

    // Get user ID from token or localStorage
    const userInfo = localStorage.getItem('userInfo');
    let userId = null;
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        userId = user.Id || user.id;
      } catch (e) {
        console.error('Error parsing userInfo:', e);
      }
    }

    if (!userId) {
      // Return null instead of throwing - component will use localStorage
      return null;
    }

    // Use AbortController with timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${backend_url}/api/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If not OK, return null - component will use localStorage
        return null;
      }

      // Try to read response - if it fails due to size, return null
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text && text.trim()) {
            try {
              return JSON.parse(text);
            } catch (parseError) {
              console.error('Error parsing get current user response:', parseError);
              return null;
            }
          }
          return null;
        }
        return null;
      } catch (readError) {
        // If reading fails (e.g., Content-Length mismatch), return null
        console.error('Error reading user response (likely too large):', readError);
        return null;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Silently handle network errors - component will use localStorage
      // Only log if it's not a network/CORS error (which are expected in some scenarios)
      if (fetchError.name === 'AbortError') {
        // Timeout is expected in some cases, don't log as error
        return null;
      } else if (fetchError.name === 'TypeError' && fetchError.message && (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch'))) {
        // Network errors (CORS, connection refused, etc.) are expected, don't log
        return null;
      } else {
        // Only log unexpected errors
        console.warn('Get current user fetch error:', fetchError);
      }
      // Return null instead of throwing - component will use localStorage
      return null;
    }
  } catch (error) {
    console.error("Get current user failed:", error);
    // Return null instead of throwing - component will use localStorage
    return null;
  }
};

// Get all posts API
export const getAllPosts = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Use AbortController with timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    let response;
    try {
      response = await fetch(`${backend_url}/api/Post/GetAllPost`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout. Vui lòng thử lại sau.');
      }
      throw fetchError;
    }

    if (!response.ok) {
      let message = 'Failed to load posts';
      let errorDetails = null;

      // Read response body only once
      const contentType = response.headers.get('content-type');
      let responseText = '';
      
      try {
        responseText = await response.text();
        
        // Try to parse as JSON if content-type indicates JSON
        if (contentType && contentType.includes('application/json') && responseText) {
          try {
            const err = JSON.parse(responseText);
            console.error('Get posts error response (full):', JSON.stringify(err, null, 2));
            console.error('Get posts error message:', err.message);
            console.error('Get posts error stackTrace:', err.stackTrace);
            message = err.message || err.error || message;
            errorDetails = err;
          } catch (parseError) {
            // If JSON parsing fails, use the text as message
            console.error('Get posts error (raw text):', responseText);
            message = responseText || message;
          }
        } else if (responseText) {
          console.error('Get posts error (non-JSON):', responseText);
          message = responseText || message;
        }
      } catch (e) {
        console.error('Error reading response:', e);
        // Use default message if we can't read the response
      }

      // Handle specific HTTP status codes
      if (response.status === 401) {
        message = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      } else if (response.status === 404) {
        message = 'Không tìm thấy bài đăng.';
      } else if (response.status === 500) {
        // For 500 errors, try to show the actual error message from backend
        if (errorDetails && errorDetails.message) {
          message = `Lỗi server: ${errorDetails.message}`;
        } else if (responseText) {
          message = `Lỗi server: ${responseText}`;
        } else {
          message = 'Lỗi server. Vui lòng thử lại sau.';
        }
      }

      const error = new Error(message);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    // Handle successful response - check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && text.trim()) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error('Error parsing successful response:', parseError);
          return [];
        }
      }
      return [];
    }
    return [];
  } catch (error) {
    console.error("Get posts failed:", error);
    throw error;
  }
};

// Create post API
export const createPost = async (postData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Get user info for PosterName
    let posterName = 'User';
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      posterName = userInfo.Name || userInfo.name || 'User';
    } catch (e) {
      console.error('Error parsing userInfo:', e);
    }

    // Use FormData to support file upload
    const formData = new FormData();
    
    const text = (postData.text || '').trim();
    const hasImage = postData.image instanceof File;
    
    // Backend requires PostContent to be non-empty
    // If text is empty but there's an image, use a space to satisfy validation
    // If both are empty, this shouldn't happen (frontend should prevent it), but use space as fallback
    const postContent = text || (hasImage ? ' ' : ' ');
    
    const title = postData.title || (text.length > 0 ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : 'New Post');
    
    // Add all post fields
    formData.append('PostContent', postContent);
    formData.append('PosterName', posterName);
    formData.append('ArticleTitle', title);
    formData.append('Hashtags', JSON.stringify([]));
    
    // Add image file if provided (should be a File object, not base64)
    if (postData.image instanceof File) {
      formData.append('imageFile', postData.image);
    }

    const response = await fetch(`${backend_url}/api/Post/CreatePost`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      let message = 'Failed to create post';
      let errorDetails = null;

      const contentType = response.headers.get('content-type');
      let responseText = '';

      try {
        responseText = await response.text();

        if (contentType && contentType.includes('application/json') && responseText) {
          try {
            const err = JSON.parse(responseText);
            console.error('Create post error response:', err);
            message = err.message || err.error || message;
            errorDetails = err;
          } catch (parseError) {
            message = responseText || message;
          }
        } else if (responseText) {
          message = responseText || message;
        }
      } catch (e) {
        console.error('Error reading create post response:', e);
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
      }

      const error = new Error(message);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && text.trim()) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error('Error parsing successful create post response:', parseError);
          return null;
        }
      }
      return null;
    }
    return null;
  } catch (error) {
    console.error("Create post failed:", error);
    throw error;
  }
};

// Create comment API
export const createComment = async (commentData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Use FormData to support file upload
    const formData = new FormData();
    
    // PostId must be a string (backend expects string) - REQUIRED field
    formData.append('PostId', String(commentData.postId || ''));
    
    // PostCommentId is optional (for replies)
    if (commentData.parentCommentId) {
      formData.append('PostCommentId', String(commentData.parentCommentId));
    }
    
    // Content is optional but should be sent even if empty
    formData.append('Content', commentData.content || '');
    
    // Add image file if provided (should be a File object, not base64)
    if (commentData.image instanceof File) {
      formData.append('imageFile', commentData.image);
    }
    
    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? `[File: ${pair[1].name}]` : pair[1]));
    }

    const response = await fetch(`${backend_url}/api/Comment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      let message = 'Failed to create comment';
      let errorDetails = null;

      const contentType = response.headers.get('content-type');
      let responseText = '';

      try {
        responseText = await response.text();

        if (contentType && contentType.includes('application/json') && responseText) {
          try {
            const err = JSON.parse(responseText);
            console.error('Create comment error response:', err);
            message = err.message || err.error || message;
            errorDetails = err;
          } catch (parseError) {
            message = responseText || message;
          }
        } else if (responseText) {
          message = responseText || message;
        }
      } catch (e) {
        console.error('Error reading create comment response:', e);
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
      }

      const error = new Error(message);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && text.trim()) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error('Error parsing successful create comment response:', parseError);
          return null;
        }
      }
      return null;
    }
    return null;
  } catch (error) {
    console.error("Create comment failed:", error);
    throw error;
  }
};

// Delete post API
export const deletePost = async (postId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`${backend_url}/api/Post/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let message = 'Failed to delete post';
      let errorDetails = null;

      const contentType = response.headers.get('content-type');
      let responseText = '';

      try {
        responseText = await response.text();

        if (contentType && contentType.includes('application/json') && responseText) {
          try {
            const err = JSON.parse(responseText);
            console.error('Delete post error response:', err);
            message = err.message || err.error || message;
            errorDetails = err;
          } catch (parseError) {
            message = responseText || message;
          }
        } else if (responseText) {
          message = responseText || message;
        }
      } catch (e) {
        console.error('Error reading response:', e);
      }

      if (response.status === 401) {
        message = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      } else if (response.status === 403) {
        message = 'Bạn không có quyền xóa bài đăng này.';
      } else if (response.status === 404) {
        message = 'Không tìm thấy bài đăng.';
      } else if (response.status === 500) {
        message = 'Lỗi server. Vui lòng thử lại sau.';
      }

      const error = new Error(message);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Delete post failed:", error);
    throw error;
  }
};

// Delete comment API
export const deleteComment = async (commentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Ensure commentId is a number
    const numericId = typeof commentId === 'string' ? parseInt(commentId, 10) : commentId;
    if (isNaN(numericId)) {
      throw new Error('Invalid comment ID');
    }

    console.log(`Deleting comment with ID: ${numericId} (type: ${typeof numericId})`);

    const response = await fetch(`${backend_url}/api/Comment/${numericId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let message = 'Failed to delete comment';
      let errorDetails = null;

      const contentType = response.headers.get('content-type');
      let responseText = '';

      try {
        responseText = await response.text();

        if (contentType && contentType.includes('application/json') && responseText) {
          try {
            const err = JSON.parse(responseText);
            console.error('Delete comment error response:', err);
            message = err.message || err.error || message;
            errorDetails = err;
          } catch (parseError) {
            message = responseText || message;
          }
        } else if (responseText) {
          message = responseText || message;
        }
      } catch (e) {
        console.error('Error reading response:', e);
      }

      if (response.status === 401) {
        message = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      } else if (response.status === 403) {
        message = 'Bạn không có quyền xóa bình luận này.';
      } else if (response.status === 404) {
        message = 'Không tìm thấy bình luận.';
      } else if (response.status === 500) {
        message = 'Lỗi server. Vui lòng thử lại sau.';
      }

      const error = new Error(message);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Delete comment failed:", error);
    throw error;
  }
};

// Delete reaction API
export const deleteReaction = async (targetType, targetId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`${backend_url}/api/Reaction/${targetType}/${targetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let message = 'Failed to delete reaction';
      let errorDetails = null;

      const contentType = response.headers.get('content-type');
      let responseText = '';

      try {
        responseText = await response.text();

        if (contentType && contentType.includes('application/json') && responseText) {
          try {
            const err = JSON.parse(responseText);
            console.error('Delete reaction error response:', err);
            message = err.message || err.error || message;
            errorDetails = err;
          } catch (parseError) {
            message = responseText || message;
          }
        } else if (responseText) {
          message = responseText || message;
        }
      } catch (e) {
        console.error('Error reading delete reaction response:', e);
      }

      if (response.status === 401) {
        message = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      } else if (response.status === 404) {
        message = 'Không tìm thấy reaction để xóa.';
      }

      const error = new Error(message);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Delete reaction failed:", error);
    throw error;
  }
};

// Create or update reaction API
export const createReaction = async (reactionData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Prepare reaction data according to database schema
    // Schema: USER_ID, TARGET_TYPE, TARGET_ID, REACTION_TYPE
    // CREATED_AT is set by backend
    // USER_ID is set by backend from JWT token
    const reactionPayload = {
      TargetType: reactionData.targetType, // 'POST' or 'COMMENT'
      TargetId: reactionData.targetId,
      ReactionType: reactionData.reactionType // 'like', 'love', 'haha', 'wow', 'dislike', etc.
    };

    const response = await fetch(`${backend_url}/api/Reaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reactionPayload),
    });

    if (!response.ok) {
      let message = 'Failed to create reaction';
      let errorDetails = null;

      const contentType = response.headers.get('content-type');
      let responseText = '';

      try {
        responseText = await response.text();
        console.error('Create reaction failed - Status:', response.status);
        console.error('Create reaction failed - Response text:', responseText);
        console.error('Create reaction failed - Payload sent:', JSON.stringify(reactionPayload));

        if (contentType && contentType.includes('application/json') && responseText) {
          try {
            const err = JSON.parse(responseText);
            console.error('Create reaction error response:', err);
            message = err.message || err.error || message;
            errorDetails = err;
          } catch (parseError) {
            message = responseText || message;
          }
        } else if (responseText) {
          message = responseText || message;
        }
      } catch (e) {
        console.error('Error reading create reaction response:', e);
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
      }

      const error = new Error(message);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && text.trim()) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error('Error parsing successful create reaction response:', parseError);
          return null;
        }
      }
      return null;
    }
    return null;
  } catch (error) {
    console.error("Create reaction failed:", error);
    throw error;
  }
};

