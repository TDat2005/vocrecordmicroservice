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
    <div className="auth-page auth-page-yellow">
      <div className="auth-container">
        <div className="auth-logo">
          <Link to="/"><h1>VỌC RECORDS</h1></Link>
          <p>CỔNG ĐĂNG NHẬP HỆ THỐNG</p>
        </div>
        <div className="auth-box">
          <h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Đăng Nhập</h2>
          <form onSubmit={handleLoginSubmit} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <div>
              <label htmlFor="loginAccount" className="form-label">Tên tài khoản hoặc email *</label>
              <input id="loginAccount" type="text" value={loginAccount} onChange={(e) => setLoginAccount(e.target.value)} required className="form-input" placeholder="Nhập tên tài khoản..." />
            </div>
            <div>
              <label htmlFor="loginPassword" className="form-label">Mật khẩu *</label>
              <input id="loginPassword" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="form-input" placeholder="Nhập mật khẩu..." />
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <input type="checkbox" id="remember" style={{width:20,height:20,accentColor:'#000',cursor:'pointer'}} />
              <label htmlFor="remember" style={{fontSize:'0.875rem',fontWeight:700,textTransform:'uppercase',cursor:'pointer'}}>Ghi nhớ mật khẩu</label>
            </div>
            <button type="submit" disabled={isLoginLoading} className="btn btn-primary btn-full">
              {isLoginLoading ? 'ĐANG KẾT NỐI...' : 'ĐĂNG NHẬP VÀO HỆ THỐNG'}
            </button>
          </form>
          <div className="auth-divider" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <p style={{fontWeight:700,textTransform:'uppercase',fontSize:'0.875rem'}}>Chưa có tài khoản?</p>
            <Link to="/register" className="btn btn-secondary btn-full" style={{background:'#fff'}}>TẠO TÀI KHOẢN MỚI</Link>
            <Link to="/forgot-password" style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',color:'#4b5563'}}>Quên mật khẩu?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
