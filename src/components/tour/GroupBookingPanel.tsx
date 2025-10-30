import React, { useState, useEffect } from 'react';
import { Tour, BookingDraft, GroupBooking, GroupMember } from '../../types/tour';
import { tourService } from '../../mocks/tour.service';

interface GroupBookingPanelProps {
  tour: Tour;
  booking: BookingDraft;
  onClose: () => void;
}

const GroupBookingPanel: React.FC<GroupBookingPanelProps> = ({
  tour,
  booking,
  onClose
}) => {
  const [groupBooking, setGroupBooking] = useState<GroupBooking | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [memberInfo, setMemberInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const createGroup = async () => {
    setIsCreating(true);
    try {
      const group = await tourService.createGroupBooking(booking, {
        name: 'Người tạo nhóm',
        email: 'leader@example.com',
        phone: '0123456789'
      });
      setGroupBooking(group);
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo nhóm');
    } finally {
      setIsCreating(false);
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) {
      alert('Vui lòng nhập mã nhóm');
      return;
    }

    setIsJoining(true);
    try {
      const group = await tourService.joinGroupBooking(
        joinCode,
        memberInfo,
        booking.adults,
        booking.children,
        booking.addons
      );
      setGroupBooking(group);
      setShowJoinForm(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi tham gia nhóm');
    } finally {
      setIsJoining(false);
    }
  };

  const setPaymentMode = async (mode: 'LEADER' | 'SPLIT') => {
    if (!groupBooking) return;
    
    setIsLoading(true);
    try {
      const updatedGroup = await tourService.setGroupPaymentMode(groupBooking.code, mode);
      setGroupBooking(updatedGroup);
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật phương thức thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (!groupBooking) return;
    
    setIsLoading(true);
    try {
      const result = await tourService.confirmGroupBooking(groupBooking.code);
      alert(`Xác nhận đặt nhóm thành công!\nMã đặt tour: ${result.bookingId}\nTổng tiền: ${formatPrice(result.total)}`);
      onClose();
    } catch (error) {
      alert('Có lỗi xảy ra khi xác nhận đặt nhóm');
    } finally {
      setIsLoading(false);
    }
  };

  const copyGroupCode = () => {
    if (groupBooking) {
      navigator.clipboard.writeText(groupBooking.code);
      alert('Đã copy mã nhóm!');
    }
  };

  const copyGroupLink = () => {
    if (groupBooking) {
      const link = `${window.location.origin}/tours/${tour.id}?join=${groupBooking.code}`;
      navigator.clipboard.writeText(link);
      alert('Đã copy link mời!');
    }
  };

  if (!groupBooking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Đặt tour nhóm</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-medium text-gray-900 mb-2">Tạo nhóm mới</h4>
              <p className="text-sm text-gray-600 mb-4">
                Tạo nhóm và mời bạn bè cùng tham gia tour
              </p>
              <button
                onClick={createGroup}
                disabled={isCreating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo nhóm'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">🔗</div>
              <h4 className="font-medium text-gray-900 mb-2">Tham gia nhóm có sẵn</h4>
              <p className="text-sm text-gray-600 mb-4">
                Nhập mã nhóm để tham gia
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nhập mã nhóm"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowJoinForm(true)}
                  disabled={!joinCode.trim()}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
                >
                  Tham gia nhóm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Thông tin thành viên</h3>
            <button
              onClick={() => setShowJoinForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={memberInfo.name}
                onChange={(e) => setMemberInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={memberInfo.email}
                onChange={(e) => setMemberInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={memberInfo.phone}
                onChange={(e) => setMemberInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <button
              onClick={joinGroup}
              disabled={isJoining || !memberInfo.name || !memberInfo.email || !memberInfo.phone}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
            >
              {isJoining ? 'Đang tham gia...' : 'Tham gia nhóm'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Quản lý nhóm</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Group Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-blue-900">Mã nhóm: {groupBooking.code}</h4>
                <p className="text-sm text-blue-700">Ngày khởi hành: {new Date(groupBooking.date).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyGroupCode}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Copy mã
                </button>
                <button
                  onClick={copyGroupLink}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Copy link
                </button>
              </div>
            </div>
            <div className="text-sm text-blue-700">
              Hết hạn: {new Date(groupBooking.expiresAt).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Members List */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Thành viên ({groupBooking.members.length})</h4>
            <div className="space-y-3">
              {groupBooking.members.map((member, index) => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-600">
                        {member.adults} người lớn, {member.children} trẻ em
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatPrice(member.subtotal)}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      member.paymentStatus === 'PAID' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Mode */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Phương thức thanh toán</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMode('LEADER')}
                disabled={isLoading}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  groupBooking.paymentMode === 'LEADER'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-lg mb-1">👑</div>
                <div>Trưởng nhóm thanh toán</div>
              </button>
              <button
                onClick={() => setPaymentMode('SPLIT')}
                disabled={isLoading}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  groupBooking.paymentMode === 'SPLIT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-lg mb-1">💰</div>
                <div>Chia sẻ thanh toán</div>
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Tổng cộng</span>
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(groupBooking.total)}
              </span>
            </div>
            {groupBooking.paymentMode === 'SPLIT' && (
              <div className="text-sm text-gray-600 mt-1">
                Mỗi người: {formatPrice(groupBooking.total / groupBooking.members.length)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={confirmBooking}
              disabled={isLoading || groupBooking.members.length < tour.minGroupSize}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt nhóm'}
            </button>
          </div>

          {groupBooking.members.length < tour.minGroupSize && (
            <div className="mt-3 text-sm text-yellow-600">
              Cần tối thiểu {tour.minGroupSize} người để xác nhận đặt tour
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupBookingPanel;











