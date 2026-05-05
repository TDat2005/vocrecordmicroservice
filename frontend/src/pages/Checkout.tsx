import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API } from '../config/api';

export function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart, appliedDiscount, setAppliedDiscount } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [payosModalData, setPayosModalData] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<any>(null);
  const [orderNote, setOrderNote] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({ recipientName: '', recipientPhone: '', address: '' });

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if(loggedInUser) {
      const u = JSON.parse(loggedInUser); setUser(u);
      if(u.customer_id) {
        fetch(API.users.getProfile(u.customer_id)).then(res => res.json()).then(data => {
          if(data.success && data.data && (data.data.address || data.data.phone)) {
            const profileAddr = { MaDC: 'default_profile', NguoiNhan: data.data.fullName || '', SoDienThoai: data.data.phone || '', DiaChi: data.data.address || '', isNew: false };
            setSavedAddresses([profileAddr]); setSelectedAddrId('default_profile');
          }
        }).catch(err => console.error("Error fetching profile:", err));
      }
    } else { alert("Bạn cần đăng nhập để tiến hành đặt hàng!"); navigate('/login', { state: { returnUrl: '/checkout' } }); }
  }, [navigate]);

  if (items.length === 0) {
    return (
      <div className="page page-gray" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center',maxWidth:'28rem',margin:'0 auto',padding:'3rem',border:'2px solid #000',background:'#fff'}}>
          <ShoppingBag style={{width:96,height:96,margin:'0 auto 1.5rem'}} />
          <h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1rem',textTransform:'uppercase'}}>Giỏ hàng trống</h2>
          <p style={{fontWeight:500,marginBottom:'2rem'}}>Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <Link to="/shop" className="btn btn-primary">MUA SẮM NGAY</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = savedAddresses.find(a => a.MaDC === selectedAddrId);
    if (!selected) { alert('Vui lòng chọn hoặc thêm địa chỉ giao hàng!'); return; }
    if (!selected.NguoiNhan || !selected.SoDienThoai || !selected.DiaChi) { alert('Thông tin địa chỉ giao hàng không đầy đủ!'); return; }
    if (!user || !user.customer_id) { alert('Vui lòng Đăng nhập để tiến hành Thanh toán.'); navigate('/login'); return; }
    const isPayos = paymentMethod === 'online';
    const payload = { customer_id: user.customer_id, items: items.map(i => ({ id: i.id, qty: i.quantity, price: i.price })), total: getCartTotal(), address: selected.DiaChi, nguoiNhan: selected.NguoiNhan, sdtNhan: selected.SoDienThoai, ghiChu: orderNote, saveAddress: selected.isNew ? true : false, discountCode: appliedDiscount?.code || null, phuongThucThanhToan: isPayos ? 'payos' : 'cod', maGiaoDich: isPayos ? 'MOCK-PAYOS-' + Date.now() : null };
    if (isPayos) { if(!window.confirm(`Bạn sẽ được chuyển hướng tới cổng thanh toán PayOS.\nTổng tiền: ${getCartTotal().toLocaleString('vi-VN')}đ\nNhấn OK để tiếp tục.`)) return; }
    fetch(API.orders.create, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
    .then(res => res.json()).then(data => {
      if(data.success) { if (isPayos && data.payos_data) { setPayosModalData({ ...data.payos_data, order_id: data.order_id }); } else { alert('Đặt hàng thành công! Mã đơn hàng: ' + data.order_id); clearCart(); navigate('/account?tab=orders'); } }
      else { alert('Lỗi đặt hàng: ' + data.message); }
    }).catch(err => { alert("Có lỗi xảy ra, vui lòng thử lại!"); console.error(err); });
  };

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if(newAddrForm.recipientName.trim().length < 2) { alert('Tên người nhận phải có ít nhất 2 ký tự!'); return; }
    if(!phoneRegex.test(newAddrForm.recipientPhone)) { alert('Số điện thoại không hợp lệ!'); return; }
    if(newAddrForm.address.trim().length < 5) { alert('Địa chỉ quá ngắn!'); return; }
    const newAddr = { MaDC: 'new_' + Date.now(), NguoiNhan: newAddrForm.recipientName.trim(), SoDienThoai: newAddrForm.recipientPhone, DiaChi: newAddrForm.address.trim(), isNew: true };
    setSavedAddresses([newAddr, ...savedAddresses]); setSelectedAddrId(newAddr.MaDC); setShowAddressModal(false); setNewAddrForm({ recipientName: '', recipientPhone: '', address: '' });
  };

  useEffect(() => {
    if (!payosModalData) return;
    const interval = setInterval(() => {
      fetch(API.orders.checkStatus(payosModalData.order_id)).then(res => res.json()).then(data => { if (data.success && data.status === 'dathanhtoan') { clearInterval(interval); clearCart(); navigate('/payment-result?orderCode=' + payosModalData.orderCode); } }).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [payosModalData]);

  const handleCheckPaid = () => {
    fetch(API.orders.checkStatus(payosModalData.order_id)).then(res => res.json()).then(data => {
      if(data.success && data.status === 'dathanhtoan') { clearCart(); navigate('/payment-result?orderCode=' + payosModalData.orderCode); }
      else { alert('Hệ thống chưa ghi nhận thanh toán. Đang kiểm tra tự động mỗi 5 giây, vui lòng chờ...'); }
    });
  };

  const handleApplyCoupon = () => {
    if (!couponInput) return; setCouponLoading(true);
    fetch(API.products.checkDiscount, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponInput, cartTotal: getCartTotal() }) })
    .then(res => res.json()).then(data => { setCouponLoading(false); if (data.success) { setAppliedDiscount({ code: data.data.code, amount: data.data.discountAmount }); setCouponInput(''); } else { alert(data.message); } })
    .catch(() => { setCouponLoading(false); alert('Có lỗi xảy ra khi áp dụng mã!'); });
  };

  const handleCancelPayos = () => { setPayosModalData(null); navigate('/cart'); };

  return (
    <div className="page page-gray">
      <div className="container" style={{padding:'2rem 1rem'}}>
        <div style={{marginBottom:'2rem',borderBottom:'2px solid #000',paddingBottom:'1rem'}}>
          <h1 className="section-title" style={{fontSize:'2.5rem'}}>Thanh Toán</h1>
          <p style={{fontWeight:700,textTransform:'uppercase',marginTop:'0.5rem'}}>Hoàn tất đơn hàng của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="cart-grid">
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            {/* Address */}
            <div style={{background:'#fff',border:'2px solid #000',padding:'1.5rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
                <h2 style={{fontSize:'1.25rem',fontWeight:700,display:'flex',alignItems:'center',gap:'0.5rem',textTransform:'uppercase'}}><Truck style={{width:24,height:24}} /> Sổ Địa Chỉ Giao Hàng</h2>
                <button type="button" onClick={() => setShowAddressModal(true)} className="btn btn-primary btn-sm">+ Thêm Mới</button>
              </div>
              {savedAddresses.length === 0 ? (
                <div style={{textAlign:'center',padding:'2rem',border:'2px dashed #d1d5db'}}>
                  <p style={{color:'#6b7280',fontWeight:700,textTransform:'uppercase',marginBottom:'0.5rem'}}>Bạn chưa có địa chỉ nào được lưu.</p>
                  <button type="button" onClick={() => setShowAddressModal(true)} style={{color:'#000',textDecoration:'underline',fontWeight:700,textTransform:'uppercase',background:'none',border:'none',cursor:'pointer'}}>Nhấn vào đây để thêm địa chỉ giao hàng</button>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',fontWeight:700}}>
                  {savedAddresses.map(addr => (
                    <label key={addr.MaDC} style={{display:'flex',alignItems:'flex-start',padding:'1rem',border:'2px solid',borderColor: selectedAddrId === addr.MaDC ? '#000' : '#d1d5db', background: selectedAddrId === addr.MaDC ? '#fefce8' : '#fff', cursor:'pointer',transition:'all 0.2s'}}>
                      <input type="radio" name="saved_address" style={{width:20,height:20,accentColor:'#000',marginTop:4}} checked={selectedAddrId === addr.MaDC} onChange={() => setSelectedAddrId(addr.MaDC)} />
                      <div style={{marginLeft:'0.75rem',flex:1,fontSize:'0.875rem'}}>
                        <div style={{textTransform:'uppercase'}}>Người nhận: <span style={{fontSize:'1rem',color:'#dc2626'}}>{addr.NguoiNhan}</span> - {addr.SoDienThoai}</div>
                        <div style={{fontWeight:500,marginTop:'0.25rem',textTransform:'uppercase',color:'#374151'}}>{addr.DiaChi}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div style={{marginTop:'1.5rem',paddingTop:'1rem',borderTop:'2px dashed #000'}}>
                <label htmlFor="note" className="form-label">Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea id="note" rows={2} value={orderNote} onChange={(e) => setOrderNote(e.target.value)} className="form-textarea" style={{border:'2px solid #000',fontWeight:700,textTransform:'uppercase'}} placeholder="LỜI NHẮN DÀNH CHO CỬA HÀNG" />
              </div>
            </div>

            {/* Payment */}
            <div style={{background:'#fff',border:'2px solid #000',padding:'1.5rem'}}>
              <h2 style={{fontSize:'1.25rem',fontWeight:700,marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.5rem',textTransform:'uppercase'}}><CreditCard style={{width:24,height:24}} /> Phương Thức Thanh Toán</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',fontWeight:700,textTransform:'uppercase'}}>
                <label style={{display:'flex',alignItems:'center',padding:'1rem',border:'2px solid #000',cursor:'pointer',transition:'background 0.2s'}}>
                  <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{width:20,height:20,accentColor:'#000'}} />
                  <div style={{marginLeft:'0.75rem'}}>Thanh toán tiền mặt (COD)</div>
                </label>
                <label style={{display:'flex',alignItems:'center',padding:'1rem',border:'2px solid #000',cursor:'pointer',transition:'background 0.2s'}}>
                  <input type="radio" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} style={{width:20,height:20,accentColor:'#000'}} />
                  <div style={{marginLeft:'0.75rem'}}>Thanh toán Online (MoMo, VNPay)</div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="neo-card" style={{position:'sticky',top:'6rem'}}>
              <h2 style={{fontSize:'1.25rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'0.5rem'}}>Đơn Hàng</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'1rem',maxHeight:400,overflowY:'auto',paddingRight:'0.5rem'}}>
                {items.map((item) => (
                  <div key={item.id} style={{display:'flex',gap:'1rem',border:'2px solid #000',padding:'0.5rem'}}>
                    <div style={{width:80,height:80,flexShrink:0,borderRight:'2px solid #000',overflow:'hidden',background:'#f3f4f6'}}><img src={item.image} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>
                    <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',minWidth:0}}>
                      <p style={{fontWeight:700,fontSize:'0.875rem',textTransform:'uppercase'}} className="line-clamp-1">{item.title}</p>
                      <p style={{fontSize:'0.875rem',fontWeight:700}}>x{item.quantity}</p>
                      <p style={{fontSize:'0.875rem',fontWeight:700}}>{item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{borderTop:'2px solid #000',paddingTop:'1rem',display:'flex',flexDirection:'column',gap:'0.75rem',marginBottom:'1.5rem',fontWeight:700,textTransform:'uppercase',fontSize:'0.875rem'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)})</span><span>{getCartTotal().toLocaleString('vi-VN')}đ</span></div>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #000',paddingBottom:'1rem'}}><span style={{color:'#4b5563'}}>Phí vận chuyển</span><span>Miễn phí</span></div>
                {appliedDiscount && (<div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px dashed #000',paddingBottom:'1rem',color:'#dc2626'}}><span>GIẢM GIÁ ({appliedDiscount.code})</span><span>-{appliedDiscount.amount.toLocaleString('vi-VN')}đ</span></div>)}
                {!appliedDiscount && (
                  <div style={{paddingBottom:'1rem',borderBottom:'2px solid #000'}}>
                    <label style={{display:'block',fontSize:'0.75rem',fontWeight:900,textTransform:'uppercase',marginBottom:'0.5rem'}}>Mã Giảm Giá</label>
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className="form-input" style={{flex:1,fontSize:'0.875rem',fontWeight:700,textTransform:'uppercase'}} placeholder="NHẬP MÃ" />
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading} className="btn btn-primary btn-sm">{couponLoading ? '...' : 'ÁP DỤNG'}</button>
                    </div>
                  </div>
                )}
                <div style={{borderTop:'2px solid #000',paddingTop:'1rem',display:'flex',justifyContent:'space-between',fontSize:'1.25rem',fontWeight:900}}><span>TỔNG TIỀN</span><span>{(getCartTotal() - (appliedDiscount?.amount || 0)).toLocaleString('vi-VN')}đ</span></div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{fontSize:'1.125rem',marginBottom:'1rem'}}>Xác nhận Đặt hàng</button>
              <Link to="/cart" style={{display:'block',textAlign:'center',fontWeight:700,textTransform:'uppercase'}}>← QUAY LẠI GIỎ HÀNG</Link>
            </div>
          </div>
        </form>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{maxWidth:'28rem'}}>
            <h2 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1.5rem'}}>Thêm Địa Chỉ Mới</h2>
            <form onSubmit={handleAddNewAddressSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem',fontWeight:700,textTransform:'uppercase'}}>
              <div><label className="form-label">Tên người nhận *</label><input type="text" required value={newAddrForm.recipientName} onChange={e => setNewAddrForm({...newAddrForm, recipientName: e.target.value})} className="form-input" placeholder="HỌ VÀ TÊN" /></div>
              <div><label className="form-label">Số điện thoại *</label><input type="tel" required value={newAddrForm.recipientPhone} onChange={e => setNewAddrForm({...newAddrForm, recipientPhone: e.target.value})} className="form-input" placeholder="SỐ ĐIỆN THOẠI" /></div>
              <div><label className="form-label">Địa chỉ giao hàng *</label><textarea required rows={3} value={newAddrForm.address} onChange={e => setNewAddrForm({...newAddrForm, address: e.target.value})} className="form-textarea" style={{border:'2px solid #000'}} placeholder="ĐỊA CHỈ CHI TIẾT" /></div>
              <div style={{display:'flex',gap:'1rem',marginTop:'1rem',paddingTop:'1rem',borderTop:'2px dashed #000'}}>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>LƯU & CHỌN</button>
                <button type="button" onClick={() => setShowAddressModal(false)} className="btn btn-secondary" style={{flex:1}}>HỦY BỎ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PayOS QR Modal */}
      {payosModalData && (
        <div className="modal-overlay">
          <div className="modal-box" style={{maxWidth:'28rem',textAlign:'center'}}>
            <h2 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase',marginBottom:'0.5rem'}}>Thanh Toán Đơn Hàng</h2>
            <p style={{fontWeight:700,color:'#4b5563',marginBottom:'1.5rem',borderBottom:'2px solid #000',paddingBottom:'1rem',fontSize:'0.875rem'}}>Vui lòng mở ứng dụng ngân hàng và quét mã QR bên dưới.</p>
            <div style={{background:'#f3f4f6',padding:'1rem',border:'2px solid #000',display:'inline-block',marginBottom:'1.5rem'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payosModalData.qrCode)}`} alt="QR Code" style={{margin:'0 auto'}} />
            </div>
            <div style={{textAlign:'left',fontWeight:700,textTransform:'uppercase',fontSize:'0.875rem',border:'2px solid #000',padding:'1rem',marginBottom:'1.5rem',background:'#fefce8'}}>
              <p style={{marginBottom:'0.5rem',display:'flex',justifyContent:'space-between'}}><span>Ngân hàng:</span><span>{payosModalData.bin}</span></p>
              <p style={{marginBottom:'0.5rem',display:'flex',justifyContent:'space-between'}}><span>Chủ tk:</span><span>{payosModalData.accountName}</span></p>
              <p style={{marginBottom:'0.5rem',display:'flex',justifyContent:'space-between'}}><span>Số tài khoản:</span><span>{payosModalData.accountNumber}</span></p>
              <p style={{marginBottom:'0.5rem',display:'flex',justifyContent:'space-between',fontSize:'1.125rem',color:'#dc2626'}}><span>Số tiền:</span><span>{payosModalData.amount.toLocaleString()}đ</span></p>
              <p style={{display:'flex',justifyContent:'space-between'}}><span>Nội dung:</span><span>{payosModalData.description}</span></p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <button onClick={handleCheckPaid} className="btn btn-yellow btn-full">Tôi Đã Thanh Toán</button>
              <button onClick={handleCancelPayos} className="btn btn-secondary btn-full">Huỷ Lệnh Thanh Toán</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}