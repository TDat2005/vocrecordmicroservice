import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Shield, ArrowLeft } from 'lucide-react';


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

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Step 1: Gửi OTP quên mật khẩu
  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost/clonevocrecord/api/auth.php?action=send_forgot_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountInput })
      });
      const data = await response.json();
      setIsLoading(false);

      if (data.success) {
        setCurrentStep('verify-otp');
        setCountdown(60);
      } else {
        alert(data.message || 'Có lỗi xảy ra!');
      }
    } catch {
      setIsLoading(false);
      alert('Lỗi kết nối máy chủ!');
    }
  };

  // Step 2: Xác thực OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost/clonevocrecord/api/auth.php?action=verify_forgot_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountInput, otp: otp })
      });
      const data = await response.json();
      setIsLoading(false);

      if (data.success) {
        setCurrentStep('new-password');
      } else {
        alert(data.message || 'Mã OTP không đúng!');
      }
    } catch {
      setIsLoading(false);
      alert('Lỗi kết nối máy chủ!');
    }
  };

  // Step 3: Đặt mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost/clonevocrecord/api/auth.php?action=reset_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountInput, otp: otp, new_password: newPassword })
      });
      const data = await response.json();
      setIsLoading(false);

      if (data.success) {
        alert('ĐỔI MẬT KHẨU THÀNH CÔNG! ĐANG CHUYỂN HƯỚNG...');
        navigate('/login');
      } else {
        alert(data.message || 'Có lỗi xảy ra!');
      }
    } catch {
      setIsLoading(false);
      alert('Lỗi kết nối máy chủ!');
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      const response = await fetch(`http://localhost/clonevocrecord/api/auth.php?action=send_forgot_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountInput })
      });
      const data = await response.json();
      if (data.success) {
        setCountdown(60);
        alert('Đã gửi lại mã OTP!');
      }
    } catch {
      alert('Lỗi kết nối!');
    }
  };

  return (
    <div className="min-h-screen bg-orange-400 flex items-center justify-center py-16 px-4 font-body">
      <div className="max-w-md w-full">
        {/* Logo/Heading */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block border-2 border-black bg-white px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-heading)' }}>VỌC RECORDS</h1>
          </Link>
          <p className="mt-4 font-bold uppercase tracking-wider">KHÔI PHỤC MẬT KHẨU</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 border-2 border-black font-bold text-xs uppercase ${
              currentStep === 'find-account' ? 'bg-black text-white' : 'bg-green-400 text-black'
            }`}>
              {currentStep !== 'find-account' ? '✓' : '1'} Email
            </div>
            <div className="w-6 h-0.5 bg-black"></div>
            <div className={`flex items-center gap-2 px-3 py-2 border-2 border-black font-bold text-xs uppercase ${
              currentStep === 'verify-otp' ? 'bg-black text-white' : currentStep === 'new-password' ? 'bg-green-400 text-black' : 'bg-white text-gray-400'
            }`}>
              {currentStep === 'new-password' ? '✓' : '2'} OTP
            </div>
            <div className="w-6 h-0.5 bg-black"></div>
            <div className={`flex items-center gap-2 px-3 py-2 border-2 border-black font-bold text-xs uppercase ${
              currentStep === 'new-password' ? 'bg-black text-white' : 'bg-white text-gray-400'
            }`}>
              3 Mật khẩu
            </div>
          </div>
        </div>

        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Step 1: Tìm tài khoản */}
          {currentStep === 'find-account' && (
            <>
              <div className="text-center mb-6">
                <Mail className="w-16 h-16 text-black mx-auto mb-4" />
                <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                  Tìm Tài Khoản
                </h2>
                <p className="mt-2 font-bold text-sm text-gray-600">
                  NHẬP EMAIL ĐĂNG KÝ ĐỂ NHẬN MÃ XÁC THỰC OTP
                </p>
              </div>

              <form onSubmit={handleFindAccount} className="space-y-6">
                <div>
                  <label htmlFor="account" className="block text-sm font-bold uppercase mb-2">
                    Địa chỉ Email *
                  </label>
                  <input
                    id="account"
                    type="email"
                    value={accountInput}
                    onChange={(e) => setAccountInput(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-orange-100 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white px-8 py-4 font-bold uppercase border-2 border-black hover:bg-orange-400 hover:text-black transition-colors"
                >
                  {isLoading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC THỰC OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Nhập OTP */}
          {currentStep === 'verify-otp' && (
            <>
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-black mx-auto mb-4" />
                <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                  Nhập Mã OTP
                </h2>
                <p className="mt-2 font-bold text-sm text-gray-600">
                  MÃ XÁC THỰC ĐÃ GỬI ĐẾN <span className="text-orange-600 text-base">{accountInput}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-bold uppercase mb-2 text-center">
                    Nhập mã OTP (6 số)
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    required
                    maxLength={6}
                    className="w-full px-4 py-4 bg-white border-4 border-black text-center text-3xl tracking-[0.5em] font-bold outline-none focus:bg-orange-100 transition-colors"
                    autoFocus
                  />
                </div>

                <div className="text-center text-sm font-bold">
                  {countdown > 0 ? (
                    <p className="text-gray-600 uppercase">
                      Gửi lại mã sau <span className="text-orange-600 text-lg">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-orange-600 hover:text-orange-700 font-bold uppercase underline"
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>

                <p className="text-xs font-bold text-red-500 text-center border-2 border-dashed border-red-300 p-2 uppercase">
                  ⏱ Mã OTP có hiệu lực trong 5 phút. Kiểm tra cả mục Spam/Junk.
                </p>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('find-account')}
                    className="flex-1 bg-white text-black px-4 py-4 font-bold uppercase border-2 border-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1 bg-black text-white px-4 py-4 font-bold uppercase border-2 border-black hover:bg-orange-400 hover:text-black transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Đặt mật khẩu mới */}
          {currentStep === 'new-password' && (
            <>
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 text-black mx-auto mb-4" />
                <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                  Mật Khẩu Mới
                </h2>
                <p className="mt-2 font-bold text-sm text-gray-600">
                  TẠO MẬT KHẨU MỚI CHO TÀI KHOẢN CỦA BẠN
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-bold uppercase mb-2">
                    Mật khẩu mới *
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-orange-100 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold uppercase mb-2">
                    Xác nhận mật khẩu *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-orange-100 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white px-8 py-4 font-bold uppercase border-2 border-black hover:bg-orange-400 hover:text-black transition-colors mt-2"
                >
                  {isLoading ? 'ĐANG CẬP NHẬT...' : 'ĐỔI MẬT KHẨU'}
                </button>
              </form>
            </>
          )}

          {/* Link quay về đăng nhập */}
          <div className="mt-6 pt-6 border-t-2 border-black text-center">
            <Link
              to="/login"
              className="inline-block w-full text-center bg-white text-black px-8 py-3 font-bold uppercase border-2 border-black hover:bg-yellow-400 transition-colors"
            >
              ← QUAY VỀ ĐĂNG NHẬP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
