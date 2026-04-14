import { Link } from 'react-router';
import { Music, Disc3, Headphones, TrendingUp, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API } from '../config/api';


export function Home() {
  const [featuredRecords, setFeaturedRecords] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);

  useEffect(() => {
    fetch(API.products.list)
      .then(res => res.json())
      .then(data => {
        if(data.success && data.data) {
          setFeaturedRecords(data.data.slice(0, 4));
          setNewReleases(data.data.slice(4, 8));
        }
      })
      .catch(err => console.error("Error fetching records: ", err));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Bento Grid */}
      <section className="bg-white border-b-2 border-black">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-black bg-yellow-400 p-8 flex flex-col justify-center min-h-[400px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-60 group-hover:opacity-80 transition-opacity" style={{ backgroundImage: `url(${API.images}/Photo-New-disc.png)` }}></div>
                <div className="relative z-10">
                  <h1 className="text-5xl md:text-7xl font-bold mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>ĐĨA MỚI</h1>
                  <p className="text-xl font-bold uppercase mb-8">Trải nghiệm âm nhạc cực đỉnh với chất lượng hoàn thiện tuyệt đối.</p>
                  <Link to="/shop" className="bg-black text-white px-8 py-4 w-max font-bold uppercase text-xl flex items-center gap-2 hover:bg-white hover:text-black hover:border-2 hover:border-black transition-colors">
                      Săn Ngay <ArrowRight className="w-6 h-6" />
                  </Link>
                </div>
            </div>
            <div className="border-2 border-black bg-red-600 text-white p-8 flex flex-col justify-center min-h-[400px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-50 group-hover:opacity-70 transition-opacity" style={{ backgroundImage: `url(${API.images}/Photo-Vintage-disc.png)` }}></div>
                <div className="relative z-10">
                  <h1 className="text-5xl md:text-7xl font-bold mb-4 uppercase text-black" style={{ fontFamily: 'var(--font-heading)' }}>ĐĨA VINTAGE</h1>
                  <p className="text-xl text-black font-bold uppercase mb-8">Hơn 5000+ đĩa qua sử dụng được kiểm tra và lọc kĩ lưỡng.</p>
                  <Link to="/shop" className="bg-white text-black border-2 border-black px-8 py-4 w-max font-bold uppercase text-xl flex items-center gap-2 hover:bg-black hover:text-white transition-colors">
                      Khám Phá <ArrowRight className="w-6 h-6" />
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-white border-b-2 border-black">
        <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden">
            <img src={`${API.images}/DEMO_PROMO-1.jpg`} alt="Promo Promo Promo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
                <div className="bg-white border-4 border-black p-6 md:p-10 text-center max-w-2xl transform hover:rotate-2 transition-transform cursor-pointer shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    <h2 className="text-3xl md:text-5xl font-bold uppercase mb-4 text-black">BIG SALE MÙA HÈ ☀️</h2>
                    <p className="text-xl font-bold uppercase mb-6 text-black">Giảm đến 30% cho tất cả đĩa than Pop & Rock</p>
                    <Link to="/shop" className="bg-yellow-400 text-black border-2 border-black px-8 py-3 text-xl font-bold uppercase inline-block shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                        Mua ngay kẻo lỡ
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 border-b-2 border-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 border-2 border-black bg-yellow-400 flex items-center justify-center mb-6">
                <Disc3 className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-bold text-xl mb-2 uppercase">Chất Lượng Cao Cấp</h3>
              <p className="text-gray-800 font-medium font-body">Tuyển chọn tỉ mỉ các đĩa than trong tình trạng hoàn hảo.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 border-2 border-black bg-pink-400 flex items-center justify-center mb-6">
                <Headphones className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-bold text-xl mb-2 uppercase">Tuyển Chọn Chuyên Gia</h3>
              <p className="text-gray-800 font-medium font-body">Bởi những người am hiểu nghệ thuật đĩa than.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 border-2 border-black bg-blue-400 flex items-center justify-center mb-6">
                <Music className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-bold text-xl mb-2 uppercase">Đa Dạng Thể Loại</h3>
              <p className="text-gray-800 font-medium font-body">Từ jazz, rock đến soul và electronic - chúng tôi có tất cả.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Records */}
      <section className="py-16 bg-white border-b-2 border-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-black">
            <h2 className="text-4xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Featured Records</h2>
            <Link to="/shop" className="text-black bg-white border-2 border-black px-6 py-2 uppercase font-bold hover:bg-black hover:text-white transition-colors">
              XEM TẤT CẢ →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredRecords.map((record) => (
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
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black border-2 border-black px-2 py-1 text-xs font-bold uppercase">
                      {record.genre}
                  </div>
                </div>
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <h3 className="font-bold uppercase text-sm md:text-lg line-clamp-1 mb-1">{record.title}</h3>
                  <p className="text-gray-700 font-bold uppercase text-[10px] md:text-sm mb-2 md:mb-4 line-clamp-1">{record.artist}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-black text-sm md:text-xl font-bold">{Number(record.price).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Releases */}
      <section className="py-16 bg-gray-50 border-b-2 border-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-black">
            <div className="flex items-center gap-4">
                <div className="bg-red-600 p-2 border-2 border-black"><TrendingUp className="w-8 h-8 text-white" /></div>
                <h2 className="text-4xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>New Arrivals</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {newReleases.map((record) => (
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
                  <div className="absolute top-2 left-2 bg-black text-white border-2 border-black border-l-0 px-2 py-1 text-xs font-bold uppercase">
                      NEW
                  </div>
                </div>
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <h3 className="font-bold uppercase text-sm md:text-lg line-clamp-1 mb-1">{record.title}</h3>
                  <p className="text-gray-700 font-bold uppercase text-[10px] md:text-sm mb-2 md:mb-4 line-clamp-1">{record.artist}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-black text-sm md:text-xl font-bold">{Number(record.price).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}