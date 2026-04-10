import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Package, Heart, Edit2, Save, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../config/api';

type Tab = 'profile' | 'orders' | 'wishlist';

interface Order {
  MaDH: number;
  NgayDat: string;
  TrangThai: 'choxacnhan' | 'daxacnhan' | 'dangchuanbihang' | 'danggiaohang' | 'hoanthanh' | 'dahuy';
  TongTien: number;
}

export function Account() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const { addToCart } = useCart();
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(loggedInUser);
    setUser(userData);

    if (userData.customer_id) {
       // Profile
       fetch(`${API_BASE}/account.php?action=get_profile&customer_id=${userData.customer_id}`)
         .then(res => res.json())
         .then(data => { if(data.success) setProfileData(data.data) });

       // Orders
       fetchOrdersData(userData.customer_id);

       // Wishlist
       fetch(`${API_BASE}/wishlist.php?action=list&customer_id=${userData.customer_id}`)
         .then(res => res.json())
         .then(data => { if(data.success) setWishlist(data.data) });
    }
  }, [navigate]);

  const fetchOrdersData = (custId: any) => {
       fetch(`${API_BASE}/orders.php?action=list&customer_id=${custId}`)
         .then(res => res.json())
         .then(data => { if(data.success) setOrders(data.data) });
  };

  const handleCancelOrder = (orderId: number) => {
    if (!window.confirm('BẠN CHẮC CHẮN MUỐN HỦY ĐƠN HÀNG NÀY? MỌI THAO TÁC CÓ THỂ KHÔNG THỂ HOÀN TÁC!')) return;
    fetch(`${API_BASE}/orders.php?action=cancel_order`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ order_id: orderId, customer_id: user.customer_id })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
         alert('Đã hủy đơn hàng!');
         fetchOrdersData(user.customer_id);
      } else {
         alert(data.message);
      }
    });
  };


  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    if(!user || !user.customer_id) return;
    fetch(`${API_BASE}/account.php?action=update_profile`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        customer_id: user.customer_id,
        ...profileData
      })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        alert("Đã lưu thông tin.");
        setIsEditing(false);
      } else {
        alert(data.message);
      }
    });
  };

  const handleRemoveWishlist = (productId: number) => {
    if(!user || !user.customer_id) return;
    fetch(`${API_BASE}/wishlist.php?action=remove`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ customer_id: user.customer_id, product_id: productId })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) setWishlist(wishlist.filter(i => i.id != productId));
    });
  };

  const getStatusColor = (status: Order['TrangThai']) => {
    const colors = {
      choxacnhan: 'bg-yellow-100 text-yellow-800',
      daxacnhan: 'bg-indigo-100 text-indigo-800',
      dangchuanbihang: 'bg-blue-100 text-blue-800',
      danggiaohang: 'bg-purple-100 text-purple-800',
      hoanthanh: 'bg-green-100 text-green-800',
      dahuy: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: Order['TrangThai']) => {
    const texts = {
      choxacnhan: 'Chờ xác nhận',
      daxacnhan: 'Đã xác nhận',
      dangchuanbihang: 'Đang xử lý',
      danggiaohang: 'Đang giao',
      hoanthanh: 'Đã giao',
      dahuy: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatPrice = (price: number | string) => {
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'TÀI KHOẢN', icon: User },
    { id: 'orders' as Tab, label: 'ĐƠN HÀNG', icon: Package },
    { id: 'wishlist' as Tab, label: 'WISHLIST', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
            Quản Lý Tài Khoản
          </h1>
          <p className="text-gray-600">Xin chào, {profileData.fullName || user?.name || ''}</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-2 border-black mb-6 overflow-x-auto shadow-sm">
          <div className="flex border-b border-black">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold transition-all whitespace-nowrap min-w-max uppercase ${
                    activeTab === tab.id
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border-2 border-black p-6 md:p-8 shadow-sm">
          {/* Thông tin cá nhân Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Thông tin cá nhân</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors uppercase text-sm">
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                ) : (
                  <button onClick={handleSaveProfile} className="flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black font-bold hover:bg-gray-800 transition-colors uppercase text-sm">
                    <Save className="w-4 h-4" /> Lưu thông tin
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 font-medium">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">Họ và tên</label>
                  <input type="text" value={profileData.fullName} onChange={(e) => handleProfileChange('fullName', e.target.value)} disabled={!isEditing} className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-0 disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">Email</label>
                  <input type="email" value={profileData.email} disabled={true} className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-0 disabled:bg-gray-200" title="Không thể đổi email" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">Số điện thoại</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} disabled={!isEditing} className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-0 disabled:bg-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">Địa chỉ nhận hàng</label>
                  <textarea value={profileData.address || ''} onChange={(e) => handleProfileChange('address', e.target.value)} disabled={!isEditing} rows={3} className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-0 disabled:bg-gray-100" />
                </div>
              </div>
            </div>
          )}

          {/* Đơn hàng Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Đơn hàng của tôi</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold mb-4 uppercase">Bạn chưa có đơn hàng nào</p>
                  <Link to="/shop" className="inline-block px-6 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors uppercase">Mua sắm ngay</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.MaDH} className="border-2 border-black p-4 md:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1 uppercase">Đơn hàng #{order.MaDH}</h3>
                          <p className="text-sm font-bold text-gray-500">{formatDate(order.NgayDat)}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-bold border-2 border-black uppercase ${getStatusColor(order.TrangThai)}`}>
                          {getStatusText(order.TrangThai)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm font-bold">
                        <div><span className="text-gray-500">TỔNG TIỀN:</span> <span className="text-black text-lg">{formatPrice(order.TongTien)}</span></div>
                      </div>
                      <div className="flex gap-3">
                        <Link to={`/order/${order.MaDH}`} className="px-4 py-2 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors uppercase text-sm">Chi tiết</Link>
                        {(order.TrangThai === 'choxacnhan' || order.TrangThai === 'daxacnhan' || order.TrangThai === 'dangchuanbihang') && (
                          <button onClick={() => handleCancelOrder(order.MaDH)} className="px-4 py-2 bg-white text-red-600 border-2 border-black font-bold hover:bg-red-600 hover:text-white transition-colors uppercase text-sm">
                            Hủy đơn hàng
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Sản phẩm yêu thích</h2>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold mb-4 uppercase">Danh sách yêu thích trống</p>
                  <Link to="/shop" className="inline-block px-6 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors uppercase">Khám phá</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlist.map((item) => (
                    <div key={item.id} className="border-2 border-black hover:shadow-lg transition-shadow group flex flex-col">
                      <Link to={`/product/${item.id}`} className="block border-b-2 border-black aspect-square overflow-hidden bg-gray-100">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </Link>
                      <div className="p-4 flex flex-col flex-1">
                        <Link to={`/product/${item.id}`} className="mb-2">
                          <h3 className="font-bold uppercase mb-1 line-clamp-1">{item.title}</h3>
                          <p className="text-sm font-bold text-gray-500 line-clamp-1">{item.artist}</p>
                        </Link>
                        <div className="mb-4">
                          <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button onClick={() => addToCart({ id: item.id, title: item.title, artist: item.artist, price: item.price, image: item.image })} className="flex-1 px-3 py-2 bg-black text-white font-bold text-xs uppercase hover:bg-gray-800 transition-colors">
                            VÀO GIỎ
                          </button>
                          <button onClick={() => handleRemoveWishlist(item.id)} className="px-3 py-2 border-2 border-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}