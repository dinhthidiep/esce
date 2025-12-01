import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';
import Header from './Header';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import Badge from './ui/Badge';
import LoadingSpinner from './LoadingSpinner';
import LazyImage from './LazyImage';
import ImageCarousel from './ImageCarousel';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon, 
  ArrowLeftIcon,
  UsersIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CalendarIcon
} from './icons/index';
import { formatPrice, getImageUrl } from '../lib/utils';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import './ServiceDetail.css';

// Sử dụng đường dẫn public URL thay vì import
const baNaHillImage = '/img/banahills.jpg';

// Hàm parse nhiều ảnh từ Image field
// Hỗ trợ: string đơn, string phân cách bởi dấu phẩy, hoặc array
const parseServiceImages = (imageField, fallbackImage) => {
  // Nếu không có ảnh, trả về fallback image
  if (!imageField || (typeof imageField === 'string' && imageField.trim() === '')) {
    return fallbackImage ? [fallbackImage] : [];
  }

  // Nếu là array, xử lý từng phần tử
  if (Array.isArray(imageField)) {
    const images = imageField
      .filter(img => img && String(img).trim() !== '')
      .map(img => getImageUrl(String(img).trim(), fallbackImage));
    
    // Nếu có ít nhất 1 ảnh, trả về
    if (images.length > 0) {
      return images;
    }
    // Nếu array rỗng, trả về fallback
    return fallbackImage ? [fallbackImage] : [];
  }

  // Nếu là string, kiểm tra xem có nhiều ảnh phân cách bởi dấu phẩy không
  const imageString = String(imageField).trim();
  
  // Kiểm tra nếu có dấu phẩy (nhiều ảnh)
  if (imageString.includes(',')) {
    const images = imageString
      .split(',')
      .map(img => img.trim())
      .filter(img => img !== '')
      .map(img => getImageUrl(img, fallbackImage));
    
    // Nếu có ít nhất 1 ảnh hợp lệ, trả về
    if (images.length > 0) {
      return images;
    }
  }

  // Nếu chỉ có 1 ảnh, trả về mảng với 1 phần tử
  const mainImage = getImageUrl(imageString, fallbackImage);
  return mainImage ? [mainImage] : (fallbackImage ? [fallbackImage] : []);
};

// Additional Icons
const CheckIcon = ({ className = '', ...props }) => (
  <svg 
    className={className} 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const MoreVerticalIcon = ({ className = '', ...props }) => (
  <svg 
    className={className} 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="5" r="1"/>
    <circle cx="12" cy="19" r="1"/>
  </svg>
);

const EditIcon = ({ className = '', ...props }) => (
  <svg 
    className={className} 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = ({ className = '', ...props }) => (
  <svg 
    className={className} 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

// Constants
const MAX_COMMENT_LENGTH = 1000;
const MIN_RATING = 1;
const MAX_RATING = 5;

// Helper để lấy userId từ localStorage
const getUserId = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.Id || userInfo.id;
      if (userId) {
        const parsedId = parseInt(userId);
        if (!isNaN(parsedId) && parsedId > 0) {
          return parsedId;
        }
      }
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(' Error getting user ID:', error);
    }
    return null;
  }
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null); // BookingId để dùng cho can-review check
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
  const [filterRating, setFilterRating] = useState(0); // 0 = all, 1-5 = filter by rating
  const [openMenuId, setOpenMenuId] = useState(null); // ID of review with open menu
  const [editingReviewId, setEditingReviewId] = useState(null); // ID of review being edited
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [deletingReviewId, setDeletingReviewId] = useState(null); // ID of review being deleted
  const [similarServices, setSimilarServices] = useState([]);
  const [loadingSimilarServices, setLoadingSimilarServices] = useState(false);

  // Helper function để enrich reviews (batch load Users thay vì N+1 queries)
  const enrichReviews = useCallback(async (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) return [];
    
    // Lấy tất cả AuthorIds unique
    const authorIds = [...new Set(
      reviewsData
        .map(review => review.AuthorId || review.authorId)
        .filter(id => id != null)
    )];
    
    // Batch load tất cả Users cùng lúc
    const userMap = new Map();
    if (authorIds.length > 0) {
      try {
        const userPromises = authorIds.map(async (authorId) => {
          try {
            const userResponse = await axiosInstance.get(`${API_ENDPOINTS.USER}/${authorId}`);
            return { id: authorId, data: userResponse.data };
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(` Không thể load user ${authorId}:`, err);
            }
            return { id: authorId, data: null };
          }
        });
        
        const userResults = await Promise.allSettled(userPromises);
        userResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            userMap.set(result.value.id, result.value.data);
          }
        });
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(' Lỗi khi batch load Users:', err);
        }
      }
    }
    
    // Enrich reviews với data đã load
    return reviewsData.map(review => {
      const enrichedReview = { ...review };
      const authorId = enrichedReview.AuthorId || enrichedReview.authorId;
      
      if (authorId && userMap.has(authorId)) {
        enrichedReview.User = userMap.get(authorId);
      } else if (authorId) {
        enrichedReview.User = null;
      }
      
      // ServiceCombo đã có trong review hoặc không cần load lại
      // (vì đây là reviews của cùng một service combo)
      
      return enrichedReview;
    });
  }, []);

  // Fetch service data, reviews, and check if user can review
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        // Gọi API ServiceCombo thay vì Service
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SERVICE_COMBO}/${id}`);
        if (process.env.NODE_ENV === 'development') {
          console.log(' ServiceDetail: Nhận được dữ liệu:', response.data);
        }
        setService(response.data);
        
        // Fetch average rating
        try {
          const ratingResponse = await axios.get(`${API_BASE_URL}/Review/servicecombo/${id}/average-rating`);
          setAverageRating(ratingResponse.data.AverageRating || 0);
        } catch (ratingErr) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(' Không thể lấy rating:', ratingErr);
          }
          setAverageRating(0);
        } finally {
          setRatingLoading(false);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(' Lỗi khi tải chi tiết dịch vụ:', err);
        }
        setError(err.response?.status === 404 
          ? 'Không tìm thấy dịch vụ này' 
          : 'Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  // Fetch similar services (các dịch vụ tương tự)
  useEffect(() => {
    const fetchSimilarServices = async () => {
      if (!id) return;
      
      try {
        setLoadingSimilarServices(true);
        // Lấy tất cả services
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SERVICE_COMBO}`);
        const allServices = response.data || [];
        
        // Loại trừ service hiện tại và lấy 4 services khác
        const filtered = allServices
          .filter(s => {
            const serviceId = s.Id || s.id;
            return serviceId !== parseInt(id) && (s.Status || s.status || 'open').toLowerCase() === 'open';
          })
          .slice(0, 4)
          .map(s => {
            // Xử lý trường hợp có nhiều ảnh phân cách bởi dấu phẩy - lấy ảnh đầu tiên cho card
            let imagePath = s.Image || s.image || '';
            if (imagePath && typeof imagePath === 'string' && imagePath.includes(',')) {
              imagePath = imagePath.split(',')[0].trim();
            }
            return {
              id: s.Id || s.id,
              name: s.Name || s.name || 'Dịch vụ',
              image: getImageUrl(imagePath, baNaHillImage),
              price: s.Price || s.price || 0,
              address: s.Address || s.address || '',
              availableSlots: s.AvailableSlots !== undefined ? s.AvailableSlots : (s.availableSlots !== undefined ? s.availableSlots : 0),
              status: s.Status || s.status || 'open'
            };
          });
        
        setSimilarServices(filtered);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(' Lỗi khi tải dịch vụ tương tự:', err);
        }
        setSimilarServices([]);
      } finally {
        setLoadingSimilarServices(false);
      }
    };

    fetchSimilarServices();
  }, [id]);

  // Fetch reviews for this service combo
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        setLoadingReviews(true);
        // Lấy tất cả reviews, sau đó filter theo service combo
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.REVIEW}`);
        const allReviews = response.data || [];
        
        // Filter reviews theo ComboId (database schema)
        const serviceReviews = allReviews.filter(review => {
          const comboId = review.ComboId || review.comboId;
          return comboId === parseInt(id);
        });
        
        // Enrich reviews với batch loading
        const enrichedReviews = await enrichReviews(serviceReviews);
        setReviews(enrichedReviews);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(' Lỗi khi tải reviews:', err);
        }
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Check if user can review this service - Sử dụng API backend đúng logic
  const checkCanReview = useCallback(async () => {
      const userId = getUserId();
      if (!userId || !id) {
        setCanReview(false);
        setSelectedBookingId(null);
        return;
      }

      try {
        // Bước 1: Lấy bookings của user cho service combo này
        const bookingsResponse = await axiosInstance.get(`${API_ENDPOINTS.BOOKING}/user/${userId}`);
        const bookings = bookingsResponse.data || [];
        
        // Bước 2: Filter bookings có ServiceComboId = id và status = confirmed hoặc completed
        const relevantBookings = bookings.filter(booking => {
          const comboId = booking.ServiceComboId || booking.serviceComboId;
          const status = (booking.Status || booking.status || '').toLowerCase();
          return comboId === parseInt(id) && (status === 'confirmed' || status === 'completed');
        });

        if (relevantBookings.length === 0) {
          setCanReview(false);
          setUserBookings([]);
          setSelectedBookingId(null);
          return;
        }

        setUserBookings(relevantBookings);
        
        // Bước 3: Với mỗi booking, gọi API backend can-review để kiểm tra chính xác
        // Backend API: GET /api/Review/booking/{bookingId}/user/{userId}/can-review
        let canReviewResult = false;
        let foundBookingId = null;

        // Kiểm tra từng booking, lấy booking đầu tiên có thể review
        for (const booking of relevantBookings) {
          const bookingId = booking.Id || booking.id;
          if (!bookingId) continue;

          try {
            // Gọi API backend can-review với bookingId cụ thể
            const canReviewResponse = await axiosInstance.get(
              `${API_ENDPOINTS.REVIEW}/booking/${bookingId}/user/${userId}/can-review`
            );
            
            const canReviewData = canReviewResponse.data || {};
            if (canReviewData.CanReview === true || canReviewData.canReview === true) {
              canReviewResult = true;
              foundBookingId = bookingId;
              if (process.env.NODE_ENV === 'development') {
                console.log(` User có thể review booking ${bookingId} cho service combo ${id}`);
              }
              break; // Tìm thấy booking có thể review, không cần check tiếp
            }
          } catch (err) {
            // Nếu API trả về lỗi, tiếp tục check booking khác
            if (process.env.NODE_ENV === 'development') {
              console.warn(` Không thể kiểm tra can-review cho booking ${bookingId}:`, err);
            }
            continue;
          }
        }

        setCanReview(canReviewResult);
        setSelectedBookingId(foundBookingId);
        
        if (process.env.NODE_ENV === 'development') {
          if (canReviewResult) {
            console.log(` User có thể review service combo ${id} với bookingId ${foundBookingId}`);
          } else {
            console.log(` User không thể review service combo ${id} (đã review hoặc chưa đủ điều kiện)`);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(' Lỗi khi kiểm tra can review:', err);
        }
        setCanReview(false);
        setSelectedBookingId(null);
      }
    }, [id]);

  // Gọi checkCanReview khi component mount hoặc id thay đổi
  useEffect(() => {
    checkCanReview();
  }, [checkCanReview]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate rating distribution - Memoized để tránh tính toán lại mỗi render
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = review.Rating || review.rating || 0;
      if (rating >= MIN_RATING && rating <= MAX_RATING) {
        distribution[rating]++;
      }
    });
    return distribution;
  }, [reviews]);

  // Get sorted and filtered reviews - Memoized để tránh sort/filter lại mỗi render
  const sortedAndFilteredReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    let filtered = [...reviews];

    // Filter by rating
    if (filterRating > 0) {
      filtered = filtered.filter(review => {
        const rating = review.Rating || review.rating || 0;
        return rating === filterRating;
      });
    }

    // Sort reviews
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.CreatedAt || a.createdAt || a.CreatedDate || a.createdDate || 0);
      const dateB = new Date(b.CreatedAt || b.createdAt || b.CreatedDate || b.createdDate || 0);
      const ratingA = a.Rating || a.rating || 0;
      const ratingB = b.Rating || b.rating || 0;

      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'highest':
          return ratingB - ratingA;
        case 'lowest':
          return ratingA - ratingB;
        default:
          return dateB - dateA;
      }
    });

    return sorted;
  }, [reviews, sortBy, filterRating]);

  // Helper function to reload reviews
  const reloadReviews = async () => {
    if (!id) return;
    
    try {
      setLoadingReviews(true);
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.REVIEW}`);
      const allReviews = response.data || [];
      const serviceReviews = allReviews.filter(review => {
        const comboId = review.ComboId || review.comboId;
        return comboId === parseInt(id);
      });
      
      // Enrich reviews với batch loading
      const enrichedReviews = await enrichReviews(serviceReviews);
      setReviews(enrichedReviews);
      
      // Reload average rating
      const ratingResponse = await axios.get(`${API_BASE_URL}/Review/servicecombo/${id}/average-rating`);
      setAverageRating(ratingResponse.data.AverageRating || 0);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(' Lỗi khi reload reviews:', err);
      }
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.rating || reviewForm.rating < MIN_RATING || reviewForm.rating > MAX_RATING) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert('Vui lòng đăng nhập để đánh giá');
      navigate('/login', { state: { returnUrl: `/services/${id}` } });
      return;
    }

    if (!id) {
      alert('Không tìm thấy thông tin dịch vụ');
      return;
    }

    try {
      setSubmittingReview(true);
      // Gửi theo format database: ComboId, AuthorId, Content, Rating
      const reviewData = {
        ComboId: parseInt(id),
        AuthorId: userId,
        Rating: reviewForm.rating,
        Content: reviewForm.comment || '',
        ParentReviewId: null
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(' Gửi review data:', reviewData);
      }
      await axiosInstance.post(`${API_ENDPOINTS.REVIEW}`, reviewData);
      
      // Reset form và reload reviews
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      
      await reloadReviews();
      
      // Reload can-review status sau khi submit review (user đã review nên canReview = false)
      await checkCanReview();
      
      alert('Đánh giá của bạn đã được gửi! Cảm ơn bạn đã đánh giá dịch vụ.');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(' Lỗi khi gửi review:', err);
      }
      const errorMessage = err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    const reviewId = review.Id || review.id;
    const rating = review.Rating || review.rating || 5;
    const comment = review.Content || review.content || review.Comment || review.comment || '';
    
    setEditingReviewId(reviewId);
    setEditForm({ rating, comment });
    setOpenMenuId(null);
  };

  const handleUpdateReview = async () => {
    if (!editForm.rating || editForm.rating < MIN_RATING || editForm.rating > MAX_RATING) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!editingReviewId) {
      alert('Không tìm thấy đánh giá cần chỉnh sửa');
      return;
    }

    try {
      setSubmittingReview(true);
      const reviewData = {
        Rating: editForm.rating,
        Content: editForm.comment || ''
      };

      await axiosInstance.put(`${API_ENDPOINTS.REVIEW}/${editingReviewId}`, reviewData);
      
      setEditingReviewId(null);
      setEditForm({ rating: 5, comment: '' });
      setOpenMenuId(null);
      
      await reloadReviews();
      
      alert('Đánh giá đã được cập nhật thành công!');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(' Lỗi khi cập nhật review:', err);
      }
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật đánh giá. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeletingReviewId(reviewId);
      await axiosInstance.delete(`${API_ENDPOINTS.REVIEW}/${reviewId}`);
      
      setOpenMenuId(null);
      await reloadReviews();
      
      // Reload can-review status sau khi delete review (user có thể review lại)
      await checkCanReview();
      
      alert('Đánh giá đã được xóa thành công!');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(' Lỗi khi xóa review:', err);
      }
      const errorMessage = err.response?.data?.message || 'Không thể xóa đánh giá. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.review-menu-container')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'open') {
      return { text: 'Có sẵn', variant: 'success', color: '#047857' };
    } else if (statusLower === 'closed') {
      return { text: 'Đã đóng', variant: 'destructive', color: '#dc2626' };
    } else {
      return { text: 'Đã hủy', variant: 'default', color: '#64748b' };
    }
  };

  if (loading) {
    return (
      <div className="service-detail-page">
        <Header />
        <main className="service-detail-main">
          <LoadingSpinner message="Đang tải thông tin dịch vụ..." />
        </main>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-detail-page">
        <Header />
        <main className="service-detail-main">
          <div className="service-detail-container">
            <div className="error-container" role="alert">
              <h2 className="error-title">Không tìm thấy dịch vụ</h2>
              <p className="error-message">{error || 'Dịch vụ không tồn tại'}</p>
              <Button variant="default" onClick={() => navigate('/services')}>
                <ArrowLeftIcon className="button-icon" />
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const serviceName = service.Name || service.name || 'Dịch vụ';
  const serviceImages = parseServiceImages(service.Image || service.image, baNaHillImage);
  const servicePrice = service.Price || service.price || 0;
  const serviceAddress = service.Address || service.address || '';
  const serviceDescription = service.Description || service.description || '';
  const availableSlots = service.AvailableSlots !== undefined ? service.AvailableSlots : (service.availableSlots !== undefined ? service.availableSlots : 0);
  const status = service.Status || service.status || 'open';
  const statusBadge = getStatusBadge(status);
  const rating = averageRating > 0 ? averageRating : 4.5; // Fallback rating

  return (
    <div className="service-detail-page">
      <Header />
      
      <main className="service-detail-main">
        {/* Hero Section with Image Carousel */}
        <section className="service-hero-section">
          <div className="service-hero-background">
            <ImageCarousel
              images={serviceImages}
              autoPlayInterval={4000}
              fallbackImage={baNaHillImage}
            />
            <div className="service-hero-overlay"></div>
          </div>
          <div className="service-hero-content">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="back-button-hero"
            >
              <ArrowLeftIcon className="button-icon" />
              Quay lại
            </Button>
            <div className="service-hero-info">
              <h1 className="service-hero-title">{serviceName}</h1>
              <div className="service-hero-meta">
                {serviceAddress && (
                  <div className="hero-meta-item">
                    <MapPinIcon className="hero-meta-icon" />
                    <span>{serviceAddress}</span>
                  </div>
                )}
                {!ratingLoading && rating > 0 && (
                  <div className="hero-meta-item">
                    <div className="hero-rating">
                      <StarIcon className="hero-star-icon" filled={true} />
                      <span className="hero-rating-value">{rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                <Badge 
                  variant={statusBadge.variant} 
                  className="hero-status-badge"
                  style={{ backgroundColor: statusBadge.color === '#047857' ? '#d1fae5' : statusBadge.color === '#dc2626' ? '#fee2e2' : '#f1f5f9', color: statusBadge.color }}
                >
                  {statusBadge.text}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="service-detail-container">
          {/* Main Content Grid */}
          <div className="service-detail-content">
            {/* Left Column - Main Content */}
            <div className="service-detail-left">
              {/* Description Section */}
              <Card className="description-card">
                <CardContent>
                  <h2 className="section-title">Mô tả dịch vụ</h2>
                  <div className="description-content">
                    {serviceDescription ? (
                      <p className="description-text">{serviceDescription}</p>
                    ) : (
                      <p className="description-text description-empty">
                        Chưa có mô tả cho dịch vụ này.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Highlights Section */}
              <Card className="highlights-card">
                <CardContent>
                  <h2 className="section-title">Đặc điểm nổi bật</h2>
                  <div className="highlights-grid">
                    <div className="highlight-item">
                      <div className="highlight-icon-wrapper">
                        <CheckCircleIcon className="highlight-icon" />
                      </div>
                      <div className="highlight-content">
                        <h3 className="highlight-title">Dịch vụ chất lượng cao</h3>
                        <p className="highlight-description">Được quản lý và kiểm duyệt bởi hệ thống ESCE</p>
                      </div>
                    </div>
                    <div className="highlight-item">
                      <div className="highlight-icon-wrapper">
                        <ShieldCheckIcon className="highlight-icon" />
                      </div>
                      <div className="highlight-content">
                        <h3 className="highlight-title">Thanh toán an toàn</h3>
                        <p className="highlight-description">Hệ thống thanh toán được bảo mật và an toàn</p>
                      </div>
                    </div>
                    <div className="highlight-item">
                      <div className="highlight-icon-wrapper">
                        <UsersIcon className="highlight-icon" />
                      </div>
                      <div className="highlight-content">
                        <h3 className="highlight-title">Đặt dịch vụ theo nhóm</h3>
                        <p className="highlight-description">Tiết kiệm chi phí khi đặt theo nhóm</p>
                      </div>
                    </div>
                    <div className="highlight-item">
                      <div className="highlight-icon-wrapper">
                        <ClockIcon className="highlight-icon" />
                      </div>
                      <div className="highlight-content">
                        <h3 className="highlight-title">Hỗ trợ 24/7</h3>
                        <p className="highlight-description">Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Information and Cancellation Policy - Two Column Layout */}
              <div className="info-policy-grid">
                {/* Left Column - Service Information */}
                <Card className="service-info-card-detail">
                  <CardContent>
                    <h2 className="section-title">Thông tin chi tiết</h2>
                    <div className="detail-info-list">
                      {serviceAddress && (
                        <div className="detail-info-item">
                          <MapPinIcon className="detail-info-icon" />
                          <div className="detail-info-content">
                            <span className="detail-info-label">ĐỊA CHỈ</span>
                            <span className="detail-info-value">{serviceAddress}</span>
                          </div>
                        </div>
                      )}
                      <div className="detail-info-item">
                        <ClockIcon className="detail-info-icon" />
                        <div className="detail-info-content">
                          <span className="detail-info-label">SỐ CHỖ CÒN LẠI</span>
                          <span className="detail-info-value">
                             {availableSlots > 0 ? `${availableSlots} chỗ` : 'Đã hết chỗ'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column - Cancellation Policy */}
                <Card className="policy-card-detail">
                  <CardContent>
                    <h2 className="section-title">Chính sách hủy</h2>
                    <div className="policy-detail-list">
                      <div className="policy-detail-item policy-item-48h-before">
                        <svg className="policy-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className="policy-detail-text">Hủy trước 48h được hoàn 90%</span>
                      </div>
                      <div className="policy-detail-item policy-item-48h-within">
                        <svg className="policy-icon warning" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                          <path d="M12 9v4"/>
                          <path d="M12 17h.01"/>
                        </svg>
                        <span className="policy-detail-text">Hủy trong vòng 48h hoàn 50%</span>
                      </div>
                      <div className="policy-detail-item policy-item-24h-within">
                        <svg className="policy-icon danger" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        <span className="policy-detail-text">Hủy trong vòng 24h không hoàn tiền</span>
                      </div>
                    </div>
                    <div className="policy-note">
                      <span className="policy-note-text">* Thời gian tính từ lúc check-in</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews Section */}
              <Card className="reviews-card">
                <CardContent>
                  <div className="reviews-header">
                    <div className="reviews-header-left">
                      <h2 className="section-title">Đánh giá từ khách hàng</h2>
                      {reviews.length > 0 && (
                        <span className="reviews-count">({reviews.length} đánh giá)</span>
                      )}
                    </div>
                    {canReview && !showReviewForm && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          const userId = getUserId();
                          if (!userId) {
                            navigate('/login', { state: { returnUrl: `/services/${id}` } });
                            return;
                          }
                          setShowReviewForm(true);
                        }}
                        className="write-review-btn"
                      >
                        <StarIcon className="button-icon" />
                        Viết đánh giá
                      </Button>
                    )}
                  </div>

                  {/* Rating Summary */}
                  {!loadingReviews && reviews.length > 0 && (
                    <div className="rating-summary-section">
                      <div className="rating-summary-main">
                        <div className="rating-overall">
                          <div className="rating-overall-value">
                            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                          </div>
                          <div className="rating-overall-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className="rating-overall-star"
                                filled={star <= Math.round(averageRating)}
                              />
                            ))}
                          </div>
                          <div className="rating-overall-label">
                            {reviews.length} {reviews.length === 1 ? 'đánh giá' : 'đánh giá'}
                          </div>
                        </div>
                        <div className="rating-distribution">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingDistribution[star] || 0;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={star} className="rating-distribution-item">
                                <div className="distribution-star">
                                  <span className="distribution-star-number">{star}</span>
                                  <StarIcon className="distribution-star-icon" filled={true} />
                                </div>
                                <div className="distribution-bar-wrapper">
                                  <div 
                                    className="distribution-bar"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Form */}
                  {showReviewForm && (
                    <div className="review-form-container">
                      <div className="review-form-header">
                        <h3 className="review-form-title">Viết đánh giá của bạn</h3>
                        <button
                          className="review-form-close"
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewForm({ rating: 5, comment: '' });
                          }}
                          aria-label="Đóng form"
                        >
                          ×
                        </button>
                      </div>
                      <div className="review-form-rating">
                        <label>Đánh giá của bạn:</label>
                        <div className="star-rating-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`star-button ${star <= reviewForm.rating ? 'active' : ''}`}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              aria-label={`${star} sao`}
                            >
                              <StarIcon className="star-icon" filled={star <= reviewForm.rating} />
                            </button>
                          ))}
                          <span className="rating-text">
                            {reviewForm.rating === 5 && 'Tuyệt vời'}
                            {reviewForm.rating === 4 && 'Rất tốt'}
                            {reviewForm.rating === 3 && 'Tốt'}
                            {reviewForm.rating === 2 && 'Khá'}
                            {reviewForm.rating === 1 && 'Kém'}
                          </span>
                        </div>
                      </div>
                      <div className="review-form-comment">
                        <label htmlFor="review-comment">Nhận xét chi tiết:</label>
                        <textarea
                          id="review-comment"
                          rows="5"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này. Điều gì bạn thích nhất? Có điều gì cần cải thiện không?"
                          maxLength={MAX_COMMENT_LENGTH}
                        />
                        <div className="char-count-wrapper">
                          <span className="char-count">{reviewForm.comment.length}/{MAX_COMMENT_LENGTH} ký tự</span>
                        </div>
                      </div>
                      <div className="review-form-actions">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewForm({ rating: 5, comment: '' });
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="default"
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                        >
                          {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Sort and Filter Controls */}
                  {!loadingReviews && reviews.length > 0 && (
                    <div className="reviews-controls">
                      <div className="reviews-sort">
                        <label htmlFor="sort-select">Sắp xếp:</label>
                        <div className="sort-select-wrapper">
                          <select
                            id="sort-select"
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                          >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="highest">Điểm cao nhất</option>
                            <option value="lowest">Điểm thấp nhất</option>
                          </select>
                          <ChevronDownIcon className="sort-chevron" />
                        </div>
                      </div>
                      <div className="reviews-filter">
                        <label htmlFor="filter-select">Lọc theo sao:</label>
                        <div className="filter-select-wrapper">
                          <select
                            id="filter-select"
                            className="filter-select"
                            value={filterRating}
                            onChange={(e) => setFilterRating(parseInt(e.target.value))}
                          >
                            <option value="0">Tất cả</option>
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="2">2 sao</option>
                            <option value="1">1 sao</option>
                          </select>
                          <ChevronDownIcon className="filter-chevron" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  {loadingReviews ? (
                    <LoadingSpinner message="Đang tải đánh giá..." />
                  ) : reviews.length === 0 ? (
                    <div className="reviews-empty">
                      <div className="reviews-empty-icon-wrapper">
                        <StarIcon className="reviews-empty-icon" />
                      </div>
                      <h3 className="reviews-empty-title">Chưa có đánh giá nào</h3>
                      <p className="reviews-empty-text">Hãy là người đầu tiên đánh giá dịch vụ này!</p>
                      {canReview && (
                        <Button
                          variant="default"
                          onClick={() => {
                            const userId = getUserId();
                            if (!userId) {
                              navigate('/login', { state: { returnUrl: `/services/${id}` } });
                              return;
                            }
                            setShowReviewForm(true);
                          }}
                          className="write-review-empty-btn"
                        >
                          <StarIcon className="button-icon" />
                          Viết đánh giá đầu tiên
                        </Button>
                      )}
                    </div>
                  ) : sortedAndFilteredReviews.length === 0 ? (
                    <div className="reviews-empty">
                      <div className="reviews-empty-icon-wrapper">
                        <StarIcon className="reviews-empty-icon" />
                      </div>
                      <h3 className="reviews-empty-title">Không tìm thấy đánh giá</h3>
                      <p className="reviews-empty-text">Không có đánh giá nào phù hợp với bộ lọc của bạn.</p>
                      <Button
                        variant="outline"
                        onClick={() => setFilterRating(0)}
                        className="reset-filter-btn"
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {sortedAndFilteredReviews.map((review) => {
                        const reviewId = review.Id || review.id;
                        const user = review.User || review.user;
                        const userName = user?.Name || user?.name || 'Khách hàng';
                        const userAvatar = user?.Avatar || user?.avatar || '';
                        const authorId = review.AuthorId || review.authorId;
                        const rating = review.Rating || review.rating || 0;
                        const comment = review.Content || review.content || review.Comment || review.comment || '';
                        const createdAt = review.CreatedAt || review.createdAt || review.CreatedDate || review.createdDate;
                        const currentUserId = getUserId();
                        const isOwnReview = currentUserId && authorId && parseInt(authorId) === parseInt(currentUserId);
                        const isEditing = editingReviewId === reviewId;
                          
                        return (
                          <div key={reviewId} className="review-item">
                            {isEditing ? (
                              <div className="review-edit-form">
                                <div className="review-form-rating">
                                  <label>Đánh giá:</label>
                                  <div className="star-rating-input">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        className={`star-button ${star <= editForm.rating ? 'active' : ''}`}
                                        onClick={() => setEditForm({ ...editForm, rating: star })}
                                        aria-label={`${star} sao`}
                                      >
                                        <StarIcon className="star-icon" filled={star <= editForm.rating} />
                                      </button>
                                    ))}
                                    <span className="rating-text">
                                      {editForm.rating === 5 && 'Tuyệt vời'}
                                      {editForm.rating === 4 && 'Rất tốt'}
                                      {editForm.rating === 3 && 'Tốt'}
                                      {editForm.rating === 2 && 'Khá'}
                                      {editForm.rating === 1 && 'Kém'}
                                    </span>
                                  </div>
                                </div>
                                <div className="review-form-comment">
                                  <label htmlFor={`edit-comment-${reviewId}`}>Nhận xét:</label>
                                  <textarea
                                    id={`edit-comment-${reviewId}`}
                                    rows="4"
                                    value={editForm.comment}
                                    onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                    placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                                    maxLength={MAX_COMMENT_LENGTH}
                                  />
                                  <div className="char-count-wrapper">
                                    <span className="char-count">{editForm.comment.length}/{MAX_COMMENT_LENGTH} ký tự</span>
                                  </div>
                                </div>
                                <div className="review-form-actions">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingReviewId(null);
                                      setEditForm({ rating: 5, comment: '' });
                                    }}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    variant="default"
                                    onClick={handleUpdateReview}
                                    disabled={submittingReview}
                                  >
                                    {submittingReview ? 'Đang lưu...' : 'Lưu thay đổi'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="review-item-header">
                                  <div className="review-user">
                                    <div className="review-avatar">
                                      {userAvatar ? (
                                        <img src={userAvatar} alt={userName} />
                                      ) : (
                                        <span>{userName.charAt(0).toUpperCase()}</span>
                                      )}
                                    </div>
                                    <div className="review-user-info">
                                      <div className="review-user-name">{userName}</div>
                                      <div className="review-date-row">
                                        <CalendarIcon className="review-date-icon" />
                                        <span>{formatDate(createdAt)}</span>
                                      </div>
                                      <div className="review-rating-row">
                                        <div className="review-stars">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                              key={star}
                                              className="review-star"
                                              filled={star <= rating}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {isOwnReview && (
                                    <div className="review-menu-container">
                                      <button
                                        className="review-menu-button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(openMenuId === reviewId ? null : reviewId);
                                        }}
                                        aria-label="Tùy chọn"
                                      >
                                        <MoreVerticalIcon className="review-menu-icon" />
                                      </button>
                                      {openMenuId === reviewId && (
                                        <div className="review-menu-dropdown">
                                          <button
                                            className="review-menu-item"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditReview(review);
                                            }}
                                          >
                                            <EditIcon className="review-menu-item-icon" />
                                            <span>Chỉnh sửa</span>
                                          </button>
                                          <button
                                            className="review-menu-item review-menu-item-delete"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteReview(reviewId);
                                            }}
                                            disabled={deletingReviewId === reviewId}
                                          >
                                            <TrashIcon className="review-menu-item-icon" />
                                            <span>{deletingReviewId === reviewId ? 'Đang xóa...' : 'Xóa'}</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {comment && (
                                  <div className="review-comment">
                                    <p>{comment}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Similar Services Section */}
              {similarServices.length > 0 && (
                <div className="similar-services-section">
                  <h2 className="similar-services-title">Các dịch vụ tương tự</h2>
                  <div className="similar-services-grid">
                    {similarServices.map((similarService) => (
                      <Link
                        key={similarService.id}
                        to={`/services/${similarService.id}`}
                        className="similar-service-card-link"
                      >
                        <Card className="similar-service-card">
                          <div className="similar-service-image-wrapper">
                            <LazyImage
                              src={similarService.image}
                              alt={similarService.name}
                              className="similar-service-image"
                              fallbackSrc={baNaHillImage}
                            />
                            {similarService.availableSlots > 0 && (
                              <Badge 
                                variant="success" 
                                className="similar-service-badge"
                              >
                                Còn {similarService.availableSlots} chỗ
                              </Badge>
                            )}
                          </div>
                          <CardContent className="similar-service-content">
                            <h3 className="similar-service-name">{similarService.name}</h3>
                            {similarService.address && (
                              <div className="similar-service-address">
                                <MapPinIcon className="similar-service-address-icon" />
                                <span>{similarService.address}</span>
                              </div>
                            )}
                            <div className="similar-service-price">
                              {formatPrice(similarService.price)}
                              <span className="similar-service-price-unit">/ người</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card (Sticky) */}
            <div className="service-detail-right">
              <Card className="booking-card">
                <CardContent>
                  <div className="booking-header">
                    <div className="booking-price-section">
                      <span className="booking-price-label">Giá dịch vụ</span>
                      <div className="booking-price-value-wrapper">
                        <span className="booking-price-value">{formatPrice(servicePrice)}</span>
                        <span className="booking-price-unit">/ người</span>
                      </div>
                    </div>
                    {availableSlots > 0 && (
                      <div className="booking-slots-info">
                        <UsersIcon className="booking-slots-icon" />
                        <span>Còn {availableSlots} chỗ</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="booking-section">
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="booking-button"
                      disabled={status.toLowerCase() !== 'open' || availableSlots === 0}
                      onClick={() => {
                        if (status.toLowerCase() !== 'open' || availableSlots === 0) {
                          alert('Dịch vụ hiện không khả dụng để đặt');
                          return;
                        }
                        
                        // Kiểm tra đăng nhập trước khi chuyển đến trang booking
                        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                        const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
                        
                        if (!token || !userInfoStr) {
                          // Chưa đăng nhập - chuyển đến trang đăng nhập với returnUrl
                          navigate('/login', { 
                            state: { returnUrl: `/booking/${id}` } 
                          });
                          return;
                        }
                        
                        // Đã đăng nhập - chuyển đến trang booking
                        navigate(`/booking/${id}`);
                      }}
                    >
                      {status.toLowerCase() === 'open' && availableSlots > 0 
                        ? 'Đặt dịch vụ ngay' 
                        : status.toLowerCase() === 'closed' 
                        ? 'Dịch vụ đã đóng'
                        : 'Hết chỗ'}
                    </Button>
                    <p className="booking-note">
                      {status.toLowerCase() === 'open' && availableSlots > 0
                        ? 'Bạn sẽ được chuyển đến trang đặt dịch vụ để hoàn tất thanh toán'
                        : 'Dịch vụ hiện không khả dụng'}
                    </p>
                  </div>

                  {/* Rating Summary */}
                  {!ratingLoading && rating > 0 && (
                    <div className="booking-rating-summary">
                      <div className="rating-summary-header">
                        <StarIcon className="rating-summary-star" filled={true} />
                        <span className="rating-summary-value">{rating.toFixed(1)}</span>
                        <span className="rating-summary-label">Đánh giá trung bình</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
