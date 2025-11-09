import './EditService.css';
import React, { useState, useEffect, useCallback } from 'react';
import { updateService, getServiceById } from '../API/EditServiceApi';
import Header from './Header';

const EditService = () => {
   // State management
   const [formData, setFormData] = useState({
     id: '',
     name: '',
     address: '',
     description: '',
     price: '',
     capacity: '',
     availableSlot: '',
     startDate: '',
     endDate: ''
   });

   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [sidebarActive, setSidebarActive] = useState(false);

  // Configuration
  const config = {
    maxDescriptionLength: 5000
  };

  // Utility functions
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name':
      case 'address':
        return !value || value.trim() === '' ? `${name === 'name' ? 'Tên dịch vụ' : 'Địa chỉ'} không được để trống` : '';
      
      case 'price':
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) return 'Giá phải là số >= 0';
        return '';
      
      default:
        return '';
    }
  }, [formData.capacity, formData.startDate]);

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
      // Create FormData for file upload (exclude fields not used by API)
      const submitData = new FormData();
      const excluded = new Set(['capacity', 'availableSlot', 'startDate', 'endDate']);
      Object.keys(formData).forEach(key => {
        if (!excluded.has(key) && formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      // Ensure ID is included for update
      if (formData.id) {
        submitData.append('Id', formData.id);
      }

      // Submit to backend API
      const result = await updateService(submitData);
      // If updateService succeeds (no error thrown), redirect
      alert('Dịch vụ đã được cập nhật thành công!');
      // Redirect to service-manager page with comboId if present
      const urlParams = new URLSearchParams(window.location.search);
      const comboId = urlParams.get('comboId');
      const redirectUrl = comboId ? `/service-manager?comboId=${comboId}` : '/service-manager';
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Có lỗi xảy ra khi tạo dịch vụ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const comboId = urlParams.get('comboId');
    if (comboId) {
      window.location.href = `/service-manager?comboId=${comboId}`;
    } else {
      window.location.href = '/service-manager';
    }
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  // Load service data on component mount
  useEffect(() => {
    const loadServiceData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceId = urlParams.get('id');

      if (serviceId) {
        try {
          const serviceData = await getServiceById(serviceId);
          console.log('Service data loaded:', serviceData); // Debug log
          setFormData({
            id: serviceData.Id || serviceData.id,
            name: serviceData.Name || serviceData.name || '',
            description: serviceData.Description || serviceData.description || '',
            price: serviceData.Price || serviceData.price || '',
            capacity: '',
            availableSlot: '',
            startDate: '',
            endDate: ''
          });
          setErrors({});
        } catch (error) {
          console.error('Error loading service data:', error);
          alert('Không thể tải dữ liệu dịch vụ. Vui lòng thử lại.');
        }
      }
    };

    loadServiceData();
  }, []);


  // Update end date minimum when start date changes
  useEffect(() => {
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setFormData(prev => ({
        ...prev,
        endDate: formData.startDate
      }));
    }
  }, [formData.startDate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarActive) {
        setSidebarActive(false);
      }
      if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('createServiceForm').dispatchEvent(new Event('submit'));
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
          <h2>Chỉnh sửa dịch vụ</h2>
        </div>
      </section>

      {/* Main Content */}
      <main className={`content ${sidebarActive ? 'shift' : ''}`} role="main">
        <div className="form-content">
          <div className="disclaimer-text">
            (<span className="required-indicator">*</span>) bắt buộc
          </div>
          
          <form id="createServiceForm" onSubmit={handleSubmit} noValidate>
            {/* Service Name Field */}
            <div className="field">
              <label htmlFor="name">
                Nhập tên dịch vụ (Service Name)
                <span className="required-indicator">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                maxLength="255"
                required
                placeholder="Tên dịch vụ..."
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </div>


            {/* Description Field */}
            <div className="field">
              <label htmlFor="description">Mô tả về dịch vụ (Service Description)</label>
              <textarea
                id="description"
                name="description"
                maxLength="5000"
                placeholder="Mô tả ngắn về dịch vụ (tối đa 5000 ký tự)"
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


            {/* Form Actions */}
            <div className="form-action">
              <button type="submit" className="primary" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Cập nhật dịch vụ'}
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

export default EditService;
