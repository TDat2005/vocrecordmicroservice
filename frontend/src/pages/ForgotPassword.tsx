import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Shield, ArrowLeft } from 'lucide-react';
import { API } from '../config/api';

type Step = 'find-account' | 'verify-otp' | 'new-password';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('find-account');
  const [accountInput, setAccountInput] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => { setCountdown((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const r = await fetch(API.auth.sendForgotOTP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: accountInput }) });
      const data = await r.json(); setIsLoading(false);
      if (data.success) { setCurrentStep('verify-otp'); setCountdown(60); } else alert(data.message || 'Có lỗi xảy ra!');
    } catch { setIsLoading(false); alert('Lỗi kết nối máy chủ!'); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const r = await fetch(API.auth.verifyForgotOTP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: accountInput, otp }) });
      const data = await r.json(); setIsLoading(false);
      if (data.success) setCurrentStep('new-password'); else alert(data.message || 'Mã OTP không đúng!');
    } catch { setIsLoading(false); alert('Lỗi kết nối máy chủ!'); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { alert('Mật khẩu xác nhận không khớp!'); return; }
    if (newPassword.length < 6) { alert('Mật khẩu phải có ít nhất 6 ký tự!'); return; }
    setIsLoading(true);
    try {
      const r = await fetch(API.auth.resetPassword, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: accountInput, otp, new_password: newPassword }) });
      const data = await r.json(); setIsLoading(false);
      if (data.success) { alert('ĐỔI MẬT KHẨU THÀNH CÔNG!'); navigate('/login'); } else alert(data.message || 'Có lỗi xảy ra!');
    } catch { setIsLoading(false); alert('Lỗi kết nối máy chủ!'); }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      const r = await fetch(API.auth.sendForgotOTP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: accountInput }) });
      const data = await r.json();
      if (data.success) { setCountdown(60); alert('Đã gửi lại mã OTP!'); }
    } catch { alert('Lỗi kết nối!'); }
  };

  const getStepClass = (step: string) => {
    if (step === currentStep) return 'progress-step active';
    const steps: Step[] = ['find-account', 'verify-otp', 'new-password'];
    return steps.indexOf(step as Step) < steps.indexOf(currentStep) ? 'progress-step done' : 'progress-step pending';
  };

  return (
    <div className="auth-page auth-page-orange">
      <div className="auth-container">
        <div className="auth-logo">
          <Link to="/"><h1>VỌC RECORDS</h1></Link>
          <p>KHÔI PHỤC MẬT KHẨU</p>
        </div>

        <div className="progress-steps">
          <div className={getStepClass('find-account')}>{currentStep !== 'find-account' ? '✓' : '1'} Email</div>
          <div className="progress-line"></div>
          <div className={getStepClass('verify-otp')}>{currentStep === 'new-password' ? '✓' : '2'} OTP</div>
          <div className="progress-line"></div>
          <div className={getStepClass('new-password')}>3 Mật khẩu</div>
        </div>

        <div className="auth-box">
          {currentStep === 'find-account' && (
            <>
              <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
                <Mail style={{width:64,height:64,margin:'0 auto 1rem'}} />
                <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Tìm Tài Khoản</h2>
                <p style={{marginTop:'0.5rem',fontWeight:700,fontSize:'0.875rem',color:'#4b5563'}}>NHẬP EMAIL ĐĂNG KÝ ĐỂ NHẬN MÃ XÁC THỰC OTP</p>
              </div>
              <form onSubmit={handleFindAccount} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                <div>
                  <label htmlFor="account" className="form-label">Địa chỉ Email *</label>
                  <input id="account" type="email" value={accountInput} onChange={(e) => setAccountInput(e.target.value)} placeholder="email@example.com" required className="form-input" />
                </div>
                <button type="submit" disabled={isLoading} className="btn btn-primary btn-full">{isLoading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC THỰC OTP'}</button>
              </form>
            </>
          )}

          {currentStep === 'verify-otp' && (
            <>
              <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
                <Shield style={{width:64,height:64,margin:'0 auto 1rem'}} />
                <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Nhập Mã OTP</h2>
                <p style={{marginTop:'0.5rem',fontWeight:700,fontSize:'0.875rem',color:'#4b5563'}}>MÃ XÁC THỰC ĐÃ GỬI ĐẾN <span style={{color:'#ea580c',fontSize:'1rem'}}>{accountInput}</span></p>
              </div>
              <form onSubmit={handleVerifyOTP} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                <div>
                  <label htmlFor="otp" className="form-label" style={{textAlign:'center'}}>Nhập mã OTP (6 số)</label>
                  <input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="● ● ● ● ● ●" required maxLength={6} className="form-input" style={{textAlign:'center',fontSize:'1.875rem',letterSpacing:'0.5em',fontWeight:700,borderWidth:4}} autoFocus />
                </div>
                <div style={{textAlign:'center',fontSize:'0.875rem',fontWeight:700}}>
                  {countdown > 0 ? (<p style={{textTransform:'uppercase',color:'#4b5563'}}>Gửi lại mã sau <span style={{color:'#ea580c',fontSize:'1.125rem'}}>{countdown}s</span></p>) : (<button type="button" onClick={handleResendOTP} style={{color:'#ea580c',fontWeight:700,textTransform:'uppercase',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}>Gửi lại mã OTP</button>)}
                </div>
                <p style={{fontSize:'0.75rem',fontWeight:700,color:'#dc2626',textAlign:'center',border:'2px dashed #fca5a5',padding:'0.5rem',textTransform:'uppercase'}}>⏱ Mã OTP có hiệu lực trong 5 phút. Kiểm tra cả mục Spam/Junk.</p>
                <div style={{display:'flex',gap:'1rem'}}>
                  <button type="button" onClick={() => setCurrentStep('find-account')} className="btn btn-secondary" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}><ArrowLeft style={{width:20,height:20}} /> Quay lại</button>
                  <button type="submit" disabled={isLoading || otp.length !== 6} className="btn btn-primary" style={{flex:1}}>{isLoading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN'}</button>
                </div>
              </form>
            </>
          )}

          {currentStep === 'new-password' && (
            <>
              <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
                <Lock style={{width:64,height:64,margin:'0 auto 1rem'}} />
                <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Mật Khẩu Mới</h2>
                <p style={{marginTop:'0.5rem',fontWeight:700,fontSize:'0.875rem',color:'#4b5563'}}>TẠO MẬT KHẨU MỚI CHO TÀI KHOẢN CỦA BẠN</p>
              </div>
              <form onSubmit={handleResetPassword} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div>
                  <label htmlFor="newPassword" className="form-label">Mật khẩu mới *</label>
                  <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" required minLength={6} className="form-input" />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu *</label>
                  <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" required minLength={6} className="form-input" />
                </div>
                <button type="submit" disabled={isLoading} className="btn btn-primary btn-full" style={{marginTop:'0.5rem'}}>{isLoading ? 'ĐANG CẬP NHẬT...' : 'ĐỔI MẬT KHẨU'}</button>
              </form>
            </>
          )}

          <div className="auth-divider">
            <Link to="/login" className="btn btn-secondary btn-full" style={{background:'#fff'}}>← QUAY VỀ ĐĂNG NHẬP</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
