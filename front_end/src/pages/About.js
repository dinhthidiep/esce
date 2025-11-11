import Header from '../components/Header';
import Footer from '../components/Footer';
import './About.css';

const About = () => {
  const stats = [
    { value: '1,284+', label: 'Khách hàng hài lòng' },
    { value: '127', label: 'Tour du lịch' },
    { value: '4.8/5', label: 'Đánh giá trung bình' },
    { value: '15+', label: 'Năm kinh nghiệm' }
  ];

  const features = [
    {
      title: 'Du lịch bền vững',
      description: 'Cam kết bảo vệ môi trường và phát triển du lịch sinh thái bền vững tại Đà Nẵng.'
    },
    {
      title: 'Trải nghiệm chất lượng',
      description: 'Đội ngũ hướng dẫn viên chuyên nghiệp, nhiệt tình và am hiểu địa phương.'
    },
    {
      title: 'Giá cả hợp lý',
      description: 'Cam kết giá tốt nhất thị trường với nhiều ưu đãi hấp dẫn cho khách hàng.'
    },
    {
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc mọi nơi.'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      position: 'Giám đốc điều hành',
      image: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=059669&color=fff&size=200'
    },
    {
      name: 'Trần Thị B',
      position: 'Trưởng phòng Marketing',
      image: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=059669&color=fff&size=200'
    },
    {
      name: 'Lê Văn C',
      position: 'Trưởng phòng Vận hành',
      image: 'https://ui-avatars.com/api/?name=Le+Van+C&background=059669&color=fff&size=200'
    }
  ];

  return (
    <div className="about-page">
      <Header />

      <main className="about-main">
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge">Du lịch sinh thái Đà Nẵng</div>
            <h1>Về chúng tôi</h1>
            <p>
              Du lịch sinh thái Đà Nẵng là nền tảng kỹ thuật số được phát triển nhằm thúc đẩy 
              và quản lý các hoạt động du lịch sinh thái tại Đà Nẵng. Chúng tôi tạo ra cầu nối 
              giữa thiên nhiên - con người - công nghệ.
            </p>
          </div>
        </section>

        <section className="intro-section">
          <div className="section-container">
            <div className="intro-grid">
              <div className="intro-text">
                <div className="section-label">
                  <div className="label-line"></div>
                  <h2>Giới thiệu chung</h2>
                </div>
                <p className="intro-lead">
                  Du lịch sinh thái Đà Nẵng là một nền tảng kỹ thuật số được phát triển nhằm 
                  thúc đẩy và quản lý các hoạt động du lịch sinh thái tại Đà Nẵng.
                </p>
                <p>
                  Hệ thống giúp kết nối du khách với chủ cơ sở du lịch sinh thái địa phương 
                  như khu cắm trại, glamping, farmstay, đồng thời đảm bảo vận hành minh bạch 
                  và hiệu quả dưới sự giám sát của quản trị viên.
                </p>
                <div className="quote-box">
                  <p>
                    "Với Du lịch sinh thái Đà Nẵng, chúng tôi hướng đến việc số hoá mô hình 
                    du lịch bền vững, tạo ra cầu nối giữa thiên nhiên - con người - công nghệ."
                  </p>
                </div>
              </div>
              <div className="intro-image">
                <img 
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" 
                  alt="Đà Nẵng"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="section-container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="section-container">
            <div className="section-header">
              <h2>Tại sao chọn chúng tôi?</h2>
              <p>Những giá trị cốt lõi mà chúng tôi mang lại cho khách hàng</p>
            </div>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{index + 1}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="team-section">
          <div className="section-container">
            <div className="section-header">
              <h2>Đội ngũ của chúng tôi</h2>
              <p>Những người đồng hành cùng bạn trong mọi hành trình</p>
            </div>
            <div className="team-grid">
              {team.map((member, index) => (
                <div key={index} className="team-card">
                  <img src={member.image} alt={member.name} />
                  <h3>{member.name}</h3>
                  <p>{member.position}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mission-section">
          <div className="section-container">
            <div className="mission-content">
              <h2>Sứ mệnh của chúng tôi</h2>
              <p>
                Chúng tôi cam kết mang đến những trải nghiệm du lịch sinh thái chất lượng cao, 
                bền vững và có trách nhiệm với môi trường. Mỗi chuyến đi không chỉ là một kỷ niệm 
                đáng nhớ mà còn là đóng góp vào việc bảo vệ thiên nhiên và phát triển cộng đồng địa phương.
              </p>
              <div className="mission-values">
                <div className="value-item">
                  <h4>Bền vững</h4>
                  <p>Bảo vệ môi trường và phát triển du lịch có trách nhiệm</p>
                </div>
                <div className="value-item">
                  <h4>Chất lượng</h4>
                  <p>Cam kết mang đến trải nghiệm tốt nhất cho khách hàng</p>
                </div>
                <div className="value-item">
                  <h4>Cộng đồng</h4>
                  <p>Hỗ trợ và phát triển cộng đồng địa phương</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

