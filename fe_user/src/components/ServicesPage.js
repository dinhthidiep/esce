import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import Badge from './ui/Badge';
import LoadingSpinner from './LoadingSpinner';
import LazyImage from './LazyImage';
import { StarIcon, MapPinIcon, SearchIcon } from './icons';
import { formatPrice, createSlug, getImageUrl } from '../lib/utils';
import { useTours } from '../hooks/useTours';
import { API_BASE_URL } from '../config/api';
import './ServicesPage.css';

// Sử dụng đường dẫn public URL thay vì import
const baNaHillImage = '/img/banahills.jpg';

// Additional Icons
const HeartIcon = ({ className = '', filled = false, ...props }) => (
  <svg 
    className={className} 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const GridIcon = ({ className = '', ...props }) => (
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
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ListIcon = ({ className = '', ...props }) => (
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
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const FilterIcon = ({ className = '', ...props }) => (
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
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const ClockIcon = ({ className = '', ...props }) => (
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
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ChevronDownIcon = ({ className = '', ...props }) => (
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
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ServicesPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [ratings, setRatings] = useState({}); // Map serviceId -> rating
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { tours, loading: toursLoading, error: toursError } = useTours();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('esce_favorites');
    if (savedFavorites) {
      try {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavorites(new Set(favoriteIds));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Fetch ratings for all services
  useEffect(() => {
    const fetchRatings = async () => {
      if (!tours || tours.length === 0) return;

      const ratingPromises = tours.map(async (tour) => {
        const id = tour.Id !== undefined ? tour.Id : (tour.id !== undefined ? tour.id : null);
        if (!id) return null;

        try {
          const response = await axios.get(`${API_BASE_URL}/Review/servicecombo/${id}/average-rating`);
          const rating = response.data.AverageRating || 0;
          return { id, rating: parseFloat(rating) || 0 };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Không thể lấy rating cho service ${id}:`, error);
          }
          return { id, rating: 0 };
        }
      });

      const ratingResults = await Promise.all(ratingPromises);
      const ratingsMap = {};
      ratingResults.forEach(result => {
        if (result) {
          ratingsMap[result.id] = result.rating;
        }
      });
      setRatings(ratingsMap);
    };

    fetchRatings();
  }, [tours]);

  // Max price cố định: 5,000,000đ
  const maxPrice = 5000000;

  // Transform API data to display format
  // API trả về PascalCase (Id, Name, Price, etc.) nên cần xử lý cả hai trường hợp
  const allServices = useMemo(() => {
    if (!tours || tours.length === 0) {
      console.log('ServicesPage: Không có tours từ API');
      return [];
    }

    console.log(`ServicesPage: Nhận được ${tours.length} tours từ API`);
    console.log('Sample tour data:', tours[0]);

    const mappedServices = tours
      .filter(tour => {
        // Chỉ lấy các tour có status 'open'
        // Xử lý cả PascalCase và camelCase
        const status = tour.Status || tour.status || 'open';
        const isOpen = status.toLowerCase() === 'open';
        if (!isOpen) {
          console.log(`Bỏ qua tour có status: ${status}`);
        }
        return isOpen;
      })
      .map(tour => {
        // Xử lý cả PascalCase và camelCase
        // API trả về PascalCase nên ưu tiên PascalCase trước
        const id = tour.Id !== undefined ? tour.Id : (tour.id !== undefined ? tour.id : null);
        const name = tour.Name || tour.name || 'Tour chưa có tên';
        const imagePath = tour.Image || tour.image || '';
        // Xử lý trường hợp có nhiều ảnh phân cách bởi dấu phẩy - lấy ảnh đầu tiên cho card
        let firstImage = imagePath;
        if (imagePath && typeof imagePath === 'string' && imagePath.includes(',')) {
          firstImage = imagePath.split(',')[0].trim();
        }
        // Sử dụng getImageUrl để xử lý đường dẫn ảnh từ database
        const image = getImageUrl(firstImage, baNaHillImage);
        const address = tour.Address || tour.address || 'Đà Nẵng';
        const price = parseFloat(tour.Price || tour.price || 0);
        const availableSlots = tour.AvailableSlots !== undefined 
          ? tour.AvailableSlots 
          : (tour.availableSlots !== undefined ? tour.availableSlots : 0);
        const status = tour.Status || tour.status || 'open';
        const description = tour.Description || tour.description || '';

        // Lấy rating từ state, mặc định là 0 nếu chưa có
        const serviceRating = ratings[id] !== undefined ? ratings[id] : 0;

        const mappedService = {
          id: id,
          name: name,
          slug: createSlug(name) || `service-${id}`,
          image: image,
          rating: serviceRating, // Rating từ API
          price: price,
          address: address,
          availableSlots: availableSlots,
          status: status,
          description: description
        };

        console.log(`Mapped service:`, { id, name, price, status, image });
        return mappedService;
      });

    console.log(`ServicesPage: Mapped ${mappedServices.length} services`);
    return mappedServices;
  }, [tours, ratings]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...allServices];

    // Multi-field search: name, address, description
    if (searchName.trim()) {
      const query = searchName.toLowerCase();
      filtered = filtered.filter(service => {
        const nameMatch = service.name?.toLowerCase().includes(query);
        const addressMatch = service.address?.toLowerCase().includes(query);
        const descriptionMatch = service.description?.toLowerCase().includes(query);
        return nameMatch || addressMatch || descriptionMatch;
      });
    }

    // Filter by price range
    const [minPrice, maxPrice] = priceRange;
    filtered = filtered.filter(service => 
      service.price >= minPrice && service.price <= maxPrice
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        // Keep original order or sort by rating
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [allServices, searchName, priceRange, sortBy]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      // Persist favorites to localStorage
      try {
        localStorage.setItem('esce_favorites', JSON.stringify([...newSet]));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
      return newSet;
    });
  };

  return (
    <div className="services-page">
      <Header />
      
      <main className="services-main">
        {/* Page Header */}
        <section className="services-page-header">
          <div className="services-header-container">
            <h1 className="services-page-title">
              Khám phá các tour du lịch
            </h1>
            <p className="services-page-subtitle">
              Tìm kiếm và đặt tour du lịch sinh thái phù hợp với bạn
            </p>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <section className="services-content-section">
          {/* Mobile Filter Button */}
          <button
            className="mobile-filter-button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            aria-label="Mở bộ lọc"
            aria-expanded={showMobileFilters}
          >
            <FilterIcon className="mobile-filter-icon" />
            <span>Bộ lọc</span>
            {filteredAndSortedServices.length !== allServices.length && (
              <span className="filter-badge">{allServices.length - filteredAndSortedServices.length}</span>
            )}
          </button>

          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div 
              className="mobile-filter-overlay"
              onClick={() => setShowMobileFilters(false)}
              aria-hidden="true"
            />
          )}

          <div className="services-content-container">
            {/* Left Sidebar - Filters */}
            <aside className={`services-sidebar ${showMobileFilters ? 'mobile-open' : ''}`}>
              <div className="sidebar-header">
                <FilterIcon className="filter-icon" />
                <h2 className="sidebar-title">Bộ lọc</h2>
                {/* Mobile Close Button */}
                <button
                  className="mobile-filter-close"
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Đóng bộ lọc"
                >
                  ×
                </button>
              </div>

              {/* Search by Name */}
              <div className="filter-section">
                <h3 className="filter-section-title">Tìm kiếm</h3>
                  <div className="filter-search-box">
                  <SearchIcon className="filter-search-icon" />
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Tìm tour, địa điểm, mô tả..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    aria-label="Tìm kiếm tour du lịch"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h3 className="filter-section-title">Giá</h3>
                <div className="price-range-filter">
                  <div className="price-range-display">
                    <span className="price-range-value">{formatPrice(priceRange[0])}</span>
                    <span className="price-range-separator">-</span>
                    <span className="price-range-value">{formatPrice(priceRange[1])}</span>
                  </div>
                  <div 
                    className="price-range-slider-wrapper"
                    style={{
                      '--min-percent': `${(priceRange[0] / maxPrice) * 100}`,
                      '--max-percent': `${(priceRange[1] / maxPrice) * 100}`
                    }}
                  >
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step={Math.max(10000, Math.floor(maxPrice / 100))}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value);
                        if (newMin <= priceRange[1]) {
                          setPriceRange([newMin, priceRange[1]]);
                        }
                      }}
                      className="price-range-slider price-range-slider-min"
                      aria-label="Giá tối thiểu"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step={Math.max(10000, Math.floor(maxPrice / 100))}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value);
                        if (newMax >= priceRange[0]) {
                          setPriceRange([priceRange[0], newMax]);
                        }
                      }}
                      className="price-range-slider price-range-slider-max"
                      aria-label="Giá tối đa"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content - Tour Listings */}
            <div className="services-main-content">
              {/* Results Header */}
              <div className="results-header">
                <div className="results-count">
                  {filteredAndSortedServices.length} kết quả
                </div>
                <div className="results-controls">
                  <div className="sort-dropdown">
                    <select 
                      className="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popular">Phổ biến</option>
                      <option value="price-low">Giá: Thấp đến cao</option>
                      <option value="price-high">Giá: Cao đến thấp</option>
                      <option value="name">Tên: A-Z</option>
                    </select>
                    <ChevronDownIcon className="sort-chevron" />
                  </div>
                  <div className="view-toggle">
                    <button
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      aria-label="Xem dạng lưới"
                    >
                      <GridIcon />
                    </button>
                    <button
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      aria-label="Xem dạng danh sách"
                    >
                      <ListIcon />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tour Cards */}
              {toursLoading ? (
                <LoadingSpinner message="Đang tải danh sách tour..." />
              ) : toursError ? (
                <div className="error-container" role="alert">
                  <p className="error-message">
                    Không thể tải danh sách tour từ server. {toursError}
                  </p>
                </div>
              ) : filteredAndSortedServices.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">Không tìm thấy tour nào</p>
                  <p className="empty-state-description">
                    {searchName || (priceRange[0] > 0) || (priceRange[1] < 5000000)
                      ? 'Không có tour nào phù hợp với bộ lọc của bạn. Vui lòng thử lại.'
                      : 'Hiện chưa có tour nào trong hệ thống.'}
                  </p>
                </div>
              ) : (
                <div className={`tours-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {filteredAndSortedServices.map((tour, index) => (
                    <TourCard 
                      key={tour.id} 
                      tour={tour} 
                      index={index}
                      isFavorite={favorites.has(tour.id)}
                      onToggleFavorite={() => toggleFavorite(tour.id)}
                      isVisible={isVisible}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Tour Card Component
const TourCard = ({ tour, index, isFavorite, onToggleFavorite, isVisible }) => {
  const discountPercent = tour.originalPrice 
    ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
    : null;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <article 
      className={`tour-card ${isVisible ? 'fade-in-up' : ''}`}
      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
    >
      <Link to={`/services/${tour.id}`} className="tour-card-link">
        <Card className="tour-card-inner">
          <div className="tour-image-wrapper">
            <LazyImage
              src={tour.image}
              alt={tour.name}
              className="tour-image"
              fallbackSrc={baNaHillImage}
            />
            
            {/* Favorite Button */}
            <button
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              <HeartIcon filled={isFavorite} />
            </button>

            {/* Discount Badge */}
            {discountPercent && discountPercent > 0 && (
              <Badge variant="destructive" className="tour-discount-badge">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          <CardContent className="tour-content">
            <h3 className="tour-name">{tour.name}</h3>
            
            <div className="tour-location-duration">
              <MapPinIcon className="location-icon" />
              <span>{tour.address}</span>
              <ClockIcon className="clock-icon" />
              <span>1 ngày</span>
            </div>

            <div className="tour-rating">
              <div className="stars" aria-label={`Đánh giá ${tour.rating} sao`}>
                {(() => {
                  const rating = tour.rating || 0;
                  const fullStars = Math.floor(rating);
                  const hasHalfStar = (rating % 1) >= 0.5;
                  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                  
                  return [
                    ...Array(fullStars).fill('full'),
                    ...(hasHalfStar ? ['half'] : []),
                    ...Array(emptyStars).fill('empty')
                  ].map((type, i) => (
                    <StarIcon 
                      key={i}
                      className="star-icon"
                      filled={type === 'full'}
                      half={type === 'half'}
                      aria-hidden="true"
                    />
                  ));
                })()}
              </div>
              <span className="rating-value">({tour.rating > 0 ? tour.rating.toFixed(1) : '0.0'})</span>
            </div>

            <div className="tour-price-section">
              <span className="tour-price">{formatPrice(tour.price)}</span>
            </div>

            <div className="tour-detail-btn">
              Chi tiết
            </div>
          </CardContent>
        </Card>
      </Link>
    </article>
  );
};

export default ServicesPage;
