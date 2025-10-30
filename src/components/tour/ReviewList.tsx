import React from 'react';
import { Review } from '../../types/tour';
import ReactionBar from './ReactionBar';

interface ReviewListProps {
  reviews: Review[];
  onReaction: (reviewId: string, type: 'LIKE' | 'LOVE' | 'HELPFUL' | 'FUNNY') => void;
  className?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onReaction,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-4">⭐</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá</h3>
        <p className="text-gray-600">Hãy là người đầu tiên đánh giá tour này!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Review Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-gray-600">
                    {review.userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{review.userName}</h4>
                  {review.isVerified && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      ✓ Xác thực
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
            <p className="text-gray-700 leading-relaxed">{review.content}</p>
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // Open image in modal or new tab
                      window.open(image, '_blank');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Host Reply */}
          {review.hostReply && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">H</span>
                </div>
                <span className="font-medium text-blue-900">Phản hồi từ chủ tour</span>
                <span className="text-sm text-blue-600">
                  {formatDate(review.hostReply.repliedAt)}
                </span>
              </div>
              <p className="text-blue-800">{review.hostReply.content}</p>
            </div>
          )}

          {/* Reactions */}
          <ReactionBar
            reactions={review.reactions}
            onReaction={(type) => onReaction(review.id, type)}
            targetType="review"
            targetId={review.id}
          />
        </div>
      ))}
    </div>
  );
};

export default ReviewList;











