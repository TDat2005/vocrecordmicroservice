<?php
// Router: Đơn Hàng (orders.php)
// Entry point - định tuyến request đến OrderController

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/OrderController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new OrderController($pdo);

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'create':        $controller->create($data); break;
    case 'list':          $controller->list(); break;
    case 'update_status': $controller->updateStatus($data); break;
    case 'cancel_order':  $controller->cancelOrder($data); break;
    case 'order_detail':  $controller->orderDetail(); break;
    case 'check_status':  $controller->checkStatus(); break;
    default:
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ']);
}
?>
