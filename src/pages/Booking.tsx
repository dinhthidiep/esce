import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tour, BookingDraft, Promotion, Addon, TourSchedule } from '../types/tour';
import { tourService } from '../mocks/tour.service';
import Header from '../components/Header';

// Booking Steps
interface BookingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking data from location state
  const bookingData = location.state as {
    tour: Tour;
    selectedDate: string;
    selectedDateInfo: {
      date: string;
      price: number;
      remainingSlots: number;
    };
  } | null;

  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tour data
  const [tour, setTour] = useState<Tour | null>(null);
  const [schedule, setSchedule] = useState<TourSchedule | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  
  // Booking form data
  const [bookingType] = useState<'PERSONAL' | 'GROUP' | 'TEAM'>('PERSONAL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    date: string;
    price: number;
    remainingSlots: number;
  } | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<{ [key: string]: number }>({});
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  
  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Booking steps
  const [steps] = useState<BookingStep[]>([
    { id: '1', title: 'Chọn tour & ngày', description: 'Xác nhận thông tin tour và ngày khởi hành', completed: false },
    { id: '2', title: 'Thông tin khách hàng', description: 'Nhập thông tin liên hệ và yêu cầu đặc biệt', completed: false },
    { id: '3', title: 'Xác nhận & thanh toán', description: 'Kiểm tra lại thông tin và hoàn tất đặt tour', completed: false }
  ]);

  useEffect(() => {
    if (bookingData) {
      setTour(bookingData.tour);
      setSelectedDate(bookingData.selectedDate);
      setSelectedDateInfo(bookingData.selectedDateInfo);
    } else if (id) {
      loadTourData();
    } else {
      navigate('/tours');
    }
  }, [id, bookingData, navigate]);

  const loadTourData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [tourData, scheduleData, promotionsData, addonsData] = await Promise.all([
        tourService.getTourById(id),
        tourService.getTourSchedule(id),
        tourService.getTourPromotions(id),
        tourService.getTourAddons(id)
      ]);

      if (!tourData) {
        setError('Không tìm thấy tour');
        return;
      }

      setTour(tourData);
      setSchedule(scheduleData);
      setPromotions(promotionsData);
      setAddons(addonsData);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu tour');
      console.error('Error loading tour:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDatePrice = (date: string) => {
    if (selectedDateInfo && date === selectedDate) {
      return selectedDateInfo.price;
    }
    const dateInfo = schedule?.availableDates.find(d => d.date === date);
    return dateInfo?.price || tour?.price || 0;
  };

  const calculateSubtotal = () => {
    if (!selectedDate) return 0;
    
    const basePrice = getDatePrice(selectedDate);
    const adultTotal = adults * basePrice;
    const childTotal = children * (basePrice * 0.5);
    
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

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: Math.max(0, quantity)
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitBooking = async () => {
    if (!tour || !selectedDate) return;

    setIsLoading(true);
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

      // Mock booking creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const bookingId = `BK${Date.now()}`;

      // Navigate to success page with summary
      navigate('/booking/success', {
        state: {
          bookingId,
          tourTitle: tour.title,
          date: selectedDate,
          total: booking.total
        }
      });
    } catch (error) {
      setError('Có lỗi xảy ra khi đặt tour. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Tour Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin tour</h3>
              {tour && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img 
                      src={tour.images[0]} 
                      alt={tour.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{tour.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{tour.shortDescription}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>📍 {tour.region}</span>
                        <span>⏱️ {tour.duration} ngày</span>
                        <span>👥 {tour.minGroupSize}-{tour.maxGroupSize} người</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Date Info */}
            {selectedDate && selectedDateInfo && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ngày khởi hành đã chọn</h3>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{formatDate(selectedDate)}</div>
                    <div className="text-sm text-gray-600">Còn {selectedDateInfo.remainingSlots} chỗ</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{formatPrice(selectedDateInfo.price)}</div>
                    <div className="text-sm text-gray-600">mỗi người</div>
                  </div>
                </div>
              </div>
            )}

            {/* People Count */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Số lượng người</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Người lớn</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="p-3 hover:bg-gray-100"
                      disabled={adults <= 1}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="flex-1 text-center font-medium text-lg">{adults}</span>
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="p-3 hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trẻ em (2-11 tuổi)</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="p-3 hover:bg-gray-100"
                      disabled={children <= 0}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="flex-1 text-center font-medium text-lg">{children}</span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="p-3 hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {children > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  Trẻ em được giảm 50% giá tour
                </div>
              )}
            </div>

            {/* Addons */}
            {addons.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Dịch vụ bổ sung</h3>
                <div className="space-y-4">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{addon.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{addon.description}</div>
                        <div className="text-sm font-medium text-green-600 mt-1">
                          {formatPrice(addon.price)}
                          {addon.type === 'PER_PERSON' ? '/người' : '/nhóm'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateAddonQuantity(addon.id, (selectedAddons[addon.id] || 0) - 1)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          disabled={(selectedAddons[addon.id] || 0) <= 0}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center font-medium text-lg">
                          {selectedAddons[addon.id] || 0}
                        </span>
                        <button
                          onClick={() => updateAddonQuantity(addon.id, (selectedAddons[addon.id] || 0) + 1)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promotions */}
            {promotions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Mã giảm giá</h3>
                <div className="space-y-3">
                  {promotions.map((promo) => (
                    <button
                      key={promo.id}
                      onClick={() => setSelectedPromo(selectedPromo?.id === promo.id ? null : promo)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedPromo?.id === promo.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{promo.name}</div>
                          <div className="text-sm text-gray-600">Mã: {promo.code}</div>
                          <div className="text-sm text-green-600">
                            {promo.type === 'PERCENT' 
                              ? `Giảm ${promo.value}%`
                              : `Giảm ${formatPrice(promo.value)}`
                            }
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedPromo?.id === promo.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedPromo?.id === promo.id && (
                            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú đặc biệt
                </label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập yêu cầu đặc biệt (dị ứng thực phẩm, yêu cầu ăn chay, v.v.)"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tóm tắt đặt tour</h3>
              
              {/* Tour Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex gap-4">
                  {tour && (
                    <>
                      <img 
                        src={tour.images[0]} 
                        alt={tour.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{tour.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{tour.region}</p>
                        <p className="text-sm text-gray-600">
                          Ngày khởi hành: {selectedDate && formatDate(selectedDate)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Họ tên:</strong> {customerInfo.fullName}</p>
                  <p><strong>Email:</strong> {customerInfo.email}</p>
                  <p><strong>SĐT:</strong> {customerInfo.phone}</p>
                  {customerInfo.address && <p><strong>Địa chỉ:</strong> {customerInfo.address}</p>}
                  {customerInfo.notes && <p><strong>Ghi chú:</strong> {customerInfo.notes}</p>}
                </div>
              </div>

              {/* Price Breakdown */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Chi tiết giá</h4>
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
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatPrice(calculateDiscount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-green-600">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Điều khoản và điều kiện</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Bằng việc đặt tour, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.</p>
                <p>• Tour có thể bị hủy do thời tiết hoặc các lý do bất khả kháng.</p>
                <p>• Hủy tour trước 24h sẽ được hoàn tiền 100%.</p>
                <p>• Hủy tour trong vòng 24h sẽ bị phí 50%.</p>
                <p>• Thông tin cá nhân của bạn sẽ được bảo mật theo chính sách riêng tư.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading && !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin tour...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy tour</h1>
          <p className="text-gray-600 mb-4">{error || 'Tour không tồn tại hoặc đã bị xóa'}</p>
          <button
            onClick={() => navigate('/tours')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Đặt tour</h1>
          <p className="text-gray-600 mt-2">Hoàn tất thông tin để đặt tour của bạn</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Steps */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep > index + 1
                        ? 'border-green-500 bg-green-500 text-white'
                        : currentStep === index + 1
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > index + 1 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="font-medium">{step.id}</span>
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <div className={`text-sm font-medium ${
                        currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                        currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-6">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quay lại
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  disabled={!selectedDate || (currentStep === 2 && (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone))}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  onClick={handleSubmitBooking}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang xử lý...' : 'Hoàn tất đặt tour'}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Price Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt giá</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Người lớn ({adults})</span>
                    <span>{formatPrice(adults * getDatePrice(selectedDate))}</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span>Trẻ em ({children})</span>
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
                        <span>{addon.name}</span>
                        <span>{formatPrice(addonTotal)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Tạm tính</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatPrice(calculateDiscount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-green-600">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tour Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tour</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Mã tour: {tour.id.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Nơi khởi hành: {tour.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Ngày khởi hành: {selectedDate && formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Thời gian: {tour.duration} ngày</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedDateInfo?.remainingSlots && selectedDateInfo.remainingSlots > 5 ? 'bg-green-500' : 
                      selectedDateInfo?.remainingSlots && selectedDateInfo.remainingSlots > 0 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span>Còn {selectedDateInfo?.remainingSlots || 0} chỗ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
