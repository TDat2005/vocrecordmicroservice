import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { API } from '../config/api';


export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginAccount, setLoginAccount] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const response = await fetch(API.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginAccount, password: loginPassword })
      });
      const data = await response.json();
      setIsLoginLoading(false);

      if (data.success) {
        if (data.token) localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin' || data.user.role === 'nhanvien') {
           navigate('/admin');
        } else {
           const returnUrl = location.state?.returnUrl || '/shop';
           navigate(returnUrl);
        }
      } else {
        alert(data.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      setIsLoginLoading(false);
      alert('Lỗi kết nối máy chủ!');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center py-16 px-4 font-body">
      <div className="max-w-md w-full">
        {/* Logo/Heading */}
        <div className="text-center mb-8">
            <Link to="/" className="inline-block border-2 border-black bg-white px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-heading)' }}>VỌC RECORDS</h1>
            </Link>
            <p className="mt-4 font-bold uppercase tracking-wider">CỔNG ĐĂNG NHẬP HỆ THỐNG</p>
        </div>

        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-bold mb-6 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
            Đăng Nhập
          </h2>
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="loginAccount" className="block text-sm font-bold uppercase mb-2">Tên tài khoản hoặc email *</label>
              <input
                id="loginAccount"
                type="text"
                value={loginAccount}
                onChange={(e) => setLoginAccount(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-yellow-100 transition-colors"
                placeholder="Nhập tên tài khoản..."
              />
            </div>
            <div>
              <label htmlFor="loginPassword" className="block text-sm font-bold uppercase mb-2">Mật khẩu *</label>
              <input
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-yellow-100 transition-colors"
                placeholder="Nhập mật khẩu..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-5 h-5 border-2 border-black accent-black cursor-pointer" />
              <label htmlFor="remember" className="text-sm font-bold uppercase cursor-pointer">Ghi nhớ mật khẩu</label>
            </div>
            <button
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-black text-white px-8 py-4 font-bold uppercase border-2 border-black hover:bg-yellow-400 hover:text-black transition-colors"
            >
              {isLoginLoading ? 'ĐANG KẾT NỐI...' : 'ĐĂNG NHẬP VÀO HỆ THỐNG'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-black text-center space-y-4">
              <p className="font-bold uppercase text-sm">Chưa có tài khoản?</p>
              <Link to="/register" className="inline-block w-full text-center bg-white text-black px-8 py-3 font-bold uppercase border-2 border-black hover:bg-blue-400 transition-colors">
                  TẠO TÀI KHOẢN MỚI
              </Link>
              <Link to="/forgot-password" className="inline-block text-xs font-bold uppercase hover:underline mt-4 text-gray-600">
                Quên mật khẩu?
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
