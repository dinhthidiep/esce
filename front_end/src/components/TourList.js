import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './TourList.css';

const TourList = () => {

  // State
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination info from API
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const pageSize = 9;

  // Fetch tours from API
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();

        if (searchTerm) params.append('keyword', searchTerm);
        if (selectedLocation) params.append('location', selectedLocation);
        if (priceRange[0] > 0) params.append('minPrice', priceRange[0]);
        if (priceRange[1] < 5000000) params.append('maxPrice', priceRange[1]);
        params.append('status', 'open');
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        params.append('pageNumber', currentPage);
        params.append('pageSize', pageSize);

        const response = await fetch(`https://localhost:7267/api/tour/tour-combos?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Không thể tải danh sách tour');
        }

        const data = await response.json();

        setTours(data.Items || []);
        setTotalCount(data.TotalCount || 0);
        setTotalPages(data.TotalPages || 0);
        setHasNextPage(data.HasNextPage || false);
        setHasPreviousPage(data.HasPreviousPage || false);

      } catch (err) {
        console.error('Error fetching tours:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [searchTerm, selectedLocation, priceRange, sortBy, sortOrder, currentPage, pageSize]);

  // Available locations (can be fetched from API later)
  const locations = ['Đà Lạt', 'Sapa', 'Phú Quốc', 'Hạ Long', 'Đà Nẵng', 'Hội An'];

  // Handlers
  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === 'price_asc') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (newSortBy === 'price_desc') {
      setSortBy('price');
      setSortOrder('desc');
    } else if (newSortBy === 'name') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (newSortBy === 'newest') {
      setSortBy('createdAt');
      setSortOrder('desc');
    } else {
      setSortBy('createdAt');
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setPriceRange([0, 5000000]);
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="tour-list-page">
      <Header />

      {/* Main Content */}
      <main className="tour-list-main">
        <div className="tour-list-container">
          {/* Page Header */}
          <div className="page-header">
            <h1>Khám phá các tour du lịch</h1>
            <p>Tìm kiếm và đặt tour du lịch sinh thái phù hợp với bạn</p>
          </div>

          <div className="content-wrapper">
            {/* Sidebar Filters */}
            <aside className={`filter-sidebar ${showMobileFilters ? 'show' : ''}`}>
              <div className="filter-header">
                <h3>Bộ lọc</h3>
                <button className="btn-clear" onClick={clearFilters}>Xóa tất cả</button>
              </div>

              {/* Search */}
              <div className="filter-section">
                <label>Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Tìm tour..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Location */}
              <div className="filter-section">
                <label>Địa điểm</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="location-select"
                >
                  <option value="">Tất cả địa điểm</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <label>Khoảng giá</label>
                <div className="price-range">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="range-slider"
                  />
                  <div className="price-display">
                    {formatPrice(0)} - {formatPrice(priceRange[1])}
                  </div>
                </div>
              </div>
            </aside>

            {/* Tours Grid */}
            <div className="tours-content">
              {/* Toolbar */}
              <div className="results-toolbar">
                <div className="results-info">
                  <span>{totalCount} tour được tìm thấy</span>
                </div>
                <div className="toolbar-actions">
                  <select
                    value={sortBy === 'price' && sortOrder === 'asc' ? 'price_asc' : sortBy === 'price' && sortOrder === 'desc' ? 'price_desc' : sortBy === 'name' ? 'name' : 'newest'}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá thấp đến cao</option>
                    <option value="price_desc">Giá cao đến thấp</option>
                    <option value="name">Tên A-Z</option>
                  </select>
                  <div className="view-toggle">
                    <button
                      className={viewMode === 'grid' ? 'active' : ''}
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      Grid
                    </button>
                    <button
                      className={viewMode === 'list' ? 'active' : ''}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      List
                    </button>
                  </div>
                  <button
                    className="btn-mobile-filter"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    Lọc
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="loading-state">
                  <p>Đang tải danh sách tour...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="error-state">
                  <p>Lỗi: {error}</p>
                  <button onClick={() => window.location.reload()} className="btn-retry">
                    Thử lại
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && tours.length === 0 && (
                <div className="empty-state">
                  <p>Không tìm thấy tour nào phù hợp</p>
                </div>
              )}

              {/* Tour Grid/List */}
              {!loading && !error && tours.length > 0 && (
                <div className={`tour-grid ${viewMode}`}>
                  {tours.map(tour => (
                    <div key={tour.Id} className="tour-card">
                      <div className="tour-image-wrapper">
                        <img src={tour.Image} alt={tour.Name} />
                        {tour.Status === 'open' && (
                          <div className="status-badge">Còn {tour.AvailableSlots} chỗ</div>
                        )}
                      </div>
                      <div className="tour-content">
                        <h3>{tour.Name}</h3>
                        <div className="tour-meta">
                          <span className="area">{tour.Address}</span>
                        </div>
                        <p className="tour-description">{tour.Description}</p>
                        <div className="tour-footer">
                          <div className="price">
                            <span className="label">Từ</span>
                            <span className="value">{formatPrice(tour.Price)}</span>
                          </div>
                          <Link to={`/tours/${tour.Id}`} className="btn-detail">
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={!hasPreviousPage}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    &larr; Trước
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={currentPage === i + 1 ? 'active' : ''}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={!hasNextPage}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Sau &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TourList;

