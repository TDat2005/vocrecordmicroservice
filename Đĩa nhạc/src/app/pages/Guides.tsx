import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen } from 'lucide-react';
import { guides, guideCategories, Guide } from '../data/guides';

export function Guides() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const filteredGuides = guides.filter((guide) => {
    return selectedCategory === 'Tất cả' || guide.category === selectedCategory;
  });

  const getDifficultyColor = (difficulty: Guide['difficulty']) => {
    const colors = {
      'Dễ': 'bg-green-400 text-black border-black',
      'Trung bình': 'bg-yellow-400 text-black border-black',
      'Nâng cao': 'bg-red-500 text-white border-black',
    };
    return colors[difficulty] || 'bg-white text-black border-black';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 border-b-2 border-black pb-4">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
            HƯỚNG DẪN
          </h1>
          <p className="text-black font-bold uppercase">
            Tất cả những gì bạn cần biết để bắt đầu và nâng cao kiến thức về vinyl
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {guideCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 font-bold uppercase border-2 transition-colors ${
                selectedCategory === category
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide) => (
            <Link
              key={guide.id}
              to={`/guide/${guide.id}`}
              className="bg-white border-2 border-black overflow-hidden hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group flex flex-col"
            >
              <div className="aspect-video overflow-hidden border-b-2 border-black relative bg-gray-200">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                />
                {/* Difficulty Badge */}
                <div className={`absolute top-2 right-2 border-2 px-3 py-1 text-xs font-bold uppercase ${getDifficultyColor(guide.difficulty)}`}>
                  {guide.difficulty}
                </div>
                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-black text-white border-2 border-black px-3 py-1 text-xs font-bold uppercase">
                  {guide.category}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                {/* Title */}
                <h2 className="text-xl font-bold mb-3 uppercase line-clamp-2">
                  {guide.title}
                </h2>

                {/* Description */}
                <p className="text-gray-800 font-medium text-sm mb-4 line-clamp-3">
                  {guide.description}
                </p>

                {/* Read More */}
                <div className="mt-auto pt-4 border-t-2 border-black flex items-center justify-between font-bold uppercase text-black text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Đọc Bài Viết
                  </div>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-16 border-2 border-black bg-white mt-8">
            <p className="text-black font-bold uppercase">KHÔNG TÌM THẤY HƯỚNG DẪN NÀO.</p>
          </div>
        )}
      </div>
    </div>
  );
}
