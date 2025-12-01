import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';

/**
 * Validate coupon code
 * @param {string} code - Coupon code
 * @param {number|null} serviceComboId - Service combo ID (optional)
 * @returns {Promise<{IsValid: boolean}>}
 */
export const validateCoupon = async (code, serviceComboId = null) => {
  try {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.COUPON}/validate`,
      {
        Code: code,
        ServiceComboId: serviceComboId
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

/**
 * Calculate discount amount
 * @param {string} code - Coupon code
 * @param {number} originalAmount - Original amount before discount
 * @returns {Promise<{Discount: number}>}
 */
export const calculateDiscount = async (code, originalAmount) => {
  try {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.COUPON}/calculate-discount`,
      {
        Code: code,
        OriginalAmount: originalAmount
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error calculating discount:', error);
    throw error;
  }
};

/**
 * Apply coupon to booking
 * @param {number} bookingId - Booking ID
 * @param {string} couponCode - Coupon code
 * @returns {Promise<string>}
 */
export const applyCoupon = async (bookingId, couponCode) => {
  try {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.COUPON}/apply`,
      {
        BookingId: bookingId,
        CouponCode: couponCode
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
};

/**
 * Remove coupon from booking
 * @param {number} bookingId - Booking ID
 * @param {string} couponCode - Coupon code
 * @returns {Promise<string>}
 */
export const removeCoupon = async (bookingId, couponCode) => {
  try {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.COUPON}/remove`,
      {
        BookingId: bookingId,
        CouponCode: couponCode
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing coupon:', error);
    throw error;
  }
};

/**
 * Get coupons for a service combo
 * @param {number} serviceComboId - Service combo ID
 * @returns {Promise<Array>}
 */
export const getCouponsForCombo = async (serviceComboId) => {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.COUPON}/combo/${serviceComboId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting coupons for combo:', error);
    throw error;
  }
};

/**
 * Get coupon by code
 * @param {string} code - Coupon code
 * @returns {Promise<Object>}
 */
export const getCouponByCode = async (code) => {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.COUPON}/code/${code}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting coupon by code:', error);
    throw error;
  }
};

/**
 * Get active coupons
 * @returns {Promise<Array>}
 */
export const getActiveCoupons = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.COUPON}/active`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting active coupons:', error);
    throw error;
  }
};



