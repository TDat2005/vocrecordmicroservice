
import { Outlet, Link } from 'react-router';
import { Header } from '../components/Header';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useState } from 'react';
import { Mail, Send, ArrowUp } from 'lucide-react';
import { useEffect } from 'react';
import { API } from '../config/api';
import './Root.css';

export function Root() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => { setSubscribed(false); setEmail(''); }, 3000);
    }
  };

  return (
    <div className="root-layout">
      <Header />
      <main className="root-main"><Outlet /></main>
      <MobileBottomNav />
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <img src={`${API.images}/voc_logo_new.png`} alt="Vọc Records" className="footer-logo" />
              <ul>
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/blog">Về chúng tôi</Link></li>
                <li><Link to="/account">Tài khoản</Link></li>
              </ul>
            </div>
            <div>
              <h4>Sản phẩm</h4>
              <ul>
                <li><Link to="/shop">Đĩa Than</Link></li>
                <li><Link to="/turntables">Mâm Đĩa</Link></li>
                <li><Link to="/cassettes">Cassette</Link></li>
                <li><Link to="/accessories">Phụ Kiện</Link></li>
              </ul>
            </div>
            <div>
              <h4>Nội dung</h4>
              <ul>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/guides">Hướng dẫn</Link></li>
                <li><Link to="/shop">Cửa hàng</Link></li>
              </ul>
            </div>
            <div>
              <h4>Đăng ký nhận tin</h4>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
              <form onSubmit={handleSubscribe}>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email của bạn" required className="footer-sub-input" />
                </div>
                <button type="submit" disabled={subscribed} className="footer-sub-btn">
                  {subscribed ? <>✓ Đã đăng ký!</> : <><Send style={{ width: 16, height: 16 }} /> Đăng ký</>}
                </button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Nhóm 6 Kiến Trúc Và Thiết Kế Phần Mềm. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showTopBtn && (
        <button onClick={goToTop} className="scroll-top-btn" aria-label="Cuộn lên đầu trang">
          <ArrowUp style={{ width: 24, height: 24 }} />
        </button>
      )}
    </div>
  );
}