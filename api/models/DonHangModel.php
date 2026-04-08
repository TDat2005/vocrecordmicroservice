<?php
// Model: Đơn Hàng (DonHang)
// Chứa các phương thức truy vấn CSDL liên quan đến bảng DonHang, ChiTietDonHang, ThanhToan

class DonHangModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function create($customerId, $total, $address, $nguoiNhan, $sdtNhan, $ghiChu, $phuongThucThanhToan, $codeGiamGia = null, $soTienGiam = 0) {
        $stmt = $this->pdo->prepare("INSERT INTO DonHang (MaKH, TongTien, TrangThai, DiaChiGiao, NguoiNhan, SDTNhan, GhiChu, PhuongThucThanhToan, CodeGiamGia, SoTienGiam) VALUES (?, ?, 'choxacnhan', ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$customerId, $total, $address, $nguoiNhan, $sdtNhan, $ghiChu, $phuongThucThanhToan, $codeGiamGia, $soTienGiam]);
        return $this->pdo->lastInsertId();
    }

    public function addItem($maDH, $maSP, $soLuong, $donGia) {
        $stmt = $this->pdo->prepare("INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, DonGia) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$maDH, $maSP, $soLuong, $donGia]);
    }

    public function createPayment($maDH, $soTien, $hinhThuc, $trangThai, $maGiaoDich) {
        $stmt = $this->pdo->prepare("INSERT INTO ThanhToan (MaDH, SoTien, HinhThuc, TrangThaiTT, MaGiaoDich) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$maDH, $soTien, $hinhThuc, $trangThai, $maGiaoDich]);
    }

    public function getByCustomer($customerId) {
        $stmt = $this->pdo->prepare("SELECT * FROM DonHang WHERE MaKH = ? ORDER BY NgayDat DESC");
        $stmt->execute([$customerId]);
        return $stmt->fetchAll();
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT dh.*, kh.HoTen, kh.SoDienThoai FROM DonHang dh LEFT JOIN KhachHang kh ON dh.MaKH = kh.MaKH ORDER BY NgayDat DESC");
        return $stmt->fetchAll();
    }

    public function getById($orderId, $customerId = null) {
        $q = "SELECT dh.*, tt.HinhThuc as ThanhToanHinhThuc, tt.TrangThaiTT, tt.MaGiaoDich FROM DonHang dh LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH WHERE dh.MaDH = ?";
        $params = [$orderId];
        if ($customerId) {
            $q .= " AND dh.MaKH = ?";
            $params[] = $customerId;
        }
        $stmt = $this->pdo->prepare($q);
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getOrderItems($orderId) {
        $stmt = $this->pdo->prepare("SELECT ct.*, sp.TenSP, sp.HinhAnh, sp.NgheSi FROM ChiTietDonHang ct JOIN SanPham sp ON ct.MaSP = sp.MaSP WHERE ct.MaDH = ?");
        $stmt->execute([$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus($orderId, $status, $adminId = null) {
        $stmt = $this->pdo->prepare("UPDATE DonHang SET TrangThai = ?, MaNVXuLy = ? WHERE MaDH = ?");
        return $stmt->execute([$status, $adminId, $orderId]);
    }

    public function getStatus($orderId, $customerId) {
        $stmt = $this->pdo->prepare("SELECT TrangThai FROM DonHang WHERE MaDH = ? AND MaKH = ?");
        $stmt->execute([$orderId, $customerId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function cancel($orderId) {
        $stmt = $this->pdo->prepare("UPDATE DonHang SET TrangThai = 'dahuy' WHERE MaDH = ?");
        return $stmt->execute([$orderId]);
    }

    public function beginTransaction() { $this->pdo->beginTransaction(); }
    public function commit() { $this->pdo->commit(); }
    public function rollBack() { $this->pdo->rollBack(); }
}
?>
