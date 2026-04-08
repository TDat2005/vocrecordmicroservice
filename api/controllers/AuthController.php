<?php
// Controller: Xác Thực (AuthController)
// Xử lý logic đăng nhập, đăng ký

require_once __DIR__ . '/../models/TaiKhoanModel.php';
require_once __DIR__ . '/../models/KhachHangModel.php';

class AuthController {
    private $accountModel;
    private $customerModel;

    public function __construct($pdo) {
        $this->accountModel = new TaiKhoanModel($pdo);
        $this->customerModel = new KhachHangModel($pdo);
    }

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
}
?>
