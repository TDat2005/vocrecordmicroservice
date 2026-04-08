<?php
// Model: Mã Giảm Giá
class DiscountModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM MaGiamGia ORDER BY NgayTao DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByCode($code) {
        $stmt = $this->pdo->prepare("SELECT * FROM MaGiamGia WHERE Code = ?");
        $stmt->execute([$code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($code, $loaiGiamGia, $giaTri, $donHangToiThieu, $soLuong, $ngayHetHan) {
        $stmt = $this->pdo->prepare("INSERT INTO MaGiamGia (Code, LoaiGiamGia, GiaTri, DonHangToiThieu, SoLuong, NgayHetHan) VALUES (?, ?, ?, ?, ?, ?)");
        return $stmt->execute([strtoupper($code), $loaiGiamGia, $giaTri, $donHangToiThieu, $soLuong, $ngayHetHan]);
    }

    public function update($id, $code, $loaiGiamGia, $giaTri, $donHangToiThieu, $soLuong, $ngayHetHan) {
        $stmt = $this->pdo->prepare("UPDATE MaGiamGia SET Code = ?, LoaiGiamGia = ?, GiaTri = ?, DonHangToiThieu = ?, SoLuong = ?, NgayHetHan = ? WHERE MaGG = ?");
        return $stmt->execute([strtoupper($code), $loaiGiamGia, $giaTri, $donHangToiThieu, $soLuong, $ngayHetHan, $id]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM MaGiamGia WHERE MaGG = ?");
        return $stmt->execute([$id]);
    }

    public function incrementUsage($code) {
        $stmt = $this->pdo->prepare("UPDATE MaGiamGia SET DaDung = DaDung + 1 WHERE Code = ?");
        return $stmt->execute([$code]);
    }
}
?>
