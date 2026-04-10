import { Home, ShoppingCart, User, Search, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../context/CartContext';

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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black z-50 px-4 py-2 mobile-nav-shadow">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 relative p-2 transition-all active-neo ${
                isActive ? 'text-black scale-110' : 'text-gray-500'
              }`}
            >
              <div className={`p-1.5 rounded-none border-2 transition-all ${
                isActive ? 'bg-neon-yellow border-black shadow-neo-sm' : 'border-transparent'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}>
                {item.label}
              </span>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center border-2 border-white shadow-neo-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
