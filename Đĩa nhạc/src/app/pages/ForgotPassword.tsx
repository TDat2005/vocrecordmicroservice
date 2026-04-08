import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Phone, Lock, Shield, ArrowLeft, Check } from 'lucide-react';

type Step = 'find-account' | 'verify-otp' | 'verify-captcha' | 'new-password';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('find-account');
  const [accountInput, setAccountInput] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Tạo captcha ngẫu nhiên
  const [captchaCode] = useState(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  });

  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Giả lập gửi OTP
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('verify-otp');
      setCountdown(60); // Bắt đầu đếm ngược 60 giây

      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Giả lập xác thực OTP
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('verify-captcha');
    }, 1000);
  };

  const handleVerifyCaptcha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      alert('Mã captcha không đúng!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('new-password');
    }, 500);
  };

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

    // Giả lập đổi mật khẩu
    setTimeout(() => {
      setIsLoading(false);
      alert('Đổi mật khẩu thành công!');
      navigate('/login');
    }, 1000);
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo và tiêu đề */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Vọc Records
            </h1>
          </Link>
          <p className="text-gray-600 mt-2">Khôi phục mật khẩu</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'find-account' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {currentStep !== 'find-account' ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="text-xs mt-2 text-gray-600">Tìm tài khoản</span>
            </div>

            <div className={`h-1 flex-1 ${
              currentStep !== 'find-account' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'find-account' 
                  ? 'bg-gray-300 text-gray-600'
                  : currentStep === 'verify-otp'
                  ? 'bg-purple-600 text-white'
                  : 'bg-green-500 text-white'
              }`}>
                {currentStep !== 'find-account' && currentStep !== 'verify-otp' ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-xs mt-2 text-gray-600">Mã OTP</span>
            </div>

            <div className={`h-1 flex-1 ${
              currentStep === 'verify-captcha' || currentStep === 'new-password' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'find-account' || currentStep === 'verify-otp'
                  ? 'bg-gray-300 text-gray-600'
                  : currentStep === 'verify-captcha'
                  ? 'bg-purple-600 text-white'
                  : 'bg-green-500 text-white'
              }`}>
                {currentStep === 'new-password' ? <Check className="w-5 h-5" /> : '3'}
              </div>
              <span className="text-xs mt-2 text-gray-600">Captcha</span>
            </div>

            <div className={`h-1 flex-1 ${
              currentStep === 'new-password' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>

            {/* Step 4 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'new-password'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                4
              </div>
              <span className="text-xs mt-2 text-gray-600">Mật khẩu mới</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Tìm tài khoản */}
          {currentStep === 'find-account' && (
            <form onSubmit={handleFindAccount} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tìm tài khoản của bạn</h2>
                <p className="text-gray-600 text-sm">
                  Nhập email hoặc số điện thoại để nhận mã xác thực
                </p>
              </div>

              <div>
                <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                  Email hoặc số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="account"
                    type="text"
                    value={accountInput}
                    onChange={(e) => setAccountInput(e.target.value)}
                    placeholder="email@example.com hoặc 0912345678"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
            </form>
          )}

          {/* Step 2: Nhập OTP */}
          {currentStep === 'verify-otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Nhập mã OTP</h2>
                <p className="text-gray-600 text-sm">
                  Mã xác thực đã được gửi đến <span className="font-semibold">{accountInput}</span>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Mã OTP (6 số)
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="text-center text-sm">
                {countdown > 0 ? (
                  <p className="text-gray-600">
                    Gửi lại mã sau <span className="font-semibold text-purple-600">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('find-account')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 inline mr-2" />
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Xác nhận Captcha */}
          {currentStep === 'verify-captcha' && (
            <form onSubmit={handleVerifyCaptcha} className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận bảo mật</h2>
                <p className="text-gray-600 text-sm">
                  Vui lòng nhập mã captcha để tiếp tục
                </p>
              </div>

              {/* Captcha Display */}
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 text-center">
                <div className="bg-white inline-block px-8 py-4 rounded border-2 border-dashed border-gray-400">
                  <span 
                    className="text-3xl font-bold tracking-wider select-none"
                    style={{ 
                      fontFamily: 'monospace',
                      textDecoration: 'line-through',
                      textDecorationStyle: 'wavy',
                      textDecorationColor: '#9333ea'
                    }}
                  >
                    {captchaCode}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-3">Không phân biệt chữ hoa/thường</p>
              </div>

              <div>
                <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập mã captcha
                </label>
                <input
                  id="captcha"
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Nhập mã hiển thị ở trên"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('verify-otp')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 inline mr-2" />
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Đặt mật khẩu mới */}
          {currentStep === 'new-password' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-6">
                <Lock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt mật khẩu mới</h2>
                <p className="text-gray-600 text-sm">
                  Tạo mật khẩu mới cho tài khoản của bạn
                </p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}

          {/* Link quay về đăng nhập */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
