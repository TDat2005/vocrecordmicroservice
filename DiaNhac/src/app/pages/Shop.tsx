import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Filter, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { API_BASE } from '../config/api';

const genres = [
  "Tất cả", "Đĩa Than (Vinyl)", "Cassette", "Máy Quay Đĩa (Turntable)", "Phụ Kiện",
  "ROCK", "ELECTRONIC", "POP", "JAZZ", "BLUES", "REGGAE", "LATIN", "CLASSICAL", 
  "SOUNDTRACK", "HIP HOP", "FUNK / SOUL", "FOLK", "WORLD", "CHILDREN'S", "CITY POP", 
  "STAGE & SCREEN", "VIỆT NAM", "CHRISTMAS", "SMOOTH JAZZ", "CLASSIC ROCK", 
  "BRASS & MILITARY", "JAPANESE JAZZ", "VOCAL JAZZ"
];

export function Shop() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleQuickAddCart = (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (record.stock <= 0) return;
    addToCart({ id: record.id, title: record.title, artist: record.artist, price: record.price, image: record.image });
  };

  const handleQuickWishlist = (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    const userStr = localStorage.getItem('user');
    if (!userStr) { alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích!'); return; }
    const user = JSON.parse(userStr);
    const customerId = user.customer_id;
    if (!customerId) return;

    if (isInWishlist(record.id)) {
      fetch(`${API_BASE}/wishlist.php?action=remove`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ customer_id: customerId, product_id: record.id })
      }).then(r => r.json()).then(d => { if (d.success) removeFromWishlist(record.id); });
    } else {
      fetch(`${API_BASE}/wishlist.php?action=add`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ customer_id: customerId, product_id: record.id })
      }).then(r => r.json()).then(d => {
        if (d.success) addToWishlist({ id: record.id, title: record.title, artist: record.artist, price: record.price, image: record.image, genre: record.genre, year: record.year });
        else alert(d.message);
      });
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/products.php?action=list`)
      .then(res => res.json())
      .then(data => {
        if(data.success && data.data) {
          setRecords(data.data);
        }
      })
      .catch(err => console.error("Error fetching records: ", err));
  }, []);

  const filteredRecords = records
    .filter((record) => {
      const matchesGenre = selectedGenre === 'Tất cả' || record.genre === selectedGenre;
      const matchesSearch = searchQuery === '' || 
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.artist && record.artist.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesGenre && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'year':
          return b.year - a.year;
        case 'name':
        default:
          return a.title.localeCompare(b.title);
      }
    });

  useEffect(() => {
    if (searchQuery) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchQuery]);

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 border-b-4 border-black pb-4">
          <h1 className="text-5xl font-bold mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>CỬA HÀNG</h1>
          {searchQuery && (
            <p className="text-black font-bold uppercase">
              Kết quả tìm kiếm cho: "{searchQuery}" ({filteredRecords.length} đĩa than)
            </p>
          )}
          {!searchQuery && (
            <p className="text-black font-bold uppercase">
              Khám phá bộ sưu tập đầy đủ với {records.length} sản phẩm
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center justify-between font-bold uppercase mb-4 w-full bg-black text-white px-4 py-2 border-2 border-black"
              >
                <span className="flex items-center gap-2"><Filter className="w-5 h-5" /> BỘ LỌC</span>
                <span>{showFilters ? '-' : '+'}</span>
              </button>

              <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Genre Filter */}
                <div className="mb-8">
                  <h3 className="font-bold uppercase border-b-2 border-black pb-2 mb-4">THỂ LOẠI</h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {genres.map((genre) => (
                      <label key={genre} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="genre"
                          checked={selectedGenre === genre}
                          onChange={() => setSelectedGenre(genre)}
                          className="w-5 h-5 accent-black cursor-pointer border-2 border-black"
                        />
                        <span className="font-bold uppercase text-sm group-hover:underline">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="font-bold uppercase border-b-2 border-black pb-2 mb-4">SẮP XẾP THEO</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border-2 border-black bg-gray-50 focus:outline-none focus:ring-0 font-bold uppercase text-sm cursor-pointer"
                  >
                    <option value="name">Tên (A-Z)</option>
                    <option value="price-low">Giá (Thấp đến Cao)</option>
                    <option value="price-high">Giá (Cao đến Thấp)</option>
                    <option value="year">Năm (Mới nhất)</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16 border-2 border-black bg-white">
                <p className="text-black font-bold uppercase">Không tìm thấy sản phẩm phù hợp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredRecords.map((record) => (
                  <Link
                    key={record.id}
                    to={`/product/${record.id}`}
                    className="bg-white border-2 border-black overflow-hidden hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group flex flex-col"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 border-b-2 border-black relative">
                      <img
                        src={record.image}
                        alt={record.title}
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black px-2 py-1 text-[10px] md:text-xs font-bold uppercase">
                        {record.genre}
                      </div>
                      {/* Quick Action Buttons - Hidden on touch devices/small screens to reduce clutter */}
                      <div className="hidden md:flex absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={(e) => handleQuickWishlist(e, record)}
                          className={`p-2 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors ${
                            isInWishlist(record.id) ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-red-500 hover:text-white'
                          }`}
                          title="Yêu thích"
                        >
                          <Heart className="w-5 h-5" fill={isInWishlist(record.id) ? 'currentColor' : 'none'} />
                        </button>
                        {record.stock > 0 && (
                          <button
                            onClick={(e) => handleQuickAddCart(e, record)}
                            className="p-2 bg-black text-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-colors"
                            title="Thêm vào giỏ hàng"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                      <h3 className="font-bold uppercase text-sm md:text-lg line-clamp-1 mb-1">{record.title}</h3>
                      <p className="text-gray-700 font-bold uppercase text-[10px] md:text-sm mb-2 md:mb-4 line-clamp-1">{record.artist}</p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-black font-bold text-sm md:text-xl">{formatPrice(record.price)}</span>
                          <span className="hidden md:block text-xs text-black border-2 border-black px-2 py-1 font-bold">{record.year}</span>
                        </div>
                        <div className="mt-1 md:mt-2 h-6 md:h-8">
                          {record.stock > 0 ? (
                            <span className="bg-green-400 border-2 border-black px-1.5 py-0.5 text-[9px] md:text-xs font-bold uppercase text-black inline-block">Còn hàng</span>
                          ) : (
                            <span className="bg-red-600 border-2 border-black px-1.5 py-0.5 text-[9px] md:text-xs font-bold uppercase text-white inline-block">Hết hàng</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}