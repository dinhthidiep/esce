import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showToast } from '../utils/toast';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch user profile from API
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch booking history when bookings tab is active
  useEffect(() => {
    if (activeTab === 'bookings' && bookingHistory.length === 0) {
      fetchBookingHistory();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://localhost:7267/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          navigate('/login');
          return;
        }
        throw new Error('Không thể tải thông tin người dùng');
      }

      const data = await response.json();

      // Map API response to component state (API uses PascalCase)
      const mappedProfile = {
        id: data.Id,
        name: data.Name,
        email: data.Email,
        phone: data.Phone,
        address: data.Address,
        dob: data.Dob,
        gender: data.Gender,
        avatar: data.Avatar,
        roleId: data.RoleId,
        isActive: data.IsActive
      };

      setUserProfile(mappedProfile);
      setEditForm(mappedProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      setLoadingBookings(true);

      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch('https://localhost:7267/api/booking', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải lịch sử đặt tour');
      }

      const data = await response.json();
      setBookingHistory(data);
    } catch (err) {
      console.error('Error fetching booking history:', err);
      showToast.error('Không thể tải lịch sử đặt tour');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(userProfile);
  };

  const handleSave = async () => {
    try {
      // Validate phone number - only digits allowed
      if (editForm.phone && editForm.phone.trim() !== '') {
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(editForm.phone)) {
          showToast.warning('Số điện thoại chỉ được chứa các ký tự số!');
          return;
        }

        // Validate phone length (Vietnamese phone numbers are typically 10-11 digits)
        if (editForm.phone.length < 10 || editForm.phone.length > 11) {
          showToast.warning('Số điện thoại phải có 10-11 chữ số!');
          return;
        }
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const loadingToast = showToast.loading('Đang cập nhật thông tin...');

      // Prepare update data (only send fields that can be updated)
      const updateData = {
        name: editForm.name,
        phone: editForm.phone,
        avatar: editForm.avatar,
        gender: editForm.gender,
        address: editForm.address,
        dob: editForm.dob
      };

      const response = await fetch('https://localhost:7267/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật thông tin');
      }

      const data = await response.json();

      // Map updated user data
      const updatedUser = data.user || data;
      const mappedProfile = {
        id: updatedUser.Id,
        name: updatedUser.Name,
        email: updatedUser.Email,
        phone: updatedUser.Phone,
        address: updatedUser.Address,
        dob: updatedUser.Dob,
        gender: updatedUser.Gender,
        avatar: updatedUser.Avatar,
        roleId: updatedUser.RoleId,
        isActive: updatedUser.IsActive
      };

      setUserProfile(mappedProfile);
      setIsEditing(false);

      showToast.update(loadingToast, {
        render: 'Cập nhật thông tin thành công!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      // Update localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...updatedUser }));
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast.error('Lỗi: ' + err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(userProfile);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadSuccess(false);

      try {
        const token = localStorage.getItem('token');

        // Step 1: Upload image to get URL
        const formData = new FormData();
        formData.append('image', file);

        const uploadResponse = await fetch('https://localhost:7267/api/file/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Không thể tải ảnh lên');
        }

        const uploadData = await uploadResponse.json();
        const avatarUrl = uploadData.url;

        // Step 2: Update profile with new avatar URL
        const updateResponse = await fetch('https://localhost:7267/api/user/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ avatar: avatarUrl })
        });

        if (!updateResponse.ok) {
          throw new Error('Không thể cập nhật avatar');
        }

        const data = await updateResponse.json();
        const updatedUser = data.user || data;
        const mappedProfile = {
          id: updatedUser.Id,
          name: updatedUser.Name,
          email: updatedUser.Email,
          phone: updatedUser.Phone,
          address: updatedUser.Address,
          dob: updatedUser.Dob,
          gender: updatedUser.Gender,
          avatar: updatedUser.Avatar,
          roleId: updatedUser.RoleId,
          isActive: updatedUser.IsActive
        };

        setUserProfile(mappedProfile);
        setEditForm(mappedProfile);
        setUploadSuccess(true);

        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      } catch (err) {
        console.error('Error uploading avatar:', err);
        showToast.error('Lỗi: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.warning('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast.warning('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    const loadingToast = showToast.loading('Đang đổi mật khẩu...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7267/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Không thể đổi mật khẩu');
      }

      showToast.update(loadingToast, {
        render: 'Đổi mật khẩu thành công!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      setShowChangePassword(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      showToast.update(loadingToast, {
        render: 'Lỗi: ' + err.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'pending',
      'confirmed': 'upcoming',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    return classMap[status] || 'pending';
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      0: 'Chờ thanh toán',
      1: 'Đã thanh toán',
      2: 'Thanh toán thất bại',
      3: 'Đã hủy thanh toán'
    };
    return statusMap[status] || 'Chưa thanh toán';
  };

  const getPaymentStatusClass = (status) => {
    const classMap = {
      0: 'payment-pending',
      1: 'payment-completed',
      2: 'payment-failed',
      3: 'payment-cancelled'
    };
    return classMap[status] || 'payment-none';
  };

  const shouldShowPaymentButton = (booking) => {
    // Chỉ hiển thị nút thanh toán nếu:
    // 1. Booking status là pending
    // 2. Chưa có payment HOẶC payment status không phải Completed (1)

    if (booking.Status !== 'pending') {
      return false;
    }

    // Nếu chưa có payment, cho phép thanh toán
    if (!booking.Payment) {
      return true;
    }

    // Nếu có payment, kiểm tra status
    // Payment Status: 0=Pending, 1=Completed, 2=Failed, 3=Cancelled
    // Chỉ ẩn nút nếu status = 1 (Completed)
    return booking.Payment.Status !== 1;
  };

  const handlePayNow = (booking) => {
    navigate('/payment', {
      state: {
        bookingId: booking.Id,
        tourName: booking.ComboName,
        totalAmount: booking.TotalAmount,
        quantity: booking.Quantity,
        startDate: booking.StartDate,
        endDate: booking.EndDate
      }
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <main className="profile-main">
          <div className="loading-container">
            <p>Đang tải thông tin...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="profile-page">
        <Header />
        <main className="profile-main">
          <div className="error-container">
            <p>Lỗi: {error || 'Không thể tải thông tin người dùng'}</p>
            <button onClick={fetchUserProfile} className="btn-retry">Thử lại</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <img
                  src={
                    userProfile.avatar && userProfile.avatar !== null && userProfile.avatar !== ''
                      ? userProfile.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || 'User')}&background=059669&color=fff&size=200`
                  }
                  alt={userProfile.name}
                  className="profile-avatar"
                />
                <button className="avatar-upload-btn" onClick={handleAvatarUpload}>
                  <span className="camera-icon"></span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              {isUploading && <p className="upload-status">Đang tải lên...</p>}
              {uploadSuccess && <p className="upload-status success">Tải lên thành công!</p>}
              <h2>{userProfile.name}</h2>
              <p className="user-role">
                {userProfile.roleId === 1 ? 'Admin' :
                 userProfile.roleId === 2 ? 'Nhân viên' :
                 userProfile.roleId === 3 ? 'Hướng dẫn viên' : 'Khách hàng'}
              </p>
            </div>

            <nav className="profile-nav">
              <button
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <span className="icon-user"></span> Thông tin cá nhân
              </button>
              <button
                className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <span className="icon-calendar"></span> Lịch sử đặt tour
              </button>
              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="icon-settings"></span> Cài đặt
              </button>
            </nav>
          </div>

          <div className="profile-content">
            {activeTab === 'personal' && (
              <div className="content-section">
                <div className="section-header">
                  <h2>Thông tin cá nhân</h2>
                  {!isEditing ? (
                    <button className="btn-edit" onClick={handleEdit}>
                      <span className="icon-edit"></span> Chỉnh sửa
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-cancel" onClick={handleCancel}>Hủy</button>
                      <button className="btn-save" onClick={handleSave}>
                        <span className="icon-save"></span> Lưu
                      </button>
                    </div>
                  )}
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <label>Họ và tên</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <p>{userProfile.name}</p>
                    )}
                  </div>

                  <div className="info-item">
                    <label>Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p>{userProfile.email}</p>
                    )}
                  </div>

                  <div className="info-item">
                    <label>Số điện thoại</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <p>{userProfile.phone || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div className="info-item">
                    <label>Ngày sinh</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.dob ? editForm.dob.split('T')[0] : ''}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                      />
                    ) : (
                      <p>{userProfile.dob ? new Date(userProfile.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div className="info-item">
                    <label>Giới tính</label>
                    {isEditing ? (
                      <select
                        value={editForm.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Other">Khác</option>
                      </select>
                    ) : (
                      <p>{userProfile.gender === 'Male' ? 'Nam' : userProfile.gender === 'Female' ? 'Nữ' : userProfile.gender || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div className="info-item full-width">
                    <label>Địa chỉ</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    ) : (
                      <p>{userProfile.address || 'Chưa cập nhật'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="content-section">
                <div className="section-header">
                  <h2>Lịch sử đặt tour</h2>
                </div>

                {loadingBookings ? (
                  <div className="loading-bookings">
                    <p>Đang tải lịch sử đặt tour...</p>
                  </div>
                ) : bookingHistory.length === 0 ? (
                  <div className="empty-bookings">
                    <p>Bạn chưa có booking nào</p>
                  </div>
                ) : (
                  <div className="bookings-list">
                    {bookingHistory.map(booking => (
                      <div key={booking.Id} className="booking-card">
                        <div className="booking-info">
                          <h3>{booking.ComboName}</h3>
                          <p className="booking-date">
                            <strong>Ngày đặt:</strong> {formatDate(booking.BookingDate)}
                          </p>
                          <p className="booking-date">
                            <strong>Từ:</strong> {formatDate(booking.StartDate)}
                            <strong> - Đến:</strong> {formatDate(booking.EndDate)}
                          </p>
                          <p className="booking-quantity">
                            <strong>Số lượng:</strong> {booking.Quantity} người
                          </p>
                          <p className="booking-price">
                            <strong>Tổng tiền:</strong> {formatPrice(booking.TotalAmount)}
                          </p>
                          {booking.Notes && (
                            <p className="booking-notes">
                              <strong>Ghi chú:</strong> {booking.Notes}
                            </p>
                          )}
                        </div>
                        <div className="booking-status">
                          <span className={`status-badge ${getStatusClass(booking.Status)}`}>
                            {getStatusText(booking.Status)}
                          </span>
                          {booking.Payment && (
                            <span className={`payment-status-badge ${getPaymentStatusClass(booking.Payment.Status)}`}>
                              {getPaymentStatusText(booking.Payment.Status)}
                            </span>
                          )}
                          {shouldShowPaymentButton(booking) && (
                            <button
                              className="btn-pay-now"
                              onClick={() => handlePayNow(booking)}
                            >
                              Thanh toán ngay
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="content-section">
                <div className="section-header">
                  <h2>Cài đặt</h2>
                </div>

                <div className="settings-list">
                  <div className="setting-item">
                    <div>
                      <h3>Thông báo email</h3>
                      <p>Nhận thông báo về tour và ưu đãi qua email</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div>
                      <h3>Thông báo push</h3>
                      <p>Nhận thông báo trên trình duyệt</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div>
                      <h3>Đổi mật khẩu</h3>
                      <p>Cập nhật mật khẩu của bạn</p>
                    </div>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                    >
                      {showChangePassword ? 'Hủy' : 'Đổi mật khẩu'}
                    </button>
                  </div>

                  {showChangePassword && (
                    <div className="password-change-form">
                      <h3>Đổi mật khẩu</h3>
                      <div className="form-group">
                        <label>Mật khẩu cũ</label>
                        <input
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                          placeholder="Nhập mật khẩu cũ"
                        />
                      </div>
                      <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Nhập mật khẩu mới"
                        />
                      </div>
                      <div className="form-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                      <button className="btn-save" onClick={handleChangePassword}>
                        Xác nhận đổi mật khẩu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

