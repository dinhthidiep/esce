import React, { useState } from 'react';
import { Promotion } from '../../types/tour';

interface PromoPickerProps {
  promotions: Promotion[];
  selectedPromo?: Promotion;
  onPromoSelect: (promo: Promotion | null) => void;
  subtotal: number;
  className?: string;
}

const PromoPicker: React.FC<PromoPickerProps> = ({
  promotions,
  selectedPromo,
  onPromoSelect,
  subtotal,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDiscount = (promo: Promotion) => {
    if (subtotal < (promo.minOrderAmount || 0)) {
      return 0;
    }

    let discount = 0;
    if (promo.type === 'PERCENT') {
      discount = (subtotal * promo.value) / 100;
      if (promo.maxDiscountAmount) {
        discount = Math.min(discount, promo.maxDiscountAmount);
      }
    } else {
      discount = promo.value;
    }

    return Math.min(discount, subtotal);
  };

  const isPromoApplicable = (promo: Promotion) => {
    return subtotal >= (promo.minOrderAmount || 0);
  };

  const filteredPromotions = promotions.filter(promo => 
    promo.isActive && 
    isPromoApplicable(promo) &&
    (searchCode === '' || promo.code.toLowerCase().includes(searchCode.toLowerCase()))
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Mã khuyến mại</h3>
        {selectedPromo && (
          <button
            onClick={() => onPromoSelect(null)}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Xóa
          </button>
        )}
      </div>

      {selectedPromo ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-800">{selectedPromo.name}</div>
              <div className="text-sm text-green-600">Mã: {selectedPromo.code}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-800">
                -{formatPrice(calculateDiscount(selectedPromo))}
              </div>
              <div className="text-xs text-green-600">
                {selectedPromo.type === 'PERCENT' ? `${selectedPromo.value}%` : 'Giảm cố định'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Chọn mã khuyến mại</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isOpen && (
            <div className="mt-3 space-y-3">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Tìm mã khuyến mại..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Promotions List */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredPromotions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    {searchCode ? 'Không tìm thấy mã khuyến mại' : 'Không có mã khuyến mại khả dụng'}
                  </div>
                ) : (
                  filteredPromotions.map((promo) => {
                    const discount = calculateDiscount(promo);
                    const isSelected = selectedPromo?.id === promo.id;
                    
                    return (
                      <button
                        key={promo.id}
                        onClick={() => {
                          onPromoSelect(promo);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{promo.name}</div>
                            <div className="text-sm text-gray-600">Mã: {promo.code}</div>
                            {promo.minOrderAmount && (
                              <div className="text-xs text-gray-500">
                                Đơn tối thiểu: {formatPrice(promo.minOrderAmount)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              -{formatPrice(discount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {promo.type === 'PERCENT' ? `${promo.value}%` : 'Giảm cố định'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Promotions Summary */}
      {!selectedPromo && filteredPromotions.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Có {filteredPromotions.length} mã khuyến mại khả dụng
        </div>
      )}
    </div>
  );
};

export default PromoPicker;











