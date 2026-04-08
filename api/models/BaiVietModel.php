<?php
// Model: Bài Viết (BaiViet / Blog)
// Chứa các phương thức truy vấn CSDL liên quan đến bảng BaiViet

class BaiVietModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    private function baseQuery() {
        return "SELECT b.MaBV as id, b.TieuDe as title, b.NoiDung as content, b.LoaiBV as type, b.HinhAnh as image, b.NgayTao as created_at, b.NgayCapNhat as updated_at, b.TrangThai as status,
              COALESCE(nv.HoTen, t.TenDangNhap, 'Admin') as author
              FROM BaiViet b
              LEFT JOIN TaiKhoan t ON b.MaTK = t.MaTK
              LEFT JOIN NhanVien nv ON t.MaTK = nv.MaTK";
    }

    public function getAll($type = null, $status = 'daxuatban', $limit = 50) {
        $query = $this->baseQuery() . " WHERE 1=1";
        $params = [];

        if ($type) {
            $query .= " AND b.LoaiBV = ?";
            $params[] = $type;
        }
        if ($status !== 'all') {
            $query .= " AND b.TrangThai = ?";
            $params[] = $status;
        }
        $query .= " ORDER BY b.NgayTao DESC LIMIT " . (int)$limit;

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare($this->baseQuery() . " WHERE b.MaBV = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($title, $content, $type, $image, $status, $accountId) {
        $stmt = $this->pdo->prepare("INSERT INTO BaiViet (TieuDe, NoiDung, LoaiBV, HinhAnh, TrangThai, MaTK) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $content, $type, $image, $status, $accountId]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $title, $content, $type, $image, $status) {
        $stmt = $this->pdo->prepare("UPDATE BaiViet SET TieuDe=?, NoiDung=?, LoaiBV=?, HinhAnh=?, TrangThai=? WHERE MaBV=?");
        return $stmt->execute([$title, $content, $type, $image, $status, $id]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM BaiViet WHERE MaBV=?");
        return $stmt->execute([$id]);
    }
}
?>
