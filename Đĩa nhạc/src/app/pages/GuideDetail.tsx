import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Tag, Info } from 'lucide-react';
import { guides, Guide } from '../data/guides';

export function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const guide = guides.find(g => g.id === Number(id));

  if (!guide) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 border-2 border-black max-w-md">
          <h2 className="text-2xl font-bold mb-4 uppercase">Không tìm thấy hướng dẫn</h2>
          <Link to="/guides" className="inline-block bg-black text-white px-6 py-3 font-bold uppercase hover:bg-white hover:text-black border-2 border-black transition-colors">
            Quay lại Cẩm Nang
          </Link>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: Guide['difficulty']) => {
    const colors = {
      'Dễ': 'bg-green-400 text-black border-black',
      'Trung bình': 'bg-yellow-400 text-black border-black',
      'Nâng cao': 'bg-red-500 text-white border-black',
    };
    return colors[difficulty] || 'bg-white text-black border-black';
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
              src={guide.image}
              alt={guide.title}
              className="w-full h-full object-cover mix-blend-multiply"
            />
            <div className={`absolute top-4 right-4 border-2 px-4 py-2 font-bold uppercase ${getDifficultyColor(guide.difficulty)}`}>
                ĐỘ KHÓ: {guide.difficulty}
            </div>
            <div className="absolute top-4 left-4 bg-black border-2 border-black text-white px-4 py-2 font-bold uppercase text-sm">
              {guide.category}
            </div>
          </div>

          <div className="p-6 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 uppercase leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {guide.title}
            </h1>

            <div className="prose prose-lg max-w-none text-black font-medium leading-relaxed">
              <p className="text-xl mb-6 font-bold bg-gray-100 p-6 border-2 border-black flex gap-4 items-start">
                <Info className="w-8 h-8 shrink-0 mt-1" />
                {guide.description}
              </p>
              
              <h3 className="text-2xl font-bold mt-8 mb-4 border-b-2 border-black pb-2 uppercase text-black">Bước 1: Chuẩn bị dụng cụ</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Bộ chảo cọ làm sạch chuyên dụng</li>
                <li>Dung dịch vệ sinh đĩa than (được kiểm định)</li>
                <li>Khăn lau sợi Microfiber siêu mịn</li>
              </ul>

              <h3 className="text-2xl font-bold mt-8 mb-4 border-b-2 border-black pb-2 uppercase text-black">Bước 2: Tiến hành vệ sinh</h3>
              <p className="mb-6">
                Đặt đĩa than lên một mặt phẳng sạch, có lót nhung bảo vệ. Xịt một lượng vừa đủ dung dịch trải đều bề mặt. Dùng chảo cọ đưa theo chiều các rãnh đĩa từ trong ra ngoài... (Nội dung chi tiết mô phỏng).
              </p>
              
              <div className="p-6 bg-yellow-400 border-2 border-black my-8 font-bold text-black uppercase">
                <p className="mb-0">Lưu ý quan trọng: Tuyệt đối không xịt trực tiếp bất kỳ hóa chất gia dụng nào lên bề mặt đĩa than để tránh phá hủy rãnh âm thanh.</p>
              </div>

              <h3 className="text-2xl font-bold mt-8 mb-4 border-b-2 border-black pb-2 uppercase text-black">Bước 3: Bảo quản</h3>
              <p>
                Sau khi lau khô bằng khăn Microfiber, hãy cất trữ đĩa trong bao chống tĩnh điện Polyethylene rồi nhét vào bìa giấy cứng. Đặt đĩa dựng thẳng đứng tại nơi khô ráo, tránh ánh sáng mặt trời!
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
