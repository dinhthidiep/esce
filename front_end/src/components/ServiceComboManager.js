import './ServiceComboManager.css';
import React, { useEffect, useState } from 'react';
import { getMyServiceCombos } from '../API/CreateServiceComboApi';
import { deleteServiceCombo } from '../API/DeleteServiceComboApi';
import Header from './Header';

const backend_url = "http://localhost:5002";
import { deleteService } from '../API/DeleteServiceApi';

const ServiceComboManager = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const handleEditService = (serviceId) => {
    // TODO: Implement edit service functionality
    alert(`Chỉnh sửa dịch vụ ID: ${serviceId}`);
  };


  const handleDeleteServiceCombo = async (serviceComboId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa combo dịch vụ này? Hành động này không thể hoàn tác.')) {
      try {
        await deleteServiceCombo(serviceComboId);
        alert('Combo dịch vụ đã được xóa thành công!');
        // Remove the deleted item from the list instead of reloading the page
        setServices(prevServices => prevServices.filter(s => (s.Id || s.id) !== serviceComboId));
        // Also update filtered services
        setFilteredServices(prevFiltered => prevFiltered.filter(s => (s.Id || s.id) !== serviceComboId));
      } catch (error) {
        console.error('Error deleting service combo:', error);
        const errorMessage = error.message || 'Có lỗi xảy ra khi xóa combo dịch vụ. Vui lòng thử lại.';
        alert(errorMessage);
      }
    }
  };

  // Filter and sort function
  const applyFilters = (serviceList, nameFilter, statusFilter, order) => {
    let filtered = [...serviceList];

    // Filter by name
    if (nameFilter && nameFilter.trim() !== '') {
      filtered = filtered.filter(s => {
        const name = (s.Name || s.name || '').toLowerCase();
        return name.includes(nameFilter.toLowerCase().trim());
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => {
        const status = (s.Status || s.status || '').toLowerCase();
        // Map English status to Vietnamese and vice versa
        const statusMap = {
          'open': ['mở', 'open'],
          'closed': ['đóng', 'closed'],
          'canceled': ['đã hủy', 'canceled']
        };
        const statusOptions = statusMap[statusFilter] || [];
        return statusOptions.some(opt => status === opt);
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.CreatedAt || a.createdAt || 0);
      const dateB = new Date(b.CreatedAt || b.createdAt || 0);
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  // Handle search button click
  const handleSearch = () => {
    const filtered = applyFilters(services, filterName, filterStatus, sortOrder);
    setFilteredServices(filtered);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMyServiceCombos();
        if (mounted) {
          const serviceArray = Array.isArray(data) ? data : [];
          setServices(serviceArray);
          // Initially show all services with default sort
          setFilteredServices(applyFilters(serviceArray, '', 'all', 'newest'));
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load service combos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="create-tour-page">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarActive ? 'active' : ''}`} role="navigation" aria-label="Menu chính">
        <nav>
          <ul>
            <li><a href="#" className="sidebar-select" aria-label="Thông tin cá nhân">Thông tin cá nhân</a></li>
            <li><a href="/service-combo-manager" className="sidebar-select" aria-label="Quản lý combo dịch vụ">Quản lý combo dịch vụ</a></li>
            <li><a href="/social-media" className="sidebar-select" aria-label="Mạng xã hội">Mạng xã hội</a></li>
            <li><a href="#" className="sidebar-select" aria-label="Hỗ trợ">Hỗ trợ</a></li>
            <li><a href="#" className="sidebar-select" aria-label="Chat">Chat</a></li>
            <li className="sidebar-logout"><a href="#" className="sidebar-select sidebar-logout-link" aria-label="Đăng xuất">Đăng xuất</a></li>
          </ul>
        </nav>
      </aside>

      {/* Header */}
      <Header 
        showMenuButton={true}
        onMenuToggle={toggleSidebar}
        sidebarActive={sidebarActive}
      />

      {/* Page Title */}
      <section className={`content-title-display-box ${sidebarActive ? 'shift' : ''}`}>
        <div className="content-title-display-name">
          <h2>Các combo dịch vụ bạn đã tạo</h2>
        </div>
      </section>

      {/* Main Content */}
      <main className={`content ${sidebarActive ? 'shift' : ''}`} role="main">
        <div className="form-content">
          {/* Filter Section */}
          <div className="service-filter-container">
            <div className="filter-row">
              <div className="filter-field">
                <label htmlFor="filter-name">Lọc theo tên:</label>
                <input
                  id="filter-name"
                  type="text"
                  className="filter-input"
                  placeholder="Nhập tên combo..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <div className="filter-field">
                <label htmlFor="filter-status">Trạng thái:</label>
                <select
                  id="filter-status"
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="open">Mở</option>
                  <option value="closed">Đóng</option>
                  <option value="canceled">Đã hủy</option>
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="sort-order">Thứ tự:</label>
                <select
                  id="sort-order"
                  className="filter-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
              <button className="btn-search" onClick={handleSearch}>
                🔍 Tìm kiếm
              </button>
            </div>
          </div>

          <div className="create-service-header">
            <button className="btn-create-new" onClick={() => window.location.href = '/create-service-combo'}>
              ➕ Tạo combo mới
            </button>
          </div>
          {loading && <div>Đang tải...</div>}
          {error && <div className="error" role="alert">{error}</div>}
          {!loading && !error && (
            <div className="services-grid">
              {filteredServices.length === 0 ? (
                <div className="no-services">Không có combo dịch vụ nào</div>
              ) : (
                filteredServices.map(s => (
                  <div key={s.Id || s.id} className="servicecombo-card">
                    <div className="service-image">
                      <img
                        src={
                          s.Image && s.Image.trim() !== ''
                            ? (s.Image.startsWith('data:image') || s.Image.startsWith('http://') || s.Image.startsWith('https://'))
                              ? s.Image
                              : `${backend_url}/images/${s.Image}`
                            : '/img/stock_nimg.jpg'
                        }
                        alt={s.Name || s.name}
                        onError={(e) => {
                          e.target.src = '/img/stock_nimg.jpg';
                        }}
                      />
                    </div>
                    <div className="service-content-wrapper">
                      <div className="service-info">
                        <h3 className="service-name">{s.Name || s.name}</h3>
                        <p className="service-date">Ngày tạo: {new Date(s.CreatedAt).toLocaleDateString('vi-VN')}</p>
                        <p className="service-status-gray">Trạng thái: {s.Status || s.status}</p>
                      </div>
                      <div 
                        className="service-view-link" 
                        onClick={() => window.location.href = `/service-combo-preview?id=${s.Id || s.id}`}
                      >
                        &gt;&gt;Xem ngay
                      </div>
                    </div>
                    <div className="service-actions">
                      <button className="btn-view" onClick={() => window.location.href = `/coupon-manager?comboId=${s.Id || s.id}`}>
                        🎫 Thêm coupon
                      </button>
                      <button className="btn-edit" onClick={() => window.location.href = `/edit-service-combo?id=${s.Id || s.id}`}>
                        ✏️ Chỉnh sửa
                      </button>
                      <button className="btn-add-service" onClick={() => window.location.href = `/service-manager?comboId=${s.Id || s.id}`}>
                        ➕ Quản lý dịch vụ
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteServiceCombo(s.Id || s.id)}>
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ServiceComboManager;