import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Tag, Calendar, User } from 'lucide-react';
import { blogPosts } from '../data/blog';

export function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 border-2 border-black max-w-md">
          <h2 className="text-2xl font-bold mb-4 uppercase">Không tìm thấy bài viết</h2>
          <Link to="/blog" className="inline-block bg-black text-white px-6 py-3 font-bold uppercase hover:bg-white hover:text-black border-2 border-black transition-colors">
            Quay lại Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-black hover:underline mb-6 font-bold uppercase px-4 py-2 border-2 border-black bg-white w-max"
        >
          <ArrowLeft className="w-5 h-5" />
          QUAY LẠI
        </button>

        <article className="bg-white border-2 border-black">
          <div className="aspect-video lg:aspect-[21/9] border-b-2 border-black relative bg-gray-200">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover mix-blend-multiply"
            />
            <div className="absolute top-4 left-4 bg-yellow-400 border-2 border-black text-black px-4 py-2 font-bold uppercase text-sm">
              {post.category}
            </div>
          </div>

          <div className="p-6 md:p-12">
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold uppercase mb-6 pb-6 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(post.date)}
              </div>
              <div className="flex items-center gap-2 border-l-2 border-black pl-4">
                <User className="w-5 h-5" />
                Tác giả: {post.author}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-8 uppercase leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {post.title}
            </h1>

            <div className="prose prose-lg max-w-none text-black font-medium leading-relaxed">
              <p className="text-xl mb-6 font-bold bg-yellow-100 p-4 border-l-4 border-black">
                {post.description}
              </p>
              <p className="mb-6">
                (Đây là nội dung mô phỏng bài viết thực tế). Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <h3 className="text-2xl font-bold mt-8 mb-4 uppercase">1. Sự trở lại mạnh mẽ</h3>
              <p className="mb-6">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <div className="p-6 bg-gray-100 border-2 border-black my-8 font-bold text-center italic text-xl uppercase">
                "Âm nhạc analog mang lại cảm xúc mà nhạc số không thể sao chép."
              </div>
              <h3 className="text-2xl font-bold mt-8 mb-4 uppercase">2. Tương lai của đĩa than</h3>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
