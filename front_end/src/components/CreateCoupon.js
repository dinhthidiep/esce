import './CreateCoupon.css';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createCoupon } from '../API/CreateCouponApi';
import Header from './Header';

const CreateCoupon = () => {
  // State management - matching database schema
  const [formData, setFormData] = useState({
    code: '',                    // CODE NVARCHAR(50) UNIQUE NOT NULL
    description: '',             // DESCRIPTION NVARCHAR(255)
    discountType: 'percentage',  // DISCOUNT_PERCENT or DISCOUNT_AMOUNT
    discountValue: '',          // DISCOUNT_PERCENT DECIMAL(5,2) or DISCOUNT_AMOUNT DECIMAL(18,2)
    usageLimit: ''              // USAGE_LIMIT INT NOT NULL
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(false);

  // Get comboId from URL - SERVICECOMBO_ID INT NOT NULL
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const comboId = urlParams.get('comboId');

  // Configuration matching database constraints
  const config = {
    maxCodeLength: 50,           // CODE NVARCHAR(50)
    maxDescriptionLength: 255,   // DESCRIPTION NVARCHAR(255)
    maxDiscountPercent: 100,      // DISCOUNT_PERCENT DECIMAL(5,2) - max 100%
    minUsageLimit: 1             // USAGE_LIMIT INT NOT NULL - minimum 1
  };

  // Validation matching database schema
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'code':
        if (!value || value.trim() === '') {
          return 'Mã coupon không được để trống';
        }
        if (value.trim().length > config.maxCodeLength) {
          return `Mã coupon không được vượt quá ${config.maxCodeLength} ký tự`;
        }
        // Allow alphanumeric, dash, underscore for coupon codes
        const couponRegex = /^[A-Za-z0-9\-_]+$/;
        if (!couponRegex.test(value.trim())) {
          return 'Mã coupon chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới';
        }
        return '';

      case 'description':
        if (value && value.length > config.maxDescriptionLength) {
          return `Mô tả không được vượt quá ${config.maxDescriptionLength} ký tự`;
        }
        return '';

      case 'discountValue':
        if (!value || value.trim() === '') {
          return formData.discountType === 'percentage' 
            ? 'Phần trăm giảm giá không được để trống'
            : 'Số tiền giảm giá không được để trống';
        }
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
          return 'Giá trị phải là số dương';
        }
        if (formData.discountType === 'percentage' && num > config.maxDiscountPercent) {
          return `Phần trăm không được vượt quá ${config.maxDiscountPercent}%`;
        }
        return '';

      case 'usageLimit':
        if (!value || value.trim() === '') {
          return 'Giới hạn sử dụng không được để trống';
        }
        const limit = parseInt(value);
        if (isNaN(limit) || limit < config.minUsageLimit) {
          return `Giới hạn sử dụng phải là số nguyên >= ${config.minUsageLimit}`;
        }
        return '';

      default:
        return '';
    }
  }, [formData.discountType]);

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let fieldValue;
    
    if (type === 'radio') {
      fieldValue = value;
    } else if (type === 'checkbox') {
      fieldValue = checked;
    } else {
      fieldValue = value;
    }
    
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
      if (key !== 'discountType' && key !== 'isActive') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    // Validate comboId
    if (!comboId) {
      newErrors.comboId = 'Combo ID không được tìm thấy. Vui lòng truy cập từ trang quản lý combo.';
    }

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
      // Prepare coupon data according to database schema
      // Schema: CODE, DESCRIPTION, DISCOUNT_PERCENT, DISCOUNT_AMOUNT, USAGE_LIMIT, SERVICECOMBO_ID
      // HOST_ID, CREATED_AT, UPDATED_AT, USAGE_COUNT, IS_ACTIVE are set by backend (IS_ACTIVE defaults to 1)
      const couponData = {
        Code: formData.code.trim(),
        Description: formData.description.trim() || null,
        DiscountPercent: formData.discountType === 'percentage' ? parseFloat(formData.discountValue) : null,
        DiscountAmount: formData.discountType === 'amount' ? parseFloat(formData.discountValue) : null,
        UsageLimit: parseInt(formData.usageLimit),
        ServiceComboId: parseInt(comboId)
      };

      // Submit to backend API
      const result = await createCoupon(couponData);
      if (result?.id || result?.Id) {
        alert('Coupon đã được tạo thành công!');
        // Redirect back to coupon manager with comboId
        window.location.href = `/coupon-manager?comboId=${comboId}`;
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi tạo coupon. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const comboId = urlParams.get('comboId');
    if (comboId) {
      window.location.href = `/coupon-manager?comboId=${comboId}`;
    } else {
      window.location.href = '/coupon-manager';
    }
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };


  // Validate comboId on mount
  useEffect(() => {
    if (!comboId) {
      setErrors(prev => ({
        ...prev,
        comboId: 'Combo ID không được tìm thấy. Vui lòng truy cập từ trang quản lý combo.'
      }));
    }
  }, [comboId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarActive) {
        setSidebarActive(false);
      }
      if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('createCouponForm').dispatchEvent(new Event('submit'));
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
          <h2>Tạo coupon mới</h2>
        </div>
      </section>

      {/* Main Content */}
      <main className={`content ${sidebarActive ? 'shift' : ''}`} role="main">
        <div className="form-content">
          <div className="disclaimer-text">
            (<span className="required-indicator">*</span>) bắt buộc
          </div>

          <form id="createCouponForm" onSubmit={handleSubmit} noValidate>
            {/* CODE Field - CODE NVARCHAR(50) UNIQUE NOT NULL */}
            <div className="field">
              <label htmlFor="code">
                Nhập mã coupon (CODE)
                <span className="required-indicator">*</span>
              </label>
              <input
                id="code"
                name="code"
                type="text"
                maxLength={config.maxCodeLength}
                required
                placeholder="Ví dụ: SUMMER2024, WELCOME10, DISCOUNT50"
                value={formData.code}
                onChange={handleInputChange}
                aria-describedby="code-hint"
                autoComplete="off"
              />
              <div id="code-hint" className="hint">
                Mã coupon có thể chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_). Tối đa {config.maxCodeLength} ký tự.
              </div>
            </div>

            {/* DESCRIPTION Field - DESCRIPTION NVARCHAR(255) */}
            <div className="field">
              <label htmlFor="description">Mô tả về coupon (DESCRIPTION)</label>
              <textarea
                id="description"
                name="description"
                maxLength={config.maxDescriptionLength}
                placeholder="Mô tả về coupon (tối đa 255 ký tự)"
                value={formData.description}
                onChange={handleInputChange}
                aria-describedby="description-hint"
                rows="3"
              />
              <div id="description-hint" className="hint">
                Còn lại: <span>{config.maxDescriptionLength - formData.description.length}</span> ký tự
              </div>
            </div>

            {/* Discount Type Selection */}
            <div className="field">
              <label>Loại giảm giá (Discount Type)</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={formData.discountType === 'percentage'}
                    onChange={handleInputChange}
                  />
                  <span>Phần trăm (%)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="discountType"
                    value="amount"
                    checked={formData.discountType === 'amount'}
                    onChange={handleInputChange}
                  />
                  <span>Số tiền (VND)</span>
                </label>
              </div>
            </div>

            {/* Discount Value Field */}
            <div className="field">
              <label htmlFor="discountValue">
                {formData.discountType === 'percentage' ? 'Phần trăm giảm giá (%)' : 'Số tiền giảm giá (VND)'}
                <span className="required-indicator">*</span>
              </label>
              <input
                id="discountValue"
                name="discountValue"
                type="number"
                step={formData.discountType === 'percentage' ? '1' : '0.01'}
                min="0"
                max={formData.discountType === 'percentage' ? config.maxDiscountPercent : undefined}
                required
                placeholder={formData.discountType === 'percentage' ? 'Ví dụ: 10, 25, 50' : 'Ví dụ: 50000, 100000'}
                value={formData.discountValue}
                onChange={handleInputChange}
                aria-describedby="discountValue-hint"
                inputMode="decimal"
              />
              <div id="discountValue-hint" className="hint">
                {formData.discountType === 'percentage' 
                  ? `Phần trăm giảm giá tối đa ${config.maxDiscountPercent}%`
                  : 'Nhập số tiền giảm giá (VND)'}
              </div>
            </div>

            {/* USAGE_LIMIT Field - USAGE_LIMIT INT NOT NULL */}
            <div className="field">
              <label htmlFor="usageLimit">
                Giới hạn sử dụng (USAGE_LIMIT)
                <span className="required-indicator">*</span>
              </label>
              <input
                id="usageLimit"
                name="usageLimit"
                type="number"
                min={config.minUsageLimit}
                required
                placeholder="Ví dụ: 100, 500, 1000"
                value={formData.usageLimit}
                onChange={handleInputChange}
                aria-describedby="usageLimit-hint"
                inputMode="numeric"
              />
              <div id="usageLimit-hint" className="hint">
                Số lần tối đa coupon có thể được sử dụng (tối thiểu {config.minUsageLimit} lần)
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-action">
              <button type="submit" className="primary" disabled={isLoading || !comboId}>
                {isLoading ? 'Đang xử lý...' : 'Tạo coupon'}
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

export default CreateCoupon;

