<?php
// Controller: Admin (AdminController)
// Xử lý logic dashboard, thống kê, quản lý kho, nhật ký

require_once __DIR__ . '/../models/KhachHangModel.php';
require_once __DIR__ . '/../models/SanPhamModel.php';

class AdminController {
    private $pdo;
    private $customerModel;
    private $productModel;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->customerModel = new KhachHangModel($pdo);
        $this->productModel = new SanPhamModel($pdo);
    }

    public function dashboardStats() {
        $stmtRev = $this->pdo->query("SELECT SUM(TongTien) as todayRevenue FROM DonHang WHERE DATE(NgayDat) = CURDATE() AND TrangThai = 'hoanthanh'");
        $todayRevenue = $stmtRev->fetch(PDO::FETCH_ASSOC)['todayRevenue'] ?? 0;

        $stmtOrders = $this->pdo->query("SELECT COUNT(MaDH) as todayOrders FROM DonHang WHERE DATE(NgayDat) = CURDATE() AND TrangThai != 'dahuy'");
        $todayOrders = $stmtOrders->fetch(PDO::FETCH_ASSOC)['todayOrders'] ?? 0;

        $stmtProducts = $this->pdo->query("SELECT COUNT(MaSP) as totalProducts FROM SanPham");
        $totalProducts = $stmtProducts->fetch(PDO::FETCH_ASSOC)['totalProducts'] ?? 0;

        $stmtCustomers = $this->pdo->query("SELECT COUNT(MaKH) as totalCustomers FROM KhachHang");
        $totalCustomers = $stmtCustomers->fetch(PDO::FETCH_ASSOC)['totalCustomers'] ?? 0;

        $stmtTop = $this->pdo->query("
            SELECT sp.MaSP as id, sp.TenSP as name, sp.NgheSi as artist, SUM(ct.SoLuong) as sales, SUM(ct.SoLuong * ct.DonGia) as revenue
            FROM ChiTietDonHang ct
            JOIN SanPham sp ON ct.MaSP = sp.MaSP
            JOIN DonHang dh ON ct.MaDH = dh.MaDH
            WHERE dh.TrangThai = 'hoanthanh'
            GROUP BY sp.MaSP
            ORDER BY sales DESC
            LIMIT 5
        ");
        $topProducts = $stmtTop->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => [
            'todayRevenue' => (float)$todayRevenue,
            'todayOrders' => (int)$todayOrders,
            'totalProducts' => (int)$totalProducts,
            'totalCustomers' => (int)$totalCustomers,
            'topProducts' => $topProducts
        ]]);
    }

    public function customersList() {
        echo json_encode(['success' => true, 'data' => $this->customerModel->getAll()]);
    }

    public function inventoryList() {
        $stmt = $this->pdo->query("
            SELECT sp.MaSP as id, sp.TenSP as name, sp.GiaBan as price, sp.SoLuongTon as stock, dm.TenDM as genre, sp.TinhTrang as status
            FROM SanPham sp
            LEFT JOIN DanhMuc dm ON sp.MaDM = dm.MaDM
            ORDER BY sp.MaSP DESC
        ");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function revenueReport() {
        $startDate = $_GET['start'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $_GET['end'] ?? date('Y-m-d');

        $stmt = $this->pdo->prepare("
            SELECT DATE(NgayDat) as date, SUM(TongTien) as revenue, COUNT(MaDH) as orders
            FROM DonHang
            WHERE DATE(NgayDat) >= ? AND DATE(NgayDat) <= ? AND TrangThai = 'hoanthanh'
            GROUP BY DATE(NgayDat)
            ORDER BY DATE(NgayDat) ASC
        ");
        $stmt->execute([$startDate, $endDate]);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function importStock($data) {
        $adminId = $data['admin_id'] ?? null;
        $items = $data['items'] ?? [];
        $note = $data['note'] ?? '';

        if (!$adminId || empty($items)) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        try {
            $this->pdo->beginTransaction();

            $total = 0;
            foreach ($items as $item) {
                $total += ($item['qty'] * $item['price']);
            }

            $stmt = $this->pdo->prepare("INSERT INTO PhieuNhap (MaNV, TongTien, GhiChu) VALUES (?, ?, ?)");
            $stmt->execute([$adminId, $total, $note]);
            $maPN = $this->pdo->lastInsertId();

            $stmtCT = $this->pdo->prepare("INSERT INTO ChiTietPhieuNhap (MaPN, MaSP, SoLuongNhap, GiaNhap) VALUES (?, ?, ?, ?)");
            foreach ($items as $item) {
                $stmtCT->execute([$maPN, $item['id'], $item['qty'], $item['price']]);
                $this->productModel->updateStock($item['id'], $item['qty']);
            }

            // Log activity
            $logStmt = $this->pdo->prepare("INSERT INTO NhatKyHoatDong (MaTK, HanhDong, NoiDung) VALUES ((SELECT MaTK FROM NhanVien WHERE MaNV = ? LIMIT 1), 'NhapKho', ?)");
            $logStmt->execute([$adminId, "Nhập kho phiếu #$maPN, tổng tiền $total"]);

            $this->pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Nhập kho thành công!', 'phieu_nhap_id' => $maPN]);
        } catch(Exception $e) {
            $this->pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Lỗi nhập kho: ' . $e->getMessage()]);
        }
    }

    public function activityLog() {
        $stmt = $this->pdo->query("
            SELECT n.MaNK as id, n.HanhDong as action, n.NoiDung as content, n.ThoiGian as time, 
                   t.TenDangNhap as username, nv.HoTen as fullname 
            FROM NhatKyHoatDong n 
            LEFT JOIN TaiKhoan t ON n.MaTK = t.MaTK 
            LEFT JOIN NhanVien nv ON t.MaTK = nv.MaTK
            ORDER BY n.ThoiGian DESC 
            LIMIT 50
        ");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }
}
?>
