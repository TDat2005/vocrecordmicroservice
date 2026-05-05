import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, ArrowLeft, Shield } from 'lucide-react';
import { API } from '../config/api';


type Step = 'info' | 'otp';

export function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => { setCountdown((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { alert('Mật khẩu xác nhận không khớp!'); return; }
    if (formData.password.length < 6) { alert('Mật khẩu phải có ít nhất 6 ký tự!'); return; }
    setIsLoading(true);
    try {
      const response = await fetch(API.auth.sendRegisterOTP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
      const data = await response.json();
      setIsLoading(false);
      if (data.success) { setCurrentStep('otp'); setCountdown(60); } else { alert(data.message || 'Không thể gửi OTP!'); }
    } catch (error) { setIsLoading(false); alert('Lỗi kết nối máy chủ!'); console.error(error); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(API.auth.verifyRegisterOTP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, otp, password: formData.password, fullname: formData.fullName, phone: formData.phone }) });
      const data = await response.json();
      setIsLoading(false);
      if (data.success) { alert("ĐĂNG KÝ THÀNH CÔNG!"); navigate('/login'); } else { alert(data.message || 'Xác thực OTP thất bại!'); }
    } catch (error) { setIsLoading(false); alert('Lỗi kết nối máy chủ!'); console.error(error); }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      const response = await fetch(API.auth.sendRegisterOTP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
      const data = await response.json();
      setIsLoading(false);
      if (data.success) { setCountdown(60); alert('Đã gửi lại mã OTP!'); } else { alert(data.message); }
    } catch { setIsLoading(false); alert('Lỗi kết nối!'); }
  };

  return (
    <div className="auth-page auth-page-pink">
      <div className="auth-container auth-container-lg">
        <div className="auth-logo">
          <Link to="/"><h1>VỌC RECORDS</h1></Link>
          <p>ĐĂNG KÝ THÀNH VIÊN MỚI</p>
        </div>

        <div className="progress-steps">
          <div className={`progress-step ${currentStep === 'info' ? 'active' : 'done'}`}>{currentStep !== 'info' ? '✓' : '1'} Thông tin</div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep === 'otp' ? 'active' : 'pending'}`}>2 Xác thực OTP</div>
        </div>

        <div className="auth-box">
          {currentStep === 'info' && (
            <>
              <h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'1rem',fontFamily:'var(--font-heading)'}}>Điền Thông Tin</h2>
              <form onSubmit={handleSendOTP} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div className="grid-2">
                  <div>
                    <label htmlFor="fullName" className="form-label">Họ Tên *</label>
                    <input id="fullName" type="text" required value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="form-label">SĐT *</label>
                    <input id="phone" type="tel" required value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="form-input" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="form-label"><Mail style={{width:16,height:16,display:'inline',marginRight:4}} />Địa Chỉ Email * <span style={{fontSize:'0.75rem',textTransform:'none',color:'#6b7280'}}>(OTP sẽ được gửi về email này)</span></label>
                  <input id="email" type="email" required value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="form-input" placeholder="example@gmail.com" />
                </div>
                <div className="grid-2">
                  <div>
                    <label htmlFor="password" className="form-label">Mật khẩu *</label>
                    <input id="password" type="password" required minLength={6} value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">Nhập Lại M.Khẩu *</label>
                    <input id="confirmPassword" type="password" required minLength={6} value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className="form-input" />
                  </div>
                </div>
                <p style={{fontSize:'0.75rem',fontWeight:700,color:'#6b7280',border:'2px dashed #d1d5db',padding:'0.5rem'}}>LƯU Ý: SAU KHI NHẤN TIẾP TỤC, MÃ OTP SẼ ĐƯỢC GỬI VỀ EMAIL CỦA BẠN ĐỂ XÁC THỰC.</p>
                <button type="submit" disabled={isLoading} className="btn btn-primary btn-full">{isLoading ? 'ĐANG GỬI MÃ OTP...' : 'TIẾP TỤC → NHẬN MÃ OTP'}</button>
              </form>
            </>
          )}

          {currentStep === 'otp' && (
            <>
              <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
                <Shield style={{width:64,height:64,margin:'0 auto 1rem'}} />
                <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Xác Thực Email</h2>
                <p style={{marginTop:'0.5rem',fontWeight:700,fontSize:'0.875rem',color:'#4b5563'}}>Mã OTP đã được gửi đến <span style={{color:'#db2777',fontSize:'1rem'}}>{formData.email}</span></p>
              </div>
              <form onSubmit={handleVerifyOTP} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                <div>
                  <label htmlFor="otp" className="form-label" style={{textAlign:'center'}}>Nhập mã OTP (6 số)</label>
                  <input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="● ● ● ● ● ●" required maxLength={6} className="form-input" style={{textAlign:'center',fontSize:'1.875rem',letterSpacing:'0.5em',fontWeight:700,borderWidth:4}} autoFocus />
                </div>
                <div style={{textAlign:'center',fontSize:'0.875rem',fontWeight:700}}>
                  {countdown > 0 ? (<p style={{textTransform:'uppercase',color:'#4b5563'}}>Gửi lại mã sau <span style={{color:'#db2777',fontSize:'1.125rem'}}>{countdown}s</span></p>) : (<button type="button" onClick={handleResendOTP} disabled={isLoading} style={{color:'#db2777',fontWeight:700,textTransform:'uppercase',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}>Gửi lại mã OTP</button>)}
                </div>
                <p style={{fontSize:'0.75rem',fontWeight:700,color:'#dc2626',textAlign:'center',border:'2px dashed #fca5a5',padding:'0.5rem',textTransform:'uppercase'}}>⏱ Mã OTP có hiệu lực trong 5 phút. Kiểm tra cả mục Spam/Junk.</p>
                <div style={{display:'flex',gap:'1rem'}}>
                  <button type="button" onClick={() => { setCurrentStep('info'); setOtp(''); }} className="btn btn-secondary" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}><ArrowLeft style={{width:20,height:20}} /> Quay lại</button>
                  <button type="submit" disabled={isLoading || otp.length !== 6} className="btn btn-primary" style={{flex:1}}>{isLoading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN ĐĂNG KÝ'}</button>
                </div>
              </form>
            </>
          )}

          <div className="auth-divider">
            <p style={{fontWeight:700,textTransform:'uppercase',fontSize:'0.875rem',marginBottom:'1rem'}}>Đã là thành viên?</p>
            <Link to="/login" className="btn btn-secondary btn-full" style={{background:'#fff'}}>QUAY VỀ ĐĂNG NHẬP</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
