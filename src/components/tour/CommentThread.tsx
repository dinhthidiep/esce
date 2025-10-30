import React, { useState } from 'react';
import { Comment } from '../../types/tour';
import ReactionBar from './ReactionBar';

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onReaction: (commentId: string, type: 'LIKE' | 'LOVE' | 'HELPFUL' | 'FUNNY') => void;
  className?: string;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onAddComment,
  onReaction,
  className = ''
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim() || !replyingTo) return;

    setIsSubmitting(true);
    
    try {
      await onAddComment(replyContent.trim(), replyingTo);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi phản hồi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {comment.userAvatar ? (
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {comment.userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 text-sm">{comment.userName}</h4>
                {comment.isVerified && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                    ✓
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center justify-between">
          <ReactionBar
            reactions={comment.reactions}
            onReaction={(type) => onReaction(comment.id, type)}
            targetType="comment"
            targetId={comment.id}
          />
          
          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Phản hồi
            </button>
          )}
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <form onSubmit={handleSubmitReply} className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết phản hồi..."
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isSubmitting ? 'Gửi...' : 'Gửi'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Add Comment Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Đặt câu hỏi</h3>
        
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Bạn có câu hỏi gì về tour này? Hãy đặt câu hỏi để nhận được phản hồi từ chủ tour..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {newComment.length}/500 ký tự
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có câu hỏi</h3>
          <p className="text-gray-600">Hãy là người đầu tiên đặt câu hỏi về tour này!</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Câu hỏi và trả lời ({comments.length})
          </h3>
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;











