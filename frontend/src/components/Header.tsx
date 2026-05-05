
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { API } from '../config/api';
import './Header.css';

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
    <header className="header">
      <div className="header-top">
        <Link to="/" className="header-logo">
          <img src={`${API.images}/voc_logo_new.png`} alt="Vọc Records" />
        </Link>

        <form onSubmit={handleSearch} className="header-search">
          <Search className="header-search-icon" />
          <input
            type="text"
            placeholder="TÌM KIẾM ĐĨA THAN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="header-actions">
          <Link to="/cart" className="header-icon-btn">
            <ShoppingCart style={{width:24,height:24}} />
            {cartCount > 0 && (
              <span className="header-cart-badge">{cartCount}</span>
            )}
          </Link>

          {user ? (
            <div className="header-user-menu">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="header-icon-btn">
                <User style={{width:24,height:24}} />
              </button>
              {userMenuOpen && (
                 <div className="header-dropdown">
                    {(user.role === 'admin' || user.role === 'nhanvien') && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="admin-link">
                           TRANG QUẢN TRỊ
                        </Link>
                    )}
                    <Link to="/account" onClick={() => setUserMenuOpen(false)}>
                       QUẢN LÝ TÀI KHOẢN
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                       ĐĂNG XUẤT
                    </button>
                 </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="header-icon-btn">
              <User style={{width:24,height:24}} />
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="header-mobile-btn"
          >
            {mobileMenuOpen ? <X style={{width:32,height:32}} /> : <Menu style={{width:32,height:32}} />}
          </button>
        </div>
      </div>

      <nav className="header-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link to={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {mobileMenuOpen && (
        <div className="header-mobile-menu">
          <div className="header-mobile-search">
            <h3>Tìm kiếm</h3>
            <form onSubmit={handleSearch} style={{position:'relative'}}>
              <Search style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',color:'#fff',width:24,height:24}} />
              <input
                type="text"
                placeholder="BẠN ĐANG TÌM ĐĨA GÌ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <nav className="header-mobile-nav">
            <h3>Danh mục</h3>
            <ul>
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="header-mobile-footer">
                {user ? (
                  <div>
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                       TÀI KHOẢN CỦA TÔI
                    </Link>
                    <button onClick={handleLogout}>ĐĂNG XUẤT</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
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