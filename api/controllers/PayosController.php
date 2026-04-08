<?php
require_once __DIR__ . '/../models/DonHangModel.php';
require_once __DIR__ . '/../config/PayOSService.php';
require_once __DIR__ . '/../config/payos.php';

class PayosController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function confirmWebhook() {
        $dataStr = file_get_contents("php://input");
        $data = json_decode($dataStr, true);

        if (!$data || !isset($data['success']) || !isset($data['data'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid webhook payload']);
            return;
        }

        if ($data['success'] === false) {
             echo json_encode(['success' => true]); // Acknowledge bad payload to payos
             return;
        }

        $webhookData = $data['data'];
        $signature = $data['signature'];

        try {
            if (PayOSService::verifyWebhookSignature($webhookData, $signature)) {
                $orderCode = $webhookData['orderCode'];
                
                // Tìm order trong db có maGiaoDich = $orderCode
                $stmt = $this->pdo->prepare("SELECT MaDH FROM ThanhToan WHERE MaGiaoDich = ?");
                $stmt->execute([$orderCode]);
                $thanhToan = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($thanhToan) {
                    $maDH = $thanhToan['MaDH'];
                    
                    if ($webhookData['code'] == '00') { // Thành công
                        $this->pdo->prepare("UPDATE ThanhToan SET TrangThaiTT = 'dathanhtoan' WHERE MaDH = ?")->execute([$maDH]);
                        $this->pdo->prepare("UPDATE DonHang SET TrangThai = 'danggiaohang' WHERE MaDH = ?")->execute([$maDH]);
                    } else { // Huỷ / Thất bại
                        $this->pdo->prepare("UPDATE ThanhToan SET TrangThaiTT = 'thatbai' WHERE MaDH = ?")->execute([$maDH]);
                        $this->pdo->prepare("UPDATE DonHang SET TrangThai = 'dahuy' WHERE MaDH = ?")->execute([$maDH]);
                        
                        // Hoàn lại kho
                        $stmtCT = $this->pdo->prepare("SELECT MaSP, SoLuong FROM ChiTietDonHang WHERE MaDH = ?");
                        $stmtCT->execute([$maDH]);
                        $items = $stmtCT->fetchAll(PDO::FETCH_ASSOC);
                        
                        $stmtKho = $this->pdo->prepare("UPDATE SanPham SET SoLuongTon = SoLuongTon + ? WHERE MaSP = ?");
                        foreach($items as $item) {
                            $stmtKho->execute([$item['SoLuong'], $item['MaSP']]);
                        }
                    }
                }
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid signature']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
?>
