<?php
// Controller: Tài Khoản Khách Hàng (AccountController)
// Xử lý logic xem/cập nhật profile khách hàng

require_once __DIR__ . '/../models/KhachHangModel.php';

class AccountController {
    private $model;

    public function __construct($pdo) {
        $this->model = new KhachHangModel($pdo);
    }

    public function getProfile() {
        $customerId = $_GET['customer_id'] ?? null;
        if (!$customerId) {
            echo json_encode(['success' => false, 'message' => 'Thiếu mã khách hàng']);
            return;
        }

        $profile = $this->model->getProfile($customerId);
        if ($profile) {
            echo json_encode(['success' => true, 'data' => [
                'fullName' => $profile['HoTen'],
                'email' => $profile['Email'],
                'phone' => $profile['SoDienThoai'],
                'address' => $profile['DiaChi']
            ]]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Không tìm thấy khách hàng']);
        }
    }

    public function updateProfile($data) {
        $customerId = $data['customer_id'] ?? null;
        $fullName = $data['fullName'] ?? '';
        $phone = $data['phone'] ?? '';
        $address = $data['address'] ?? '';

        if (!$customerId) {
            echo json_encode(['success' => false, 'message' => 'Thiếu ID khách hàng.']);
            return;
        }

        try {
            $this->model->updateProfile($customerId, $fullName, $phone, $address);
            echo json_encode(['success' => true, 'message' => 'Cập nhật thông tin thành công']);
        } catch(Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Lỗi cập nhật: ' . $e->getMessage()]);
        }
    }

    public function getAddresses() {
        $customerId = $_GET['customer_id'] ?? null;
        if (!$customerId) {
            echo json_encode(['success' => false, 'message' => 'Thiếu mã khách hàng']);
            return;
        }
        $addresses = $this->model->getAddresses($customerId);
        echo json_encode(['success' => true, 'data' => $addresses]);
    }
}
?>
