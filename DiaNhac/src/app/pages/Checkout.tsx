import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

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
  const [newAddrForm, setNewAddrForm] = useState({
      recipientName: '',
      recipientPhone: '',
      address: ''
  });

  useEffect(() => {
    // Nếu user đăng nhập, điền sẵn thông tin
    const loggedInUser = localStorage.getItem('user');
    if(loggedInUser) {
        const u = JSON.parse(loggedInUser);
        setUser(u);
        if(u.customer_id) {
            fetch(`http://localhost/clonevocrecord/api/account.php?action=get_addresses&customer_id=${u.customer_id}`)
            .then(res => res.json())
            .then(addrData => {
                if(addrData.success && addrData.data && addrData.data.length > 0) {
                    setSavedAddresses(addrData.data);
                    setSelectedAddrId(addrData.data[0].MaDC);
                } else {
                    // Nếu chưa có sổ, lấy profile mặc định dựng 1 địa chỉ ảo
                    fetch(`http://localhost/clonevocrecord/api/account.php?action=get_profile&customer_id=${u.customer_id}`)
                    .then(res => res.json())
                    .then(data => {
                        if(data.success && data.data && (data.data.address || data.data.phone)) {
                            const profileAddr = {
                                MaDC: 'profile_default',
                                NguoiNhan: data.data.fullName,
                                SoDienThoai: data.data.phone,
                                DiaChi: data.data.address,
                                isNew: true
                            };
                            setSavedAddresses([profileAddr]);
                            setSelectedAddrId(profileAddr.MaDC);
                        }
                    });
                }
            });
        }
    }
  }, []);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 border-2 border-black p-12 bg-white">
          <ShoppingBag className="w-24 h-24 text-black mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 uppercase text-black">Giỏ hàng trống</h2>
          <p className="text-black font-medium mb-8">
            Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-white hover:text-black border-2 border-black transition-colors uppercase"
          >
            MUA SẮM NGAY
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selected = savedAddresses.find(a => a.MaDC === selectedAddrId);
    if (!selected) {
      alert('Vui lòng chọn hoặc thêm địa chỉ giao hàng!');
      return;
    }

    if (!selected.NguoiNhan || !selected.SoDienThoai || !selected.DiaChi) {
      alert('Thông tin địa chỉ giao hàng không đầy đủ!');
      return;
    }

    if (!user || !user.customer_id) {
       alert('Vui lòng Đăng nhập để tiến hành Thanh toán.');
       navigate('/login');
       return;
    }

    const isPayos = paymentMethod === 'online';

    const payload = {
        customer_id: user.customer_id,
        items: items.map(i => ({ id: i.id, qty: i.quantity, price: i.price })),
        total: getCartTotal(),
        address: selected.DiaChi,
        nguoiNhan: selected.NguoiNhan,
        sdtNhan: selected.SoDienThoai,
        ghiChu: orderNote,
        saveAddress: selected.isNew ? true : false,
        discountCode: appliedDiscount?.code || null,
        phuongThucThanhToan: isPayos ? 'payos' : 'cod',
        maGiaoDich: isPayos ? 'MOCK-PAYOS-' + Date.now() : null
    };

    if (isPayos) {
         if(!window.confirm(`Bạn sẽ được chuyển hướng tới cổng thanh toán PayOS.\nTổng tiền: ${getCartTotal().toLocaleString('vi-VN')}đ\nNhấn OK để tiếp tục.`)) {
             return;
         }
    }

    fetch('http://localhost/clonevocrecord/api/orders.php?action=create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
          if (isPayos && data.payos_data) {
            setPayosModalData({ ...data.payos_data, order_id: data.order_id });
          } else {
            alert('Đặt hàng thành công! Mã đơn hàng: ' + data.order_id);
            clearCart();
            navigate('/account');
          }
        } else {
            alert('Lỗi đặt hàng: ' + data.message);
        }
    })
    .catch(err => {
        alert("Có lỗi xảy ra, vui lòng thử lại!");
        console.error(err);
    });
  };

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newAddrForm.recipientName || !newAddrForm.recipientPhone || !newAddrForm.address) return;
      
      const newAddr = {
          MaDC: 'new_' + Date.now(),
          NguoiNhan: newAddrForm.recipientName,
          SoDienThoai: newAddrForm.recipientPhone,
          DiaChi: newAddrForm.address,
          isNew: true
      };

      setSavedAddresses([newAddr, ...savedAddresses]);
      setSelectedAddrId(newAddr.MaDC);
      setShowAddressModal(false);
      setNewAddrForm({ recipientName: '', recipientPhone: '', address: '' });
  };

  const handleCheckPaid = () => {
       fetch(`http://localhost/clonevocrecord/api/orders.php?action=check_status&order_id=${payosModalData.order_id}`)
       .then(res => res.json())
       .then(data => {
           if(data.success && data.status === 'dathanhtoan') {
               clearCart();
               navigate('/payment-result?orderCode=' + payosModalData.orderCode);
           } else {
               alert('Hệ thống chưa ghi nhận thanh toán. Nếu bạn đã quét mã, vui lòng chờ vài giây hoặc kiểm tra lại!');
           }
       });
  };

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    setCouponLoading(true);
    fetch('http://localhost/clonevocrecord/api/discount.php?action=check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, cartTotal: getCartTotal() })
    })
    .then(res => res.json())
    .then(data => {
        setCouponLoading(false);
        if (data.success) {
            setAppliedDiscount({ code: data.data.code, amount: data.data.discountAmount });
            setCouponInput('');
        } else {
            alert(data.message);
        }
    })
    .catch(() => {
        setCouponLoading(false);
        alert('Có lỗi xảy ra khi áp dụng mã!');
    });
  };

  const handleCancelPayos = () => {
       setShowAddressModal(false); // Just in case
       setPayosModalData(null);
       navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 border-b-2 border-black pb-4 block lg:flex justify-between items-end">
          <div>
              <h1 className="text-4xl lg:text-5xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Thanh Toán</h1>
              <p className="text-gray-900 font-bold uppercase mt-2">Hoàn tất đơn hàng của bạn</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Sổ Địa Chỉ (Luôn hiển thị) */}
            <div className="bg-white border-2 border-black p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 uppercase">
                   <Truck className="w-6 h-6" /> Sổ Địa Chỉ Giao Hàng
                </h2>
                <button 
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="bg-black text-white px-4 py-2 font-bold text-sm hover:bg-yellow-400 hover:text-black uppercase border-2 border-black transition-colors"
                >
                   + Thêm Mới
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 font-bold uppercase mb-2">Bạn chưa có địa chỉ nào được lưu.</p>
                      <button 
                        type="button"
                        onClick={() => setShowAddressModal(true)}
                        className="text-black underline font-bold uppercase hover:text-pink-600"
                      >
                         Nhấn vào đây để thêm địa chỉ giao hàng
                      </button>
                  </div>
              ) : (
                  <div className="space-y-3 font-bold">
                      {savedAddresses.map(addr => (
                          <label key={addr.MaDC} className={`flex items-start p-4 border-2 cursor-pointer transition-colors w-full ${selectedAddrId === addr.MaDC ? 'border-black bg-yellow-50' : 'border-gray-300 hover:border-black'}`}>
                              <input 
                                  type="radio" 
                                  name="saved_address" 
                                  className="w-5 h-5 accent-black mt-1" 
                                  checked={selectedAddrId === addr.MaDC}
                                  onChange={() => setSelectedAddrId(addr.MaDC)}
                              />
                              <div className="ml-3 flex-1 text-sm">
                                  <div className="uppercase">Người nhận: <span className="text-base text-red-600">{addr.NguoiNhan}</span> - {addr.SoDienThoai}</div>
                                  <div className="font-medium mt-1 uppercase text-gray-700">{addr.DiaChi}</div>
                              </div>
                          </label>
                      ))}
                  </div>
              )}

              {/* Order Note */}
              <div className="mt-6 pt-4 border-t-2 border-black border-dashed">
                  <label htmlFor="note" className="block font-bold text-sm uppercase mb-2">Ghi chú đơn hàng (Tùy chọn)</label>
                  <textarea
                    id="note" name="note" rows={2}
                    value={orderNote} onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 resize-none font-bold uppercase placeholder-gray-400" placeholder="LỜI NHẮN DÀNH CHO CỬA HÀNG"
                  />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 uppercase">
                <CreditCard className="w-6 h-6" /> Phương Thức Thanh Toán
              </h2>
              <div className="space-y-3 font-bold uppercase">
                <label className="flex items-center p-4 border-2 border-black cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod('cod')} className="w-5 h-5 accent-black" />
                  <div className="ml-3 flex-1">
                    <div>Thanh toán tiền mặt (COD)</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-black cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="radio" value="online" checked={paymentMethod === 'online'} onChange={(e) => setPaymentMethod('online')} className="w-5 h-5 accent-black" />
                  <div className="ml-3 flex-1">
                    <div>Thanh toán Online (MoMo, VNPay)</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24">
              <h2 className="text-xl font-bold mb-6 uppercase border-b-2 border-black pb-2">Đơn Hàng</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-2 border-black p-2">
                    <div className="w-20 h-20 shrink-0 border-r-2 border-black overflow-hidden bg-gray-100">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <p className="font-bold text-sm uppercase line-clamp-1">{item.title}</p>
                      <p className="text-sm font-bold text-gray-900 mb-1">x{item.quantity}</p>
                      <p className="text-sm font-bold">{item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t-2 border-black pt-4 space-y-3 mb-6 font-bold uppercase text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>{getCartTotal().toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between border-b-2 border-black pb-4">
                  <span className="text-gray-600">PHÍ VẬN CHUYỂN</span>
                  <span className="text-black uppercase">Miễn phí</span>
                </div>
                {appliedDiscount && (
                    <div className="flex justify-between border-b-2 border-black border-dashed pb-4 text-red-600">
                        <span>GIẢM GIÁ ({appliedDiscount.code})</span>
                        <span>-{appliedDiscount.amount.toLocaleString('vi-VN')}đ</span>
                    </div>
                )}

                {/* Inline Coupon Input for Checkout */}
                {!appliedDiscount && (
                    <div className="pb-4 border-b-2 border-black">
                        <label className="block text-xs font-black uppercase mb-2">Mã Giảm Giá</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                className="flex-1 border-2 border-black px-3 py-2 text-sm font-bold uppercase focus:outline-none"
                                placeholder="NHẬP MÃ"
                            />
                            <button 
                                type="button"
                                onClick={handleApplyCoupon}
                                disabled={couponLoading}
                                className="bg-black text-white px-4 py-2 border-2 border-black font-black text-xs hover:bg-yellow-400 hover:text-black transition-colors disabled:opacity-50 uppercase"
                            >
                                {couponLoading ? '...' : 'ÁP DỤNG'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="border-t-2 border-black pt-4 flex justify-between text-xl font-black">
                  <span>TỔNG TIỀN</span>
                  <span>{(getCartTotal() - (appliedDiscount?.amount || 0)).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full bg-black text-white py-4 font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-none transition-all uppercase mb-4 text-lg">
                Xác nhận Đặt hàng
              </button>
              <Link to="/cart" className="block text-center text-black font-bold uppercase hover:underline">
                ← QUAY LẠI GIỎ HÀNG
              </Link>
            </div>
          </div>
        </form>
      </div>

      {showAddressModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
             <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
                 <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-2">Thêm Địa Chỉ Mới</h2>
                 <form onSubmit={handleAddNewAddressSubmit} className="space-y-4 font-bold uppercase">
                     <div>
                         <label className="block text-sm mb-2">Tên người nhận *</label>
                         <input type="text" required value={newAddrForm.recipientName} onChange={e => setNewAddrForm({...newAddrForm, recipientName: e.target.value})} className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0" placeholder="HỌ VÀ TÊN" />
                     </div>
                     <div>
                         <label className="block text-sm mb-2">Số điện thoại *</label>
                         <input type="tel" required value={newAddrForm.recipientPhone} onChange={e => setNewAddrForm({...newAddrForm, recipientPhone: e.target.value})} className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0" placeholder="SỐ ĐIỆN THOẠI" />
                     </div>
                     <div>
                         <label className="block text-sm mb-2">Địa chỉ giao hàng *</label>
                         <textarea required rows={3} value={newAddrForm.address} onChange={e => setNewAddrForm({...newAddrForm, address: e.target.value})} className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 resize-none" placeholder="ĐỊA CHỈ CHI TIẾT" />
                     </div>
                     <div className="flex gap-4 mt-6 pt-4 border-t-2 border-black border-dashed">
                         <button type="submit" className="flex-1 bg-black text-white py-3 border-2 border-black hover:bg-yellow-400 hover:text-black uppercase transition-colors text-sm">LƯU & CHỌN</button>
                         <button type="button" onClick={() => setShowAddressModal(false)} className="flex-1 bg-white text-black py-3 border-2 border-black hover:bg-gray-100 uppercase transition-colors text-sm">HỦY BỎ</button>
                     </div>
                 </form>
             </div>
          </div>
      )}

      {payosModalData && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
             <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] text-center my-8">
                 <h2 className="text-2xl font-bold uppercase mb-2">Thanh Toán Đơn Hàng</h2>
                 <p className="font-bold text-gray-600 mb-6 border-b-2 border-black pb-4 text-sm">Vui lòng mở ứng dụng ngân hàng và quét mã QR bên dưới.</p>
                 
                 <div className="bg-gray-100 p-4 border-2 border-black inline-block mb-6">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payosModalData.qrCode)}`} alt="QR Code" className="mx-auto" />
                 </div>

                 <div className="text-left font-bold uppercase text-sm border-2 border-black p-4 mb-6 bg-yellow-50">
                     <p className="mb-2 flex justify-between"><span>Ngân hàng:</span> <span>{payosModalData.bin}</span></p>
                     <p className="mb-2 flex justify-between"><span>Chủ tk:</span> <span>{payosModalData.accountName}</span></p>
                     <p className="mb-2 flex justify-between"><span>Số tài khoản:</span> <span>{payosModalData.accountNumber}</span></p>
                     <p className="mb-2 flex justify-between text-lg text-red-600"><span>Số tiền:</span> <span>{payosModalData.amount.toLocaleString()}đ</span></p>
                     <p className="mb-2 flex justify-between"><span>Nội dung:</span> <span>{payosModalData.description}</span></p>
                 </div>

                 <div className="space-y-3">
                     <button onClick={handleCheckPaid} className="w-full bg-yellow-400 text-black border-2 border-black py-4 font-bold uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                         Tôi Đã Thanh Toán
                     </button>
                     <button onClick={handleCancelPayos} className="w-full bg-white text-black border-2 border-black py-4 font-bold uppercase hover:bg-gray-100 transition-colors">
                         Huỷ Lệnh Thanh Toán
                     </button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
}