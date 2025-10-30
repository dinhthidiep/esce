import React, { useState } from 'react';
import { ScheduleDay } from '../../types/tour';

interface ScheduleAccordionProps {
  schedule: ScheduleDay[];
  className?: string;
}

const ScheduleAccordion: React.FC<ScheduleAccordionProps> = ({
  schedule,
  className = ''
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const formatMeals = (meals: string[]) => {
    if (meals.length === 0) return '';
    
    const mealMap: { [key: string]: string } = {
      'Sáng': 'sáng',
      'Trưa': 'trưa', 
      'Chiều': 'chiều',
      'Tối': 'tối'
    };
    
    const formattedMeals = meals.map(meal => mealMap[meal] || meal.toLowerCase());
    const count = meals.length;
    
    return `${count} bữa ăn (${formattedMeals.join(', ')})`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">LỊCH TRÌNH</h3>
      
      <div className="space-y-3">
        {schedule.map((day) => (
          <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Day Header */}
            <button
              onClick={() => toggleDay(day.day)}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {day.day}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{day.title}</div>
                  <div className="text-sm text-gray-600">{day.description}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Meals Info */}
                {day.meals.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>{formatMeals(day.meals)}</span>
                  </div>
                )}
                
                {/* Expand/Collapse Arrow */}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedDay === day.day ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Day Content */}
            {expandedDay === day.day && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="space-y-4">
                  {/* Activities */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Hoạt động</h4>
                    <ul className="space-y-2">
                      {day.activities.map((activity, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Accommodation */}
                  {day.accommodation && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Nơi ở</h4>
                      <p className="text-sm text-gray-700">{day.accommodation}</p>
                    </div>
                  )}
                  
                  {/* Transport */}
                  {day.transport && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Phương tiện</h4>
                      <p className="text-sm text-gray-700">{day.transport}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleAccordion;
