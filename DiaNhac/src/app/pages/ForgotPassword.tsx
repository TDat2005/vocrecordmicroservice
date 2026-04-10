import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Shield, ArrowLeft, Check } from 'lucide-react';

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
      const response = await fetch('http://localhost/clonevocrecord/api/auth.php?action=send_forgot_otp', {
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
      const response = await fetch('http://localhost/clonevocrecord/api/auth.php?action=verify_forgot_otp', {
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
      const response = await fetch('http://localhost/clonevocrecord/api/auth.php?action=reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountInput, new_password: newPassword })
      });
      const data = await response.json();
      setIsLoading(false);

      if (data.success) {
        alert('Đổi mật khẩu thành công! Đang chuyển hướng...');
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
      const response = await fetch('http://localhost/clonevocrecord/api/auth.php?action=send_forgot_otp', {
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
              <span className="text-xs mt-2 text-gray-600">Nhập email</span>
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
                {currentStep === 'new-password' ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-xs mt-2 text-gray-600">Mã OTP</span>
            </div>

            <div className={`h-1 flex-1 ${
              currentStep === 'new-password' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'new-password'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                3
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
                  Nhập email đăng ký để nhận mã xác thực OTP
                </p>
              </div>

              <div>
                <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="account"
                    type="email"
                    value={accountInput}
                    onChange={(e) => setAccountInput(e.target.value)}
                    placeholder="email@example.com"
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
                {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực OTP'}
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
                  autoFocus
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

              <p className="text-xs text-red-500 text-center font-medium">
                ⏱ Mã có hiệu lực trong 5 phút. Kiểm tra cả mục Spam/Junk.
              </p>

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

          {/* Step 3: Đặt mật khẩu mới */}
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
