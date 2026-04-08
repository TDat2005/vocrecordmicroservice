<?php
// Controller: Blog (BlogController)
// Xử lý logic bài viết, hướng dẫn

require_once __DIR__ . '/../models/BaiVietModel.php';

class BlogController {
    private $model;
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->model = new BaiVietModel($pdo);
    }

    public function list() {
        $type = $_GET['type'] ?? null;
        $status = $_GET['status'] ?? 'daxuatban';
        $limit = $_GET['limit'] ?? 50;
        echo json_encode(['success' => true, 'data' => $this->model->getAll($type, $status, $limit)]);
    }

    public function detail() {
        $id = $_GET['id'] ?? 0;
        $post = $this->model->getById($id);
        if ($post) {
            echo json_encode(['success' => true, 'data' => $post]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Không tìm thấy bài viết']);
        }
    }

    public function create($data) {
        $title = $data['title'] ?? '';
        $content = $data['content'] ?? '';
        $type = $data['type'] ?? 'blog';
        $image = $data['image'] ?? '';
        $status = $data['status'] ?? 'nhap';
        $accountId = $data['account_id'] ?? null;

        if (empty($title) || empty($content)) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        $id = $this->model->create($title, $content, $type, $image, $status, $accountId);
        if ($id) {
            $this->logActivity($accountId, 'ThemBaiViet', "Thêm bài viết mới: '$title'");
            echo json_encode(['success' => true, 'message' => 'Thêm bài viết thành công!', 'id' => $id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Lỗi khi thêm bài viết']);
        }
    }

    public function update($data) {
        $id = $data['id'] ?? 0;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID không hợp lệ']);
            return;
        }

        $title = $data['title'] ?? '';
        $content = $data['content'] ?? '';
        $type = $data['type'] ?? 'blog';
        $image = $data['image'] ?? '';
        $status = $data['status'] ?? 'nhap';
        $accountId = $data['account_id'] ?? null;

        if ($this->model->update($id, $title, $content, $type, $image, $status)) {
            $this->logActivity($accountId, 'SuaBaiViet', "Sửa bài viết ID: $id");
            echo json_encode(['success' => true, 'message' => 'Cập nhật bài viết thành công!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Lỗi cập nhật']);
        }
    }

    public function delete($data) {
        $id = $data['id'] ?? 0;
        $accountId = $data['account_id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID không hợp lệ']);
            return;
        }

        if ($this->model->delete($id)) {
            $this->logActivity($accountId, 'XoaBaiViet', "Xóa bài viết ID: $id");
            echo json_encode(['success' => true, 'message' => 'Đã xóa bài viết']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Lỗi khi xóa']);
        }
    }

    private function logActivity($accountId, $action, $content) {
        if ($accountId) {
            $stmt = $this->pdo->prepare("INSERT INTO NhatKyHoatDong (MaTK, HanhDong, NoiDung) VALUES (?, ?, ?)");
            $stmt->execute([$accountId, $action, $content]);
        }
    }
}
?>
