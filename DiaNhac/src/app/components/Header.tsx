import { Link, useNavigate } from 'react-router';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export function Header() {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  const cartCount = getCartCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const menuItems = [
    { label: 'Đĩa Than', href: '/shop' },
    { label: 'Mâm Đĩa', href: '/turntables' },
    { label: 'Cassette', href: '/cassettes' },
    { label: 'Phụ Kiện', href: '/accessories' },
    { label: 'Blog', href: '/blog' },
    { label: 'Hướng dẫn', href: '/guides' },
  ];

  return (
    <header className="bg-black text-white sticky top-0 z-50 border-b-2 border-white">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="http://localhost/clonevocrecord/images/voc_logo_new.png" alt="Vọc Records" className="h-12 object-contain" />
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="TÌM KIẾM ĐĨA THAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white text-white placeholder-gray-400 font-bold"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/cart"
            className="flex items-center gap-2 p-2 text-white hover:text-gray-300 transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-neon-yellow text-black text-[10px] font-black w-5 h-5 flex items-center justify-center border-2 border-black shadow-neo-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 text-white hover:text-gray-300 transition-colors">
                <User className="w-6 h-6" />
              </button>
              {userMenuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black z-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black">
                    {(user.role === 'admin' || user.role === 'nhanvien') && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 font-bold uppercase border-b-2 border-black hover:bg-yellow-400 text-purple-700">
                           TRANG QUẢN TRỊ
                        </Link>
                    )}
                    <Link to="/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 font-bold uppercase border-b-2 border-black hover:bg-gray-100">
                       QUẢN LÝ TÀI KHOẢN
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 font-bold text-red-600 uppercase hover:bg-gray-100">
                       ĐĂNG XUẤT
                    </button>
                 </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 p-2 text-white hover:text-gray-300 transition-colors">
              <User className="w-6 h-6" />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-neon-yellow active-neo"
          >
            {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Navigation Menu - Desktop */}
      <nav className="hidden lg:block border-t border-gray-800">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-8 py-3">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wider text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[74px] bg-black z-50 overflow-y-auto">
          {/* Mobile Search */}
          <div className="container mx-auto px-6 py-8 border-b-2 border-white">
            <h3 className="text-neon-yellow font-black text-xs uppercase mb-4 tracking-[0.2em]">Tìm kiếm</h3>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white w-6 h-6" />
                <input
                  type="text"
                  placeholder="BẠN ĐANG TÌM ĐĨA GÌ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-transparent border-b-4 border-white focus:outline-none text-2xl text-white font-black uppercase placeholder-gray-600"
                />
              </div>
            </form>
          </div>

          {/* Mobile Menu Items */}
          <nav className="container mx-auto px-6 py-8">
            <h3 className="text-neon-yellow font-black text-xs uppercase mb-6 tracking-[0.2em]">Danh mục</h3>
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-4xl font-black text-white hover:text-neon-yellow transition-colors uppercase italic"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              
              <li className="pt-8 border-t-2 border-white/20">
                {user ? (
                  <div className="space-y-4">
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-black text-white uppercase hover:text-neon-yellow">
                       TÀI KHOẢN CỦA TÔI
                    </Link>
                    <button onClick={handleLogout} className="block text-2xl font-black text-red-500 uppercase">
                       ĐĂNG XUẤT
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-4xl font-black text-white uppercase hover:text-neon-yellow italic">
                     ĐĂNG NHẬP
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}