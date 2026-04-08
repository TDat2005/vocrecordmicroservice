import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useState } from 'react';
import { Mail, Send, ArrowUp } from 'lucide-react';
import { useEffect } from 'react';

export function Root() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Trong thực tế sẽ gọi API
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <MobileBottomNav />
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Vọc Records */}
            <div>
              <img src="http://localhost/clonevocrecord/images/VOC-logo-standard-1-e1657338237763.png" alt="Vọc Records" className="h-12 object-contain mb-4 bg-white p-1 rounded" />
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/about" className="hover:text-white transition-colors">
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a href="/policy" className="hover:text-white transition-colors">
                    Chính sách
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/shop" className="hover:text-white transition-colors">
                    Đĩa Than
                  </a>
                </li>
                <li>
                  <a href="/turntables" className="hover:text-white transition-colors">
                    Mâm Đĩa
                  </a>
                </li>
                <li>
                  <a href="/cassette" className="hover:text-white transition-colors">
                    Cassette
                  </a>
                </li>
                <li>
                  <a href="/accessories" className="hover:text-white transition-colors">
                    Phụ Kiện
                  </a>
                </li>
              </ul>
            </div>

            {/* Nội dung */}
            <div>
              <h4 className="font-semibold mb-4">Nội dung</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/guides" className="hover:text-white transition-colors">
                    Hướng dẫn
                  </a>
                </li>
                <li>
                  <a href="/reviews" className="hover:text-white transition-colors">
                    Đánh giá
                  </a>
                </li>
              </ul>
            </div>

            {/* Email Subscription */}
            <div>
              <h4 className="font-semibold mb-4">Đăng ký nhận tin</h4>
              <p className="text-sm text-gray-400 mb-4">
                Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email của bạn"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribed}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-green-600 text-sm font-medium"
                >
                  {subscribed ? (
                    <>✓ Đã đăng ký!</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Đăng ký
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Vọc Records. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll To Top Button */}
      {showTopBtn && (
        <button
          onClick={goToTop}
          className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-50 p-4 bg-black text-white hover:bg-white hover:text-black border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active-neo transition-all flex items-center justify-center animate-bounce"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}