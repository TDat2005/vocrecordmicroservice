import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, ArrowLeft, Shield } from 'lucide-react';

type Step = 'info' | 'otp';

export function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Bước 1: Gửi thông tin + request OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }

    if (formData.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/clonevocrecord/api/auth.php?action=send_register_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      setIsLoading(false);

      if (data.success) {
        setCurrentStep('otp');
        setCountdown(60);
      } else {
        alert(data.message || 'Không thể gửi OTP!');
      }
    } catch (error) {
      setIsLoading(false);
      alert('Lỗi kết nối máy chủ!');
      console.error(error);
    }
  };

  // Bước 2: Xác thực OTP + Tạo tài khoản
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/clonevocrecord/api/auth.php?action=verify_register_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
          password: formData.password,
          fullname: formData.fullName,
          phone: formData.phone,
        })
      });
      const data = await response.json();
      setIsLoading(false);

      if (data.success) {
        alert("ĐĂNG KÝ THÀNH CÔNG! HỆ THỐNG ĐANG CHUYỂN HƯỚNG...");
        navigate('/login');
      } else {
        alert(data.message || 'Xác thực OTP thất bại!');
      }
    } catch (error) {
      setIsLoading(false);
      alert('Lỗi kết nối máy chủ!');
      console.error(error);
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/clonevocrecord/api/auth.php?action=send_register_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      setIsLoading(false);

      if (data.success) {
        setCountdown(60);
        alert('Đã gửi lại mã OTP!');
      } else {
        alert(data.message);
      }
    } catch {
      setIsLoading(false);
      alert('Lỗi kết nối!');
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

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-sm uppercase ${currentStep === 'info' ? 'bg-black text-white' : 'bg-green-400 text-black'}`}>
              {currentStep !== 'info' ? '✓' : '1'} Thông tin
            </div>
            <div className="w-8 h-0.5 bg-black"></div>
            <div className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-sm uppercase ${currentStep === 'otp' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>
              2 Xác thực OTP
            </div>
          </div>
        </div>

        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          
          {/* Step 1: Thông tin đăng ký */}
          {currentStep === 'info' && (
            <>
              <h2 className="text-3xl font-bold mb-6 uppercase border-b-2 border-black pb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Điền Thông Tin
              </h2>

              <form onSubmit={handleSendOTP} className="space-y-4">
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
                  <label htmlFor="email" className="block text-sm font-bold uppercase mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Địa Chỉ Email * <span className="text-xs normal-case text-gray-500">(OTP sẽ được gửi về email này)</span>
                  </label>
                  <input
                    id="email" type="email" required value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-black outline-none focus:bg-pink-100 transition-colors"
                    placeholder="example@gmail.com"
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
                  LƯU Ý: SAU KHI NHẤN TIẾP TỤC, MÃ OTP SẼ ĐƯỢC GỬI VỀ EMAIL CỦA BẠN ĐỂ XÁC THỰC.
                </p>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white px-8 py-4 font-bold uppercase border-2 border-black hover:bg-pink-400 hover:text-black transition-colors mt-6"
                >
                  {isLoading ? 'ĐANG GỬI MÃ OTP...' : 'TIẾP TỤC → NHẬN MÃ OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Nhập OTP */}
          {currentStep === 'otp' && (
            <>
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-black mx-auto mb-4" />
                <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                  Xác Thực Email
                </h2>
                <p className="mt-2 font-bold text-sm text-gray-600">
                  Mã OTP đã được gửi đến <span className="text-pink-600 text-base">{formData.email}</span>
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
                    className="w-full px-4 py-4 bg-white border-4 border-black text-center text-3xl tracking-[0.5em] font-bold outline-none focus:bg-pink-100 transition-colors"
                    autoFocus
                  />
                </div>

                <div className="text-center text-sm font-bold">
                  {countdown > 0 ? (
                    <p className="text-gray-600 uppercase">
                      Gửi lại mã sau <span className="text-pink-600 text-lg">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-pink-600 hover:text-pink-700 font-bold uppercase underline"
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
                    onClick={() => { setCurrentStep('info'); setOtp(''); }}
                    className="flex-1 bg-white text-black px-4 py-4 font-bold uppercase border-2 border-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1 bg-black text-white px-4 py-4 font-bold uppercase border-2 border-black hover:bg-pink-400 hover:text-black transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN ĐĂNG KÝ'}
                  </button>
                </div>
              </form>
            </>
          )}

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
