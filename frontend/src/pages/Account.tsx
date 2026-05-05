import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { User, Package, Heart, Edit2, Save, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API } from '../config/api';

type Tab = 'profile' | 'orders' | 'wishlist';
interface Order { id: number; createdAt: string; status: 'choxacnhan' | 'daxacnhan' | 'dangchuanbihang' | 'danggiaohang' | 'hoanthanh' | 'dahuy'; total: number; }

export function Account() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabQuery = searchParams.get('tab') as Tab;
  const activeTab: Tab = ['profile', 'orders', 'wishlist'].includes(tabQuery) ? tabQuery : 'profile';
  const setActiveTab = (tab: Tab) => setSearchParams({ tab });
  const [isEditing, setIsEditing] = useState(false);
  const { addToCart } = useCart();
  const [profileData, setProfileData] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) { navigate('/login'); return; }
    const userData = JSON.parse(loggedInUser);
    setUser(userData);
    if (userData.customer_id) {
      fetch(API.users.getProfile(userData.customer_id)).then(res => res.json()).then(data => { if(data.success) setProfileData(data.data) });
      fetchOrdersData(userData.customer_id);
      fetch(API.users.getWishlist(userData.customer_id)).then(res => res.json()).then(data => { if(data.success) setWishlist(data.data) });
    }
  }, [navigate]);

  const fetchOrdersData = (custId: any) => {
    fetch(`${API.orders.list}?customer_id=${custId}`).then(res => res.json()).then(data => { if(data.success) setOrders(data.data) });
  };

  const handleCancelOrder = (orderId: number) => {
    if (!window.confirm('BẠN CHẮC CHẮN MUỐN HỦY ĐƠN HÀNG NÀY?')) return;
    fetch(API.orders.cancel, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ order_id: orderId, customer_id: user.customer_id }) })
    .then(res => res.json()).then(data => { if(data.success) { alert('Đã hủy đơn hàng!'); fetchOrdersData(user.customer_id); } else { alert(data.message); } });
  };

  const handleProfileChange = (field: string, value: string) => setProfileData(prev => ({ ...prev, [field]: value }));

  const handleSaveProfile = () => {
    if(!user || !user.customer_id) return;
    fetch(API.users.updateProfile(user.customer_id), { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ customer_id: user.customer_id, ...profileData }) })
    .then(res => res.json()).then(data => { if(data.success) { alert("Đã lưu thông tin."); setIsEditing(false); } else { alert(data.message); } });
  };

  const handleRemoveWishlist = (productId: number) => {
    if(!user || !user.customer_id) { console.error('No user/customer_id'); return; }
    fetch(API.users.removeWishlist, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ customer_id: user.customer_id, product_id: productId }) })
    .then(res => res.json())
    .then(data => { 
      if(data.success) { 
        setWishlist(prev => prev.filter(i => i.product_id != productId)); 
      } else { 
        alert('Lỗi: ' + data.message); 
      } 
    })
    .catch(err => { console.error('Lỗi xóa wishlist:', err); alert('Có lỗi xảy ra, vui lòng thử lại!'); });
  };

  const handleAddToCart = (prodItem: any) => {
    const prod = prodItem.product || {};
    addToCart({ id: prodItem.product_id, title: prod.name || 'Sản phẩm', artist: prod.artist || '', price: Number(prod.price) || 0, image: prod.image || '', stock: Number(prod.stock) || 99 });
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const getStatusStyle = (status: Order['status']) => {
    const styles: Record<string, React.CSSProperties> = {
      choxacnhan: {background:'#fef9c3',color:'#854d0e'}, daxacnhan: {background:'#e0e7ff',color:'#3730a3'}, dangchuanbihang: {background:'#dbeafe',color:'#1e40af'},
      danggiaohang: {background:'#f3e8ff',color:'#6b21a8'}, hoanthanh: {background:'#dcfce7',color:'#166534'}, dahuy: {background:'#fee2e2',color:'#991b1b'},
    };
    return styles[status] || {background:'#f3f4f6',color:'#1f2937'};
  };
  const getStatusText = (status: Order['status']) => {
    const texts: Record<string, string> = { choxacnhan:'Chờ xác nhận', daxacnhan:'Đã xác nhận', dangchuanbihang:'Đang xử lý', danggiaohang:'Đang giao', hoanthanh:'Đã giao', dahuy:'Đã hủy' };
    return texts[status] || status;
  };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatPrice = (price: number | string) => Number(price).toLocaleString('vi-VN') + 'đ';

  const tabs = [
    { id: 'profile' as Tab, label: 'TÀI KHOẢN', icon: User },
    { id: 'orders' as Tab, label: 'ĐƠN HÀNG', icon: Package },
    { id: 'wishlist' as Tab, label: 'WISHLIST', icon: Heart },
  ];

  return (
    <div className="page page-gray" style={{padding:'2rem 0'}}>
      <div className="container">
        <div style={{marginBottom:'2rem'}}>
          <h1 className="section-title">Quản Lý Tài Khoản</h1>
          <p style={{color:'#4b5563'}}>Xin chào, {profileData.fullName || user?.name || ''}</p>
        </div>

        <div style={{background:'#fff',border:'2px solid #000',marginBottom:'1.5rem',overflowX:'auto'}}>
          <div className="account-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`account-tab ${activeTab === tab.id ? 'active' : ''}`}><Icon style={{width:20,height:20}} />{tab.label}</button>);
            })}
          </div>
        </div>

        <div style={{background:'#fff',border:'2px solid #000',padding:'2rem'}}>
          {activeTab === 'profile' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
                <h2 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Thông tin cá nhân</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm"><Edit2 style={{width:16,height:16}} /> Chỉnh sửa</button>
                ) : (
                  <button onClick={handleSaveProfile} className="btn btn-primary btn-sm"><Save style={{width:16,height:16}} /> Lưu thông tin</button>
                )}
              </div>
              <div className="grid-2">
                <div><label className="form-label">Họ và tên</label><input type="text" value={profileData.fullName} onChange={(e) => handleProfileChange('fullName', e.target.value)} disabled={!isEditing} className="form-input" style={{background: !isEditing ? '#f3f4f6' : '#fff'}} /></div>
                <div><label className="form-label">Email</label><input type="email" value={profileData.email} disabled className="form-input" style={{background:'#e5e7eb'}} title="Không thể đổi email" /></div>
                <div><label className="form-label">Số điện thoại</label><input type="tel" value={profileData.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} disabled={!isEditing} className="form-input" style={{background: !isEditing ? '#f3f4f6' : '#fff'}} /></div>
                <div style={{gridColumn:'1 / -1'}}><label className="form-label">Địa chỉ nhận hàng</label><textarea value={profileData.address || ''} onChange={(e) => handleProfileChange('address', e.target.value)} disabled={!isEditing} rows={3} className="form-textarea" style={{background: !isEditing ? '#f3f4f6' : '#fff', border:'2px solid #000'}} /></div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Đơn hàng của tôi</h2>
              {orders.length === 0 ? (
                <div className="empty-state" style={{border:'2px dashed #d1d5db'}}><Package style={{width:64,height:64,color:'#d1d5db',margin:'0 auto 1rem'}} /><p style={{color:'#6b7280',marginBottom:'1rem'}}>Bạn chưa có đơn hàng nào</p><Link to="/shop" className="btn btn-primary btn-sm">Mua sắm ngay</Link></div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                  {orders.map((order) => (
                    <div key={order.id} style={{border:'2px solid #000',padding:'1.5rem',transition:'box-shadow 0.2s'}}>
                      <div style={{display:'flex',flexWrap:'wrap',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'1rem'}}>
                        <div>
                          <h3 style={{fontWeight:700,fontSize:'1.125rem',marginBottom:'0.25rem',textTransform:'uppercase'}}>Đơn hàng #{order.id}</h3>
                          <p style={{fontSize:'0.875rem',fontWeight:700,color:'#6b7280'}}>{formatDate(order.createdAt)}</p>
                        </div>
                        <span style={{...getStatusStyle(order.status),padding:'0.25rem 0.75rem',fontSize:'0.875rem',fontWeight:700,border:'2px solid #000',textTransform:'uppercase'}}>{getStatusText(order.status)}</span>
                      </div>
                      <div style={{fontSize:'0.875rem',fontWeight:700,marginBottom:'1rem'}}><span style={{color:'#6b7280'}}>TỔNG TIỀN:</span> <span style={{fontSize:'1.125rem'}}>{formatPrice(order.total)}</span></div>
                      <div style={{display:'flex',gap:'0.75rem'}}>
                        <Link to={`/order/${order.id}`} className="btn btn-secondary btn-sm">Chi tiết</Link>
                        {(order.status === 'choxacnhan' || order.status === 'daxacnhan' || order.status === 'dangchuanbihang') && (
                          <button onClick={() => handleCancelOrder(order.id)} className="btn btn-danger btn-sm">Hủy đơn hàng</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Sản phẩm yêu thích</h2>
              {wishlist.length === 0 ? (
                <div className="empty-state" style={{border:'2px dashed #d1d5db'}}><Heart style={{width:64,height:64,color:'#d1d5db',margin:'0 auto 1rem'}} /><p style={{color:'#6b7280',marginBottom:'1rem'}}>Danh sách yêu thích trống</p><Link to="/shop" className="btn btn-primary btn-sm">Khám phá</Link></div>
              ) : (
                <div className="grid-4">
                  {wishlist.map((item) => {
                    const prod = item.product || {};
                    return (
                    <div key={item.id} style={{border:'2px solid #000',display:'flex',flexDirection:'column',transition:'box-shadow 0.2s'}}>
                      <Link to={`/product/${item.product_id}`} style={{display:'block',borderBottom:'2px solid #000',aspectRatio:'1',overflow:'hidden',background:'#f3f4f6'}}>
                        <img src={prod.image || ''} alt={prod.name || ''} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      </Link>
                      <div style={{padding:'1rem',display:'flex',flexDirection:'column',flex:1}}>
                        <Link to={`/product/${item.product_id}`} style={{marginBottom:'0.5rem'}}>
                          <h3 style={{fontWeight:700,textTransform:'uppercase',marginBottom:'0.25rem'}} className="line-clamp-1">{prod.name || 'Sản phẩm'}</h3>
                          <p style={{fontSize:'0.875rem',fontWeight:700,color:'#6b7280'}} className="line-clamp-1">{prod.artist || ''}</p>
                        </Link>
                        <div style={{marginBottom:'1rem'}}><span style={{fontWeight:700,fontSize:'1.125rem'}}>{formatPrice(prod.price || 0)}</span></div>
                        <div style={{marginTop:'auto',display:'flex',gap:'0.5rem'}}>
                          <button onClick={() => handleAddToCart(item)} className="btn btn-primary btn-sm" style={{flex:1,fontSize:'0.75rem'}}>VÀO GIỎ</button>
                          <button onClick={() => handleRemoveWishlist(item.product_id)} className="btn btn-secondary btn-sm" style={{padding:'0.5rem'}} title="Xóa"><Trash2 style={{width:16,height:16}} /></button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}