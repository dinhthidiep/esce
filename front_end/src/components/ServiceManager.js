import './ServiceManager.css';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyServices } from '../API/CreateServiceApi';
import { deleteService } from '../API/DeleteServiceApi';
import Header from './Header';
import { getServicesByComboId } from '../API/CreateServiceComboApi';

const ServiceManager = () => {
  const location = useLocation();
  const [sidebarActive, setSidebarActive] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const handleEditService = (serviceId) => {
    // TODO: Implement edit service functionality
    alert(`Chỉnh sửa dịch vụ ID: ${serviceId}`);
  };



  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        await deleteService(serviceId);
        alert('Dịch vụ đã được xóa thành công!');
        // Reload the page to refresh the services list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Có lỗi xảy ra khi xóa dịch vụ. Vui lòng thử lại.');
      }
    }
  };


  useEffect(() => {
    // Reset loading and error when location changes
    setLoading(true);
    setError('');
    
    const urlParams = new URLSearchParams(location.search);
    const comboId = urlParams.get('comboId');

    let mounted = true;

    const loadServices = async () => {
      try {
        let data;
        if (comboId) {
          // Load services associated with the service combo via SERVICECOMBO_DETAIL table
          data = await getServicesByComboId(comboId);
        } else {
          // Load all user services (when accessed directly without comboId)
          data = await getMyServices();
        }
        
        if (mounted) {
          setServices(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (mounted) {
          setError(e.message || 'Failed to load services');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => { mounted = false; };
  }, [location.search, location.pathname]); // Reload when location changes

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
          <h2>Quản lý dịch vụ</h2>
        </div>
      </section>

      {/* Main Content */}
      <main className={`content ${sidebarActive ? 'shift' : ''}`} role="main">
        <div className="form-content">
          <div className="create-service-header">
            <button className="btn-back" onClick={() => window.location.href = '/service-combo-manager'}>
              ← Về quản lý combo dịch vụ
            </button>
            <button className="btn-create-new" onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              const comboId = urlParams.get('comboId');
              window.location.href = comboId ? `/create-service?comboId=${comboId}` : '/create-service';
            }}>
              ➕ Tạo dịch vụ mới
            </button>
          </div>
          {loading && <div>Đang tải...</div>}
          {error && <div className="error" role="alert">{error}</div>}
          {!loading && !error && (
            <div className="services-grid">
              {services.length === 0 ? (
                <div className="no-services">Không</div>
              ) : (
                services.map(s => (
                  <div key={s.Id || s.id} className="service-card">
                    <div className="service-details">
                      <h3 className="service-name">{s.Name || s.name}</h3>
                      {s.Description || s.description ? (
                        <p className="service-description">{s.Description || s.description}</p>
                      ) : null}
                      <p className="service-date">Ngày tạo: {s.Created_At || s.CreatedAt ? new Date(s.Created_At || s.CreatedAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      <p className="service-date">Ngày sửa: {s.Updated_At || s.UpdatedAt ? new Date(s.Updated_At || s.UpdatedAt).toLocaleDateString('vi-VN') : 'Không'}</p>
                      <p className="service-price">Giá: {s.Price ? s.Price.toLocaleString('vi-VN') : '0'} VND</p>
                    </div>
                    <div className="service-actions">
                      <button className="btn-edit" onClick={() => {
                        const urlParams = new URLSearchParams(window.location.search);
                        const comboId = urlParams.get('comboId');
                        const serviceId = s.Id || s.id;
                        const editUrl = comboId 
                          ? `/edit-service?id=${serviceId}&comboId=${comboId}`
                          : `/edit-service?id=${serviceId}`;
                        window.location.href = editUrl;
                      }}>
                        ✏️ Chỉnh sửa
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteService(s.Id || s.id)}>
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

export default ServiceManager;



