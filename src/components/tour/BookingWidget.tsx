import React, { useState, useEffect } from 'react';
import { Tour, BookingDraft, Promotion, Addon, TourSchedule } from '../../types/tour';
import PromoPicker from './PromoPicker';
import SchedulePicker from './SchedulePicker';
import GroupBookingPanel from './GroupBookingPanel';

interface BookingWidgetProps {
  tour: Tour;
  schedule: TourSchedule;
  promotions: Promotion[];
  addons: Addon[];
  className?: string;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({
  tour,
  schedule,
  promotions,
  addons,
  className = ''
}) => {
  const [bookingType, setBookingType] = useState<'PERSONAL' | 'GROUP' | 'TEAM'>('PERSONAL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<{ [key: string]: number }>({});
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getDatePrice = (date: string) => {
    const dateInfo = schedule.availableDates.find(d => d.date === date);
    return dateInfo?.price || tour.price;
  };

  const calculateSubtotal = () => {
    if (!selectedDate) return 0;
    
    const basePrice = getDatePrice(selectedDate);
    const adultTotal = adults * basePrice;
    const childTotal = children * (basePrice * 0.5); // 50% for children
    
    let addonTotal = 0;
    Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
      if (quantity > 0) {
        const addon = addons.find(a => a.id === addonId);
        if (addon) {
          if (addon.type === 'PER_PERSON') {
            addonTotal += addon.price * quantity * (adults + children);
          } else {
            addonTotal += addon.price * quantity;
          }
        }
      }
    });
    
    return adultTotal + childTotal + addonTotal;
  };

  const calculateDiscount = () => {
    if (!selectedPromo) return 0;
    
    const subtotal = calculateSubtotal();
    if (subtotal < (selectedPromo.minOrderAmount || 0)) return 0;
    
    let discount = 0;
    if (selectedPromo.type === 'PERCENT') {
      discount = (subtotal * selectedPromo.value) / 100;
      if (selectedPromo.maxDiscountAmount) {
        discount = Math.min(discount, selectedPromo.maxDiscountAmount);
      }
    } else {
      discount = selectedPromo.value;
    }
    
    return Math.min(discount, subtotal);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return Math.max(0, subtotal - discount);
  };

  const handleBooking = async () => {
    if (!selectedDate) {
      alert('Vui lòng chọn ngày khởi hành');
      return;
    }

    if (adults + children === 0) {
      alert('Vui lòng chọn số lượng người');
      return;
    }

    setIsBooking(true);

    try {
      const booking: BookingDraft = {
        type: bookingType,
        tourId: tour.id,
        date: selectedDate,
        adults,
        children,
        addons: Object.entries(selectedAddons)
          .filter(([_, quantity]) => quantity > 0)
          .map(([addonId, quantity]) => ({ addonId, quantity })),
        promotionCode: selectedPromo?.code,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        total: calculateTotal()
      };

      if (bookingType === 'GROUP') {
        setShowGroupPanel(true);
      } else {
        // Mock booking creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const bookingId = `BK${Date.now()}`;
        alert(`Mock checkout: ${bookingId}\nTổng tiền: ${formatPrice(booking.total)}`);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi đặt tour');
    } finally {
      setIsBooking(false);
    }
  };

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: Math.max(0, quantity)
    }));
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const total = calculateTotal();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Đặt tour</h3>

      {/* Booking Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Loại đặt tour
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'PERSONAL', label: 'Cá nhân', icon: '👤' },
            { value: 'GROUP', label: 'Nhóm', icon: '👥' },
            { value: 'TEAM', label: 'Đội', icon: '🏢' }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setBookingType(type.value as any)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                bookingType === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-lg mb-1">{type.icon}</div>
              <div>{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Picker */}
      <div className="mb-6">
        <SchedulePicker
          schedule={schedule}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      {/* People Count */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Số lượng người
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Người lớn</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setAdults(Math.max(1, adults - 1))}
                className="p-2 hover:bg-gray-100"
                disabled={adults <= 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="flex-1 text-center font-medium">{adults}</span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="p-2 hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Trẻ em (2-11 tuổi)</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setChildren(Math.max(0, children - 1))}
                className="p-2 hover:bg-gray-100"
                disabled={children <= 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="flex-1 text-center font-medium">{children}</span>
              <button
                onClick={() => setChildren(children + 1)}
                className="p-2 hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {children > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            Trẻ em được giảm 50% giá tour
          </div>
        )}
      </div>

      {/* Addons */}
      {addons.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Dịch vụ bổ sung
          </label>
          <div className="space-y-3">
            {addons.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{addon.name}</div>
                  <div className="text-sm text-gray-600">{addon.description}</div>
                  <div className="text-sm font-medium text-green-600">
                    {formatPrice(addon.price)}
                    {addon.type === 'PER_PERSON' ? '/người' : '/nhóm'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateAddonQuantity(addon.id, (selectedAddons[addon.id] || 0) - 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={(selectedAddons[addon.id] || 0) <= 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center font-medium">
                    {selectedAddons[addon.id] || 0}
                  </span>
                  <button
                    onClick={() => updateAddonQuantity(addon.id, (selectedAddons[addon.id] || 0) + 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promo Picker */}
      <div className="mb-6">
        <PromoPicker
          promotions={promotions}
          selectedPromo={selectedPromo}
          onPromoSelect={setSelectedPromo}
          subtotal={subtotal}
        />
      </div>

      {/* Price Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Người lớn ({adults} × {formatPrice(getDatePrice(selectedDate))})</span>
            <span>{formatPrice(adults * getDatePrice(selectedDate))}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between">
              <span>Trẻ em ({children} × {formatPrice(getDatePrice(selectedDate) * 0.5)})</span>
              <span>{formatPrice(children * getDatePrice(selectedDate) * 0.5)}</span>
            </div>
          )}
          {Object.entries(selectedAddons).map(([addonId, quantity]) => {
            if (quantity === 0) return null;
            const addon = addons.find(a => a.id === addonId);
            if (!addon) return null;
            
            const addonTotal = addon.type === 'PER_PERSON' 
              ? addon.price * quantity * (adults + children)
              : addon.price * quantity;
            
            return (
              <div key={addonId} className="flex justify-between">
                <span>{addon.name} (×{quantity})</span>
                <span>{formatPrice(addonTotal)}</span>
              </div>
            );
          })}
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-green-600">
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={!selectedDate || adults + children === 0 || isBooking}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isBooking ? 'Đang xử lý...' : 'Đặt tour ngay'}
      </button>

      {/* Group Booking Panel */}
      {showGroupPanel && (
        <GroupBookingPanel
          tour={tour}
          booking={{
            type: bookingType,
            tourId: tour.id,
            date: selectedDate,
            adults,
            children,
            addons: Object.entries(selectedAddons)
              .filter(([_, quantity]) => quantity > 0)
              .map(([addonId, quantity]) => ({ addonId, quantity })),
            promotionCode: selectedPromo?.code,
            subtotal,
            discount,
            total
          }}
          onClose={() => setShowGroupPanel(false)}
        />
      )}
    </div>
  );
};

export default BookingWidget;











