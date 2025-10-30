import React from 'react';

interface SectionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const SectionTabs: React.FC<SectionTabsProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: '📋' },
    { id: 'schedule', label: 'Lịch trình', icon: '🗓️' },
    { id: 'calendar', label: 'Lịch khởi hành', icon: '📅' },
    { id: 'reviews', label: 'Đánh giá', icon: '⭐' },
    { id: 'qa', label: 'Hỏi đáp', icon: '❓' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SectionTabs;
