import {
  fetchWithFallback,
  extractErrorMessage,
  getAuthToken
} from "./httpClient";

// Get all users (Admin only)
export const getAllUsers = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login first.");
    }

    const response = await fetchWithFallback("/api/user/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
console.log(response);
    if (!response.ok) {
      const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(await extractErrorMessage(response, fallbackMessage));
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get all users failed:", error);
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. URL backend có đúng không?\n3. Có vấn đề về CORS không?");
    }
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login first.");
    }

    const response = await fetchWithFallback(`/api/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(await extractErrorMessage(response, fallbackMessage));
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get user by ID failed:", error);
    throw error;
  }
};

// Ban account (Admin only)
export const banAccount = async (accountId, reason) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login first.");
    }

    const response = await fetchWithFallback("/api/user/ban-account", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        AccountId: accountId.toString(),
        Reason: reason || "",
      }),
    });

    if (!response.ok) {
      const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(await extractErrorMessage(response, fallbackMessage));
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ban account failed:", error);
    throw error;
  }
};

// Unban account (Admin only)
export const unbanAccount = async (accountId, reason = "") => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login first.");
    }

    const response = await fetchWithFallback("/api/user/unban-account", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        AccountId: accountId.toString(),
        Reason: reason || "",
      }),
    });

    if (!response.ok) {
      const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(await extractErrorMessage(response, fallbackMessage));
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Unban account failed:", error);
    throw error;
  }
};

// Update user (Admin only)
export const updateUserByAdmin = async (accountId, payload = {}) => {
  try {
      const token = getAuthToken();
      if (!token) {
          throw new Error(
              "No authentication token found. Please login first."
          );
      }

      // Build request body với đúng các field DTO
      const requestBody = {};

      // Name - luôn gửi giá trị đã trim (frontend đã validate trước)
      if (payload.name !== undefined) {
          const trimmedName = payload.name?.trim();
          // Gửi giá trị đã trim (frontend đã đảm bảo có ít nhất 2 ký tự)
          requestBody.Name = trimmedName || null;
      }

      // Avatar
      if (payload.avatar !== undefined) {
          requestBody.Avatar = payload.avatar?.trim() || null;
      }

      // Phone
      if (payload.phone !== undefined) {
          requestBody.Phone = payload.phone?.trim() || null;
      }

      // DOB - DateTime?
      if (payload.dob !== undefined) {
          if (!payload.dob) {
              requestBody.DOB = null;
          } else {
              // Backend expects DateTime?, but we'll send ISO date string
              // Try to parse the date
              const date = new Date(payload.dob);
              if (!isNaN(date.getTime())) {
                  // Format as yyyy-MM-dd for backend
                  requestBody.DOB = date.toISOString().split("T")[0];
              } else {
                  // If it's already in yyyy-MM-dd format, use it directly
                  if (typeof payload.dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(payload.dob)) {
                      requestBody.DOB = payload.dob;
                  } else {
                      requestBody.DOB = null;
                  }
              }
          }
      }

      // Gender
      if (payload.gender !== undefined) {
          requestBody.Gender = payload.gender?.trim() || null;
      }

      // Address
      if (payload.address !== undefined) {
          requestBody.Address = payload.address?.trim() || null;
      }

      // RoleId: int?
      if (payload.roleId !== undefined) {
          const roleId = Number(payload.roleId);
          requestBody.RoleId = isNaN(roleId) ? null : roleId;
      }

      // IsBanned: bool?
      if (payload.isBanned !== undefined) {
          // Có thể nhận true/false hoặc string "true"
          requestBody.IsBanned =
              payload.isBanned === null ? null : Boolean(payload.isBanned);
      }

      // Log request for debugging
      console.log('Update user request:', {
          accountId,
          requestBody
      });

      const response = await fetchWithFallback(`/api/user/${accountId}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
          const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
          const errorMessage = await extractErrorMessage(response, fallbackMessage);
          console.error('Update user failed:', {
              status: response.status,
              statusText: response.statusText,
              error: errorMessage,
              requestBody
          });
          throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Update user success:', data);
      return data;
  } catch (error) {
      console.error("Update user failed:", error);
      throw error;
  }
};

// Delete user account (Admin only)
export const deleteUser = async (accountId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login first.");
    }

    const response = await fetchWithFallback(`/api/user/${accountId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(await extractErrorMessage(response, fallbackMessage));
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Delete user failed:", error);
    throw error;
  }
};

// Send notification to user (Admin only)
export const sendNotificationToUser = async (userId, message, title) => {
  // Allow title to be string or null/undefined
  const titleValue = title || null;
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login first.");
    }

    const response = await fetchWithFallback("/api/notification/Send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        UserId: userId.toString(),
        Message: message,
        Title: titleValue,
      }),
    });

    if (!response.ok) {
      const fallbackMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(await extractErrorMessage(response, fallbackMessage));
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Send notification failed:", error);
    throw error;
  }
};

