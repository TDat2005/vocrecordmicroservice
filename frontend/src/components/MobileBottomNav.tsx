import { Home, ShoppingCart, User, Search, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../context/CartContext';
import './MobileBottomNav.css';

export function MobileBottomNav() {
  const location = useLocation();
  const { getCartCount } = useCart();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Shop', path: '/shop' },
    { icon: ShoppingBag, label: 'Cart', path: '/cart', badge: getCartCount() },
    { icon: User, label: 'Account', path: '/login' },
  ];

  return (
    <div className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">
                <Icon style={{width:24,height:24}} />
              </div>
              <span className="mobile-nav-label">{item.label}</span>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className="mobile-nav-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
