import { useState } from 'react';
import { Link } from 'react-router';
import { Calendar, User } from 'lucide-react';
import { blogPosts, categories } from '../data/blog';

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const filteredPosts = blogPosts.filter((post) => {
    return selectedCategory === 'Tất cả' || post.category === selectedCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 border-b-2 border-black pb-4">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
            CHUYÊN TRANG BÀI VIẾT
          </h1>
          <p className="text-black font-bold uppercase">
            Tin tức, kiến thức và câu chuyện thú vị về thế giới âm nhạc Analog
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
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

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="bg-white border-2 border-black overflow-hidden hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group flex flex-col"
            >
              <div className="aspect-video overflow-hidden border-b-2 border-black relative bg-gray-200">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                />
                <div className="absolute top-2 left-2 bg-yellow-400 border-2 border-black text-black px-3 py-1 text-xs font-bold uppercase">
                    {post.category}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-xl font-bold mb-3 uppercase line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-800 font-medium text-sm mb-4 line-clamp-3">
                  {post.description}
                </p>

                <div className="mt-auto pt-4 border-t-2 border-black flex items-center justify-between text-xs text-black font-bold uppercase">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16 border-2 border-black bg-white mt-8">
            <p className="text-black font-bold uppercase">KHÔNG CÓ BÀI VIẾT NÀO TRONG MỤC NÀY.</p>
          </div>
        )}
      </div>
    </div>
  );
}
