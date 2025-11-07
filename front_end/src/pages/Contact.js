import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: 'location',
      title: 'Địa chỉ',
      content: '123 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng',
      description: 'Văn phòng chính của chúng tôi'
    },
    {
      icon: 'phone',
      title: 'Điện thoại',
      content: '+84 236 3123 456',
      description: 'Hotline 24/7 hỗ trợ khách hàng'
    },
    {
      icon: 'email',
      title: 'Email',
      content: 'info@esce-danang.com',
      description: 'Liên hệ qua email'
    },
    {
      icon: 'clock',
      title: 'Giờ làm việc',
      content: '8:00 - 18:00 (T2-T7)',
      description: 'Thời gian phục vụ khách hàng'
    }
  ];

  const faqs = [
    {
      question: 'Làm thế nào để đặt dịch vụ?',
      answer: 'Bạn có thể đặt dịch vụ trực tiếp trên website hoặc gọi hotline. Chúng tôi hỗ trợ đặt dịch vụ cá nhân và dịch vụ nhóm với ưu đãi hấp dẫn.'
    },
    {
      question: 'Dịch vụ có thể hủy không?',
      answer: 'Có, bạn có thể hủy dịch vụ miễn phí trước 24h. Hủy trong vòng 24h sẽ tính phí 50% giá dịch vụ.'
    },
    {
      question: 'Có bảo hiểm du lịch không?',
      answer: 'Tất cả các tour của chúng tôi đều bao gồm bảo hiểm du lịch cơ bản. Bạn có thể mua thêm bảo hiểm mở rộng nếu muốn.'
    },
    {
      question: 'Thanh toán như thế nào?',
      answer: 'Chúng tôi chấp nhận thanh toán qua chuyển khoản, thẻ tín dụng, ví điện tử và tiền mặt tại văn phòng.'
    }
  ];

  return (
    <div className="contact-page">
      <Header />

      <main className="contact-main">
        <section className="contact-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>Liên hệ với chúng tôi</h1>
            <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
          </div>
        </section>

        <section className="contact-info-section">
          <div className="section-container">
            <div className="contact-info-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-info-card">
                  <div className={`info-icon icon-${info.icon}`}></div>
                  <h3>{info.title}</h3>
                  <p className="info-content">{info.content}</p>
                  <p className="info-description">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-form-section">
          <div className="section-container">
            <div className="form-grid">
              <div className="form-left">
                <h2>Gửi tin nhắn cho chúng tôi</h2>
                <p>Điền thông tin vào form bên dưới và chúng tôi sẽ phản hồi trong vòng 24h</p>
                
                {isSubmitted ? (
                  <div className="success-message">
                    <div className="success-icon"></div>
                    <h3>Gửi thành công!</h3>
                    <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Họ và tên *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập email"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div className="form-group">
                        <label>Chủ đề *</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập chủ đề"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Nội dung *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="5"
                        placeholder="Nhập nội dung tin nhắn..."
                      ></textarea>
                    </div>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                    </button>
                  </form>
                )}
              </div>

              <div className="form-right">
                <div className="map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.8349183935!2d108.21445731533315!3d16.074012888885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a83%3A0xfc14e3a044436487!2zxJDDoCBO4bq1bmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Map"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="section-container">
            <div className="section-header">
              <h2>Câu hỏi thường gặp</h2>
              <p>Những câu hỏi phổ biến từ khách hàng</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

