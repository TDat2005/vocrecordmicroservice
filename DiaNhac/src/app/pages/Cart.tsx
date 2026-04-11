import { useState } from 'react';
import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';


export function Cart() {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart, appliedDiscount, setAppliedDiscount } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    setLoading(true);
    fetch(`http://localhost/clonevocrecord/api/discount.php?action=check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, cartTotal: getCartTotal() })
    })
    .then(res => res.json())
    .then(data => {
        setLoading(false);
        if (data.success) {
            setAppliedDiscount({ code: data.data.code, amount: data.data.discountAmount });
            alert(data.message);
        } else {
            alert(data.message);
        }
    })
    .catch(() => {
        setLoading(false);
        alert('Có lỗi xảy ra khi áp dụng mã!');
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center w-[90%] max-w-lg border-2 border-black p-12 bg-white">
          <ShoppingBag className="w-24 h-24 text-black mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Giỏ hàng trống</h2>
          <p className="text-black font-medium mb-8">
            Bạn chưa thêm Sản phẩm nào vào giỏ hàng.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white px-8 py-4 font-bold hover:bg-white hover:text-black border-2 border-black transition-colors uppercase"
          >
            Quay Về Cửa Hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 border-b-2 border-black pb-4 flex items-center justify-between">
          <h1 className="text-4xl lg:text-5xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>GIỎ HÀNG</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-white border-2 border-red-600 hover:bg-red-600 px-4 py-2 font-bold uppercase transition-colors"
          >
            Xóa Tất Cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Desktop Table Header */}
            <div className="hidden md:flex border-2 border-black border-b-0 bg-white p-4 font-bold uppercase text-sm">
                <div className="flex-1">Sản phẩm</div>
                <div className="w-32 text-center">Giá</div>
                <div className="w-32 text-center">Số lượng</div>
                <div className="w-32 text-right">Tạm tính</div>
                <div className="w-12"></div>
            </div>

            <div className="space-y-4 md:space-y-0">
              {items.map((item) => (
                <div key={item.id} className="bg-white border-2 border-black p-4 flex flex-col md:flex-row gap-4 items-center md:items-stretch mb-0 md:-mt-[2px]">
                  {/* Image & Title */}
                  <div className="flex-1 flex gap-4 w-full md:w-auto items-center">
                      <div className="w-24 h-24 shrink-0 border-2 border-black overflow-hidden bg-gray-100">
                      <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                      />
                      </div>
                      <div className="min-w-0 flex-1">
                      <Link
                          to={`/product/${item.id}`}
                          className="font-bold text-lg hover:underline block uppercase line-clamp-2"
                      >
                          {item.title}
                      </Link>
                      <p className="text-gray-600 font-bold uppercase mt-1 text-sm">{item.artist}</p>
                      {/* Mobile Price */}
                      <p className="md:hidden text-black font-bold mt-2">{item.price.toLocaleString('vi-VN')}đ</p>
                      </div>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden md:flex w-32 items-center justify-center font-bold">
                      {item.price.toLocaleString('vi-VN')}đ
                  </div>

                  {/* Quantity */}
                  <div className="w-full md:w-32 flex items-center justify-center">
                      <div className="flex items-center gap-0 w-max border-2 border-black">
                          <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-black hover:text-white transition-colors"
                          >
                              <Minus className="w-4 h-4 cursor-pointer pointer-events-none" />
                          </button>
                          <span className="w-12 h-10 text-center font-bold uppercase flex items-center justify-center border-x-2 border-black">
                              {item.quantity}
                          </span>
                          <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-black hover:text-white transition-colors"
                          >
                              <Plus className="w-4 h-4 cursor-pointer pointer-events-none" />
                          </button>
                      </div>
                  </div>

                  {/* Total & Remove */}
                  <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0">
                      <div className="font-bold text-xl md:w-32 md:text-right">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                      <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shrink-0"
                          title="Xóa"
                      >
                          <Trash2 className="w-5 h-5 cursor-pointer pointer-events-none" />
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-black p-6 sticky top-24 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold mb-6 uppercase border-b-2 border-black pb-2" style={{ fontFamily: 'var(--font-heading)' }}>CỘNG GIỎ HÀNG</h2>

              <div className="space-y-4 mb-6 font-bold text-sm uppercase">
                <div className="flex justify-between border-b-2 border-black pb-4">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-black">{getCartTotal().toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between border-b-2 border-black pb-4">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-black">MIỄN PHÍ</span>
                </div>
                {appliedDiscount && (
                    <div className="flex justify-between border-b-2 border-black border-dashed pb-4 text-red-600">
                        <span>GIẢM GIÁ ({appliedDiscount.code})</span>
                        <span>-{appliedDiscount.amount.toLocaleString('vi-VN')}đ</span>
                    </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg">Tổng</span>
                  <span className="text-2xl font-black">
                      {(getCartTotal() - (appliedDiscount?.amount || 0)).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                  <label className="block text-xs font-black uppercase mb-2">Mã Giảm Giá</label>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="NHẬP MÃ TẠI ĐÂY"
                        className="flex-1 border-2 border-black p-2 font-bold focus:outline-none uppercase text-sm"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={loading}
                        className="bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-yellow-400 hover:text-black transition-colors uppercase text-sm disabled:opacity-50"
                      >
                        {loading ? '...' : 'ÁP DỤNG'}
                      </button>
                  </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-black text-white py-4 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors mb-4 text-center uppercase text-lg"
              >
                Tiến Hành Thanh Toán
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}