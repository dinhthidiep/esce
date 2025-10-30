import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tour, ScheduleDay, Review, Comment, TourSchedule } from '../types/tour';
import { tourService } from '../mocks/tour.service';

// Components
import Header from '../components/Header';
import HeaderMeta from '../components/tour/HeaderMeta';
import Gallery from '../components/tour/Gallery';
import PriceBox from '../components/tour/PriceBox';
import SectionTabs from '../components/tour/SectionTabs';
import ReviewList from '../components/tour/ReviewList';
import ReviewForm from '../components/tour/ReviewForm';
import CommentThread from '../components/tour/CommentThread';
import SchedulePicker from '../components/tour/SchedulePicker';
import ScheduleAccordion from '../components/tour/ScheduleAccordion';

const TourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [tour, setTour] = useState<Tour | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [tourSchedule, setTourSchedule] = useState<TourSchedule | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Selected date state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    date: string;
    price: number;
    remainingSlots: number;
  } | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadTourData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load all tour data in parallel
        const [
          tourData,
          scheduleData,
          tourScheduleData,
          reviewsData,
          commentsData
        ] = await Promise.all([
          tourService.getTourById(id),
          tourService.getTourScheduleDays(id),
          tourService.getTourSchedule(id),
          tourService.getReviews(id),
          tourService.getComments(id)
        ]);

        if (!tourData) {
          setError('Không tìm thấy tour');
          return;
        }

        setTour(tourData);
        setSchedule(scheduleData);
        setTourSchedule(tourScheduleData);
        setReviews(reviewsData);
        setComments(commentsData);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu tour');
        console.error('Error loading tour:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTourData();
  }, [id]);

  const handleAddReview = async (reviewData: { rating: number; title: string; content: string; images?: string[] }) => {
    if (!tour) return;
    
    try {
      const newReview = await tourService.addReview(tour.id, reviewData);
      setReviews(prev => [newReview, ...prev]);
    } catch (error) {
      throw error;
    }
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!tour) return;
    
    try {
      const newComment = await tourService.addComment(tour.id, content, parentId);
      if (parentId) {
        // Update the parent comment with the new reply
        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: [...comment.replies, newComment] }
            : comment
        ));
      } else {
        setComments(prev => [newComment, ...prev]);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleReaction = async (targetId: string, type: 'LIKE' | 'LOVE' | 'HELPFUL' | 'FUNNY') => {
    try {
      await tourService.toggleReaction(targetId, 'review', type);
      // In a real app, you'd update the local state with the new reaction
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handleCommentReaction = async (targetId: string, type: 'LIKE' | 'LOVE' | 'HELPFUL' | 'FUNNY') => {
    try {
      await tourService.toggleReaction(targetId, 'comment', type);
      // In a real app, you'd update the local state with the new reaction
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handleSelectDate = () => {
    setActiveTab('calendar');
    // Smooth scroll to calendar section
    setTimeout(() => {
      const calendarElement = document.getElementById('calendar-section');
      if (calendarElement) {
        calendarElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const handleDateSelect = (date: string) => {
    if (!tourSchedule) return;
    
    const dateInfo = tourSchedule.availableDates.find(d => d.date === date);
    
    if (dateInfo && dateInfo.isAvailable) {
      setSelectedDate(date);
      setSelectedDateInfo({
        date,
        price: dateInfo.price,
        remainingSlots: dateInfo.remainingSlots
      });
    }
  };

  const handleDateChange = () => {
    setSelectedDate('');
    setSelectedDateInfo(null);
    setActiveTab('calendar');
    // Smooth scroll to calendar section
    setTimeout(() => {
      const calendarElement = document.getElementById('calendar-section');
      if (calendarElement) {
        calendarElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const handleBookNow = () => {
    if (!tour || !selectedDate || !selectedDateInfo) {
      alert('Vui lòng chọn ngày khởi hành trước khi đặt tour');
      return;
    }

    // Navigate to booking page with tour data
    navigate('/booking', {
      state: {
        tour,
        selectedDate,
        selectedDateInfo
      }
    });
  };

  if (isLoading) {
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
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Mô tả tour */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mô tả tour</h3>
              <p className="text-gray-700 leading-relaxed">{tour.description}</p>
            </div>

            {/* Điểm nổi bật */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Điểm nổi bật</h3>
              <ul className="space-y-2">
                {tour.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bao gồm & Không bao gồm */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Bao gồm</h3>
                <ul className="space-y-2">
                  {tour.included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Không bao gồm</h3>
                <ul className="space-y-2">
                  {tour.excluded.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lịch khởi hành */}
            {tourSchedule && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Lịch khởi hành</h3>
                <SchedulePicker
                  schedule={tourSchedule}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>
            )}

            {/* Lịch trình */}
            <ScheduleAccordion schedule={schedule} />

            {/* Yêu cầu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Yêu cầu</h3>
              <ul className="space-y-2">
                {tour.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chính sách hủy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chính sách hủy</h3>
              <p className="text-gray-700">{tour.cancellationPolicy}</p>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            {schedule.map((day) => (
              <div key={day.day} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{day.title}</h3>
                </div>
                
                <p className="text-gray-700 mb-4">{day.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Hoạt động</h4>
                    <ul className="space-y-1">
                      {day.activities.map((activity, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {day.meals.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Bữa ăn</h4>
                      <div className="flex gap-2">
                        {day.meals.map((meal, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {meal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {day.accommodation && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Nơi ở</h4>
                      <p className="text-sm text-gray-700">{day.accommodation}</p>
                    </div>
                  )}
                  
                  {day.transport && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Phương tiện</h4>
                      <p className="text-sm text-gray-700">{day.transport}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'calendar':
        return (
          <div id="calendar-section" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {tourSchedule && (
              <SchedulePicker
                schedule={tourSchedule}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            )}
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <ReviewList
              reviews={reviews}
              onReaction={handleReaction}
            />
            <ReviewForm onSubmit={handleAddReview} />
          </div>
        );

      case 'qa':
        return (
          <CommentThread
            comments={comments}
            onAddComment={handleAddComment}
            onReaction={handleCommentReaction}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and Gallery */}
        <div className="mb-8">
          <HeaderMeta tour={tour} />
          <Gallery images={tour.images} title={tour.title} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <SectionTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="mb-6"
            />
            <div className="mt-6">
              {renderTabContent()}
            </div>
          </div>

           {/* Sidebar */}
           <div className="lg:col-span-1">
             <div className="sticky top-8 space-y-6">
               <PriceBox 
                 tour={tour} 
                 onSelectDate={handleSelectDate}
                 selectedDate={selectedDate}
                 selectedDateInfo={selectedDateInfo}
                 onDateChange={handleDateChange}
                 onBookNow={handleBookNow}
               />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
