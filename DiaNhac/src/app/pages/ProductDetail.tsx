import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Check, Plus, Minus, Heart, Youtube } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [record, setRecord] = useState<any>(null);
  const [relatedRecords, setRelatedRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`${API_BASE}/products.php?action=detail&id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setRecord(data.data);
          fetch(`${API_BASE}/products.php?action=list&category=${data.data.genre}`)
            .then(r => r.json())
            .then(d => {
              if (d.success && d.data) {
                setRelatedRecords(d.data.filter((i: any) => i.id != id).slice(0, 4));
              }
            });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-xl uppercase">Đang tải...</div>;
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 uppercase">Không tìm thấy sản phẩm</h2>
          <Link to="/shop" className="bg-black text-white px-6 py-2 border-2 border-black font-bold uppercase transition-colors hover:bg-white hover:text-black hover:border-black">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (record) {
      addToCart({
        id: record.id,
        title: record.title,
        artist: record.artist,
        price: record.price,
        image: record.image,
      }, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
      if (record) {
          addToCart({
            id: record.id,
            title: record.title,
            artist: record.artist,
            price: record.price,
            image: record.image,
          }, quantity);
          navigate('/checkout');
      }
  };

  const handleWishlistToggle = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích!');
      return;
    }
    const user = JSON.parse(userStr);
    const customerId = user.customer_id;
    if (!customerId) return;

    if (isInWishlist(record.id)) {
      // Xóa khỏi wishlist
      fetch(`${API_BASE}/wishlist.php?action=remove`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ customer_id: customerId, product_id: record.id })
      }).then(res => res.json()).then(data => {
        if (data.success) removeFromWishlist(record.id);
      });
    } else {
      // Thêm vào wishlist
      fetch(`${API_BASE}/wishlist.php?action=add`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ customer_id: customerId, product_id: record.id })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          addToWishlist({
            id: record.id, title: record.title, artist: record.artist,
            price: record.price, image: record.image, genre: record.genre, year: record.year,
          });
        } else {
          alert(data.message);
        }
      });
    }
  };

  const incrementQuantity = () => {
    if (quantity < record.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= record.stock) {
      setQuantity(value);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-black hover:text-gray-600 mb-6 font-bold uppercase"
        >
          <ArrowLeft className="w-5 h-5" />
          QUAY LẠI
        </button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column: Image + Shipping Notice */}
          <div className="flex flex-col gap-8">
            <div className="bg-white border-2 border-black p-4 md:p-8">
              <div className="aspect-square overflow-hidden border-2 border-black bg-gray-100">
                <img
                  src={record.image}
                  alt={record.title}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>
            </div>

            <div className="bg-gray-100 border-2 border-black p-6">
              <h3 className="font-bold text-xl uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                <ShoppingCart className="w-6 h-6" /> LƯU Ý KHI MUA HÀNG
              </h3>
              <ul className="space-y-3 text-sm font-medium list-disc list-inside">
                <li>Vui lòng thanh toán 100% đơn hàng có <span className="font-bold">sản phẩm PRE-ORDER</span>.</li>
                <li>Giá sản phẩm <span className="font-bold">PRE-ORDER</span> cập nhật hàng tuần, Vọc Records sẽ liên hệ nếu có chênh lệch.</li>
                <li>Vận chuyển: Sản phẩm <span className="font-bold">CÒN HÀNG 1-5 ngày</span>, sản phẩm <span className="font-bold">PRE-ORDER 2-5 tuần</span>.</li>
                <li>Sản phẩm giá <span className="font-bold">0 đ</span> vui lòng <span className="font-bold underline">LIÊN HỆ</span> để đặt hàng.</li>
                <li><span className="font-bold">KHÔNG HUỶ/ HOÀN TIỀN</span> sản phẩm PRE-ORDER.</li>
                <li>Khách hàng có thể <span className="font-bold">HỦY ĐƠN HÀNG</span> nếu cửa hàng chưa gửi cho đơn vị vận chuyển.</li>
                <li className="list-none pt-2 font-bold underline cursor-pointer hover:text-red-600">QUY ĐỊNH ĐỔI TRẢ</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Info + Table + Tracklist */}
          <div>
            <div className="mb-2">
              <span className="inline-block bg-black text-white px-3 py-1 text-sm font-bold uppercase">
                {record.genre}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>{record.title}</h1>
            <p className="text-2xl text-gray-800 mb-4 font-bold uppercase border-b-2 border-black pb-4">{record.artist}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              <span className="text-sm font-bold bg-yellow-400 px-3 py-1 border-2 border-black flex items-center uppercase">
                NĂM PHÁT HÀNH: {record.year || 'N/A'}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-black">{formatPrice(record.price)}</span>
            </div>

            <div className="mb-6">
              {record.stock > 0 ? (
                <div className="flex items-center gap-2 text-black bg-green-100 border-2 border-black px-4 py-2 w-max">
                  <Check className="w-5 h-5" />
                  <span className="font-bold uppercase">CÒN HÀNG ({record.stock} SP)</span>
                </div>
              ) : (
                <span className="text-white bg-red-600 px-4 py-2 border-2 border-black font-bold uppercase">HẾT HÀNG</span>
              )}
            </div>

            <div className="mb-8 p-4 border-2 border-black bg-gray-50">
              <h3 className="font-bold mb-2 uppercase">MÔ TẢ SẢN PHẨM</h3>
              <p className="text-black font-medium leading-relaxed">{record.description}</p>
            </div>

            {/* Quantity Selector */}
            {record.stock > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 uppercase">SỐ LƯỢNG</h3>
                <div className="flex items-center gap-0 w-max border-2 border-black bg-white">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="text-black hover:bg-black hover:text-white w-12 h-12 flex items-center justify-center font-bold transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={record.stock}
                    className="w-16 h-12 text-center border-x-2 border-black px-2 font-bold focus:outline-none focus:ring-0"
                  />
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= record.stock}
                    className="text-black hover:bg-black hover:text-white w-12 h-12 flex items-center justify-center font-bold transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={record.stock == 0}
                  className="flex-1 bg-black text-white px-8 py-4 border-2 border-black font-bold uppercase hover:bg-yellow-400 hover:text-black hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  <ShoppingCart className="w-6 h-6" />
                  ĐẶT HÀNG NGAY
                </button>
                <Link
                  to="/cart"
                  className="px-8 py-4 border-2 border-black text-black font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center whitespace-nowrap"
                >
                  TỚI GIỎ HÀNG
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-4">
                    {/* Thêm Vào Giỏ Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={record.stock == 0 || added}
                      className="flex-1 bg-white text-black py-4 font-bold border-2 border-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
                      title="Thêm vào giỏ hàng"
                    >
                      {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                      <span className="hidden sm:inline">{added ? 'ĐÃ THÊM' : 'THÊM VÀO GIỎ'}</span>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      onClick={handleWishlistToggle}
                      className={`flex-1 py-4 font-bold border-2 transition-colors flex items-center justify-center gap-2 uppercase ${isInWishlist(record.id)
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-white text-black border-black hover:bg-gray-100'
                        }`}
                      title="Lưu yêu thích"
                    >
                      <Heart className={`w-5 h-5 shrink-0 ${isInWishlist(record.id) ? 'fill-white' : ''}`} />
                      <span className="hidden sm:inline">{isInWishlist(record.id) ? 'ĐÃ LƯU' : 'YÊU THÍCH'}</span>
                    </button>
                </div>

                {/* Youtube Button */}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(record.artist + ' ' + record.title + ' full album')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black border-2 border-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors py-4 px-6 flex items-center justify-center gap-2 uppercase font-bold text-center"
                  title="Nghe thử trên Youtube"
                >
                  <Youtube className="w-6 h-6" />
                  <span className="hidden sm:inline">NGHE THỬ</span>
                </a>
              </div>
            </div>

            {/* Thông Tin Đĩa Table */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold uppercase border-b-2 border-black pb-2 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>THÔNG TIN ĐĨA</h3>
              <table className="w-full text-left font-medium text-sm">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="py-3 text-gray-600 w-1/3">Thể Loại</td>
                    <td className="py-3">{record.genre}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-3 text-gray-600">Định Dạng</td>
                    <td className="py-3">{record.genre.includes('Vinyl') ? 'Vinyl (LP)' : record.genre.includes('Cassette') ? 'Cassette' : 'Thiết bị'}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-3 text-gray-600">Tình Trạng (Bìa/Đĩa)</td>
                    <td className="py-3 font-bold">{record.stock > 0 ? 'Brand New (SS)' : 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-3 text-gray-600">Số Lượng</td>
                    <td className="py-3">1 x {record.genre.includes('Vinyl') ? 'Vinyl' : 'Album'}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-3 text-gray-600">Năm Sản Xuất</td>
                    <td className="py-3">{record.year || 'Đang cập nhật'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tracklist */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold uppercase border-b-2 border-black pb-2 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>TRACKLIST</h3>
              <ul className="space-y-2 text-sm font-medium">
                {/* Mock Tracklist */}
                <li>1. Intro / Title Track</li>
                <li>2. Popular Song 1</li>
                <li>3. Popular Song 2</li>
                <li>4. Interlude</li>
                <li>5. Hidden Gem</li>
                <li>6. Acoustic Version</li>
                <li>7. Extended Mix</li>
                <li>8. Outro</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedRecords.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6 uppercase border-b-2 border-black pb-2" style={{ fontFamily: 'var(--font-heading)' }}>Sản phẩm cùng thể loại ({record.genre})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedRecords.map((relatedRecord) => (
                <Link
                  key={relatedRecord.id}
                  to={`/product/${relatedRecord.id}`}
                  className="bg-white border-2 border-black hover:shadow-lg transition-all group flex flex-col"
                >
                  <div className="aspect-square overflow-hidden border-b-2 border-black bg-gray-100">
                    <img
                      src={relatedRecord.image}
                      alt={relatedRecord.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold mb-1 uppercase line-clamp-1">{relatedRecord.title}</h3>
                    <p className="text-gray-600 text-sm font-bold uppercase mb-4 line-clamp-1">{relatedRecord.artist}</p>
                    <div className="mt-auto">
                      <span className="text-black font-bold text-lg">{formatPrice(relatedRecord.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-20 left-0 right-0 bg-white border-t-4 border-black z-40 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4">
          <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase">Tổng cộng</span>
              <span className="text-xl font-black text-black leading-none">{formatPrice(record.price * quantity)}</span>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={record.stock == 0}
            className="flex-1 bg-black text-white px-6 py-4 border-2 border-black font-black uppercase active-neo shadow-neo-sm disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            ĐẶT HÀNG NGAY
          </button>
      </div>
    </div>
  );
}