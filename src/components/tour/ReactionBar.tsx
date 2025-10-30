import React from 'react';
import { Reaction } from '../../types/tour';

interface ReactionBarProps {
  reactions: Reaction[];
  onReaction: (type: 'LIKE' | 'LOVE' | 'HELPFUL' | 'FUNNY') => void;
  targetType: 'review' | 'comment';
  targetId: string;
  className?: string;
}

const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  onReaction,
  targetType,
  targetId,
  className = ''
}) => {
  const reactionTypes = [
    { type: 'LIKE' as const, icon: '👍', label: 'Thích', color: 'text-blue-600' },
    { type: 'LOVE' as const, icon: '❤️', label: 'Yêu thích', color: 'text-red-600' },
    { type: 'HELPFUL' as const, icon: '💡', label: 'Hữu ích', color: 'text-green-600' },
    { type: 'FUNNY' as const, icon: '😂', label: 'Hài hước', color: 'text-yellow-600' }
  ];

  const getReactionCount = (type: string) => {
    return reactions.filter(reaction => reaction.type === type).length;
  };

  const hasUserReacted = (type: string) => {
    // Mock: assume current user ID is 'current_user'
    return reactions.some(reaction => 
      reaction.type === type && reaction.userId === 'current_user'
    );
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {reactionTypes.map((reactionType) => {
        const count = getReactionCount(reactionType.type);
        const isActive = hasUserReacted(reactionType.type);
        
        return (
          <button
            key={reactionType.type}
            onClick={() => onReaction(reactionType.type)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
              ${isActive 
                ? `${reactionType.color} bg-opacity-10` 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
            title={reactionType.label}
          >
            <span className="text-sm">{reactionType.icon}</span>
            {count > 0 && (
              <span className={isActive ? 'font-semibold' : ''}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBar;











