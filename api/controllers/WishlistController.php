<?php
// Controller: Wishlist (WishlistController)
// Xử lý logic yêu thích sản phẩm

require_once __DIR__ . '/../models/YeuThichModel.php';

class WishlistController {
    private $model;

    public function __construct($pdo) {
        $this->model = new YeuThichModel($pdo);
    }

    public function list() {
        $customerId = $_GET['customer_id'] ?? null;
        if (!$customerId) {
            echo json_encode(['success' => false, 'message' => 'Thiếu mã khách hàng']);
            return;
        }
        echo json_encode(['success' => true, 'data' => $this->model->getByCustomer($customerId)]);
    }

    public function add($data) {
        $customerId = $data['customer_id'] ?? null;
        $productId = $data['product_id'] ?? null;

        if (!$customerId || !$productId) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không đầy đủ.']);
            return;
        }

        try {
            if ($this->model->exists($customerId, $productId)) {
                echo json_encode(['success' => false, 'message' => 'Sản phẩm đã có trong danh sách!']);
                return;
            }
            $id = $this->model->add($customerId, $productId);
            echo json_encode(['success' => true, 'message' => 'Đã thêm vào danh sách yêu thích', 'wishlist_id' => $id]);
        } catch(Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()]);
        }
    }

    public function remove($data) {
        $customerId = $data['customer_id'] ?? null;
        $productId = $data['product_id'] ?? null;

        if (!$customerId || !$productId) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không đầy đủ.']);
            return;
        }

        try {
            $this->model->remove($customerId, $productId);
            echo json_encode(['success' => true, 'message' => 'Đã xóa khỏi danh sách yêu thích']);
        } catch(Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()]);
        }
    }
}
?>
