import './CreateService.css';
import React, { useState, useEffect, useCallback } from 'react';
import { createService, addServiceToCombo } from '../API/CreateServiceApi';
import Header from './Header';

const CreateService = () => {
   // State management
   const [formData, setFormData] = useState({
     name: '',
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
        return !value || value.trim() === '' ? 'Tên dịch vụ không được để trống' : '';
      
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

      // Check if we came from service manager with comboId
      const urlParams = new URLSearchParams(window.location.search);
      const comboId = urlParams.get('comboId');

      // Submit to backend API
      const result = await createService(submitData, comboId);
      if (result?.id || result?.Id) {
        const serviceId = result.id || result.Id;
        
        // If comboId is provided, add the service to the combo
        if (comboId) {
          try {
            console.log(`Attempting to add service ${serviceId} to combo ${comboId}`);
            const comboResult = await addServiceToCombo(parseInt(comboId), serviceId, 1);
            console.log(`Service ${serviceId} added to combo ${comboId} successfully:`, comboResult);
          } catch (comboError) {
            console.error('Error adding service to combo:', comboError);
            console.error('Error details:', {
              message: comboError.message,
              status: comboError.status,
              details: comboError.details
            });
            // Show the actual error message to help debug
            const errorMsg = comboError.message || 'Có lỗi không xác định';
            alert(`Dịch vụ đã được tạo thành công, nhưng có lỗi khi thêm vào combo: ${errorMsg}`);
          }
        }
        
        alert('Dịch vụ đã được tạo thành công!');
        if (comboId) {
          // Redirect back to service manager with the combo
          window.location.href = `/service-manager?comboId=${comboId}`;
        } else {
          // Redirect to service-manager page
          window.location.href = '/service-manager';
        }
      }
    } catch (error) {
      console.error('Error creating service:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi tạo dịch vụ. Vui lòng thử lại.';
      alert(errorMessage);
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

  // Set minimum date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      startDate: prev.startDate || today,
      endDate: prev.endDate || today
    }));
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
          <h2>Tạo dịch vụ mới</h2>
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
                {isLoading ? 'Đang xử lý...' : 'Tạo dịch vụ'}
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

export default CreateService;
