<?php
// Controller: Sản Phẩm (ProductController)
// Xử lý logic nghiệp vụ, gọi Model, trả JSON response

require_once __DIR__ . '/../models/SanPhamModel.php';

class ProductController {
    private $model;

    public function __construct($pdo) {
        $this->model = new SanPhamModel($pdo);
    }

    public function list() {
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;
        $products = $this->model->getAll($category, $search);
        echo json_encode(['success' => true, 'data' => $products]);
    }

    public function detail() {
        $id = $_GET['id'] ?? 0;
        $product = $this->model->getById($id);
        if ($product) {
            echo json_encode(['success' => true, 'data' => $product]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Không tìm thấy sản phẩm']);
        }
    }

    public function categories() {
        echo json_encode(['success' => true, 'data' => $this->model->getCategories()]);
    }

    public function create($data) {
        $title = $data['title'] ?? '';
        $artist = $data['artist'] ?? '';
        $genre = $data['genre'] ?? '';
        $price = $data['price'] ?? 0;
        $stock = $data['stock'] ?? 0;
        $desc = $data['description'] ?? '';
        $image = $data['image'] ?? 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80';
        $year = $data['year'] ?? 2024;
        $status = $data['status'] ?? 'conhang';

        // Tìm MaDM từ tên Genre
        $maDM = 1;
        $dm = $this->model->getDanhMucByName($genre);
        if ($dm) $maDM = $dm['MaDM'];

        $id = $this->model->create($title, $artist, $genre, $price, $stock, $desc, $image, $year, $status, $maDM);
        echo json_encode(['success' => true, 'message' => 'Thêm sản phẩm thành công', 'id' => $id]);
    }

    public function update($data) {
        $id = $data['id'] ?? 0;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID không hợp lệ']);
            return;
        }

        $title = $data['title'] ?? '';
        $artist = $data['artist'] ?? '';
        $genre = $data['genre'] ?? '';
        $price = $data['price'] ?? 0;
        $stock = $data['stock'] ?? 0;
        $desc = $data['description'] ?? '';
        $image = $data['image'] ?? '';
        $year = $data['year'] ?? 2024;
        $status = $data['status'] ?? 'conhang';

        $maDM = 1;
        $dm = $this->model->getDanhMucByName($genre);
        if ($dm) $maDM = $dm['MaDM'];

        if ($this->model->update($id, $title, $artist, $genre, $price, $stock, $desc, $image, $year, $status, $maDM)) {
            echo json_encode(['success' => true, 'message' => 'Đã cập nhật sản phẩm']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Lỗi cập nhật sản phẩm']);
        }
    }

    public function delete($data) {
        $id = $data['id'] ?? 0;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID không hợp lệ']);
            return;
        }
        if ($this->model->delete($id)) {
            echo json_encode(['success' => true, 'message' => 'Đã xóa sản phẩm']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Lỗi xóa sản phẩm']);
        }
    }
}
?>
