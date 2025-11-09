import './EditServiceCombo.css';
import React, { useState, useEffect, useCallback } from 'react';
import { updateServiceCombo, getServiceComboById } from '../API/EditServiceComboApi';
import Header from './Header';

const backend_url = "http://localhost:5002";

const EditServiceCombo = () => {
   // State management
   const [formData, setFormData] = useState({
     id: '',
     name: '',
     address: '',
     description: '',
     price: '',
     availableSlots: '',
     status: 'open',
     cancellationPolicy: '',
     image: null
   });

   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [imagePreview, setImagePreview] = useState(null);
   const [sidebarActive, setSidebarActive] = useState(false);

  // Configuration
  const config = {
    maxDescriptionLength: 1000, // Match backend MaxLength(1000)
    maxCancellationPolicyLength: 1000, // Match backend MaxLength(1000)
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  };

  // Utility functions
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name':
      case 'address':
        return !value || value.trim() === '' ? `${name === 'name' ? 'Tên combo dịch vụ' : 'Địa chỉ'} không được để trống` : '';

      case 'price':
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) return 'Giá phải là số >= 0';
        return '';

      case 'availableSlots':
        const slots = parseInt(value);
        if (isNaN(slots)) return 'Số slot phải là số nguyên';
        if (slots <= 0) return 'Số slot phải lớn hơn 0';
        return '';

      case 'image':
        if (!value) return '';
        if (!config.allowedImageTypes.includes(value.type)) {
          return 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)';
        }
        if (value.size > config.maxImageSize) {
          return 'Kích thước file không được vượt quá 5MB';
        }
        return '';

      default:
        return '';
    }
  }, []);

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    const fieldValue = files ? files[0] : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateField('image', file);
      if (error) {
        setErrors(prev => ({ ...prev, image: error }));
        setImagePreview(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    
    handleInputChange(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);

      // Scroll to first error
      const firstErrorField = document.querySelector('.error:not(:empty)')?.previousElementSibling;
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }

    try {
      // Convert image to base64 if it's a File object
      let imageBase64 = null;
      if (formData.image instanceof File) {
        // New image file selected - convert to base64
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            resolve(event.target.result); // This is the base64 string
          };
          reader.onerror = (error) => {
            reject(error);
          };
          reader.readAsDataURL(formData.image);
        });
      } else if (formData.image && typeof formData.image === 'string') {
        // If it's already a base64 string (existing image), use it directly
        imageBase64 = formData.image;
      }
      // If formData.image is null, imageBase64 will be null, which means "don't update the image"

      // Convert formData to JSON object
      // Use PascalCase to match backend C# model properties
      // Convert empty strings to null for nullable fields to avoid validation errors
      const submitData = {
        Name: formData.name?.trim() || '',
        Address: formData.address?.trim() || '',
        Description: formData.description?.trim() || null, // Convert empty string to null
        Price: parseFloat(formData.price),
        AvailableSlots: parseInt(formData.availableSlots),
        Status: formData.status || 'open',
        CancellationPolicy: formData.cancellationPolicy?.trim() || null, // Convert empty string to null
        Image: imageBase64 // Use the base64 string or null
      };

      // Submit to backend API
      const result = await updateServiceCombo(formData.id, submitData);
      if (result?.id || result?.Id) {
        alert('Combo dịch vụ đã được cập nhật thành công!');
        // Redirect to service-combo-manager page
        window.location.href = '/service-combo-manager';
      }
    } catch (error) {
      console.error('Error updating service combo:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi cập nhật combo dịch vụ. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    window.location.href = '/service-combo-manager';
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  // Load service combo data on component mount
  useEffect(() => {
    const loadServiceComboData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceComboId = urlParams.get('id');

      if (serviceComboId) {
        try {
          const serviceComboData = await getServiceComboById(serviceComboId);
          console.log('Service combo data loaded:', serviceComboData); // Debug log
          const existingImage = serviceComboData.Image || serviceComboData.image || null;
          setFormData({
            id: serviceComboData.Id || serviceComboData.id,
            name: serviceComboData.Name || serviceComboData.name || '',
            address: serviceComboData.Address || serviceComboData.address || '',
            description: serviceComboData.Description || serviceComboData.description || '',
            price: serviceComboData.Price || serviceComboData.price || '',
            availableSlots: serviceComboData.AvailableSlots || serviceComboData.availableSlots || '',
            status: serviceComboData.Status || serviceComboData.status || 'open',
            cancellationPolicy: serviceComboData.CancellationPolicy || serviceComboData.cancellationPolicy || '',
            image: existingImage // Store existing image (base64 string) or null
          });
          setErrors({});
          // Set image preview if there's an existing image
          if (existingImage && (existingImage.startsWith('data:image') || existingImage.startsWith('http://') || existingImage.startsWith('https://'))) {
            setImagePreview(existingImage);
          } else if (existingImage) {
            // If it's a file path, try to construct the URL
            setImagePreview(`${backend_url}/images/${existingImage}`);
          } else {
            setImagePreview(null);
          }
        } catch (error) {
          console.error('Error loading service combo data:', error);
          alert('Không thể tải dữ liệu combo dịch vụ. Vui lòng thử lại.');
        }
      }
    };

    loadServiceComboData();
  }, []);


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarActive) {
        setSidebarActive(false);
      }
      if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('createServiceComboForm').dispatchEvent(new Event('submit'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarActive]);

  return (
    <div className="create-tour-page">
      {/* Sidebar Navigation */}
      <aside 
        className={`sidebar ${sidebarActive ? 'active' : ''}`} 
        role="navigation" 
        aria-label="Menu chính"
      >
        <nav>
          <ul>
            <li>
              <a href="#" className="sidebar-select" aria-label="Thông tin cá nhân">
                Thông tin cá nhân
              </a>
            </li>
            <li>
              <a href="/service-combo-manager" className="sidebar-select" aria-label="Quản lý combo dịch vụ">
                Quản lý combo dịch vụ
              </a>
            </li>
            <li>
              <a href="/social-media" className="sidebar-select" aria-label="Mạng xã hội">
                Mạng xã hội
              </a>
            </li>
            <li>
              <a href="#" className="sidebar-select" aria-label="Hỗ trợ">
                Hỗ trợ
              </a>
            </li>
            <li>
              <a href="#" className="sidebar-select" aria-label="Chat">
                Chat
              </a>
            </li>
            <li className="sidebar-logout">
              <a href="#" className="sidebar-select sidebar-logout-link" aria-label="Đăng xuất">
                Đăng xuất
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Header */}
      <Header 
        showMenuButton={true}
        onMenuToggle={toggleSidebar}
        sidebarActive={sidebarActive}
      />

      {/* Page Title */}
      <section className={`content-title-display-box ${sidebarActive ? 'shift' : ''}`}>
        <div className="content-title-display-name">
          <h2>Chỉnh sửa combo dịch vụ</h2>
        </div>
      </section>

      {/* Main Content */}
      <main className={`content ${sidebarActive ? 'shift' : ''}`} role="main">
        <div className="form-content">
          <div className="disclaimer-text">
            (<span className="required-indicator">*</span>) bắt buộc
          </div>
          
          <form id="createServiceComboForm" onSubmit={handleSubmit} noValidate>
            {/* Service Combo Name Field */}
            <div className="field">
              <label htmlFor="name">
                Nhập tên combo dịch vụ (Service Combo Name)
                <span className="required-indicator">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                maxLength="255"
                required
                placeholder="Tên combo dịch vụ..."
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </div>

            {/* Address Field */}
            <div className="field">
              <label htmlFor="address">
                Địa chỉ (Address)
                <span className="required-indicator">*</span>
              </label>
              <input
                id="address"
                name="address"
                type="text"
                maxLength="255"
                required
                placeholder="Địa chỉ..."
                value={formData.address}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </div>

            {/* Description Field */}
            <div className="field">
              <label htmlFor="description">Mô tả về combo dịch vụ (Description)</label>
              <textarea
                id="description"
                name="description"
                maxLength={config.maxDescriptionLength}
                placeholder="Mô tả ngắn về combo dịch vụ (tối đa 1000 ký tự)"
                value={formData.description}
                onChange={handleInputChange}
                aria-describedby="description-hint"
                rows="4"
              />
              <div id="description-hint" className="hint">
                Còn lại: <span>{config.maxDescriptionLength - formData.description.length}</span> ký tự
              </div>
            </div>

            {/* Price Field */}
            <div className="field">
              <label htmlFor="price">
                Giá (Price)
                <span className="required-indicator">*</span>
              </label>
              <input 
                id="price" 
                name="price" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
                inputMode="decimal"
              />
            </div>

            {/* Available Slots Field */}
            <div className="field">
              <label htmlFor="availableSlots">
                Số slot có sẵn (Available Slots)
                <span className="required-indicator">*</span>
              </label>
              <input 
                id="availableSlots" 
                name="availableSlots" 
                type="number" 
                min="1" 
                required 
                placeholder="1"
                value={formData.availableSlots}
                onChange={handleInputChange}
                inputMode="numeric"
              />
            </div>

            {/* Status Field */}
            <div className="field">
              <label htmlFor="status">Trạng thái (Status)</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="open">Mở (Open)</option>
                <option value="closed">Đóng (Closed)</option>
                <option value="canceled">Đã hủy (Canceled)</option>
              </select>
            </div>

            {/* Cancellation Policy Field */}
            <div className="field">
              <label htmlFor="cancellationPolicy">Chính sách hủy (Cancellation Policy)</label>
              <textarea
                id="cancellationPolicy"
                name="cancellationPolicy"
                maxLength={config.maxCancellationPolicyLength}
                placeholder="Mô tả chính sách hủy (tối đa 1000 ký tự)"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                aria-describedby="cancellationPolicy-hint"
                rows="4"
              />
              <div id="cancellationPolicy-hint" className="hint">
                Còn lại: <span>{config.maxCancellationPolicyLength - formData.cancellationPolicy.length}</span> ký tự
              </div>
            </div>

            {/* Image Upload Field */}
            <div className="field">
              <label htmlFor="image">Ảnh đại diện (IMAGE)</label>
              <input 
                id="image" 
                name="image" 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                aria-describedby="image-hint"
              />
              <div id="image-hint" className="hint">
                Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)
              </div>
              {imagePreview && (
                <img 
                  src={imagePreview}
                  className="img-preview" 
                  alt="Xem trước ảnh"
                  loading="lazy"
                />
              )}
            </div>

            {/* Form Actions */}
            <div className="form-action">
              <button type="submit" className="primary" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Cập nhật combo'}
              </button>
              <button type="button" className="secondary" onClick={handleGoBack}>
                Quay lại
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay" aria-hidden="false">
          <div className="loading-spinner" role="status">
            <span className="sr-only">Đang xử lý...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditServiceCombo;

