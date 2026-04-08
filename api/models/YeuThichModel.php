<?php
// Model: Yêu Thích (YeuThich / Wishlist)
// Chứa các phương thức truy vấn CSDL liên quan đến bảng YeuThich

class YeuThichModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getByCustomer($customerId) {
        $stmt = $this->pdo->prepare("SELECT sp.MaSP as id, sp.TenSP as title, sp.NgheSi as artist, sp.GiaBan as price, sp.HinhAnh as image, yt.MaYT FROM YeuThich yt JOIN SanPham sp ON yt.MaSP = sp.MaSP WHERE yt.MaKH = ?");
        $stmt->execute([$customerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function exists($customerId, $productId) {
        $stmt = $this->pdo->prepare("SELECT * FROM YeuThich WHERE MaKH = ? AND MaSP = ?");
        $stmt->execute([$customerId, $productId]);
        return $stmt->rowCount() > 0;
    }

    public function add($customerId, $productId) {
        $stmt = $this->pdo->prepare("INSERT INTO YeuThich (MaKH, MaSP) VALUES (?, ?)");
        $stmt->execute([$customerId, $productId]);
        return $this->pdo->lastInsertId();
    }

    public function remove($customerId, $productId) {
        $stmt = $this->pdo->prepare("DELETE FROM YeuThich WHERE MaKH = ? AND MaSP = ?");
        return $stmt->execute([$customerId, $productId]);
    }
}
?>
