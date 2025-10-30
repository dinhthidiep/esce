import React from 'react';
import { Tour } from '../../types/tour';

interface PriceBoxProps {
  tour: Tour;
  className?: string;
  onSelectDate?: () => void;
  selectedDate?: string;
  selectedDateInfo?: {
    date: string;
    price: number;
    remainingSlots: number;
  } | null;
  onDateChange?: () => void;
  onBookNow?: () => void;
}

const PriceBox: React.FC<PriceBoxProps> = ({ 
  tour, 
  className = '', 
  onSelectDate,
  selectedDate,
  selectedDateInfo,
  onDateChange,
  onBookNow
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (tour.originalPrice && tour.originalPrice > tour.price) {
      return Math.round((1 - tour.price / tour.originalPrice) * 100);
    }
    return 0;
  };

  const formatDate = (dateString: string) => {
    // Parse date string as YYYY-MM-DD and create date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // If date is selected, show selected version
  if (selectedDate && selectedDateInfo) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-left">
          {/* Price */}
          <div className="mb-4">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {formatPrice(selectedDateInfo.price)}
            </div>
            <div className="text-sm text-gray-600">mỗi người</div>
          </div>

          {/* Tour Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Mã tour: {tour.id.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Nơi khởi hành: {tour.region}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Ngày khởi hành: {formatDate(selectedDate)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Thời gian: {tour.duration} ngày</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${
                selectedDateInfo.remainingSlots > 5 ? 'bg-green-500' : 
                selectedDateInfo.remainingSlots > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span>Còn {selectedDateInfo.remainingSlots} chỗ</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onDateChange}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Ngày khác
            </button>
            <button
              onClick={onBookNow}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Đặt ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default version
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="text-center">
        {/* Price */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {formatPrice(tour.price)}
          </div>
          <div className="text-sm text-gray-600">mỗi người</div>
        </div>

        {/* Original Price and Discount */}
        {tour.originalPrice && tour.originalPrice > tour.price && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(tour.originalPrice)}
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                -{getDiscountPercentage()}%
              </span>
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                tour.remainingSlots > 5 ? 'bg-green-500' : 
                tour.remainingSlots > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-600">
                {tour.remainingSlots > 0 
                  ? `Còn ${tour.remainingSlots} chỗ trống`
                  : 'Hết chỗ'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Group Size Info */}
        <div className="text-xs text-gray-500 mb-4">
          Nhóm {tour.minGroupSize}-{tour.maxGroupSize} người
        </div>

        {/* Features */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Hủy miễn phí trước 24h</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Bảo hiểm du lịch</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Hướng dẫn viên chuyên nghiệp</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Vé tham quan bao gồm</span>
          </div>
        </div>

        {/* Select Date Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onSelectDate}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Chọn ngày khởi hành
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceBox;
