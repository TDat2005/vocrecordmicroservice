<?php
require_once __DIR__ . '/../models/DiscountModel.php';

class DiscountController {
    private $model;

    public function __construct($pdo) {
        $this->model = new DiscountModel($pdo);
    }

    public function getAll() {
        $data = $this->model->getAll();
        echo json_encode(['success' => true, 'data' => $data]);
    }

    public function create($data) {
        $code = $data['Code'] ?? '';
        $loai = $data['LoaiGiamGia'] ?? 'percent';
        $giaTri = $data['GiaTri'] ?? 0;
        $dk = $data['DonHangToiThieu'] ?? 0;
        $sl = $data['SoLuong'] ?? 0;
        $han = $data['NgayHetHan'] ?? null;

        if (!$code || $giaTri <= 0) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        try {
            $this->model->create($code, $loai, $giaTri, $dk, $sl, $han);
            echo json_encode(['success' => true, 'message' => 'Tạo mã thành công']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Lỗi: Thử lại hoặc Code đã tồn tại']);
        }
    }

    public function update($data) {
        $id = $data['MaGG'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Thiếu ID']);
            return;
        }

        try {
            $this->model->update($id, $data['Code'], $data['LoaiGiamGia'], $data['GiaTri'], $data['DonHangToiThieu'], $data['SoLuong'], $data['NgayHetHan']);
            echo json_encode(['success' => true, 'message' => 'Cập nhật thành công']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Lỗi cập nhật']);
        }
    }

    public function delete($data) {
        $id = $data['id'] ?? null;
        if ($id) {
            $this->model->delete($id);
            echo json_encode(['success' => true, 'message' => 'Xoá thành công']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Thiếu ID']);
        }
    }

    // Logic kiểm tra mã cho Khách hàng
    public function checkCode($data) {
        $code = $data['code'] ?? '';
        $cartTotal = $data['cartTotal'] ?? 0;

        if (!$code) {
            echo json_encode(['success' => false, 'message' => 'Vui lòng nhập mã']);
            return;
        }

        $discount = $this->model->getByCode(strtoupper($code));
        if (!$discount) {
            echo json_encode(['success' => false, 'message' => 'Mã giảm giá không tồn tại']);
            return;
        }

        // Kiem tra han su dung
        if ($discount['NgayHetHan'] && strtotime($discount['NgayHetHan']) < time()) {
            echo json_encode(['success' => false, 'message' => 'Mã đã hết hạn']);
            return;
        }

        // Kiem tra so luong
        if ($discount['DaDung'] >= $discount['SoLuong']) {
            echo json_encode(['success' => false, 'message' => 'Mã đã hết lượt sử dụng']);
            return;
        }

        // Kiem tra don hang toi thieu
        if ($cartTotal < $discount['DonHangToiThieu']) {
            echo json_encode(['success' => false, 'message' => 'Đơn hàng chưa đạt giá trị tổi thiểu ' . number_format($discount['DonHangToiThieu'], 0, ',', '.') . 'đ']);
            return;
        }

        // Tinh toan tien giam
        $moneyDiscount = 0;
        if ($discount['LoaiGiamGia'] == 'percent') {
            $moneyDiscount = $cartTotal * ($discount['GiaTri'] / 100);
            // Có thể giới hạn max giảm giá tại đây nếu có trường MaxGiam
        } else {
            $moneyDiscount = $discount['GiaTri'];
        }

        if ($moneyDiscount > $cartTotal) {
            $moneyDiscount = $cartTotal; // Khong giam qua tong tien
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'code' => $discount['Code'],
                'discountAmount' => $moneyDiscount
            ],
            'message' => 'Áp dụng thành công!'
        ]);
    }

    // Helper nội bộ để Controller khác gọi (VD: OrderController)
    public function calculateInternalDiscount($code, $cartTotal) {
        if (!$code) return 0;
        $discount = $this->model->getByCode(strtoupper($code));
        if (!$discount) return 0;
        if ($discount['NgayHetHan'] && strtotime($discount['NgayHetHan']) < time()) return 0;
        if ($discount['DaDung'] >= $discount['SoLuong']) return 0;
        if ($cartTotal < $discount['DonHangToiThieu']) return 0;

        if ($discount['LoaiGiamGia'] == 'percent') {
            return min($cartTotal, $cartTotal * ($discount['GiaTri'] / 100));
        } else {
            return min($cartTotal, $discount['GiaTri']);
        }
    }
}
?>
