import React, { useState } from 'react';
import { TourSchedule } from '../../types/tour';

interface SchedulePickerProps {
  schedule: TourSchedule;
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  className?: string;
}

const SchedulePicker: React.FC<SchedulePickerProps> = ({
  schedule,
  selectedDate,
  onDateSelect,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getDateInfo = (dateString: string) => {
    return schedule.availableDates.find(d => d.date === dateString);
  };

  const isDateAvailable = (dateString: string) => {
    const dateInfo = getDateInfo(dateString);
    return dateInfo?.isAvailable && dateInfo.remainingSlots > 0;
  };

  const getDatePrice = (dateString: string) => {
    const dateInfo = getDateInfo(dateString);
    return dateInfo?.price || 0;
  };

  const getRemainingSlots = (dateString: string) => {
    const dateInfo = getDateInfo(dateString);
    return dateInfo?.remainingSlots || 0;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 6 weeks (42 days)
    for (let i = 0; i < 42; i++) {
      // Create dateString in YYYY-MM-DD format without timezone issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const isSelected = selectedDate === dateString;
      const isAvailable = isDateAvailable(dateString);
      const isPast = currentDate < new Date().setHours(0, 0, 0, 0);
      
      days.push({
        date: currentDate.getDate(),
        dateString,
        isCurrentMonth,
        isToday,
        isSelected,
        isAvailable,
        isPast,
        price: getDatePrice(dateString),
        remainingSlots: getRemainingSlots(dateString)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Chọn ngày khởi hành</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-medium text-gray-900 min-w-[120px] text-center">
            {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => {
              if (day.isAvailable && !day.isPast) {
                onDateSelect(day.dateString);
              }
            }}
            disabled={!day.isAvailable || day.isPast}
            className={`
              relative p-2 text-sm rounded-lg transition-all
              ${!day.isCurrentMonth ? 'text-gray-300' : ''}
              ${day.isPast ? 'text-gray-300 cursor-not-allowed' : ''}
              ${!day.isAvailable && !day.isPast ? 'text-gray-400 cursor-not-allowed' : ''}
              ${day.isToday ? 'bg-blue-100 text-blue-600 font-medium' : ''}
              ${day.isSelected ? 'bg-green-500 text-white font-medium' : ''}
              ${day.isAvailable && !day.isPast && !day.isSelected && !day.isToday ? 'hover:bg-gray-100' : ''}
            `}
          >
            <div>{day.date}</div>
            {day.isAvailable && !day.isPast && day.price > 0 && (
              <div className="text-xs mt-1 font-semibold text-emerald-600">
                {formatPrice(day.price).replace('₫', '')}
              </div>
            )}
            {day.remainingSlots <= 3 && day.remainingSlots > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Đã chọn</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Ít chỗ</span>
          </div>
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-800">
                {formatDate(selectedDate)}
              </div>
              <div className="text-sm text-green-600">
                Còn {getRemainingSlots(selectedDate)} chỗ trống
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-800">
                {formatPrice(getDatePrice(selectedDate))}
              </div>
              <div className="text-xs text-green-600">mỗi người</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePicker;
