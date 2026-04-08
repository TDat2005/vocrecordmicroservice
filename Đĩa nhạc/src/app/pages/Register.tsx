import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/clonevocrecord/api/auth.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: formData.phone || formData.email,
            password: formData.password,
            fullname: formData.fullName,
            email: formData.email
        })
      });
      const data = await response.json();
      setIsLoading(false);

      if (data.success) {
        alert("ĐĂNG KÝ THÀNH CÔNG! HỆ THỐNG ĐANG CHUYỂN HƯỚNG...");
        navigate('/login');
      } else {
        alert(data.message || 'Đăng ký thất bại!');
      }
    } catch (error) {
      setIsLoading(false);
      alert('Lỗi kết nối máy chủ!');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-pink-400 flex items-center justify-center py-16 px-4 font-body">
      <div className="max-w-xl w-full">
        {/* Logo/Heading */}
        <div className="text-center mb-8">
            <Link to="/" className="inline-block border-2 border-black bg-white px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-heading)' }}>VỌC RECORDS</h1>
            </Link>
            <p className="mt-4 font-bold uppercase tracking-wider">ĐĂNG KÝ THÀNH VIÊN MỚI</p>
        </div>

        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-bold mb-6 uppercase border-b-2 border-black pb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Điền Thông Tin
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-bold uppercase mb-2">Họ Tên *</label>
                  <input
                    id="fullName" type="text" required value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-pink-100 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold uppercase mb-2">SĐT *</label>
                  <input
                    id="phone" type="tel" required value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-pink-100 transition-colors"
                  />
                </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold uppercase mb-2">Đia Chỉ Email *</label>
              <input
                id="email" type="email" required value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-pink-100 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-bold uppercase mb-2">Mật khẩu *</label>
                  <input
                    id="password" type="password" required minLength={6} value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-pink-100 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold uppercase mb-2">Nhập Lại M.Khẩu *</label>
                  <input
                    id="confirmPassword" type="password" required minLength={6} value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-pink-100 transition-colors"
                  />
                </div>
            </div>

            <p className="text-xs font-bold text-gray-500 mt-4 border-2 border-dashed border-gray-300 p-2">
              LƯU Ý: DỮ LIỆU CÁ NHÂN SẼ ĐƯỢC BẢO MẬT. CHÚNG TÔI SẼ KHÔNG BAO GIỜ SPAM HOẶC BÁN DỮ LIỆU CHO BÊN THỨ 3.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white px-8 py-4 font-bold uppercase border-2 border-black hover:bg-pink-400 hover:text-black transition-colors mt-6"
            >
              {isLoading ? 'ĐANG THEO DÕI LOGIC...' : 'TẠO TÀI KHOẢN NGAY'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-black text-center">
              <p className="font-bold uppercase text-sm mb-4">Đã là thành viên?</p>
              <Link to="/login" className="inline-block w-full text-center bg-white text-black px-8 py-3 font-bold uppercase border-2 border-black hover:bg-yellow-400 transition-colors">
                  QUAY VỀ ĐĂNG NHẬP
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
