<?php
// Controller: Xác Thực (AuthController)
// Xử lý logic đăng nhập, đăng ký, OTP email, quên mật khẩu

require_once __DIR__ . '/../models/TaiKhoanModel.php';
require_once __DIR__ . '/../models/KhachHangModel.php';
require_once __DIR__ . '/../models/OtpModel.php';
require_once __DIR__ . '/../config/EmailService.php';

class AuthController {
    private $accountModel;
    private $customerModel;
    private $otpModel;

    public function __construct($pdo) {
        $this->accountModel = new TaiKhoanModel($pdo);
        $this->customerModel = new KhachHangModel($pdo);
        $this->otpModel = new OtpModel($pdo);
    }

    /**
     * Đăng nhập bằng username/password (giữ nguyên)
     */
    public function login($data) {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->accountModel->findByUsername($username);

        if ($user && password_verify($password, $user['MatKhau'])) {
            if ($user['TrangThai'] == 0) {
                echo json_encode(['success' => false, 'message' => 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ Admin.']);
                return;
            }

            $profile = $this->customerModel->getByAccountId($user['MaTK']);

            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['MaTK'],
                    'customer_id' => $profile ? $profile['MaKH'] : null,
                    'username' => $user['TenDangNhap'],
                    'name' => $profile ? $profile['HoTen'] : '',
                    'role' => $user['VaiTro']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Sai tài khoản hoặc mật khẩu!']);
        }
    }

    /**
     * Đăng ký cũ (giữ lại để tương thích, nhưng frontend sẽ dùng flow OTP)
     */
    public function register($data) {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $fullname = $data['fullname'] ?? '';
        $email = $data['email'] ?? '';

        if (!$username || !$password) {
            echo json_encode(['success' => false, 'message' => 'Thiếu username hoặc password']);
            return;
        }

        try {
            $this->accountModel->beginTransaction();

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $maTK = $this->accountModel->create($username, $hashedPassword);
            $this->customerModel->create($fullname ? $fullname : $username, $email, $maTK);

            $this->accountModel->commit();
            echo json_encode(['success' => true, 'message' => 'Đăng ký thành công!']);
        } catch(Exception $e) {
            $this->accountModel->rollBack();
            echo json_encode(['success' => false, 'message' => 'Lỗi: User hoặc Email đã tồn tại.']);
        }
    }

    // ═══════════════════════════════════════════
    // OTP ĐĂNG KÝ (Email Verification)
    // ═══════════════════════════════════════════

    /**
     * Bước 1: Gửi OTP đăng ký về email
     * - Kiểm tra email chưa tồn tại
     * - Tạo OTP 6 số ngẫu nhiên
     * - Gửi qua EmailService
     */
    public function sendRegisterOTP($data) {
        $email = trim($data['email'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Email không hợp lệ.']);
            return;
        }

        // Kiểm tra email đã tồn tại chưa
        $existingUser = $this->accountModel->findByUsername($email);
        if ($existingUser) {
            echo json_encode(['success' => false, 'message' => 'Email này đã được đăng ký. Vui lòng đăng nhập.']);
            return;
        }

        // Tạo OTP 6 số
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Lưu DB
        $this->otpModel->create($email, $otpCode, 'dangky');

        // Gửi email
        $sent = EmailService::sendOTP($email, $otpCode, 'dangky');

        if ($sent) {
            echo json_encode(['success' => true, 'message' => 'Mã OTP đã được gửi đến email của bạn.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Không thể gửi email. Vui lòng thử lại sau.']);
        }
    }

    /**
     * Bước 2: Xác thực OTP + Tạo tài khoản
     * - Verify OTP đúng và còn hạn
     * - Tạo tài khoản + hồ sơ khách hàng
     */
    public function verifyRegisterOTP($data) {
        $email = trim($data['email'] ?? '');
        $otpCode = trim($data['otp'] ?? '');
        $password = $data['password'] ?? '';
        $fullname = $data['fullname'] ?? '';
        $phone = $data['phone'] ?? '';

        if (!$email || !$otpCode || !$password) {
            echo json_encode(['success' => false, 'message' => 'Thiếu thông tin bắt buộc.']);
            return;
        }

        // Xác thực OTP
        $validOtp = $this->otpModel->verify($email, $otpCode, 'dangky');
        if (!$validOtp) {
            echo json_encode(['success' => false, 'message' => 'Mã OTP không đúng hoặc đã hết hạn.']);
            return;
        }

        try {
            $this->accountModel->beginTransaction();

            // Đánh dấu OTP đã dùng
            $this->otpModel->markUsed($email, $otpCode);

            // Tạo tài khoản (dùng email làm username)
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $maTK = $this->accountModel->create($email, $hashedPassword);

            // Tạo hồ sơ khách hàng
            $this->customerModel->create(
                $fullname ? $fullname : $email,
                $email,
                $maTK
            );

            // Cập nhật SĐT nếu có
            if ($phone) {
                $khachHang = $this->customerModel->getByAccountId($maTK);
                if ($khachHang) {
                    $this->customerModel->updateProfile($khachHang['MaKH'], $fullname, $phone, '');
                }
            }

            $this->accountModel->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Đăng ký thành công! Chào mừng bạn đến với Vọc Records.'
            ]);
        } catch(Exception $e) {
            $this->accountModel->rollBack();
            echo json_encode(['success' => false, 'message' => 'Lỗi: Email đã tồn tại hoặc lỗi hệ thống.']);
        }
    }

    // ═══════════════════════════════════════════
    // OTP QUÊN MẬT KHẨU (Password Recovery)
    // ═══════════════════════════════════════════

    /**
     * Gửi OTP quên mật khẩu
     */
    public function sendForgotOTP($data) {
        $email = trim($data['email'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Email không hợp lệ.']);
            return;
        }

        // Kiểm tra email có tồn tại trong hệ thống
        $user = $this->accountModel->findByUsername($email);
        if (!$user) {
            // Không tiết lộ email có tồn tại hay không (bảo mật)
            echo json_encode(['success' => true, 'message' => 'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi.']);
            return;
        }

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->otpModel->create($email, $otpCode, 'quenmatkhau');

        $sent = EmailService::sendOTP($email, $otpCode, 'quenmatkhau');

        echo json_encode(['success' => true, 'message' => 'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi.']);
    }

    /**
     * Xác thực OTP quên mật khẩu (chỉ kiểm tra, chưa đánh dấu đã dùng)
     */
    public function verifyForgotOTP($data) {
        $email = trim($data['email'] ?? '');
        $otpCode = trim($data['otp'] ?? '');

        if (!$email || !$otpCode) {
            echo json_encode(['success' => false, 'message' => 'Thiếu thông tin.']);
            return;
        }

        $validOtp = $this->otpModel->verify($email, $otpCode, 'quenmatkhau');
        if (!$validOtp) {
            echo json_encode(['success' => false, 'message' => 'Mã OTP không đúng hoặc đã hết hạn.']);
            return;
        }

        // Chưa đánh dấu đã dùng - OTP sẽ được xác thực lần nữa ở bước resetPassword
        echo json_encode(['success' => true, 'message' => 'Xác thực thành công. Bạn có thể đặt mật khẩu mới.']);
    }

    /**
     * Đặt lại mật khẩu mới (yêu cầu OTP hợp lệ để đảm bảo bảo mật)
     */
    public function resetPassword($data) {
        $email = trim($data['email'] ?? '');
        $otpCode = trim($data['otp'] ?? '');
        $newPassword = $data['new_password'] ?? '';

        if (!$email || !$otpCode || !$newPassword) {
            echo json_encode(['success' => false, 'message' => 'Thiếu thông tin.']);
            return;
        }

        if (strlen($newPassword) < 6) {
            echo json_encode(['success' => false, 'message' => 'Mật khẩu phải có ít nhất 6 ký tự.']);
            return;
        }

        // Xác thực lại OTP trước khi đổi mật khẩu (bảo mật)
        $validOtp = $this->otpModel->verify($email, $otpCode, 'quenmatkhau');
        if (!$validOtp) {
            echo json_encode(['success' => false, 'message' => 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.']);
            return;
        }

        $user = $this->accountModel->findByUsername($email);
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Không tìm thấy tài khoản.']);
            return;
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $updated = $this->accountModel->updatePassword($user['MaTK'], $hashedPassword);

        if ($updated) {
            // Đánh dấu OTP đã dùng sau khi đổi mật khẩu thành công
            $this->otpModel->markUsed($email, $otpCode);
            echo json_encode(['success' => true, 'message' => 'Đổi mật khẩu thành công!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Lỗi cập nhật mật khẩu.']);
        }
    }
}
?>
