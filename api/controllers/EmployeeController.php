<?php
// Controller: Nhân Viên (EmployeeController)
// Xử lý các logic crud nhân viên cho Admin

require_once __DIR__ . '/../models/NhanVienModel.php';

class EmployeeController {
    private $model;
    private $pdo;

    public function __construct($pdo) {
        $this->model = new NhanVienModel($pdo);
        $this->pdo = $pdo;
    }

    public function list() {
        echo json_encode(['success' => true, 'data' => $this->model->getAll()]);
    }

    public function create($data) {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $name = $data['name'] ?? '';
        $position = $data['position'] ?? '';
        $role = $data['role'] ?? 'nhanvien';

        if (!$username || !$password || !$name) {
            echo json_encode(['success' => false, 'message' => 'Vui lòng điền đủ thông tin bắt buộc (Username, Mật khẩu, Họ tên)']);
            return;
        }

        try {
            $this->model->beginTransaction();

            // Kiem tra ton tai username
            $stmt = $this->pdo->prepare("SELECT MaTK FROM TaiKhoan WHERE TenDangNhap = ?");
            $stmt->execute([$username]);
            if ($stmt->fetch()) {
                throw new Exception("Tên đăng nhập đã tồn tại!");
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $maTK = $this->model->createAuth($username, $hashedPassword, $role);
            $this->model->createProfile($name, $position, $maTK);

            $this->model->commit();
            echo json_encode(['success' => true, 'message' => 'Thêm nhân viên thành công!']);
        } catch(Exception $e) {
            $this->model->rollBack();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function update($data) {
        $id = $data['id'] ?? 0;
        $accountId = $data['account_id'] ?? 0;
        
        $name = $data['name'] ?? '';
        $position = $data['position'] ?? '';
        $role = $data['role'] ?? 'nhanvien';
        $password = $data['password'] ?? ''; // Nối muốn đổi mk

        if (!$id || !$accountId || !$name) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        try {
            $this->model->beginTransaction();

            $this->model->updateProfile($id, $name, $position);
            $this->model->updateAuth($accountId, $role);

            if (!empty($password)) {
                 $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                 $this->model->updatePassword($accountId, $hashedPassword);
            }

            $this->model->commit();
            echo json_encode(['success' => true, 'message' => 'Cập nhật thành công!']);
        } catch(Exception $e) {
            $this->model->rollBack();
            echo json_encode(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()]);
        }
    }

    public function toggleStatus($data) {
        $accountId = $data['account_id'] ?? 0;
        $status = isset($data['status']) ? (int)$data['status'] : 1;

        if (!$accountId) {
             echo json_encode(['success' => false, 'message' => 'Thiếu ID Tài khoản']);
             return;
        }

        if ($this->model->toggleStatus($accountId, $status)) {
             echo json_encode(['success' => true, 'message' => $status == 1 ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!']);
        } else {
             echo json_encode(['success' => false, 'message' => 'Lỗi cập nhật trạng thái']);
        }
    }
}
?>
