<?php
// Router: Admin (admin.php)
// Entry point - định tuyến request đến AdminController

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/AdminController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new AdminController($pdo);

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

switch ($action) {
    case 'dashboard_stats': $controller->dashboardStats(); break;
    case 'customers_list':  $controller->customersList(); break;
    case 'inventory_list':  $controller->inventoryList(); break;
    case 'revenue_report':  $controller->revenueReport(); break;
    case 'import_stock':    $controller->importStock($data); break;
    case 'activity_log':    $controller->activityLog(); break;
    default:
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ']);
}
?>
