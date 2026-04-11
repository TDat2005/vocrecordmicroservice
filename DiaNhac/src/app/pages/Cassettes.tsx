import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Filter } from 'lucide-react';


export function Cassettes() {
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const categoryName = 'Cassette';

  useEffect(() => {
    fetch(`http://localhost/clonevocrecord/api/products.php?action=list`)
      .then(res => res.json())
      .then(data => {
        if(data.success && data.data) {
          const filtered = data.data.filter((r:any) => r.genre === categoryName);
          setRecords(filtered);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const filteredRecords = [...records].sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'year': return b.year - a.year;
        case 'name':
        default: return a.title.localeCompare(b.title);
      }
  });

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white border-b-2 border-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl lg:text-7xl font-bold mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
            BĂNG CASSETTE
          </h1>
          <p className="text-xl lg:text-2xl font-bold max-w-2xl uppercase">
            Cảm giác lo-fi ấm áp không thể lẫn lộn của băng từ, một trải nghiệm thuần analog.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
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

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
              <p className="text-black font-bold uppercase">
                HIỂN THỊ <span className="text-xl bg-yellow-400 border-2 border-black px-2 py-1">{filteredRecords.length}</span> SẢN PHẨM
              </p>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="text-center py-16 border-2 border-black bg-white">
                <p className="text-black font-bold uppercase">Chưa có sản phẩm Băng Cassette nào.</p>
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
                      <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black px-2 py-1 text-xs font-bold uppercase">
                        {record.genre}
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
          </main>
        </div>
      </div>
    </div>
  );
}
