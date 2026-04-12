<?php
// Controller: Đơn Hàng (OrderController)
// Xử lý logic nghiệp vụ đặt hàng, hủy đơn, cập nhật trạng thái
// Tích hợp gửi email thông báo qua EmailService

require_once __DIR__ . '/../models/DonHangModel.php';
require_once __DIR__ . '/../models/SanPhamModel.php';
require_once __DIR__ . '/../models/KhachHangModel.php';
require_once __DIR__ . '/../controllers/DiscountController.php';
require_once __DIR__ . '/../config/PayOSService.php';
require_once __DIR__ . '/../config/payos.php';
require_once __DIR__ . '/../config/EmailService.php';

class OrderController {
    private $model;
    private $productModel;
    private $khachHangModel;
    private $discountController;
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->model = new DonHangModel($pdo);
        $this->productModel = new SanPhamModel($pdo);
        $this->khachHangModel = new KhachHangModel($pdo);
        $this->discountController = new DiscountController($pdo);
    }

    public function create($data) {
        $customerId = $data['customer_id'] ?? null;
        $items = $data['items'] ?? [];
        $total = $data['total'] ?? 0;
        $address = $data['address'] ?? '';
        $nguoiNhan = $data['nguoiNhan'] ?? '';
        $sdtNhan = $data['sdtNhan'] ?? '';
        $ghiChu = $data['ghiChu'] ?? '';
        $phuongThucThanhToan = $data['phuongThucThanhToan'] ?? 'cod';
        $maGiaoDich = $data['maGiaoDich'] ?? null;
        $saveAddress = $data['saveAddress'] ?? false;
        $discountCode = $data['discountCode'] ?? null;
        $isPayos = ($phuongThucThanhToan == 'payos');
        $trangThaiThanhToan = 'chuathanhtoan'; // Với payos, webhook sẽ update thành 'dathanhtoan' sau

        if (!$customerId || empty($items)) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        try {
            $this->model->beginTransaction();

            if ($saveAddress) {
                $this->khachHangModel->addAddress($customerId, $nguoiNhan, $sdtNhan, $address);
            }

            // Tính toán mã giảm giá tại Backend để tránh Frontend gian lận
            $soTienGiam = 0;
            if ($discountCode) {
                $soTienGiam = $this->discountController->calculateInternalDiscount($discountCode, $total);
            }

            $totalAfterDiscount = $total - $soTienGiam;
            if ($totalAfterDiscount < 0) $totalAfterDiscount = 0;

            $maDH = $this->model->create($customerId, $totalAfterDiscount, $address, $nguoiNhan, $sdtNhan, $ghiChu, $phuongThucThanhToan, $discountCode, $soTienGiam);

            // Update luot dung giam gia neu co 
            if ($soTienGiam > 0 && $discountCode) {
                 require_once __DIR__ . '/../models/DiscountModel.php';
                 $dModel = new DiscountModel($this->pdo);
                 $dModel->incrementUsage($discountCode);
            }

            foreach ($items as $item) {
                $this->model->addItem($maDH, $item['id'], $item['qty'], $item['price']);
                $this->productModel->decreaseStock($item['id'], $item['qty']);
            }

            $payosData = null;
            if ($isPayos) {
                // Tạo order code duy nhat (int) cho PayOS < 9007199254740991
                $orderCode = intval(substr(time() . $maDH, -14)); 
                // Cập nhật mã giao dịch xuống DB để sau callback biết update đúng đơn nào
                $this->model->createPayment($maDH, $total, $phuongThucThanhToan, 'chuathanhtoan', $orderCode);
                
                $returnUrl = PAYOS_RETURN_URL . "?order_id=" . $maDH;
                $cancelUrl = PAYOS_CANCEL_URL . "?order_id=" . $maDH;
                
                // Mặc định PayOS ném ra Exc nếu không ổn định
                $payosData = PayOSService::createPaymentLink($orderCode, $total, "VocRecords DH" . $maDH, $returnUrl, $cancelUrl);
            } else {
                $this->model->createPayment($maDH, $total, $phuongThucThanhToan, $trangThaiThanhToan, $maGiaoDich);
            }

            $this->model->commit();

            // === GỬI EMAIL XÁC NHẬN ĐƠN HÀNG ===
            try {
                $customerInfo = $this->khachHangModel->getProfile($customerId);
                if ($customerInfo && !empty($customerInfo['Email'])) {
                    $orderItems = $this->model->getOrderItems($maDH);
                    $emailData = [
                        'orderId'   => $maDH,
                        'total'     => $totalAfterDiscount,
                        'items'     => $orderItems,
                        'address'   => $address,
                        'nguoiNhan' => $nguoiNhan,
                        'sdtNhan'   => $sdtNhan,
                    ];
                    EmailService::sendOrderConfirmation($customerInfo['Email'], $emailData);
                }
            } catch(Exception $emailErr) {
                // Email thất bại không ảnh hưởng đến đơn hàng
                error_log('Order email error: ' . $emailErr->getMessage());
            }
            
            $response = ['success' => true, 'message' => 'Đặt hàng thành công!', 'order_id' => $maDH];
            if ($payosData) {
                $response['checkoutUrl'] = $payosData['checkoutUrl'];
                $response['payos_data'] = $payosData;
            }
            
            echo json_encode($response);
        } catch(Exception $e) {
            $this->model->rollBack();
            echo json_encode(['success' => false, 'message' => 'Lỗi đặt hàng: ' . $e->getMessage()]);
        }
    }

    public function list() {
        $customerId = $_GET['customer_id'] ?? null;
        if ($customerId) {
            $orders = $this->model->getByCustomer($customerId);
        } else {
            $orders = $this->model->getAll();
        }
        echo json_encode(['success' => true, 'data' => $orders]);
    }

    public function updateStatus($data) {
        $orderId = $data['order_id'] ?? null;
        $status = $data['status'] ?? null;
        $adminId = $data['admin_id'] ?? null;

        if (!$orderId || !$status) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        if ($this->model->updateStatus($orderId, $status, $adminId)) {
            // === GỬI EMAIL THÔNG BÁO CẬP NHẬT TRẠNG THÁI ===
            try {
                $order = $this->model->getById($orderId);
                if ($order && $order['MaKH']) {
                    $customer = $this->khachHangModel->getProfile($order['MaKH']);
                    if ($customer && !empty($customer['Email'])) {
                        EmailService::sendOrderStatusUpdate($customer['Email'], $orderId, $status);
                    }
                }
            } catch(Exception $emailErr) {
                error_log('Status email error: ' . $emailErr->getMessage());
            }

            echo json_encode(['success' => true, 'message' => 'Cập nhật trạng thái thành công']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Lỗi cập nhật']);
        }
    }

    public function cancelOrder($data) {
        $orderId = $data['order_id'] ?? null;
        $customerId = $data['customer_id'] ?? null;

        if (!$orderId || !$customerId) {
            echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
            return;
        }

        $order = $this->model->getStatus($orderId, $customerId);
        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Đơn hàng không tồn tại hoặc không thuộc về bạn']);
            return;
        }

        if (in_array($order['TrangThai'], ['danggiaohang', 'hoanthanh', 'dahuy'])) {
            echo json_encode(['success' => false, 'message' => 'Đơn hàng này không thể hủy.']);
            return;
        }

        try {
            $this->model->beginTransaction();
            $this->model->cancel($orderId);

            // Hoàn lại kho
            $items = $this->model->getOrderItems($orderId);
            foreach($items as $item) {
                $this->productModel->updateStock($item['MaSP'], $item['SoLuong']);
            }

            $this->model->commit();

            // === GỬI EMAIL THÔNG BÁO HUỶ ĐƠN ===
            try {
                $customer = $this->khachHangModel->getProfile($customerId);
                if ($customer && !empty($customer['Email'])) {
                    EmailService::sendOrderStatusUpdate($customer['Email'], $orderId, 'dahuy');
                }
            } catch(Exception $emailErr) {
                error_log('Cancel email error: ' . $emailErr->getMessage());
            }

            echo json_encode(['success' => true, 'message' => 'Đã hủy đơn hàng thành công']);
        } catch(Exception $e) {
            $this->model->rollBack();
            echo json_encode(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()]);
        }
    }

    public function orderDetail() {
        $orderId = $_GET['order_id'] ?? null;
        $customerId = $_GET['customer_id'] ?? null;

        if (!$orderId) {
            echo json_encode(['success' => false, 'message' => 'Thiếu order_id']);
            return;
        }

        $orderInfo = $this->model->getById($orderId, $customerId);
        if (!$orderInfo) {
            echo json_encode(['success' => false, 'message' => 'Không tìm thấy đơn hàng']);
            return;
        }

        $items = $this->model->getOrderItems($orderId);
        echo json_encode(['success' => true, 'data' => ['info' => $orderInfo, 'items' => $items]]);
    }

    public function checkStatus() {
        $orderId = $_GET['order_id'] ?? null;
        if (!$orderId) {
            echo json_encode(['success' => false]);
            return;
        }
        $order = $this->model->getById($orderId, null);
        if (!$order) {
            echo json_encode(['success' => false]);
            return;
        }

        // Nếu đã thanh toán rồi thì trả về luôn
        if ($order['TrangThaiTT'] === 'dathanhtoan') {
            echo json_encode(['success' => true, 'status' => 'dathanhtoan']);
            return;
        }

        // Nếu chưa thanh toán và là payos, chủ động hỏi PayOS API
        if ($order['ThanhToanHinhThuc'] === 'payos' && $order['MaGiaoDich']) {
            try {
                $orderCode = $order['MaGiaoDich'];
                $ch = curl_init("https://api-merchant.payos.vn/v2/payment-requests/{$orderCode}");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    'x-client-id: ' . PAYOS_CLIENT_ID,
                    'x-api-key: ' . PAYOS_API_KEY
                ]);
                $response = curl_exec($ch);
                curl_close($ch);

                $result = json_decode($response, true);
                if (isset($result['code']) && $result['code'] == '00' && isset($result['data']['status'])) {
                    $payosStatus = $result['data']['status'];
                    // PAID = thành công, CANCELLED = đã hủy
                    if ($payosStatus === 'PAID') {
                        // Cập nhật DB
                        $this->pdo->prepare("UPDATE ThanhToan SET TrangThaiTT = 'dathanhtoan' WHERE MaDH = ?")->execute([$orderId]);
                        $this->pdo->prepare("UPDATE DonHang SET TrangThai = 'daxacnhan' WHERE MaDH = ? AND TrangThai = 'choxacnhan'")->execute([$orderId]);
                        echo json_encode(['success' => true, 'status' => 'dathanhtoan']);
                        return;
                    } elseif ($payosStatus === 'CANCELLED' || $payosStatus === 'EXPIRED') {
                        $this->pdo->prepare("UPDATE ThanhToan SET TrangThaiTT = 'thatbai' WHERE MaDH = ?")->execute([$orderId]);
                        echo json_encode(['success' => true, 'status' => 'thatbai']);
                        return;
                    }
                }
            } catch (Exception $e) {
                error_log('PayOS check error: ' . $e->getMessage());
            }
        }

        echo json_encode(['success' => true, 'status' => $order['TrangThaiTT']]);
    }
}
?>
